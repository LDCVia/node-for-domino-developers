var express = require('express');
var router = express.Router();
var rest = require('restler'); 

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/domino', function(req, res, next) {

  rest.get('http://dev.londc.com/demos/discussion.nsf/api/data/collections/unid/8178B1C14B1E9B6B8525624F0062FE9F')
  .on('complete', function(data, response){ 
    res.render('domino', {title: 'Domino Data', data: data});
  });
})

router.get('/domino/:unid', function(req, res, next){
  rest.get('http://dev.londc.com/demos/discussion.nsf/api/data/documents/unid/' + req.params.unid)
  .on('complete', function(data, response){ 
    res.render('dominodoc', {title: 'Domino Document', data: data});
  });
})

module.exports = router;
