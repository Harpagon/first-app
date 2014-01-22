var razdels = require('./../solver/razdels');
/*
 * GET users listing.
 */

exports.solve = function(req, res){
	var razd = parseInt(req.query.razd,10);
	var parent = razdels.getRazdelById(razd);
	//console.log(razdels.getPathById(razd));
	if (parent['isDirectory'])
	{
		//var subrazdels = parent['Dirs'];
		res.render('solve',{title:"Выбор раздедла",subrazdels:parent['Dirs'],parent_razd:razdels.getPathById(razd),lastSeparator:false});
	}else
	{
		res.render('solve',{lastSeparator:false,parent_razd:razdels.getPathById(razd)});
	}
	//res.send("respond with a resource");
};