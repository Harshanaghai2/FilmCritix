
// const https = require('https');
// const bcrypt = require('bcrypt');
// const express = require('express');
// const path = require('path');
// const fs = require('fs');
// const bodyParser = require('body-parser');
// const session = require('express-session');
// const morgan = require('morgan');
// require('dotenv').config();

// const { OpenAI } = require('openai');

// const mongoose = require('mongoose');
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log('MongoDB connected!'))
//   .catch(err => console.error('MongoDB connection error:', err));

// // User schema and model
// const userSchema = new mongoose.Schema({
//   username: String,
//   email: { type: String, unique: true },
//   password: String,
//   watchlist: [String]
// });
// const User = mongoose.model('User', userSchema);

// // Review schema and model
// const reviewSchema = new mongoose.Schema({
//   movieId: String,
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   username: String,
//   rating: { type: Number, min: 0, max: 10 },
//   comment: String,
//   createdAt: { type: Date, default: Date.now }
// });
// const Review = mongoose.model('Review', reviewSchema);

// const app = express();
// const port = 3000;

// const openai = new OpenAI({
//   apiKey: process.env.OPENROUTER_API_KEY,
//   baseURL: "https://openrouter.ai/api/v1",
//   defaultHeaders: {
//     "HTTP-Referer": "http://localhost:3000/",
//     "X-Title": "FilmCritix"
//   }
// });

// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// app.use(session({
//   secret: 'your-secret-key',
//   resave: false,
//   saveUninitialized: true
// }));
// app.use(morgan('dev'));

// const moviesFilePath = path.join(__dirname, 'data', 'movies.json');

// // Movies route
// app.get('/movies', (req, res) => {
//   const movies = JSON.parse(fs.readFileSync(moviesFilePath, 'utf-8'));
//   res.render('pages/movies', { title: 'Movies', movies });
// });

// // Contact and About routes
// app.get('/contact', (req, res) => {
//   res.render('pages/contact', { title: 'Contact Us' });
// });
// app.get('/about', (req, res) => {
//   res.render('pages/about', { title: 'About Us' });
// });

// // Login routes
// app.get('/login', (req, res) => res.render('pages/login', { title: 'Login' }));

// app.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email, password }).exec();
//     if (user) {
//       req.session.user = { _id: user._id, username: user.username, email: user.email, watchlist: user.watchlist };
//       res.redirect('/dashboard');
//     } else {
//       res.status(401).send('Invalid credentials');
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Internal Server Error');
//   }
// });

// // Register routes
// app.get('/register', (req, res) => res.render('pages/register', { title: 'Register' }));

// app.post('/register', async (req, res) => {
//   const { username, email, password } = req.body;
//   try {
//     const existingUser = await User.findOne({ email }).exec();
//     if (existingUser) return res.status(400).send('User already exists');

//     const newUser = new User({ username, email, password, watchlist: [] });
//     await newUser.save();

//     req.session.user = { _id: newUser._id, username: newUser.username, email: newUser.email, watchlist: [] };
//     res.redirect('/dashboard');
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Internal Server Error');
//   }
// });

// // Dashboard route
// app.get('/dashboard', async (req, res) => {
//   if (!req.session.user) return res.redirect('/login');
//   try {
//     const user = await User.findById(req.session.user._id).exec();
//     const movies = JSON.parse(fs.readFileSync(moviesFilePath, 'utf-8'));
//     const watchlistMovies = user.watchlist.map(id => movies.find(movie => movie.id === id)).filter(Boolean);
//     res.render('pages/dashboard', { title: 'User Dashboard', user, watchlistMovies });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Internal Server Error');
//   }
// });

// // Add/remove movie from watchlist
// app.post('/movie/:id/watchlist', async (req, res) => {
//   const movieId = req.params.id;
//   if (!req.session.user) return res.redirect('/login');

//   try {
//     const user = await User.findById(req.session.user._id).exec();
//     if (!user) return res.status(401).send('User not found');

//     const movie = JSON.parse(fs.readFileSync(moviesFilePath, 'utf-8')).find(m => m.id === movieId);
//     if (!movie) return res.status(404).send('Movie not found');
//     const index = user.watchlist.indexOf(movieId);
//     if (index === -1) {
//       user.watchlist.push(movieId);
//     } else {
//       user.watchlist.splice(index, 1);
//     }

