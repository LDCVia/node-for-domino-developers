var express = require('express');
var router = express.Router();
var rest = require('restler'); 
var auth = require('../controllers/authorization');
var http = require('http');
var cookie = require('cookie');
var _ = require('underscore');

/* Handle Authentication */
/* GET login page */
router.get('/login',  function(req, res, next) {
  res.render('login', {"title": "Please login"});
});

router.post('/login', function(req, res, next){
  try{
    var data = "username=" + req.body.username + "&password=" + req.body.password + "&redirectto=/names.nsf?open";
    var options = {
      host: 'dev.londc.com',
      port: '80',
      path: '/names.nsf?login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': data.length
      }
    }
    var req = http.request(options, (response) => {
      response.setEncoding('utf8');
      var data = "";
      response.on('data', function(chunk){
        data += chunk;
      });
      response.on('end', function(){
        // parse returned cookies in header
        var setcookie = response.headers["set-cookie"];
        var cookieobj = {};
        if(setcookie){
          for (var i=0; i<setcookie.length; i++){
            if (setcookie[i].indexOf("DomAuthSessId=") > -1){
              cookieobj = cookie.parse(setcookie[i]);
            }
          }
          if (cookieobj['DomAuthSessId']){
            //Store session cookie in requestors browser
            res.cookie('DomAuthSessId', cookieobj);
            res.redirect("/");
          }else{
            res.render("login", {"error": "Error getting auth cookie"});
          };
        }else{
          res.render("login", {"error": "Invalid username or password"});
        }
      })
    })
    req.write(data);
    req.end();
  }catch(e){
    res.render("login", {'error': e});
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

/* GET home page. */
router.get('/', auth.requiresLogin, function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/domino', auth.requiresLogin, function(req, res, next) {

  rest.get(
    'http://dev.londc.com/demos/discussion.nsf/api/data/collections/unid/8178B1C14B1E9B6B8525624F0062FE9F?count=100',
    {headers:
      {'cookie': getCookies(req)}
    }
  ).on('complete', function(data, response){ 
    res.render('domino', {title: 'Domino Data', data: data});
  });
})

router.get('/domino/:unid', auth.requiresLogin, function(req, res, next){
  rest.get(
    'http://dev.londc.com/demos/discussion.nsf/api/data/documents/unid/' + req.params.unid,
    {headers:
      {'cookie': getCookies(req)}
    }
  )
  .on('complete', function(data, response){ 
    if (data.Body && data.Body.content){
      //Let's tidy up the Body field a little
      for (var i=0; i<data.Body.content.length; i++){
        var obj = data.Body.content[i];
        if (obj.contentType && obj.contentType.indexOf("text/html") > -1){
          data.Body = obj.data;
          break;
        }
      }
    }
    res.render('dominodoc', {title: 'Domino Document', data: data});
  });
})

router.get('/domino/:unid/edit', auth.requiresLogin, function(req, res, next){
  rest.get(
    'http://dev.londc.com/demos/discussion.nsf/api/data/documents/unid/' + req.params.unid,
    {headers:
      {'cookie': getCookies(req)}
    }
  )
  .on('complete', function(data, response){ 
    if (data.Body && data.Body.content){
      //Let's tidy up the Body field a little
      for (var i=0; i<data.Body.content.length; i++){
        var obj = data.Body.content[i];
        if (obj.contentType && obj.contentType.indexOf("text/plain") > -1){
          data.Body = obj.data;
          break;
        }
      }
    }
    res.render('dominodocedit', {title: 'Domino Document', data: data});
  });
})

router.post('/domino/:unid/edit', auth.requiresLogin, function(req, res, next){
  rest.putJson(
    'http://dev.londc.com/demos/discussion.nsf/api/data/documents/unid/' + req.params.unid + '?computewithform=true',
    req.body,
    {headers:
      {'cookie': getCookies(req)}
    }
  ).on('complete', function(data, response){
    res.redirect('/domino/' + req.params.unid);
  })
})

router.get('/create', auth.requiresLogin, function(req, res, next){
  res.render('dominodocnew');
})

router.post('/domino/create', auth.requiresLogin, function(req, res, next){
  rest.postJson(
    'http://dev.londc.com/demos/discussion.nsf/api/data/documents?form=MainTopic&computewithform=true',
    req.body,
    {headers:
      {'cookie': getCookies(req)}
    }
  ).on('complete', function(data, response){
    res.redirect('/domino');
  })
})

module.exports = router;
