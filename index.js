const express = require('express');
const request = require('request-promise');
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());



// const apiKey = '62ffac58c57333a136053150eaa1b587';
// const fetchId = `http://api.tmdb.org/3/search/person?api_key=${apiKey}&query=${actorName}`;
// const fetchMovies = `https://api.themoviedb.org/3/person/${id}/movie_credits?api_key=${apiKey}&language=en-US`;
const fetchIdFunction = (apiKey, actorName) => `http://api.tmdb.org/3/search/person?api_key=${apiKey}&query=${actorName}`
const fetchMovieFunction = (apiKey, actorId) => `http://api.tmdb.org/3/person/${actorId}/movie_credits?api_key=${apiKey}`


app.get('/', (req, res) => {
    res.send('Welcome to Movie Actor Api');
});

app.get('/getid/:actorName', async (req, res) => {
    const actorName = req.params.actorName;
    const apiKey = req.query.apiKey;
    const fetchId = fetchIdFunction(apiKey, actorName);
    try {
        const response = await request(fetchId);
        const data = JSON.parse(response);
        const id = data.results[0].id;
        const fetchMovies = fetchMovieFunction(apiKey, id);
        try {
            const response = await request(fetchMovies);
            const data = JSON.parse(response);
            // sort the movies by release date
            const sortedMovies = data.cast.sort((a, b) => {
                return new Date(b.release_date) - new Date(a.release_date);
            });

            // drop all the movies whose release date in the future from sortedMovies
            const filteredMovies = sortedMovies.filter(movie => {
                return new Date(movie.release_date) < new Date();
            });

            // append the id of the actor to filteredMovies
            const moviesWithId = filteredMovies.map(movie => {
                return {
                    ...movie,
                    actorId: id
                }
            });
            res.send(moviesWithId);
        } catch (error) {
            console.log(error);
        }
        //res.send({ id });
    } catch (error) {
        res.json({ error: error.message });
    }
})
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});