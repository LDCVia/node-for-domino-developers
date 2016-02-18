var express = require('express');
var router = express.Router();
var rest = require('restler'); 
var auth = require('../controllers/authorization');
var request = require('request');

/* GET home page. */
router.get('/', auth.requiresLogin, function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/domino', auth.requiresLogin, function(req, res, next) {

  rest.get('http://dev.londc.com/demos/discussion.nsf/api/data/collections/unid/8178B1C14B1E9B6B8525624F0062FE9F')
  .on('complete', function(data, response){ 
    res.render('domino', {title: 'Domino Data', data: data});
  });
})

router.get('/domino/:unid', auth.requiresLogin, function(req, res, next){
  rest.get('http://dev.londc.com/demos/discussion.nsf/api/data/documents/unid/' + req.params.unid)
  .on('complete', function(data, response){ 
    res.render('dominodoc', {title: 'Domino Document', data: data});
  });
})

/* GET login page */
router.get('/login',  function(req, res, next) {
  res.render('login', {"title": "Please login"});
});

router.post('/login', function(req, res, next){
  try{
    request.post(
      "https://dev.londc.com/names.nsf?open&login",
      {form: {username: req.body.username, password: req.body.password}},
      function (err, response, body){
        if(!err && response.statusCode == 200){
          // parse returned cookies in header
          var setcookie = response.headers["set-cookie"];
          var cookieobj = {};
          for (var i=0; i<setcookie.length; i++){
            if (setcookie[i].indexOf("DomAuthSessId=") > -1){
              cookieobj = cookie.parse(setcookie[i]);
            }
          }
          if (cookieobj['DomAuthSessId'] && data.success){
            //Store session cookie in requestors browser
            res.cookie('DomAuthSessId', cookieobj);
            res.redirect("/");
          }else{
            res.render("login", {"error": "Error getting auth cookie"});
          };
        }else{
          res.render("login", {"error": err});
        }
    });
  }catch(e){
    res.render("/login");
  }
})

function getCookies(req){
  var cookies = _.map(req.cookies, function(val, key) {
    if(key == "DomAuthSessId"){
      return key + "=" + val['DomAuthSessId'];
    }
  }).join("; ");
  return cookies;
}

module.exports = router;
