
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Он решает.', razdels: GLOBAL.razdels });
};

exports.about = function(req, res){
  res.render('about');
};

exports.contacts = function(req, res){
  res.render('contacts');
};