//     await user.save();
//     req.session.user.watchlist = user.watchlist;

//     res.redirect(`/movie/${movieId}`);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Internal Server Error');
//   }
// });

// // Search movies route
// app.get('/search', (req, res) => {
//   const query = req.query.q;
//   const searchUrl = `https://www.omdbapi.com/?apikey=d7b18426&s=${encodeURIComponent(query)}&page=1`;

//   https.get(searchUrl, apiRes => {
//     let data = '';
//     apiRes.on('data', chunk => data += chunk);
//     apiRes.on('end', () => {
//       const result = JSON.parse(data);
//       const movies = (result.Response === 'True' && result.Search) ? result.Search : [];
//       res.render('pages/searchResults', { title: `Search Results for "${query}"`, query, movies });
//     });
//   }).on('error', err => {
//     console.error(err);
//     res.status(500).send('Error fetching data from OMDb');
//   });
// });

// // Home page with trending
// app.get('/', (req, res) => {
//   const movies = JSON.parse(fs.readFileSync(moviesFilePath, 'utf-8')).slice(0, 5);
//   const trendingUrl = `https://www.omdbapi.com/?apikey=d7b18426&s=movie&page=1`;

//   https.get(trendingUrl, apiRes => {
//     let data = '';
//     apiRes.on('data', chunk => data += chunk);
//     apiRes.on('end', () => {
//       const trendingMovies = JSON.parse(data).Search || [];
//       res.render('pages/home', { title: 'FILMCRITIX - Home', movies, trendingMovies });
//     });
//   }).on('error', err => {
//     console.error(err);
//     res.status(500).send('Error fetching data from OMDb');
//   });
// });

// // Movie details with AI review, rating, and user reviews
// app.get('/movie/:id', async (req, res) => {
//   const movieId = req.params.id;
//   let movies = JSON.parse(fs.readFileSync(moviesFilePath, 'utf-8'));
//   let movie = movies.find(m => m.id === movieId);

//   if (!movie) {
//     const omdbUrl = `https://www.omdbapi.com/?apikey=d7b18426&i=${movieId}&plot=full`;
//     try {
//       await new Promise((resolve, reject) => {
//         https.get(omdbUrl, apiRes => {
//           let data = '';
//           apiRes.on('data', chunk => data += chunk);
//           apiRes.on('end', () => {
//             const result = JSON.parse(data);
//             if (result.Response === 'True') {
//               movie = {
//                 id: result.imdbID,
//                 title: result.Title,
//                 genre: result.Genre,
//                 director: result.Director,
//                 releaseDate: result.Released,
//                 description: result.Plot,
//                 poster: result.Poster
//               };
//             }
//             resolve();
//           });
//         }).on('error', reject);
//       });
//     } catch (err) {
//       console.error(err);
//     }
//   }
//   if (!movie) return res.status(404).render('pages/404', { title: 'Movie Not Found' });

//   try {
//     // Fetch all user reviews for this movie, sorted by newest first
//     const userReviews = await Review.find({ movieId }).sort({ createdAt: -1 }).exec();

//     res.render('pages/movieDetails', {
//       title: movie.title,
//       movie,
//       aiReview: null,
//       aiRating: null,
//       user: req.session.user || null,
//       userReviews
//     });
//   } catch (err) {
//     console.error('Error fetching reviews:', err);
//     res.status(500).send('Internal Server Error');
//   }
// });

// // POST route for generating AI review and rating ON DEMAND
// app.post('/movie/:id/generate-review', async (req, res) => {
//   const movieId = req.params.id;
//   let movies = JSON.parse(fs.readFileSync(moviesFilePath, 'utf-8'));
//   let movie = movies.find(m => m.id === movieId);

