const express = require('express');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

// Define routes
app.get('/', (req, res) => {
  res.render('index', { title: 'Home' });
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
