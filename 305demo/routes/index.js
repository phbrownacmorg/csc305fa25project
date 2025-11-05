var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('req.query (GET): '+JSON.stringify(req.query));
  req.body = req.query; // Now behaves very much like POST
  showPage(req, res, next);
//  res.render('index', { title: '305demo' });
});

/* POST home page. */
router.post('/', function(req, res, next) {
  console.log('req.body (POST): '+JSON.stringify(req.body));
  showPage(req, res, next);
});

function showPage(req, res, next) {
  if (req.body.HR_page) {
    console.log('HR page');
    // res.render('HR_page', { title: 'HR page' });
    res.render("index", { title: 'HR page',
                          formdata: req.body})
  }
  else {
    res.render('index', { title: '305demo',
                          formdata: req.body });
  }
}


module.exports = router;
