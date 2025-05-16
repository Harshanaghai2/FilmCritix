const https = require('https');

const API_KEY = 'd7b18426';

function fetchPosterByTitle(title, callback) {
  const url = `https://www.omdbapi.com/?apikey=${API_KEY}&t=${encodeURIComponent(title)}`;

  https.get(url, (resp) => {
    let data = '';

    resp.on('data', (chunk) => {
      data += chunk;
    });

    resp.on('end', () => {
      const movieData = JSON.parse(data);
      if (movieData.Response === "True") {
        callback(null, movieData.Poster);
      } else {
        callback(new Error("Movie not found"));
      }
    });

  }).on("error", (err) => {
    callback(err);
  });
}

module.exports = { fetchPosterByTitle };
