var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('req.query (GET): '+JSON.stringify(req.query));
  req.body = req.query; // Now behaves very much like POST
  listTerms(req, res, next);
//  res.render('index', { title: '305demo' });
});

/* POST home page. */
router.post('/', function(req, res, next) {
  console.log('req.body (POST): '+JSON.stringify(req.body));
  listTerms(req, res, next);
});

function listTerms(req, res, next) {
  let sql = 'SELECT distinct OffTerm, OffYear from Offering order by OffYear;'
  req.app.locals.db.all(sql, [], (err, rows) => {
      if (err) {
        throw err;
      }
      req.app.locals.termslist = rows;
      listFaculty(req, res, next);
  })
}

function listFaculty(req, res, next) {
  if (req.body.HR_page) {
    console.log('HR page');
    // res.render('HR_page', { title: 'HR page' });

    let sql = 'SELECT FacSSN, FacFirstName, FacLastName from Faculty;'
    req.app.locals.db.all(sql, [], (err, rows) => {
      if (err) {
        throw err;
      }
      req.app.locals.facpeople = rows;
      req.app.locals.title = 'HR page';
      renderPage(req, res, next);
    })
  }
  else {
    req.app.locals.title = '305demo';
    renderPage(req, res, next);
  }
}

function renderPage(req, res, next) {
  res.render('index', { title: req.app.locals.title,
                        formdata: req.body,
                        termslist: req.app.locals.termslist,
                        facpeople: req.app.locals.facpeople                        
  });
}

module.exports = router;
