const express = require("express")
const router = express.Router()

router.get('/books', function (req, res, next) {

    let search_term = req.sanitize(req.query.search_term);
    // Query database to get all the books
    let sqlquery = "SELECT * FROM books"

    if (search_term !== undefined && search_term !== "") {
        sqlquery += " WHERE name LIKE '%" + search_term + "%'"
    }

    // Execute the sql query
    db.query(sqlquery, (err, result) => {
        // Return results as a JSON object
        if (err) {
            res.json(err)
            next(err)
        }
        else {
            res.json(result)
        }
    })
})

module.exports = router