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
    let sqlquery = "SELECT * FROM books" // query database to get all the books
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

router.get('/addbook', redirectLogin, function (req, res, next) {
    res.render('addbook.ejs')
})

router.post('/bookadded', [check('name').isLength({min: 3}), check('price').isLength({min: 1}).isNumeric()], redirectLogin, function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        //console.log(errors)
        return res.redirect('./addbook');
    }
    // saving data in database
    let bookName = req.sanitize(req.body.name);
    let bookPrice = req.sanitize(req.body.price);

    let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)"
    // execute sql query
    let newrecord = [bookName, bookPrice]
    db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
            next(err)
        } else
            res.send(' This book is added to database, name: ' + bookName + ' price ' + bookPrice)
    })
})

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