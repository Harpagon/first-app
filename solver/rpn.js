function Token (o, opType, tType, v, p) {
	this.op = o;
	this.val = v;
	this.precidence = p;
	this.OpType = opType;  //UNARY_PREFIX, UNARY_POSTFIX, BINARY_LEFT_ASSOC, BINARY_RIGHT_ASSOC, FUNCTION
	this.TokenType = tType; // NUMBER, OPERATOR, BRACKET_LEFT, BRACKET_RIGHT
}

Token.prototype = {
	toString: function toString()
	{
		if (this.TokenType=="NUMBER")
		{
			return this.val.toString();
		}
		if (this.TokenType=="OPERATOR") return this.op;
		if (this.TokenType=="BRACKET_LEFT") return "(";
		if (this.TokenType=="BRACKET_RIGHT") return ")";
		else return "";
	}
};

function Parser () {
	this.gInfixQueue = [];
	this.gPostfixQueue =[];
	this.gFunctions = ["abs", "acos", "asin", "atan",  "exp", "random", "sqrt", "log", "round", "floor", "ceil", "sin", "cos", "tan"];
}

Parser.prototype.isNumeric = function(c) {
		if (c == "0" || c=="1" || c=="2" || c=="3" || c=="4" || c=="5" || c=="6" || c=="7" || c=="8" || c=="9"  || c=='.') return true;
		return false;
};

Parser.prototype.isLetter = function(c) {
	c = c.toString().toLowerCase();
	if ( c == "a" || c == "b" || c == "c" || c == "d" || c == "e" || c == "f" || c == "g" || c == "h" || c == "i" || c == "j" ||
         c == "k" || c == "l" || c == "m" || c == "n" || c == "o" || c == "p" || c == "q" || c == "r" || c == "s" || c == "t" ||
         c == "u" || c == "v" || c == "w" || c == "x" || c == "y" || c == "z" ) return true;
		return false;
};

Parser.prototype.isFunction = function(c) {
	for (var i = 0; i < this.gFunctions.length; i++) {
		if (this.gFunctions[i] == c.toString().toLowerCase())
			return true;
	}
	return false;
};

Parser.prototype.Tokenize = function(str) {
	var i=0;
	var cur;
	var numstr;
	str = str.toString().toLowerCase();
	str = str.replace(new RegExp(" ",'g'),"").
              replace(new RegExp(",",'g'),".").
              replace(new RegExp("pi|π",'g'), Math.PI.toString()).
              replace(new RegExp("([^a-z]|^)e([^a-z]|$)",'g'), "$1"+Math.E.toString()+"$2").
              replace(new RegExp("°",'g'), "*"+Math.PI.toString()+"/180");
	this.gInfixQueue = [];
	while (i < str.length)
	{
		cur=str[i];
		if (this.isNumeric(cur)){
			numstr="";
			numstr=numstr.concat(cur);
			i++;
			while(i < str.length && this.isNumeric(str[i])){
				numstr=numstr.concat(str[i]);
				i++;
			}
			i--;
			try{
				this.gInfixQueue.push(new Token(numstr, "", "NUMBER", parseFloat(numstr), 0));
			}catch(e){
				this.gInfixQueue = [];
				return("Очень плохая цифра, очень... '"+numstr+"'");
			}
		}
		else{
			if (cur=='+'){
				this.gInfixQueue.push(new Token(cur,"BINARY_LEFT_ASSOC","OPERATOR","",50));
			}
			else{
				if (cur=='-'){
					if (this.gInfixQueue.length===0 || (this.gInfixQueue[this.gInfixQueue.length-1].TokenType != "NUMBER" && this.gInfixQueue[this.gInfixQueue.length -1].TokenType != "BRACKET_RIGHT")){
						this.gInfixQueue.push(new Token(cur,"UNARY_PREFIX","OPERATOR","",100));
					}
					else{
						this.gInfixQueue.push(new Token(cur,"BINARY_LEFT_ASSOC","OPERATOR","", 50));
					}
				}
				else{
					if(cur == '*' || cur=='/'){
						this.gInfixQueue.push(new Token(cur, "BINARY_LEFT_ASSOC","OPERATOR","", 60));
					}
					else{
						if(cur=='^'){
							this.gInfixQueue.push(new Token(cur, "BINARY_RIGHT_ASSOC","OPERATOR","", 110));
						}
						else{
						if(cur=='('){
							this.gInfixQueue.push(new Token(cur, "", "BRACKET_LEFT","",0));
						}
						else{
							if(cur==')'){
								this.gInfixQueue.push(new Token(cur,"","BRACKET_RIGHT","",0));
							}
							else{
								/*this.gInfixQueue = [];
								return("Херню ввели: '"+cur+"'");*/
								numstr=cur;
								i++;
								while(i < str.length && this.isLetter(str[i])){
									numstr=numstr.concat(str[i]);
									i++;
								}
								i--;
								if (this.isFunction(numstr))
								{
									this.gInfixQueue.push(new Token(numstr,"FUNCTION","OPERATOR","",100));
								}else
								{
									this.gInfixQueue = [];
									return("Херню ввели: '"+numstr+"'");
								}
							}
						}
					}
				}
			}
		}
	}
		i++;
	}
	return this.gInfixQueue;
};

