const request = require('request')
// Create a new router
const express = require("express")
const router = express.Router()

// Handle our routes
router.get('/', function (req, res, next) {
    res.render('index.ejs')
})

router.get('/about', function (req, res, next) {
    res.render('about.ejs')
})

router.get('/tv-shows', function (req, res, next) {
    res.render('tv-shows.ejs')
})

router.post('/tv-shows', function (req, res, next) {
    let searchQuery = req.sanitize(req.body.searchQuery);
    let url = `https://api.tvmaze.com/search/shows?q=${searchQuery}`;

    request(url, function (err, response, body) {
        if (err) {
            return next(err);
        }

        try {
            const tvShows = JSON.parse(body);
            const showDetailsPromises = tvShows.map(show => {
                return new Promise((resolve, reject) => {
                    const showId = show.show.id;
                    const episodesUrl = `https://api.tvmaze.com/shows/${showId}/episodes`;
        
                    request(episodesUrl, function (err, response, body) {
                        if (err) {
                            return reject(err);
                        }
                        const episodes = JSON.parse(body);
                        resolve({ show: show.show, episodes });
                    });
                });
            });
        
            Promise.all(showDetailsPromises).then(results => {
                const htmlContent = results.map(result => {
                    const showHtml = `
                        <div style="border: 1px solid #ccc; margin-bottom: 20px; padding: 20px;">
                            <h2>${result.show.name}</h2>
                            <div style="display: flex; align-items: flex-start;">
                                ${(result.show.image && result.show.image.medium) ? `
                                    <img src="${result.show.image.medium}" alt="${result.show.name}" style="display: block; margin-right: 20px; width: 150px;">
                                ` : ''}
                                <div>
                                    <p>${result.show.summary || 'No summary available.'}</p>
                                    <a href="${result.show.url}" target="_blank">More details</a>
                                </div>
                            </div>
                        </div>
                    `;
        
                    const episodesHtml = result.episodes.map(episode => `
                        <div style="display: flex; border-top: 1px solid #eee; padding-top: 10px; margin-top: 10px; align-items: flex-start;">
                            ${(episode.image && episode.image.medium) ? `
                                <img src="${episode.image.medium}" alt="${episode.name}" style="display: block; margin-right: 20px; width: 100px;">
                            ` : ''}
                            <div>
                                <h3>${episode.name} (Season ${episode.season}, Episode ${episode.number})</h3>
                                <p>${episode.summary || 'We don\'t have a summary for this episode.'}</p>
                                <a href="${episode.url}" target="_blank">Episode Details</a>
                            </div>
                        </div>
                    `).join('');
        
                    return showHtml + episodesHtml;
                }).join('');
        
                res.send(`
                    <html>
                    <head>
                        <title>TV Shows</title>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 900px; margin: auto; }
                            h1 { color: #333; }
                        </style>
                    </head>
                    <body>
                        <h1>Search Results for "${searchQuery}"</h1>
                        ${htmlContent}
                    </body>
                    </html>
                `);
            }).catch(error => next(error));
        
        } catch (error) {
            next(error);
        }
    });
});

// Export the router object so index.js can access it
module.exports = router