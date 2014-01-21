
/*
 * GET home page.
 */

exports.add_to_find = function(req, res){
  res.render('add_to_find', { title: 'Что ищем?', vars: [{id:'id1',name:'name1'},{id:'id2',name:'name2'}] });
};