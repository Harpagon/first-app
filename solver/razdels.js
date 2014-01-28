var fs = require('fs');
var path = require('path');
var parser = require('./f_parser');

function getFiles(dir, id){
	var result = [];
	var files = fs.readdirSync(dir);
	for(var i in files){
		if (!files.hasOwnProperty(i)) continue;
		var name = dir+'/'+files[i];
		if (fs.statSync(name).isDirectory()){
			ff = getFiles(name, id);
			id = ff[1];
			id++;
			var dd = {ID:id, Name:files[i],isDirectory:true,Path:name,Dirs:[],Variables:[]};
			for(var j in ff[0])
			{
				dd['Dirs'].push(ff[0][j]);
			}
			result.push(dd);
		}else{
			//////console.log(name);
			id++;
			result.push({ID:id,Name:files[i],isDirectory:false,Path:name, Dirs:[],Variables:[]});
		}
	}
	//id++;
	return [result,id];
}

function setFormulas(dir) {
	for(var i in dir)
	{
		if (dir[i]['isDirectory'])
		{
			setFormulas(dir[i]['Dirs']);
		}else
		{
			var text = fs.readFileSync(dir[i]['Path'],'utf8');
			dir[i]['Variables'] = parser.ParseFormulas(text);
		}
	}
}

function GetRazdels() {
	var dir = './razdels';
	var files = getFiles(dir,0);
	var result = [];
	setFormulas(files[0]);
	//////console.log(files[i]);
	return files[0];
}

function getRazdelById(id,dirs) {
	if (dirs === undefined)
		dirs = GLOBAL.razdels;
	////console.log("SEARCH FOR ID: "+id);
	for(var i in dirs)
	{
		////console.log("SEARCH: "+dirs[i]['ID']+":"+dirs[i]['Name']);
		if (dirs[i]['ID'] == id)
		{
			////console.log("FOUND: "+dirs[i]['ID']+":"+dirs[i]['Name']);
			return dirs[i];
		}
		if (dirs[i]['isDirectory'])
		{
			////console.log("ENTER TO SUB DIR: "+dirs[i]['ID']+":"+dirs[i]['Name']);
			var r = getRazdelById(id,dirs[i]['Dirs']);
			if (r != "NOT_FOUND")
				return r;
		}
	}
	////console.log("NOT_FOUND_BY_ID");
	return "NOT_FOUND";

}

function getAllRazdels(dirs) {
	var result = [];
	if (dirs === undefined)
		dirs = GLOBAL.razdels;
	for(var i in dirs)
	{
		if (dirs[i]['isDirectory'])
		{
			////console.log("ENTER TO SUB DIR: "+dirs[i]['ID']+":"+dirs[i]['Name']);
			var r = getAllRazdels(dirs[i]['Dirs']);
			for(var j in r)
				result.push(r[j]);

		}else
		{
			result.push(dirs[i]);
		}
	}
	////console.log("NOT_FOUND_BY_ID");
	return result;
}

function getParentById(id,dirs,parent) {
	if (dirs === undefined)
	{
		dirs = GLOBAL.razdels;
	}
	for(var i in dirs)
	{
		if (dirs[i]['ID'] == id)
			if(parent !== undefined)
				return parent;
			else
				return "NOT_FOUND";
		if (dirs[i]['isDirectory'])
		{
			var r = getParentById(id,dirs[i]['Dirs'],dirs[i]);
			if (r!= "NOT_FOUND")
				return r;
		}
	}
	////console.log("PARENT_NOT_FOUND");
	return "NOT_FOUND";

}

function getPathById(id, dirs, parent) {
	/*result = new Array();
	if (dirs === undefined)
		dirs = GLOBAL.razdels;
	////console.log("SEARCHING FOR ID: "+id);
	for(var i in dirs)
	{
		////console.log("SEARCHING: "+dirs[i]['Name']+":"+dirs[i]['ID']);
		if (dirs[i]['ID'] == id)
		{
			if (parent!== undefined)
				result.push(new Object(parent));
			////console.log("FOUND: "+dirs[i]['Name']+":"+dirs[i]['ID']);
			result.push(new Object(dirs[i]));
			return result;
		}
		if (dirs[i]['isDirectory'])
		{
			//result.push(new Object(dirs[i]));
			var res = getPathById(id,dirs[i]['Dirs'],dirs[i]);
			for(var j in res )
			{
				result.push(new Object(res[j]));
			}
			var curr_path = "";
			for(var l in result)
				curr_path +=result[l]['Name']+"\\";
			////console.log("RET_RESULT: "+curr_path);
			return result;
		}
		var curr_path = "";
		for(var l in result)
			curr_path +=result[l]['Name']+"\\";
		////console.log("CURRENT_RESULT: "+curr_path);
	}
	////console.log("PATH_NOT_FOUND");
	return "NOT_FOUND";*/
	var result = [];
	result.push(getRazdelById(id));
	var r = getParentById(id);
		while (r != "NOT_FOUND")
		{
			result.push(r);
			r = getParentById(r['ID']);

		}
	result.reverse();
	var curr_path = "";
	for(var l in result)
		curr_path +=result[l]['Name']+"\\";
	////console.log("CURRENT_RESULT: "+curr_path);
	return result;
}


exports.GetRazdels = GetRazdels;
exports.getRazdelById = getRazdelById;
exports.getParentById = getParentById;
exports.getPathById = getPathById;
exports.getAllRazdels = getAllRazdels;