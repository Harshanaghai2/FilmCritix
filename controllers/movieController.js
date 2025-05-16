const movies = require('../data/movies');

exports.home = (req, res) => {
  res.render('pages/home', { title: 'Home' });
};

exports.about = (req, res) => {
  res.render('pages/about', { title: 'About' });
};

exports.listMovies = (req, res) => {
  res.render('pages/movies', { title: 'All Movies', movies });
};

exports.movieDetails = (req, res) => {
  const movie = movies.find(m => m.id === parseInt(req.params.id));
  if (!movie) {
    return res.status(404).render('pages/404', { title: 'Movie Not Found' });
  }
  res.render('pages/movieDetails', { title: movie.title, movie });
};
exports.searchMovies = (req, res) => {
    const query = req.query.q?.toLowerCase() || '';
    const filteredMovies = movies.filter(movie => 
      movie.title.toLowerCase().includes(query) || 
      movie.director.toLowerCase().includes(query)
    );
    res.render('pages/movies', { title: 'Search Results', movies: filteredMovies });
  };
  