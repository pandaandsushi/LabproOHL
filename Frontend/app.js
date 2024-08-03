const express = require('express');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

let films = [
  { name: 'Dummy 1', director: 'Director 1', image: 'img/Dummy1.jpg' },
  { name: 'Dummy 2', director: 'Director 2', image: 'img/Dummy2.jpg' },
  { name: 'Dummy 3', director: 'Director 3', image: 'img/Dummy3.jpg' },
  { name: 'Dummy 4', director: 'Director 4', image: 'img/Dummy4.jpg' },
  { name: 'Dummy 5', director: 'Director 5', image: 'img/Dummy5.jpg' },
  { name: 'Dummy 6', director: 'Director 6', image: 'img/Dummy6.jpg' },
  { name: 'Dummy 7', director: 'Director 7', image: 'img/Dummy7.jpg' },
  { name: 'Dummy 8', director: 'Director 8', image: 'img/Dummy8.jpg' },
  { name: 'Dummy 9', director: 'Director 9', image: 'img/Dummy9.jpg' },
];

const faqData = [
  {
      question: "What is Nelflix?",
      answer: "Netflix is a streaming service that offers a wide variety of award-winning TV shows, movies, anime, documentaries, and more on thousands of internet-connected devices. You can watch as many times as you want, whenever you want without a single commercial, by purchasing the film."
  },
  {
      question: "Where can I watch Nelflix?",
      answer: "Watch anywhere, anytime. Sign in with your Nelflix account to watch instantly on the web at nelflix.com from your personal computer or on any internet-connected device that offers the Nelflix app, including smart TVs, smartphones, tablets, streaming media players and game consoles."
  },
  {
    question: "How can I refund movie?",
    answer: "Purchased films cannot be refunded."
  },
  {
    question: "What can I watch on Nelflix?",
    answer: "Nelflix has an extensive library of feature films, documentaries, TV shows, anime, award-winning Nelflix originals, and more. Watch as much as you want, anytime you want."
  },
];

// Define routes
app.get('/', (req, res) => {
  res.render('index', { title: 'Home', faqData });
});

app.get('/mylist', (req, res) => {
    res.render('mylist', { title: 'My List' });
  });

app.get('/browse', (req, res) => {
    res.render('browse', { title: 'Browse' });
});

app.get('/wishlist', (req, res) => {
    res.render('wishlist', { title: 'Wishlist' });
});

app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

app.get('/register', (req, res) => {
    res.render('register', { title: 'Register' });
});

app.get('/filmdetails', (req, res) => {
    res.render('filmdetails', { title: 'Film Details' });
});

app.get('/api/get-latest-films', (req, res) => {
  const since = parseInt(req.query.since, 10);
  const newFilms = films.filter(film => film.timestamp > since);
  res.json({ newFilms });
})

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
