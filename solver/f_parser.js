

function ParseFormulas(formulasStr) {
	var Formulas = [];
	//formulasStr = '"a" "Сторона треугольника" "" "@uuid@"\r\n"b" "Основание треугольника" "" "@uuid@"\r\n"c" "Катет треугольника" "" "@uuid@"\r\n"h" "Высота треугольника" "" "@uuid@"\r\n"α" "Угол между сторонами треугольника" "" "@uuid@"\r\n"p" "Полупериметр треугольника" "" "@uuid@"\r\n"P" "Периметр треугольника" "" "@uuid@"\r\n"S" "Площадь треугольника" "" "@uuid@"\r\n["P" "Периметр треугольника:" "P = a1 + a2 +a3" {"a1" "a2" "a3"} "@uuid@"]\r\n["p" "Полупериметр треугольника:" "p = (a1 + a2 + a3) / 2" {"a1" "a2" "a3"} "@uuid@"]\r\n["S" "Площадь треугольника через основание и высоту:" "S = (1/2) * b * h" {"b" "h"} "@uuid@"]\r\n["S" "Площадь треугольника через его катеты:" "S = (1/2) * c1 * c2" {"c1" "c2"} "@uuid@"]\r\n["S" "Площадь треугольника по формуле Герона:" "S = sqrt(p * (p - a1) * (p - a2) * (p - a3))" {"p" "a1" "a2" "a3"} "@uuid@"]\r\n["S" "Площадь <strong>равнобедренного</strong> треугольника через сторону и основание:" "S = (b / 4) * sqrt(4 * a^2 - b^2)" {"a" "b"} "@uuid@"]\r\n["S" "Площадь <strong>равноcтороннего</strong> треугольника через сторону:" "S = (sqrt(3) / 4) * a^2" {"a"} "@uuid@"]';
	var variables = /(^"(.*?)" "(.*?)" "(.*?)")/gim;
	var formulas =/(^\["(.*?)" "(.*?)" "(.*?)" \{(.*?)\}\])/gim;
	//var vars_in_formula = /"(.*?)"/gim;
	var vars_in_formula = /"([^0-9]*?)([0-9]*?)"/gim;
	var uuid = /@uuid@/gim;
	var id = 1;

	//Выбор переменных и создание массива
	var vars = [];
	var myArray = variables.execAll(formulasStr);
	for (var i = 0; i < myArray.length; i++) {
		//alert(v_arr[i]);
		var vv = JSON.parse(myArray[i][0].replace(variables,"{\"Value\":\"$4\",\"Name\":\"$2\",\"Description\":\"$3\",\"ID\":"+(id++)+"}"));
		var skip = false;
		for (var vi = 0; vi < vars.length; vi++) {
			if (vars[vi].Name == vv.Name)
			{
				alert("Переменная с именем '"+vv.Name+" ("+vv.Description+")' уже существует, \r\nона не будет добавлена!");
				skip = true;
			}
		}
		if (!skip)
			vars.push(vv);
	}
	Formulas = [];
	myArray = formulas.execAll(formulasStr);
	for (var myA = 0; myA < myArray.length; myA++) {
		var f =  JSON.parse(myArray[myA][0].replace(formulas,"{\"Goal\":{},\"Variables\":[],\"Description\":\"$3\",\"Expression\":\"$4\",\"ID\":"+(id++)+"}"));
		for (i = 0; i < vars.length; i++) {
			if(vars[i].Name == myArray[myA][2])
			{
				f.Goal = vars[i];
				break;
			}
		}
		var vArray = vars_in_formula.execAll(myArray[myA][5]);
		for (var vA = 0; vA < vArray.length; vA++) {
		//while ((vArray = vars_in_formula.exec(myArray[5])) !== null) {
			for (i = 0; i < vars.length; i++) {
				if(vars[i].Name == vArray[vA][1])
				{
					f.Variables.push(JSON.parse(JSON.stringify(vars[i])));
					//var v = ;
					if (vArray[vA].length > 2)
						if (vArray[vA][2] !== null && vArray[vA][2] !== "" && vArray[vA][2]!== undefined)
							f.Variables[f.Variables.length-1].Index = parseInt(vArray[vA][2],10);
					//break;
				}
			}
		}
		////console.log(f);
		Formulas.push(f);
	}
	return Formulas;
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

function createUUID() {
	// http://www.ietf.org/rfc/rfc4122.txt
	var s = [];
	var hexDigits = "0123456789abcdef";
	for (var i = 0; i < 36; i++) {
		s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
	}
	s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
	s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
	s[8] = s[13] = s[18] = s[23] = "-";
	var uuid = s.join("");
	return uuid;
}

function isContainUUID(arr,uuid) {
	for (var j = 0; j < arr.length; j++) {
			if (arr[j].ID == uuid)
				return true;
		}
	return false;
}

function isConstant(v) {
	if (v.Value !== "" && v.Value !== null && v.Value !== undefined)
		return true;
	return false;
}

function GetFindableVars (Formulas) {
	var vars = [];
	for (var i = 0; i < Formulas.length; i++) {
		if (!isContainUUID(vars,Formulas[i].Goal.ID))
		{
			vars.push(Formulas[i].Goal);
		}
	}
	return vars;
}

function GetRelatedVars (goal_var, Formulas) {
	//console.log("GET RELATED VARS FOR '"+goal_var+"' IN "+Formulas);
	var vars = [];
	for (var i = 0; i < Formulas.length; i++)
	{
		if (Formulas[i].Goal.ID == goal_var['ID'])
		{
			for (var j = 0; j < Formulas[i].Variables.length; j++)
			{
				if (!isContainUUID(vars,Formulas[i].Variables[j].ID))
				{
					if (!isConstant(Formulas[i].Variables[j]))
						vars.push(JSON.parse(JSON.stringify(Formulas[i].Variables[j])));
					var res = GetRelatedVars(Formulas[i].Variables[j],Formulas);
					for (var cc = 0; cc < res.length; cc++)
					{
						if (!isContainUUID(vars,res[cc].ID))
						{
							if (!isConstant(res[cc]))
								vars.push(JSON.parse(JSON.stringify(res[cc])));
						}
					}
				}
			}
		}
	}
	return vars;
}

function getVariableByName(id, Formulas) {
	var vars = [];
	for (var i = 0; i < Formulas.length; i++) {
		if (!isContainUUID(vars,Formulas[i].Goal.ID))
		{
			vars.push(Formulas[i].Goal);
		}
		for (var j = 0; j < Formulas[i].Variables.length; j++) {
			if (!isContainUUID(vars,Formulas[i].Variables[j].ID))
			{
				vars.push(Formulas[i].Variables[j]);
			}
		}
	}
	//return vars;
	for (i in vars)
	{
		if (vars[i].Name == id)
			return vars[i];
	}
	return "NOT_FOUND";
}

function getVariableById(id, Formulas) {
	var vars = [];
	for (var i = 0; i < Formulas.length; i++) {
		if (!isContainUUID(vars,Formulas[i].Goal.ID))
		{
			vars.push(Formulas[i].Goal);
		}
		for (var j = 0; j < Formulas[i].Variables.length; j++) {
			if (!isContainUUID(vars,Formulas[i].Variables[j].ID))
			{
				vars.push(Formulas[i].Variables[j]);
			}
		}
	}
	//return vars;
	for (i in vars)
	{
		if (vars[i].ID == id)
			return vars[i];
	}
	return "NOT_FOUND";
}

function GetConstants (Formulas) {
	var vars = [];
	var v;
	for (var i = 0; i < Formulas.length; i++) {
		if (!isContainUUID(vars,Formulas[i].Goal.ID))
		{
			v = JSON.parse(JSON.stringify(Formulas[i].Goal));
			if (v.Value !== "" && v.Value!== null && v.Value!== undefined)
				vars.push(v);
		}
		for (var j = 0; j < Formulas[i].Variables.length; j++) {
			if (!isContainUUID(vars,Formulas[i].Variables[j].ID))
			{
				v = JSON.parse(JSON.stringify(Formulas[i].Variables[j]));
				if (v.Value !== "" && v.Value!== null && v.Value!== undefined)
					vars.push(v);
			}
		}
	}
	return vars;
}

function Solve(goal, know, Formulas) {
	var g_result = [];
	var need_more = [];
	var goals = [];
	for (var k = 0; k < Formulas.length; k++)
	{
		if (Formulas[k].Goal.ID == goal.ID)
		{
			var g = Formulas[k];
			goals.push(Formulas[i]);
			var result = [];
			for (var i = 0; i < g.Variables.length; i++) {
				var nm = FindFormulas(g.Variables[i],know,Formulas);
				if (nm!=="")
				{
					while(nm.length>0)
					{
						var n = nm.pop();
						need_more.push(n);
						know.push(n.Goal);
					}
				}
				if (isContainAllVar(g,know))
					break;
			}
			if (isContainAllVar(g,know)) {
				while(need_more.length >0) {
					result.push(need_more.pop());
				}
				result.push(g);
				g_result.push(result);
			}
		}
	}
	return g_result;
}

//Поиск формулы по целевой и известным переменным
function FindFormulas(f_find, know, Formulas) {
	var need_more = [];
	var g = FindGoal(f_find, Formulas);
	if (g !== "")
	{
		/*while(!isContainAllVar(g,know))
		{

		}*/
		var result = [];
		
		
		for (var i = 0; i < g.Variables.length; i++) {
			var nm = FindFormulas(g.Variables[i],know, Formulas);
			if (nm!=="")
			{
				while(nm.length>0)
				{
					var n = nm.pop();
					need_more.push(n);
					know.push(n.Goal);
				}
			}
			if (isContainAllVar(g,know))
				break;
		}
		if (isContainAllVar(g,know)) {
			while(need_more.length >0) {
				result.push(need_more.pop());
			}
			result.push(g);
			return result;
		}else
		{
			return "";
		}
	}else
	{
		return "";
	}

}

//Проверка, содержит ли формула все переменные из списка
function isContainAllVar(formula,vars) {
	var all_good = true;
	for (var i = 0; i < formula.Variables.length; i++) {
		var good = false;
		for (var j = 0; j < vars.length; j++) {
			if (formula.Variables[i].ID == vars[j].ID)
			{
				if (formula.Variables[i].Index !== "" && formula.Variables[i].Index !== null && formula.Variables[i].Index !== undefined)
				{
					if (vars[j].Index !== "" && vars[j].Index !== null && vars[j].Index !== undefined)
					{
						if (formula.Variables[i].Index == vars[j].Index)
						{
							good = true;
							break;
						}
					}
				}else
				{
					if (vars[j].Index === "" || vars[j].Index === null || vars[j].Index === undefined)
					{
						good = true;
						break;
					}
				}
			}
		}
		if (!good)
			all_good = false;

	}
	return all_good;
}

function FindGoal (f, Formulas) {
	for (var i = 0; i < Formulas.length; i++) {
		if (Formulas[i].Goal.ID == f.ID)
			return Formulas[i];
	}
	return "";
}

//Извлекает все уникальные переменные из всех формул
function GetAllVariables(Formulas) {
	var vars = [];
	for (var i = 0; i < Formulas.length; i++) {
		if (!isContainUUID(vars,Formulas[i].Goal.ID))
		{
			vars.push(Formulas[i].Goal);
		}
		for (var j = 0; j < Formulas[i].Variables.length; j++) {
			if (!isContainUUID(vars,Formulas[i].Variables[j].ID))
			{
				vars.push(Formulas[i].Variables[j]);
			}
		}
	}
	return vars;
}

exports.ParseFormulas = ParseFormulas;
exports.GetFindableVars = GetFindableVars;
exports.isContainUUID = isContainUUID;
exports.GetRelatedVars = GetRelatedVars;
exports.getVariableById = getVariableById;
exports.getVariableByName = getVariableByName;
exports.GetConstants = GetConstants;
exports.Solve = Solve;
exports.GetAllVariables = GetAllVariables;