//   if (!movie) {
//     // Try fetching from OMDb if not found locally
//     const omdbUrl = `https://www.omdbapi.com/?apikey=d7b18426&i=${movieId}&plot=full`;
//     try {
//       await new Promise((resolve, reject) => {
//         https.get(omdbUrl, apiRes => {
//           let data = '';
//           apiRes.on('data', chunk => data += chunk);
//           apiRes.on('end', () => {
//             const result = JSON.parse(data);
//             if (result.Response === 'True') {
//               movie = {
//                 id: result.imdbID,
//                 title: result.Title,
//                 genre: result.Genre,
//                 director: result.Director,
//                 releaseDate: result.Released,
//                 description: result.Plot,
//                 poster: result.Poster
//               };
//             }
//             resolve();
//           });
//         }).on('error', reject);
//       });
//     } catch (err) {
//       return res.status(500).json({ review: 'Error fetching movie details.' });
//     }
//   }
//   if (!movie) return res.status(404).json({ review: 'Movie not found.' });

//   // Generate AI review and rating
//   generateAIReview(movie.title, (aiReview) => {
//     generateAIRating((aiRating) => {
//       res.json({ review: aiReview, rating: aiRating });
//     });
//   });
// });

// // POST route for submitting user reviews on a movie
// app.post('/movie/:id/review', async (req, res) => {
//   const movieId = req.params.id;
//   if (!req.session.user) return res.status(401).send('You must be logged in to submit a review.');
//   const { rating, comment } = req.body;

//   if (!rating || isNaN(rating) || rating < 0 || rating > 10) {
//     return res.status(400).send('Rating must be a number between 0 and 10.');
//   }

//   try {
//     // Save new review in DB
//     const newReview = new Review({
//       movieId,
//       userId: req.session.user._id,
//       username: req.session.user.username,
//       rating: Number(rating),
//       comment: comment || ''
//     });

//     await newReview.save();

//     res.redirect(`/movie/${movieId}`);
//   } catch (err) {
//     console.error('Error saving review:', err);
//     res.status(500).send('Internal Server Error');
//   }
// });

// // AI review and rating functions
// const generateAIReview = (movieTitle, callback) => {
//   const messages = [
//     { role: 'system', content: 'You are a movie critic AI that writes engaging and concise film reviews.' },
//     { role: 'user', content: `Write a detailed and balanced review for the movie titled "${movieTitle}".` }
//   ];

//   openai.chat.completions.create({
//     model: 'openai/gpt-3.5-turbo',
//     messages,
//   })
//     .then(response => {
//       if (response && response.choices && response.choices.length > 0) {
//         const aiReview = response.choices[0].message.content.trim();
//         callback(aiReview);
//       } else {
//         console.error('Empty response from OpenAI:', response);
//         callback('Failed to generate review.');
//       }
//     })
//     .catch(error => {
//       console.error('OpenAI API Error:', error.message);
//       callback('Failed to generate review.');
//     });
// };

// const generateAIRating = (callback) => {
//   const aiRating = (Math.random() * 5 + 5).toFixed(1);
//   callback(aiRating);
// };

// // Poster fetching
// const fetchPosterByTitle = (title, callback) => {
//   const url = `https://www.omdbapi.com/?apikey=d7b18426&t=${encodeURIComponent(title)}`;
//   https.get(url, (apiRes) => {
//     let data = '';
//     apiRes.on('data', chunk => data += chunk);
//     apiRes.on('end', () => {
//       const result = JSON.parse(data);
//       if (result.Response === 'True' && result.Poster !== 'N/A') {
//         callback(null, result.Poster);
//       } else {
//         callback('Poster not found', null);
//       }
//     });
//   }).on('error', err => callback(err, null));
// };

// // Error handler
// app.use((err, req, res, next) => {
//   console.error('Unhandled Error:', err.stack);
//   res.status(500).render('pages/error', { title: 'Error', message: 'Something went wrong!' });
// });

// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });




const https = require('https');
const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const session = require('express-session');
const morgan = require('morgan');
const bcrypt = require('bcrypt'); // 🔒 bcrypt added
require('dotenv').config();

const { OpenAI } = require('openai');

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.error('MongoDB connection error:', err));

// User schema and model
const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  watchlist: [String]
});
const User = mongoose.model('User', userSchema);

// Review schema and model
const reviewSchema = new mongoose.Schema({
  movieId: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: String,
  rating: { type: Number, min: 0, max: 10 },
  comment: String,
  createdAt: { type: Date, default: Date.now }
});
const Review = mongoose.model('Review', reviewSchema);

