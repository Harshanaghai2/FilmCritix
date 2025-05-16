const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

router.get('/', movieController.home);
router.get('/about', movieController.about);
router.get('/movies', movieController.listMovies);
router.get('/movies/:id', movieController.movieDetails);
router.get('/search', movieController.searchMovies);

module.exports = router;
