function show_hide_find_vars() {
	if (find_vars.style.display == 'none')
		find_vars.style.display = 'block';
	else
		find_vars.style.display = 'none';
}

function show_hide_add_know() {
	if (add_know.style.display == 'none')
		add_know.style.display = 'block';
	else
		add_know.style.display = 'none';
}

function show_hide_addVars() {
	if (addVars.style.display == 'none')
		addVars.style.display = 'block';
	else
		addVars.style.display = 'none';
}

function getHTTPRequestObject() {
	var xmlHttpRequest;
	/*@cc_on
	@if (@_jscript_version >= 5)
		try {
			xmlHttpRequest = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (exception1) {
		try {
			xmlHttpRequest = new ActiveXObject("Microsoft.XMLHTTP");
		} catch (exception2) {
			xmlHttpRequest = false;
		}
	}
	@else
	xmlhttpRequest = false;
	@end @*/

	if (!xmlHttpRequest && typeof XMLHttpRequest != 'undefined') {
		try {
			xmlHttpRequest = new XMLHttpRequest();
		} catch (exception) {
			xmlHttpRequest = false;
		}
	}
	return xmlHttpRequest;
}
 
var httpRequester = getHTTPRequestObject(); /* Когда страница
							загрузилась, создаем xml http объект */
var couldProcess = false;

function GetVariables(id)
{
	var idToDisplay = id;
	if (!couldProcess && httpRequester) {
		httpRequester.open("GET", "/getvars?razd="+idToDisplay,true);
		httpRequester.onreadystatechange = processResponse;
		couldProcess = true;
		httpRequester.send(null);
	}

}

function processResponse () {
	if ( httpRequester.readyState == 4) {
		// если статус равен 200 (OK)
		if ( httpRequester.status == 200) {
			// ... результаты выполнения...
			var values = httpRequester.responseText;
			addVars.innerHTML = values;
			couldProcess = false;
		} else {
			addVars.textContent = "Ошибка получения переменных";
			couldProcess = false;
		}
	}
}

function AddToText(p) {
	var b = p.textContent.indexOf('(');
	var text = p.textContent.substr(0,b-1);
	var parseText = document.getElementById('parseText');
	var ss = parseText.selectionStart + (text+" = ").length;
	var sel = 0;
	if (parseText.value[parseText.selectionStart] == ";")
		sel = 1;
	parseText.value = parseText.value.substr(0,parseText.selectionStart+sel) + text+" = ;" + parseText.value.substr(parseText.selectionEnd+sel,parseText.value.length - parseText.selectionEnd);
	parseText.selectionStart = ss+sel;
	parseText.selectionEnd = ss+sel;
	parseText.focus();
}