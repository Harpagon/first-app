var fs = require('fs');
var path = require('path');

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
			var dd = {ID:id, Name:files[i],isDirectory:true,Path:name,Dirs:[]};
			for(var j in ff[0])
			{
				dd['Dirs'].push(ff[0][j]);
			}
			result.push(dd);
		}else{
			//console.log(name);
			id++;
			result.push({ID:id,Name:files[i],isDirectory:false,Path:name, Dirs:[]});
		}
	}
	//id++;
	return [result,id];
}

function GetRazdels() {
	var dir = './razdels';
	var files = getFiles(dir,0);
	var result = [];
	//for (var i in files)
	//console.log(files[i]);
	return files[0];
}

function getRazdelById(id,dirs) {
	if (dirs === undefined)
		dirs = GLOBAL.razdels;
	console.log("SEARCH FOR ID: "+id);
	for(var i in dirs)
	{
		console.log("SEARCH: "+dirs[i]['ID']+":"+dirs[i]['Name']);
		if (dirs[i]['ID'] == id)
		{
			console.log("FOUND: "+dirs[i]['ID']+":"+dirs[i]['Name']);
			return dirs[i];
		}
		if (dirs[i]['isDirectory'])
		{
			console.log("ENTER TO SUB DIR: "+dirs[i]['ID']+":"+dirs[i]['Name']);
			var r = getRazdelById(id,dirs[i]['Dirs']);
			if (r != "NOT_FOUND")
				return r;
		}
	}
	console.log("NOT_FOUND_BY_ID");
	return "NOT_FOUND";

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
	console.log("PARENT_NOT_FOUND");
	return "NOT_FOUND";

}

function getPathById(id, dirs, parent) {
	/*result = new Array();
	if (dirs === undefined)
		dirs = GLOBAL.razdels;
	console.log("SEARCHING FOR ID: "+id);
	for(var i in dirs)
	{
		console.log("SEARCHING: "+dirs[i]['Name']+":"+dirs[i]['ID']);
		if (dirs[i]['ID'] == id)
		{
			if (parent!== undefined)
				result.push(new Object(parent));
			console.log("FOUND: "+dirs[i]['Name']+":"+dirs[i]['ID']);
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
			console.log("RET_RESULT: "+curr_path);
			return result;
		}
		var curr_path = "";
		for(var l in result)
			curr_path +=result[l]['Name']+"\\";
		console.log("CURRENT_RESULT: "+curr_path);
	}
	console.log("PATH_NOT_FOUND");
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
	console.log("CURRENT_RESULT: "+curr_path);
	return result;
}


exports.GetRazdels = GetRazdels;
exports.getRazdelById = getRazdelById;
exports.getParentById = getParentById;
exports.getPathById = getPathById;