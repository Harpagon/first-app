var razdels = require('./../solver/razdels');
var formulas = require('./../solver/f_parser');
var rpn = require('./../solver/rpn');
/*
 * GET users listing.
 */

 function ReSetIndexes (variables) {
	var vars = [];
	for (var i = 0; i < variables.length; i++) {
		var v = JSON.parse(JSON.stringify(variables[i]));
		if (vars[v.ID] === undefined)
			vars[v.ID] = [];
		vars[v.ID].push(v);
	}

	var result = [];

	//ClearSelect(select);
	
	for (var key in vars) {
		if (vars[key].length > 1)
		{
			for (i = 0; i < vars[key].length; i++) {
				vars[key][i].Index = i + 1;

				//AddToSelect(select, JSON.stringify(vars[key][i]),vars[key][i].Name + "<sub>"+vars[key][i].Index+"</sub> = " + vars[key][i].Value);
				//select.options[select.options.length-1].title = vars[key][i].Description;
				result.push(vars[key][i]);
			}
		}else
		if (vars[key].length == 1)
		{
			vars[key][0].Index = "";
			//AddToSelect(select, JSON.stringify(vars[key][0]),vars[key][0].Name + "<sub>"+vars[key][0].Index+"</sub> = " + vars[key][0].Value);
			//select.options[select.options.length-1].title = vars[key][0].Description;
			result.push(vars[key][0]);
		}
		//var opt = document.createElement('option');

	}
	return result;
}


function GoSolve(f_know,f_find,Formulas) {
	//ClearSelect(f_solv);
	var result = [];
	var kv = [];
	for (var i = 0; i < f_know.length; i++) {
		kv.push(JSON.parse(JSON.stringify(f_know[i])));
	}
	var cons = formulas.GetConstants(Formulas);
	for (var cc = 0; cc < cons.length; cc++) {
		kv.push(cons[cc]);
	}
	for (var s = 0; s < f_find.length; s++) {
		var goal = JSON.parse(JSON.stringify(f_find[s]));
		var g_res = formulas.Solve(goal,kv,Formulas);
		for (var m = 0; m < g_res.length; m++) {
			if (g_res[m] === "")
				gres.remove(m);
		}
		if (g_res.length > 0)
		{
			for (var k = 0; k < g_res.length; k++) {
				var res = g_res[k];
		
				if (res!=="")
				{
					for (i = 0; i < res.length; i++) {
						result.push(res[i].Description.replace(/(\*\*)(.*?)(\*\*)/gim,"<strong>$2</strong>"));
						//AddToSelect(f_solv,res[i],res[i].Description.replace(/(\*\*)(.*?)(\*\*)/gim,"<strong>$2</strong>"));
						var ex = res[i].Expression;
						var reg = "([^0-9\\W])([0-9]+)";
						ex = ex.replace(new RegExp(reg,'g'),"$1<sub>$2</sub>");
						result.push(ex);
						//AddToSelect(f_solv,res[i],ex);
						var expr = res[i].Expression.split("=")[1];
						for (var j = 0; j < kv.length; j++) {
							var ind = "";
							if (kv[j].Index !== "" && kv[j].Index !== undefined )
								ind = kv[j].Index;
							reg = "(^|\\W)"+kv[j].Name+ind+"(\\W|$)";
							expr = expr.replace(new RegExp(reg,'g'),"$1"+kv[j].Value+"$2");
						}
						var p = new rpn.Parser();
						res[i].Goal.Value = p.Eval(expr);
						kv.push(res[i]);
						//AddToSelect(f_solv,expr, res[i].Goal.Name + " = " + expr + " = " +p.Eval(expr));
						result.push(res[i].Goal.Name + " = " + expr + " = " +p.Eval(expr));
					}
				}

				if (k!=g_res.length -1)
					result.push("------------ИЛИ------------");
					//AddToSelect(f_solv,"OR", "------------ИЛИ------------");
			}
		}else
		{
			//AddToSelect(f_solv,"NF","Решение не найдено :(");
			result.push("Решение не найдено :(");
		}
	}
	return result;
}



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
						var r = JSON.parse(JSON.stringify(formulas.getVariableById(know_vars[i]['ID'],parent['Variables'])));
						r['Value'] = v;
						if (r!="NOT_FOUND")
							know_vars[i] = r;
						else
							res.render('error_page',{title:"Переменная не найдена!"});
					}
					know_vars = ReSetIndexes(know_vars);
					var solvetion = GoSolve(know_vars,ffvars,parent['Variables']);
					res.render('solve',{title:"Решение найдено", lastSeparator:false,parent_razd:razdels.getPathById(razd),findable_vars:findable_vars,find_vars:ffvars,kv_to_add:kv_to_add,url:req.url, know_vars: know_vars, solvetion: solvetion});
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