const app = express();
const port = 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000/",
    "X-Title": "FilmCritix"
  }
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));
app.use(morgan('dev'));

const moviesFilePath = path.join(__dirname, 'data', 'movies.json');

// Movies route
app.get('/movies', (req, res) => {
  const movies = JSON.parse(fs.readFileSync(moviesFilePath, 'utf-8'));
  res.render('pages/movies', { title: 'Movies', movies });
});

// Contact and About routes
app.get('/contact', (req, res) => {
  res.render('pages/contact', { title: 'Contact Us' });
});
app.get('/about', (req, res) => {
  res.render('pages/about', { title: 'About Us' });
});

// Login routes
app.get('/login', (req, res) => res.render('pages/login', { title: 'Login' }));

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).exec();
    if (user && await bcrypt.compare(password, user.password)) {
      req.session.user = { _id: user._id, username: user.username, email: user.email, watchlist: user.watchlist };
      res.redirect('/dashboard');
    } else {
      res.status(401).send('Invalid email or password');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Register routes
app.get('/register', (req, res) => res.render('pages/register', { title: 'Register' }));

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email }).exec();
    if (existingUser) return res.status(400).send('User already exists');

    const hashedPassword = await bcrypt.hash(password, 10); // 🔒 Hash password securely

    const newUser = new User({ username, email, password: hashedPassword, watchlist: [] });
    await newUser.save();

    req.session.user = { _id: newUser._id, username: newUser.username, email: newUser.email, watchlist: [] };
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Dashboard route
app.get('/dashboard', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  try {
    const user = await User.findById(req.session.user._id).exec();
    const movies = JSON.parse(fs.readFileSync(moviesFilePath, 'utf-8'));
    const watchlistMovies = user.watchlist.map(id => movies.find(movie => movie.id === id)).filter(Boolean);
    res.render('pages/dashboard', { title: 'User Dashboard', user, watchlistMovies });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Add/remove movie from watchlist
app.post('/movie/:id/watchlist', async (req, res) => {
  const movieId = req.params.id;
  if (!req.session.user) return res.redirect('/login');

  try {
    const user = await User.findById(req.session.user._id).exec();
    if (!user) return res.status(401).send('User not found');

    const movie = JSON.parse(fs.readFileSync(moviesFilePath, 'utf-8')).find(m => m.id === movieId);
    if (!movie) return res.status(404).send('Movie not found');
    const index = user.watchlist.indexOf(movieId);
    if (index === -1) {
      user.watchlist.push(movieId);
    } else {
      user.watchlist.splice(index, 1);
    }

    await user.save();
    req.session.user.watchlist = user.watchlist;

    res.redirect(`/movie/${movieId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Search movies route
app.get('/search', (req, res) => {
  const query = req.query.q;
  const searchUrl = `https://www.omdbapi.com/?apikey=d7b18426&s=${encodeURIComponent(query)}&page=1`;

  https.get(searchUrl, apiRes => {
    let data = '';
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      const result = JSON.parse(data);
      const movies = (result.Response === 'True' && result.Search) ? result.Search : [];
      res.render('pages/searchResults', { title: `Search Results for "${query}"`, query, movies });
    });
  }).on('error', err => {
    console.error(err);
    res.status(500).send('Error fetching data from OMDb');
  });
});

// Home page with trending
app.get('/', (req, res) => {
  const movies = JSON.parse(fs.readFileSync(moviesFilePath, 'utf-8')).slice(0, 5);
  const trendingUrl = `https://www.omdbapi.com/?apikey=d7b18426&s=movie&page=1`;

  https.get(trendingUrl, apiRes => {
    let data = '';
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      const trendingMovies = JSON.parse(data).Search || [];
      res.render('pages/home', { title: 'FILMCRITIX - Home', movies, trendingMovies });
    });
  }).on('error', err => {
    console.error(err);
    res.status(500).send('Error fetching data from OMDb');
  });
});

