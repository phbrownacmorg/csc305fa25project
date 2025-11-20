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
  changeFaculty(req, res, next);
}

/*
 * If there is a query to run to change the Faculty table, run it.
 * In any case, run getFaculty next.
 */
function changeFaculty(req, res, next) {
  console.log(`changeFaculty: ${req.body.action}`);
  if (req.body.action) {
    let sql = 'SELECT 3+2;';  // Do something harmless if sql doesn't get set properly
    fields = ['FacFirstName', 'FacLastName', 'FacCity', 'FacState',
              'FacDept', 'FacRank', 'FacSalary', 'FacHireDate', 'FacZipCode'];
    if (req.body.action == 'faculty_insert') {
      sql = 'INSERT INTO FACULTY(FacSSN';
      for (field of fields) {
        sql += `,${field}`;
      }
      if (req.body.FacSupervisor) {
        sql += ',FacSupervisor'
      }
      sql += `) VALUES ('${req.body.FacSSN}'`;
      for (field of fields) {
        sql += `,'${req.body[field]}'`;
      }
      if (req.body.FacSupervisor) {
        sql += `,'${req.body.FacSupervisor}'`;
      }
      sql += ');';
    }
    else if (req.body.action.startsWith('faculty_update_')) {
      if (req.body.FacDelete) {
        sql = `DELETE FROM Faculty WHERE FacSSN='${req.body.FacSSN}';`;
      }
      else {
        sql = `Update Faculty SET FacCity = '${req.body.FacCity}'`;
        update_fields = fields.slice(3,7).concat(['FacSupervisor','FacZipCode']);
        for (field of update_fields) {
          sql += `,${field} = '${req.body[field]}'`;
        }
        sql += ` WHERE FacSSN='${req.body.FacSSN}';`;
      }
    }
    console.log(sql);

    // Callback function defined in the old style so that this.changes gets the
    //     number of rows affected.
    function sqlCallback(err) {
      if (err) {
        throw err;
      }
      console.log(`${this.changes} rows affected.`)
      getFaculty(req, res, next);
    }

    req.app.locals.db.run(sql, [], sqlCallback);
  }
  else {
    getFaculty(req, res, next);
  }
}

/**
 * Unconditionally set req.app.locals.faculty to be a list of the
 * entire Faculty table.  Call listTerms next.
 */
function getFaculty(req, res, next) {
  let sql = 'SELECT * from Faculty order by FacLastName, FacFirstName, FacSSN;'
  req.app.locals.db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
    req.app.locals.faculty = rows;
    listTerms(req, res, next);
  })
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
 * courses offered in that term and year.  Call renderPage.
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
      renderPage(req, res, next);
    });
  }
  else {
    req.app.locals.termcourses = undefined;
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
                        faculty: req.app.locals.faculty                        
  });
}

module.exports = router;
