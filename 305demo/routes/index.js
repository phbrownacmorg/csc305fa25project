var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('req.query (GET): '+JSON.stringify(req.query));
  req.body = req.query; // Now behaves very much like POST
  setTitle(req, res, next);
//  res.render('index', { title: '305demo' });
});

/* POST home page. */
router.post('/', function(req, res, next) {
  console.log('req.body (POST): '+JSON.stringify(req.body));
  setTitle(req, res, next);
});

/*
 * Set req.app.locals.title to the desired title of the page, depending on
 * whether HR_page is checked or not.  Call listTerms next.
 */
function setTitle(req, res, next) {
  if (req.body.HR_page) {
    req.app.locals.title = 'HR page';
  }
  else {
    req.app.locals.title = '305demo';
  }
  listTerms(req, res, next);
}

/*
 * Unconditionally set req.app.locals.termslist to be a list of the terms 
 * represented in the Offerings table, and call listTermCourses.
 */
function listTerms(req, res, next) {
  let sql = 'SELECT distinct OffTerm, OffYear from Offering order by OffYear;'
  req.app.locals.db.all(sql, [], (err, rows) => {
      if (err) {
        throw err;
      }
      req.app.locals.termslist = rows;
      listTermCourses(req, res, next);
  })
}

/*
 * If req.body.term_year is set, set req.locals.termcourses to a list of the
 * courses offered in that term and year.  Call listFaculty next.
 */
function listTermCourses(req, res, next) {
  if (req.body.term_year) {
    console.log(`term_year = "${req.body.term_year}"`);
    let parts = req.body.term_year.split('_');
    let term = parts[0];
    let year = parts[1];
    console.log(`term="${term}" year="${year}"`);
    // This is all the columns in the Offering table.  The column names are
    // specified explicitly in the SQL to control the order of the columns
    // in the result.
    let sql = "select OfferNo, CourseNo, OffTerm, OffYear, OffDays, OffTime, OffLocation, FacSSN from Offering where OffTerm=? and OffYear=?;";
    req.app.locals.db.all(sql, [term, year], (err, rows) => {
      req.app.locals.termcourses = rows;
      console.log(`${rows.length} courses`);
      listFaculty(req, res, next);
    });
  }
  else {
    req.app.locals.termcourses = undefined;
    listFaculty(req, res, next);
  }
}


/*
 * Unconditionally set req.app.locals.facpeople to the FacSSN, FacFirstName, and
 * FacLastName of everyone in the Faculty table.  Call inquireFaculty.
 */
function listFaculty(req, res, next) {  
  let sql = 'SELECT FacSSN, FacFirstName, FacLastName from Faculty;'
  req.app.locals.db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
    req.app.locals.facpeople = rows;
    req.app.locals.title = 
    inquireFaculty(req, res, next);
  })
}

/*
 * Set req.app.locals.facDetails to all the details about a given faculty member.  Call renderPage.
 */
function inquireFaculty(req, res, next) {
  if (req.body.FacSSN) {
    sql = 'select FacSSN, FacFirstName, FacLastName, FacCity, FacState, FacZipCode, FacDept, FacRank, FacSalary, FacSupervisor, FacHireDate';
    sql += ' from Faculty where FacSSN=?;';
    req.app.locals.db.get(sql, [req.body.FacSSN], (err, row) => {
      if (err) {
        throw err;
      }
      req.app.locals.facDetails = row;
      renderPage(req, res, next);
    });
  }
  else {
    req.app.locals.facDetails = undefined;
    renderPage(req, res, next);
  }
}


/*
 * Marshal all the data that has been stashed in req.app.locals, and call res.render on index.
 */
function renderPage(req, res, next) {
  res.render('index', { title: req.app.locals.title,
                        formdata: req.body,
                        termslist: req.app.locals.termslist,
                        facpeople: req.app.locals.facpeople,
                        facdetails: req.app.locals.facDetails                        
  });
}

module.exports = router;
