const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Serve static files like CSS, JS, images
function serveStaticFile(filePath, res, contentType) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 Not Found</h1>');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
}

// Serve HTML pages
function serveHtmlPage(filePath, res, data = {}) {
    fs.readFile(filePath, 'utf8', (err, content) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end('<h1>500 Server Error</h1>');
        } else {
            let rendered = content;

            // Inject navbar partial
            const navbarPath = path.join(__dirname, 'views', 'partials', 'navbar.html');
            fs.readFile(navbarPath, 'utf8', (err, navbarContent) => {
                if (!err) {
                    rendered = rendered.replace('<%- include(\'partials/navbar\') %>', navbarContent);
                }

                // Inject other data into the template
                Object.keys(data).forEach(key => {
                    const regex = new RegExp(`<%=${key}%>`, 'g');
                    rendered = rendered.replace(regex, JSON.stringify(data[key]));
                });

                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(rendered);
            });
        }
    });
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Serve static files
    if (pathname.startsWith('/public/')) {
        const extname = path.extname(pathname);
        let contentType = 'text/plain';

        switch (extname) {
            case '.css':
                contentType = 'text/css';
                break;
            case '.js':
                contentType = 'application/javascript';
                break;
            case '.jpg':
            case '.jpeg':
            case '.png':
                contentType = 'image/jpeg';
                break;
            case '.gif':
                contentType = 'image/gif';
                break;
            case '.svg':
                contentType = 'image/svg+xml';
                break;
            case '.html':
                contentType = 'text/html';
                break;
        }

        serveStaticFile(path.join(__dirname, pathname), res, contentType);
        return;
    }

    // Routing logic
    if (pathname === '/') {
        const faqData = [
            { question: "What is Nelflix?", answer: "Nelflix is a streaming service that offers..." },
            { question: "Where can I watch Nelflix?", answer: "Watch anywhere, anytime..." },
            { question: "How can I refund movie?", answer: "Purchased films cannot be refunded." },
            { question: "What can I watch on Nelflix?", answer: "Nelflix has an extensive library..." },
        ];

        // Serve the HTML page and pass the FAQ data
        serveHtmlPage(path.join(__dirname, 'views', 'index.html'), res, { faqData });
    } else if (pathname === '/mylist') {
        serveHtmlPage(path.join(__dirname, 'views', 'mylist.html'), res);
    } else if (pathname === '/browse') {
        serveHtmlPage(path.join(__dirname, 'views', 'browse.html'), res);
    } else if (pathname === '/wishlist') {
        serveHtmlPage(path.join(__dirname, 'views', 'wishlist.html'), res);
    } else if (pathname === '/login') {
        serveHtmlPage(path.join(__dirname, 'views', 'login.html'), res);
    } else if (pathname === '/register') {
        serveHtmlPage(path.join(__dirname, 'views', 'register.html'), res);
    } else if (pathname.startsWith('/filmdetails')) {
        const id = parsedUrl.query.id || 'Unknown';
        serveHtmlPage(path.join(__dirname, 'views', 'filmdetails.html'), res, { id });
    } else {
        serveHtmlPage(path.join(__dirname, 'views', '404.html'), res);
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
