// Create a new router
const express = require("express")
const bcrypt = require('bcrypt')
const router = express.Router()

const saltRounds = 10

router.get('/register', function (req, res, next) {
    const error = req.query.error || ''

    res.render('register.ejs', {error});
})    

router.post('/registered', function (req, res) {
    const first_name = req.body.first;
    const last_name = req.body.last;
    const email_address = req.body.email;
    const username = req.body.username;
    const plainPassword = req.body.password;

    let checkUserQuery = `SELECT * FROM users WHERE email_address = ? OR username = ?`;
    db.query(checkUserQuery, [email_address, username], (err, results) => {
        if (err) {
            return res.status(500).send('Database error checking user');
        }

        if (results.length > 0) {
            return res.render('register', { error: 'Username or email already taken' });
        }

        bcrypt.hash(plainPassword, saltRounds, function (err, hashedPw) {
            if (err) {
                return res.status(500).send('Error hashing password');
            }

            let sqlquery = `INSERT INTO users (username, first_name, last_name, email_address, password) VALUES (?, ?, ?, ?, ?)`;
            let newData = [username, first_name, last_name, email_address, hashedPw];

            db.query(sqlquery, newData, (err, result) => {
                if (err) {
                    return res.status(500).send('Database error');
                } else {
                    let message = `Hello ${first_name} ${last_name}, you are now registered! We will send an email to you at ${email_address}.`;
                    message += ` Your password is: ${plainPassword} and your hashed password is: ${hashedPw}`;
                    res.send(message);
                }
            });
        });
    });
});

router.get('/lists', function(req, res, next) {
    let sqlquery = "SELECT id, first_name, last_name, username, email_address FROM users"; // select only non-sensitive fields
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err);
        }
        res.render("listusers.ejs", {availableUsers: result});
    });
});

router.get('/login', function (req, res, next) {
    const error = req.query.error || ''

    res.render('login.ejs', {error});
});

router.post('/loggedin', function (req, res, next) {
    let sqlquery = "SELECT * FROM users WHERE username = ?";
    let username = req.body.username;
    let password = req.body.password;

    db.query(sqlquery, [username], (err, result) => {
        if (err) {
            next(err);
        }
        if (result.length === 0) {
            console.log('Invalid username or password')
            res.render('login.ejs', {error: 'Invalid username or password'});
            return;
        }

        bcrypt.compare(password, result[0].password, function (err, result) {
            if (err) {
                console.log(err)
                res.render('login.ejs', {error: 'Invalid username or password'});
            }
            else if (result == true) {
                res.send('You are logged in!');
            }
            else {
                res.render('login.ejs', {error: 'Invalid username or password'});
            }
          })
        
        });
    });
        

// Export the router object so index.js can access it
module.exports = router