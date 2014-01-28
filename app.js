
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var solver = require('./routes/solve');
var ptext = require('./routes/text');
var user = require('./routes/user');
var addtofind = require('./routes/add_to_find');
var http = require('http');
var path = require('path');
var razd = require('./solver/razdels');

var app = express();

//sleep(5000);


GLOBAL.razdels = razd.GetRazdels();//[];//razd.GetRazdels();//[{id:'id1',name:'name1'},{id:'id2',name:'name2'}];

/*function load(argument) {
	//console.log("wait...");
	setTimeout(function() {
		GLOBAL.razdels = razd.GetRazdels();
		//console.log("wait done!");
	}, 10000);

}

load();*/
////console.log(GLOBAL.razdels);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.bodyParser());

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.post('/', routes.index);
app.get('/about', routes.about);
app.get('/contacts', routes.contacts);
app.get('/add_to_find', addtofind.add_to_find);
app.get('/users', user.list);
app.get('/solve', solver.solve);
app.get('/text', ptext.ptext);
app.get('/getvars', ptext.getvars);
app.post('/text', ptext.ptext);

http.createServer(app).listen(app.get('port'), function(){
  //console.log('Express server listening on port ' + app.get('port'));
});
