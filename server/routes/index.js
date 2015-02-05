var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/socket', function(req, res, next){
   res.render('socket', {title: 'socket.io test'})
});

module.exports = router;
