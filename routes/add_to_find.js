
/*
 * GET home page.
 */

exports.add_to_find = function(req, res){
  res.render('add_to_find', { title: 'Что ищем?', vars: GLOBAL.vars  });
};