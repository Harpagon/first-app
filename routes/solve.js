var razdels = require('./../solver/razdels');
var formulas = require('./../solver/f_parser');
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
		var find_vars = req.query.find_vars;
		// console.log("FIND VARS:" + find_vars);
		var findable_vars =	formulas.GetFindableVars(parent['Variables']);
		var ffvars = [];
		// console.log(findable_vars);
		for(var i in find_vars)
		{
			// console.log("FIND_VARS["+i+"]: "+find_vars[i]);
			for(var j in findable_vars)
			{
				// console.log("FINDABLE_VARS["+j+"]: "+findable_vars[j]['ID']);
				if (find_vars[i] == findable_vars[j]['ID'])
				{
					// console.log('remove ' + j);
					ffvars.push(findable_vars[j]);
					findable_vars.splice(j, 1);

				}
			}
		}
		// console.log(findable_vars);

		res.render('solve',{title:"Выбор искомых переменных", lastSeparator:false,parent_razd:razdels.getPathById(razd),findable_vars:findable_vars,find_vars:ffvars});
	}
	//res.send("respond with a resource");
};