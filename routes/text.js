var razdels = require('./../solver/razdels');
var formulas = require('./../solver/f_parser');
var rpn = require('./../solver/rpn');
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

RegExp.prototype.execAll = function(string) {
    var match = null;
    var matches = [];
    while ((match = this.exec(string)) !== null) {
        var matchArray = [];
        for (var i in match) {
            if (parseInt(i,10) == i) {
                matchArray.push(match[i]);
            }
        }
        matches.push(matchArray);
    }
    return matches;
};

exports.ptext = function(req, res)
{
	if (req.body.parseText !== null && req.body.parseText !== "" && req.body.parseText !== undefined)
	{
		var text_orig = req.body.parseText;
		var spaces = / /gim;
		var variable = /((.*) ?\= ?(.*);)/gim;
		var text = text_orig.replace(spaces,"");
		var m = variable.execAll(text);
		var url = "/solve?razd="+req.body.razd;
		var razdel = razdels.getRazdelById(req.body.razd);
		for(var i in m)
		{
			var r = formulas.getVariableByName(m[i][2], razdel['Variables']);
			console.log("var: "+m[i][2]+"; value: "+m[i][3]);
			if (m[i][3] == "?")
			{
				
				if (r!="NOT_FOUND")
					url += '&find_vars='+r['ID'];
				else
					res.render('error_page',{title:"Переменная '"+m[i][2]+"' не найдена."});
			}else
			{
				if (r!="NOT_FOUND")
					url += '&know_vars="['+r['ID']+','+m[i][3]+']"';
				else
					res.render('error_page',{title:"Переменная '"+m[i][2]+"' не найдена."});
			}

		}
		res.redirect(url);
	}else
	{
		res.render('text',{razdels:GLOBAL.razdels});
	}
};