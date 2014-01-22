var fs = require('fs');
var path = require('path');

function getFiles(dir, id){
	var result = [];
	var files = fs.readdirSync(dir);
	for(var i in files){
		if (!files.hasOwnProperty(i)) continue;
		var name = dir+'/'+files[i];
		if (fs.statSync(name).isDirectory()){
			id++;
			var dd = {ID:id, Name:files[i],isDirectory:true,Path:name,Dirs:[]};
			ff = getFiles(name, id);
			for(var j in ff)
			{
				dd['Dirs'].push(ff[j]);
			}
			result.push(dd);
		}else{
			//console.log(name);
			id++;
			result.push({ID:id,Name:files[i],isDirectory:false,Path:name, Dirs:[]});
		}
	}
	return result;
}

function GetRazdels() {
	var dir = './razdels';
	var files = getFiles(dir,0);
	var result = [];
	// for (var i in files)
	// 	console.log(files[i]);
	return files;
}

exports.GetRazdels = GetRazdels;