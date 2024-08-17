// const express = require('express');
// const path = require('path');
// const app = express();

// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

// app.use(express.static(path.join(__dirname, 'public')));


// const faqData = [
//   {
//       question: "What is Nelflix?",
//       answer: "Netflix is a streaming service that offers a wide variety of award-winning TV shows, movies, anime, documentaries, and more on thousands of internet-connected devices. You can watch as many times as you want, whenever you want without a single commercial, by purchasing the film."
//   },
//   {
//       question: "Where can I watch Nelflix?",
//       answer: "Watch anywhere, anytime. Sign in with your Nelflix account to watch instantly on the web at nelflix.com from your personal computer or on any internet-connected device that offers the Nelflix app, including smart TVs, smartphones, tablets, streaming media players and game consoles."
//   },
//   {
//     question: "How can I refund movie?",
//     answer: "Purchased films cannot be refunded."
//   },
//   {
//     question: "What can I watch on Nelflix?",
//     answer: "Nelflix has an extensive library of feature films, documentaries, TV shows, anime, award-winning Nelflix originals, and more. Watch as much as you want, anytime you want."
//   },
// ];

// // Define routes
// app.get('/', (req, res) => {
//   res.render('index', { title: 'Home', faqData });
// });

// app.get('/mylist', (req, res) => {
//     res.render('mylist', { title: 'My List' });
//   });

// app.get('/browse', (req, res) => {
//     res.render('browse', { title: 'Browse' });
// });

// app.get('/wishlist', (req, res) => {
//     res.render('wishlist', { title: 'Wishlist' });
// });

// app.get('/login', (req, res) => {
//     res.render('login', { title: 'Login' });
// });

// app.get('/register', (req, res) => {
//     res.render('register', { title: 'Register' });
// });

// app.get('/filmdetails', (req, res) => {
//     res.render('filmdetails', { title: 'Film Details' });
// });

// // app.use((req, res, next) => {
// //   res.status(404).render('404', { title: 'Page Not Found' });
// // });

// app.get('/filmdetails/:id', async (req, res) => {
//   const { id } = req.params;
//   // console.log({id})
//   try {
//       // console.log("MASUK KE SEBUAHFILM DI APP")
//       res.render('filmdetails', { title: 'Film Details',id});
//   } catch (error) {
//       console.error('Error fetching film details:', error);
//       res.status(500).render('error', { message: 'Internal server error' });
//   }
// });

// // Start the server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });
const http = require('http');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const PORT = process.env.PORT || 3000;

const renderView = (viewName, data, res) => {
  const viewPath = path.join(__dirname, 'views', `${viewName}.ejs`);
  ejs.renderFile(viewPath, data, (err, html) => {
    if (err) {
      console.error('Error rendering the view:', err);
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end('<h1>Internal Server Error</h1>');
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    }
  });
};

const serveStaticFile = (filePath, contentType, res) => {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>Page Not Found</h1>');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<h1>Internal Server Error</h1>');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
};

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

const server = http.createServer((req, res) => {
  const url = req.url;

  if (url === '/') {
    renderView('index', { title: 'Home', faqData }, res);
  } else if (url === '/mylist') {
    renderView('mylist', { title: 'My List' }, res);
  } else if (url === '/browse') {
    renderView('browse', { title: 'Browse' }, res);
  } else if (url === '/wishlist') {
    renderView('wishlist', { title: 'Wishlist' }, res);
  } else if (url === '/login') {
    renderView('login', { title: 'Login' }, res);
  } else if (url === '/register') {
    renderView('register', { title: 'Register' }, res);
  } else if (url === '/filmdetails') {
    renderView('filmdetails', { title: 'Film Details' }, res);
  } else if (url.startsWith('/filmdetails/')) {
    const id = url.split('/').pop();
    renderView('filmdetails', { title: 'Film Details', id }, res);
  } else if (url.startsWith('/public/')) {
    const filePath = path.join(__dirname, url);
    const extname = path.extname(filePath);
    let contentType = 'text/html';

    switch (extname) {
      case '.js':
        contentType = 'text/javascript';
        break;
      case '.css':
        contentType = 'text/css';
        break;
      case '.json':
        contentType = 'application/json';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
        contentType = 'image/jpg';
        break;
      case '.ico':
        contentType = 'image/x-icon';
        break;
      case '.svg':
        contentType = 'image/svg+xml';
        break;
    }

    serveStaticFile(filePath, contentType, res);
  } else {
    renderView('404', { title: 'Not Found' }, res);
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
