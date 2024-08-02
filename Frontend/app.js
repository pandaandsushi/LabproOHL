const express = require('express');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
