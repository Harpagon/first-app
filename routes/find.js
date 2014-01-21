
/*
 * GET home page.
 */

exports.find = function(req, res){
  res.render('find', { title: 'Что ищем?', vars: [{id:'id1',name:'name1'},{id:'id2',name:'name2'}] });
};