// Movie details with AI review and user reviews
app.get('/movie/:id', async (req, res) => {
  const movieId = req.params.id;
  let movies = JSON.parse(fs.readFileSync(moviesFilePath, 'utf-8'));
  let movie = movies.find(m => m.id === movieId);

  if (!movie) {
    const omdbUrl = `https://www.omdbapi.com/?apikey=d7b18426&i=${movieId}&plot=full`;
    try {
      await new Promise((resolve, reject) => {
        https.get(omdbUrl, apiRes => {
          let data = '';
          apiRes.on('data', chunk => data += chunk);
          apiRes.on('end', () => {
            const result = JSON.parse(data);
            if (result.Response === 'True') {
              movie = {
                id: result.imdbID,
                title: result.Title,
                genre: result.Genre,
                director: result.Director,
                releaseDate: result.Released,
                description: result.Plot,
                poster: result.Poster
              };
            }
            resolve();
          });
        }).on('error', reject);
      });
    } catch (err) {
      console.error(err);
    }
  }

  if (!movie) return res.status(404).render('pages/404', { title: 'Movie Not Found' });

  try {
    const userReviews = await Review.find({ movieId }).sort({ createdAt: -1 }).exec();
    res.render('pages/movieDetails', {
      title: movie.title,
      movie,
      aiReview: null,
      aiRating: null,
      user: req.session.user || null,
      userReviews
    });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).send('Internal Server Error');
  }
});

// AI review and rating generation
app.post('/movie/:id/generate-review', async (req, res) => {
  const movieId = req.params.id;
  let movies = JSON.parse(fs.readFileSync(moviesFilePath, 'utf-8'));
  let movie = movies.find(m => m.id === movieId);

  if (!movie) {
    const omdbUrl = `https://www.omdbapi.com/?apikey=d7b18426&i=${movieId}&plot=full`;
    try {
      await new Promise((resolve, reject) => {
        https.get(omdbUrl, apiRes => {
          let data = '';
          apiRes.on('data', chunk => data += chunk);
          apiRes.on('end', () => {
            const result = JSON.parse(data);
            if (result.Response === 'True') {
              movie = {
                id: result.imdbID,
                title: result.Title,
                genre: result.Genre,
                director: result.Director,
                releaseDate: result.Released,
                description: result.Plot,
                poster: result.Poster
              };
            }
            resolve();
          });
        }).on('error', reject);
      });
    } catch (err) {
      return res.status(500).json({ review: 'Error fetching movie details.' });
    }
  }

  if (!movie) return res.status(404).json({ review: 'Movie not found.' });

  generateAIReview(movie.title, (aiReview) => {
    generateAIRating((aiRating) => {
      res.json({ review: aiReview, rating: aiRating });
    });
  });
});

// Submit user reviews
app.post('/movie/:id/review', async (req, res) => {
  const movieId = req.params.id;
  if (!req.session.user) return res.status(401).send('You must be logged in to submit a review.');
  const { rating, comment } = req.body;

  if (!rating || isNaN(rating) || rating < 0 || rating > 10) {
    return res.status(400).send('Rating must be a number between 0 and 10.');
  }

  try {
    const newReview = new Review({
      movieId,
      userId: req.session.user._id,
      username: req.session.user.username,
      rating: Number(rating),
      comment: comment || ''
    });

    await newReview.save();
    res.redirect(`/movie/${movieId}`);
  } catch (err) {
    console.error('Error saving review:', err);
    res.status(500).send('Internal Server Error');
  }
});

// AI Functions
const generateAIReview = (movieTitle, callback) => {
  const messages = [
    { role: 'system', content: 'You are a movie critic AI that writes engaging and concise film reviews.' },
    { role: 'user', content: `Write a detailed and balanced review for the movie titled "${movieTitle}".` }
  ];

  openai.chat.completions.create({
    model: 'openai/gpt-3.5-turbo',
    messages,
  })
    .then(response => {
      if (response && response.choices && response.choices.length > 0) {
        const aiReview = response.choices[0].message.content.trim();
        callback(aiReview);
      } else {
        console.error('Empty response from OpenAI:', response);
        callback('Failed to generate review.');
      }
    })
    .catch(error => {
      console.error('OpenAI API Error:', error.message);
      callback('Failed to generate review.');
    });
};

const generateAIRating = (callback) => {
  const aiRating = (Math.random() * 5 + 5).toFixed(1);
  callback(aiRating);
};

app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).render('pages/error', { title: 'Error', message: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
