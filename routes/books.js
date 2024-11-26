const express = require("express")
const router = express.Router()
const {
    check,
    validationResult
} = require('express-validator');

const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('../users/login') // redirect to the login page
    } else {
        next(); // move to the next middleware function
    }
}

router.get('/search', function (req, res, next) {
    res.render("search.ejs")
})

router.get('/search_result', [check('search_text').notEmpty().isLength({
    min: 3
})], function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.redirect('./search');
    }

    // Search the database

    let sqlquery = "SELECT * FROM books WHERE name LIKE '%" + req.query.search_text + "%'" // query database to get all the books
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err)
        }
        res.render("list.ejs", {
            availableBooks: result
        })
    })
})


router.get('/list', function (req, res, next) {
    let sqlquery = "SELECT * FROM vw_books_and_authors"; // use the view instead of the books table
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err);
        }

        console.log(result)
        res.render("list.ejs", {
            availableBooks: result
        });
    });
});

router.get('/addbook', redirectLogin, function (req, res, next) {
    res.render('addbook.ejs')
})

router.post('/bookadded', [
    check('name').isLength({ min: 3 }),
    check('price').isLength({ min: 1 }).isNumeric(),
    check('authorFirstName').isLength({ min: 1 }),
    check('authorLastName').isLength({ min: 1 })
], redirectLogin, function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // console.log(errors)
        return res.redirect('./addbook');
    }
    
    // Extract and sanitize input data
    let bookName = req.sanitize(req.body.name);
    let bookPrice = parseFloat(req.sanitize(req.body.price));
    let authorFirstName = req.sanitize(req.body.authorFirstName);
    let authorLastName = req.sanitize(req.body.authorLastName);

    // Call stored procedure to add book and author
    let sqlquery = "CALL AddBookAndAuthor(?, ?, ?, ?)";
    let newrecord = [bookName, bookPrice, authorFirstName, authorLastName];

    db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
            next(err);
        } else {
            res.send(`This book and author are added to the database. Book: ${bookName}, Price: ${bookPrice}`);
        }
    });
});

router.get('/bargainbooks', function (req, res, next) {
    let sqlquery = "SELECT * FROM books WHERE price < 20"
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err)
        }
        res.render("bargains.ejs", {
            availableBooks: result
        })
    })
})


// Export the router object so index.js can access it
module.exports = router