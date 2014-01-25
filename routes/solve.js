var razdels = require('./../solver/razdels');
var formulas = require('./../solver/f_parser');
/*
 * GET users listing.
 */

exports.solve = function(req, res){
	var razd = parseInt(req.query.razd,10);
	var parent = razdels.getRazdelById(razd);
	//console.log(parent);
	//console.log(razdels.getPathById(razd));
	if(parent != "NOT_FOUND")
	{
		if (parent['isDirectory'])
		{
			//var subrazdels = parent['Dirs'];
			res.render('solve',{title:"Выбор раздедла",subrazdels:parent['Dirs'],parent_razd:razdels.getPathById(razd),lastSeparator:false});
		}else
		{
			var findable_vars =	formulas.GetFindableVars(parent['Variables']);
			var find_vars = req.query.find_vars;
			var ffvars = [];
			if (find_vars !== undefined && find_vars.length > 0)
			{
				
				// console.log("FIND VARS:" + find_vars);
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
				var know_vars = [];
				var kv_to_add = [];
				for(var i in ffvars)
				{
					var rel_vars = formulas.GetRelatedVars(ffvars[i],parent['Variables']);
					console.log("REL_VARS TO "+ffvars[i]['Name']+":"+rel_vars[0]);
					for(var j in rel_vars)
					{
						if (!formulas.isContainUUID(kv_to_add, rel_vars['ID']))
							kv_to_add.push(rel_vars[j]);
					}
				}
				if (req.query.know_vars !== undefined)
				{
					try
					{
						var k_v = JSON.parse('['+req.query.know_vars.toString()+']');
						console.log("KNOW VARS:"+k_v);
						/*var values = req.query.val;
						var test =[[1,2],[1,3]];*/
						for(var i in k_v)
						{
							k_v[i] = JSON.parse(k_v[i]);
							if (k_v[i][0] === undefined || k_v[i][1] === undefined)
								throw "Не все значения введены!";
							know_vars.push({ID:k_v[i][0],Value:k_v[i][1]});
							console.log("KNOW_VARS: "+know_vars[i]['ID']+":"+know_vars[i]['Value']);
						}
						//console.log("")
					}catch(ex)
					{
						res.render('error_page',{title:ex});
					}
				}
				//console.log(know_vars.isArray());
				if (know_vars !== undefined && know_vars.length > 0)
				{
					console.log("KNOW_VARS: "+know_vars);
					console.log("KNOW_VARS_FIRST: "+know_vars[0]);
					console.log("KNOW_VARS_FIRST_ID: "+know_vars[0]['ID']);
					for(i in know_vars)
					{
						var v = know_vars[i]['Value'];
						var r = formulas.getVariableById(know_vars[i]['ID'],parent['Variables']);
						r['Value'] = v;
						if (r!="NOT_FOUND")
							know_vars[i] = r;
						else
							res.render('error_page',{title:"Переменная не найдена!"});
					}
					res.render('solve',{title:"Решение найдено", lastSeparator:false,parent_razd:razdels.getPathById(razd),findable_vars:findable_vars,find_vars:ffvars,kv_to_add:kv_to_add,url:req.url, know_vars: know_vars});
				}else
				{
					res.render('solve',{title:"Выбор известных переменных", lastSeparator:false,parent_razd:razdels.getPathById(razd),findable_vars:findable_vars,find_vars:ffvars,kv_to_add:kv_to_add,url:req.url});
				}

			}else
			{
				res.render('solve',{title:"Выбор искомых переменных", lastSeparator:false,parent_razd:razdels.getPathById(razd),findable_vars:findable_vars,find_vars:ffvars});
			}
		}
	}else
	{
		res.render('error_page',{title:"Такой раздел не найден"});
	}
	//res.send("respond with a resource");
};