Parser.prototype.ConvertToPostfix = function() {
	if (this.gInfixQueue.length === 0) return "";
	var shuntingStack = [];
	var infixQueue = [];
	for (var q = this.gInfixQueue.length-1; q >= 0 ; q--) {
				infixQueue.push(this.gInfixQueue[q]);
	}
	var t;
	this.gPostfixQueue = [];
	shuntingStack = [];
	while (infixQueue.length>0)
	{
		t = infixQueue.pop();
		if (t.TokenType=="NUMBER") this.gPostfixQueue.push(t);
			else if (t.TokenType=="OPERATOR")
			{
				if (t.OpType=="UNARY_POSTFIX") this.gPostfixQueue.push(t);
				else if (t.OpType=="UNARY_PREFIX") shuntingStack.push(t);
				else if (t.OpType=="FUNCTION") shuntingStack.push(t);
				else if (t.OpType=="BINARY_LEFT_ASSOC")
				{
					while (shuntingStack.length>0 && shuntingStack[shuntingStack.length-1].precidence >= t.precidence) this.gPostfixQueue.push(shuntingStack.pop());
					shuntingStack.push(t);
				}
				else if (t.OpType=="BINARY_RIGHT_ASSOC")
				{
					while (shuntingStack.length>0 && shuntingStack[shuntingStack.length-1].precidence > t.precidence) this.gPostfixQueue.push(shuntingStack.pop());
					shuntingStack.push(t);
				}
			}
			else if (t.TokenType=="BRACKET_LEFT") shuntingStack.push(t);
			else if (t.TokenType=="BRACKET_RIGHT")
			{
				try {while (shuntingStack[shuntingStack.length-1].TokenType != "BRACKET_LEFT") this.gPostfixQueue.push(shuntingStack.pop());}
				catch (e)
				{
					gPostfixQueue = [];
					return("Херня со скобками в стэке.");
				}
				shuntingStack.pop();
			}
		}
		while (shuntingStack.length>0)
		{
			if (shuntingStack[shuntingStack.length-1].TokenType!="OPERATOR")
			{
				gPostfixQueue = [];
				return("Херня в стэке не оператор");
			}
			else this.gPostfixQueue.push(shuntingStack.pop());
		}
		return this.gPostfixQueue;
};

Parser.prototype.EvaluatePostfix = function() {
	if (this.gPostfixQueue.length===0) return "";
		var t;

		var postfixQueue = [];
		for (var q = this.gPostfixQueue.length-1; q >= 0 ; q--) {
				postfixQueue.push(this.gPostfixQueue[q]);
		}
		var rpevalStack = [];
		while (postfixQueue.length>0)
		{
			try
			{
				t=postfixQueue.pop();
				if (t.TokenType=="NUMBER") rpevalStack.push(t.val);
				else if (t.TokenType=="OPERATOR")
				{
					var a1 = rpevalStack.pop();
					if (t.op=='+') rpevalStack.push(a1+rpevalStack.pop());
					else if (t.op=='-' && t.OpType=="BINARY_LEFT_ASSOC") rpevalStack.push(rpevalStack.pop()-a1);
					else if (t.op=='-' && t.OpType=="UNARY_PREFIX") rpevalStack.push(-a1);
					else if (t.op=='*') rpevalStack.push(a1*rpevalStack.pop());
					else if (t.op=='/') rpevalStack.push(rpevalStack.pop()/a1);
					else if (t.op=='^') rpevalStack.push(Math.pow(rpevalStack.pop(),a1));
					else if (t.op=='sin') rpevalStack.push(Math.sin(a1));
					else if (t.op=='cos') rpevalStack.push(Math.cos(a1));
					else if (t.op=='tan') rpevalStack.push(Math.tan(a1));
					else if (t.op=='atan') rpevalStack.push(Math.atan(a1));
					else if (t.op=='abs') rpevalStack.push(Math.abs(a1));
					else if (t.op=='acos') rpevalStack.push(Math.acos(a1));
					else if (t.op=='asin') rpevalStack.push(Math.asin(a1));
					else if (t.op=='exp') rpevalStack.push(Math.exp(a1));
					else if (t.op=='random') rpevalStack.push(Math.random());
					else if (t.op=='sqrt') rpevalStack.push(Math.sqrt(a1));
					else if (t.op=='log') rpevalStack.push(Math.log(a1));
					else if (t.op=='round') rpevalStack.push(Math.round(a1));
					else if (t.op=='floor') rpevalStack.push(Math.floor(a1));
					else if (t.op=='ceil') rpevalStack.push(Math.ceil(a1));
				}
			}
			catch (e)
			{
				return "Нет больше херни для вычисления.";
				//break;
			}
		}
		if (rpevalStack.length!=1)
			return "Херовая постфиксная запись.";
		else return rpevalStack.pop();

};

Parser.prototype.Eval = function(input) {
	var res = this.Tokenize(input);
	if (this.gInfixQueue.length === 0)
		return res;
	res = this.ConvertToPostfix();
	if (this.gPostfixQueue.length === 0)
		return res;
	/*if (fix.length>0)
		return this.EvaluatePostfix()*/
	return this.EvaluatePostfix().toFixed(5).toString().replace(new RegExp('0+$','g'),'').replace(new RegExp('\\.+$','g'),'');
};

function Main (input,out) {
	var p = new Parser();
	out.textContent = p.Eval(input);
	/*out.innerText = "\r\n" + p.Tokenize(input)+"\r\n";
	out.innerText += p.ConvertToPostfix()+"\r\n";
	out.innerText += p.EvaluatePostfix();/**/
}

