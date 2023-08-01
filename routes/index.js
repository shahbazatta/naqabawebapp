var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  let date = new Date();
  res.render('index', { time: date.toDateString() +' '+ date.toTimeString() ,title:'Naqaba Web Server'});
});


module.exports = router;
