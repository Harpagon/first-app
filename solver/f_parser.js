

function ParseFormulas(formulasStr) {
	var Formulas = [];
	//formulasStr = '"a" "Сторона треугольника" "" "@uuid@"\r\n"b" "Основание треугольника" "" "@uuid@"\r\n"c" "Катет треугольника" "" "@uuid@"\r\n"h" "Высота треугольника" "" "@uuid@"\r\n"α" "Угол между сторонами треугольника" "" "@uuid@"\r\n"p" "Полупериметр треугольника" "" "@uuid@"\r\n"P" "Периметр треугольника" "" "@uuid@"\r\n"S" "Площадь треугольника" "" "@uuid@"\r\n["P" "Периметр треугольника:" "P = a1 + a2 +a3" {"a1" "a2" "a3"} "@uuid@"]\r\n["p" "Полупериметр треугольника:" "p = (a1 + a2 + a3) / 2" {"a1" "a2" "a3"} "@uuid@"]\r\n["S" "Площадь треугольника через основание и высоту:" "S = (1/2) * b * h" {"b" "h"} "@uuid@"]\r\n["S" "Площадь треугольника через его катеты:" "S = (1/2) * c1 * c2" {"c1" "c2"} "@uuid@"]\r\n["S" "Площадь треугольника по формуле Герона:" "S = sqrt(p * (p - a1) * (p - a2) * (p - a3))" {"p" "a1" "a2" "a3"} "@uuid@"]\r\n["S" "Площадь <strong>равнобедренного</strong> треугольника через сторону и основание:" "S = (b / 4) * sqrt(4 * a^2 - b^2)" {"a" "b"} "@uuid@"]\r\n["S" "Площадь <strong>равноcтороннего</strong> треугольника через сторону:" "S = (sqrt(3) / 4) * a^2" {"a"} "@uuid@"]';
	var variables = /(^"(.*?)" "(.*?)" "(.*?)")/gim;
	var formulas =/(^\["(.*?)" "(.*?)" "(.*?)" \{(.*?)\}\])/gim;
	//var vars_in_formula = /"(.*?)"/gim;
	var vars_in_formula = /"([^0-9]*?)([0-9]*?)"/gim;
	var uuid = /@uuid@/gim;

	//Выбор переменных и создание массива
	var vars = [];
	var myArray = variables.execAll(formulasStr);
	for (var i = 0; i < myArray.length; i++) {
		//alert(v_arr[i]);
		var vv = JSON.parse(myArray[i][0].replace(variables,"{\"Value\":\"$4\",\"Name\":\"$2\",\"Description\":\"$3\",\"ID\":\""+createUUID()+"\"}"));
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
		var f =  JSON.parse(myArray[myA][0].replace(formulas,"{\"Goal\":{},\"Variables\":[],\"Description\":\"$3\",\"Expression\":\"$4\",\"ID\":\""+createUUID()+"\"}"));
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
					if (vArray.length > 2)
						if (vArray[vA][2] !== null && vArray[vA][2] !== "" && vArray[vA][2]!== undefined)
							f.Variables[f.Variables.length-1].Index = parseInt(vArray[vA][2],10);
					//break;
				}
			}
		}
		//console.log(f);
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

exports.ParseFormulas = ParseFormulas;