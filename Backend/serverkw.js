const http = require('http');
const url = require('url');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const secretKey = 'your_secret_key';

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;
    const path = parsedUrl.pathname;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (method === 'GET' && path === '/self') {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        // console.log("INI TOKEN")
        // console.log(token)
        if (!token) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'success',
                message: 'No token provided. Proceed to login.',
                data: null,
            }));
            return;
        }
    
        jwt.verify(token, secretKey, async (err, user) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    console.error('Token has expired:', err);
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        status: 'error',
                        message: 'Token has expired. Please log in again.',
                        data: null,
                    }));
                } else {
                    console.error('Token verification error:', err);
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        status: 'error',
                        message: 'Invalid token',
                        data: null,
                    }));
                }
                return;
            }
    
            try {
                const userId = user.id;
                const userData = await prisma.user.findUnique({
                    where: { id: userId },
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        isAdmin: true,
                        balance: true,
                        films: true,
                    }
                });
    
                if (!userData) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        status: 'error',
                        message: 'User not found',
                        data: null,
                    }));
                    return;
                }
    
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    status: 'success',
                    message: 'User data retrieved successfully',
                    data: {
                        id: userData.id.toString(),
                        username: userData.username,
                        token: token,
                    },
                }));
            } catch (error) {
                console.error('Error fetching user data:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    status: 'error',
                    message: 'Internal server error',
                    data: null,
                }));
            }
        });
    }
    
    
    else if (method === 'POST' && path === '/login') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            const { username, password } = JSON.parse(body);

            try {
                const admin = await prisma.$queryRaw`
                    SELECT id, username, password FROM user WHERE username = ${username} AND isAdmin = true
                `;

                if (admin.length === 0) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        status: 'error',
                        message: 'Invalid username',
                        data: null,
                    }));
                    return;
                }

                const adminUser = admin[0];

                const validPassword = await bcrypt.compare(password, adminUser.password);

                if (!validPassword) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        status: 'error',
                        message: 'Invalid password',
                        data: null,
                    }));
                    return;
                }

                const token = jwt.sign({ id: adminUser.id, username: adminUser.username, isAdmin: true }, secretKey, { expiresIn: '1h' });

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    status: 'success',
                    message: 'Login successful!',
                    data: {
                        username: adminUser.username,
                        token: token,
                    },
                }));
            } catch (error) {
                console.error('Error logging in:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    status: 'error',
                    message: 'Internal server error',
                    data: null,
                }));
            }
        });
    }

    else if (method === 'GET' && path === '/users') {
        try {
            const searchQuery = parsedUrl.query.q ? `%${parsedUrl.query.q}%` : '%';

            const users = await prisma.$queryRaw`
                SELECT id, username, email, balance FROM user WHERE username LIKE ${searchQuery}
            `;

            const usersWithStringId = users.map(user => ({
                ...user,
                id: user.id.toString(),
            }));

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'success',
                message: 'Users retrieved successfully',
                data: usersWithStringId,
            }));
        } catch (error) {
            console.error('Error retrieving users:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'error',
                message: 'Failed to retrieve users',
                data: null,
            }));
        }
    } 
    else if (method === 'GET' && path.startsWith('/users/')) {
        try {
            const userId = parseInt(path.split('/')[2], 10);

            const user = await prisma.$queryRaw`
                SELECT id, username, email, balance FROM user WHERE id = ${userId}
            `;

            if (user.length === 0) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    status: 'error',
                    message: 'User not found',
                    data: null,
                }));
                return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'success',
                message: 'User retrieved successfully',
                data: {
                    ...user[0],
                    id: user[0].id.toString(),
                },
            }));
        } catch (error) {
            console.error('Error retrieving user:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'error',
                message: 'Failed to retrieve user',
                data: null,
            }));
        }
    }
    else if (method === 'POST' && path.startsWith('/users/')) {
        const userId = parseInt(path.split('/')[2], 10);
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            const { increment } = JSON.parse(body);

            try {
                const user = await prisma.$queryRaw`
                    SELECT id, username, email, balance FROM user WHERE id = ${userId}
                `;

                if (user.length === 0) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        status: 'error',
                        message: 'User not found',
                        data: null,
                    }));
                    return;
                }

                await prisma.$queryRaw`
                    UPDATE user SET balance = balance + ${parseFloat(increment)} WHERE id = ${userId}
                `;

                const updatedUser = await prisma.$queryRaw`
                    SELECT id, username, email, balance FROM user WHERE id = ${userId}
                `;

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    status: 'success',
                    message: 'Balance updated successfully',
                    data: {
                        ...updatedUser[0],
                        id: updatedUser[0].id.toString(),
                    },
                }));
            } catch (error) {
                console.error('Error updating user balance:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    status: 'error',
                    message: 'Failed to update balance',
                    data: null,
                }));
            }
        });
    } 
    else if (method === 'DELETE' && path.startsWith('/users/')) {
        const userId = parseInt(path.split('/')[2], 10);

        try {
            const user = await prisma.$queryRaw`
                SELECT id, username, email, balance FROM user WHERE id = ${userId}
            `;

            if (user.length === 0) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    status: 'error',
                    message: 'User not found',
                    data: null,
                }));
                return;
            }

            await prisma.$queryRaw`
                DELETE FROM wishlist WHERE userId = ${userId}`;
            await prisma.$queryRaw`
                DELETE FROM filmuser WHERE userId = ${userId}`;
            await prisma.$queryRaw`
                DELETE FROM user WHERE id = ${userId}`;

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'success',
                message: 'User deleted successfully',
                data: {
                    ...user[0],
                    id: user[0].id.toString(),
                },
            }));
        } catch (error) {
            console.error('Error deleting user:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'error',
                message: 'Failed to delete user',
                data: null,
            }));
        }
    }

    else if (method === 'GET' && path === '/films') {
        try {
            const searchQuery = parsedUrl.query.q ? `%${parsedUrl.query.q}%` : '%';
    
            const films = await prisma.$queryRaw`
                SELECT
                    f.id,
                    f.title,
                    f.director,
                    f.releaseYear AS 'release_year',
                    f.price,
                    f.duration,
                    f.video AS 'video_url',
                    f.coverImage AS 'cover_image_url',
                    f.createdAt AS 'created_at',
                    f.updatedAt AS 'updated_at',
                    GROUP_CONCAT(g.name) AS genres
                FROM
                    film f
                    LEFT JOIN FilmGenre fg ON f.id = fg.filmId
                    LEFT JOIN Genre g ON fg.genreId = g.id
                WHERE
                    f.title LIKE ${searchQuery} OR f.director LIKE ${searchQuery}
                GROUP BY f.id
            `;
            
            const formattedFilms = films.map(film => ({
                id: film.id.toString(),
                title: film.title,
                director: film.director,
                release_year: film.release_year,
                price: film.price,
                duration: film.duration,
                cover_image_url: film.cover_image_url,
                created_at: new Date(film.created_at).toISOString(),
                updated_at: new Date(film.updated_at).toISOString(),
                genre: film.genres ? film.genres.split(',') : []
            }));
            // console.log("TEST FORMATTED DI ADMIN FILMS")
            // console.log(formattedFilms)
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'success',
                message: 'Films retrieved successfully',
                data: formattedFilms,
            }));
        } catch (error) {
            console.error('Error retrieving films:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'error',
                message: 'Failed to retrieve films',
                data: null,
            }));
        }
    }

    else if (method === 'GET' && path.startsWith('/films/')) {
        const id = path.split('/').pop();
    
        try {
            const film = await prisma.$queryRaw`
                SELECT
                    f.id,
                    f.title,
                    f.description,
                    f.director,
                    f.releaseYear AS 'release_year',
                    f.price,
                    f.duration,
                    f.video AS 'video_url',
                    f.coverImage AS 'cover_image_url',
                    f.createdAt AS 'created_at',
                    f.updatedAt AS 'updated_at',
                    GROUP_CONCAT(g.name) AS genres
                FROM
                    film f
                    LEFT JOIN FilmGenre fg ON f.id = fg.filmId
                    LEFT JOIN Genre g ON fg.genreId = g.id
                WHERE
                    f.id = ${id}
                GROUP BY f.id
            `;
    
            if (!film.length) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    status: 'error',
                    message: 'Film not found',
                    data: null,
                }));
                return;
            }
    
            const filmData = film[0];
    
            const formattedFilm = {
                id: filmData.id.toString(),
                title: filmData.title,
                description: filmData.description,
                director: filmData.director,
                release_year: filmData.release_year,
                genre: filmData.genres ? filmData.genres.split(',') : [],
                price: filmData.price,
                duration: filmData.duration,
                video_url: filmData.video_url,
                cover_image_url: filmData.cover_image_url,
                created_at: new Date(filmData.created_at).toISOString(),
                updated_at: new Date(filmData.updated_at).toISOString(),
            };
    
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'success',
                message: 'Film retrieved successfully',
                data: formattedFilm,
            }));
        } catch (error) {
            console.error('Error retrieving film details:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'error',
                message: 'Failed to retrieve film details',
                data: null,
            }));
        }
    }
    
     
    else if (method === 'DELETE' && path.startsWith('/films/')) {
        const id = path.split('/').pop();
    
        try {
            const filmToDelete = await prisma.$queryRaw`
                SELECT
                    f.id,
                    f.title,
                    f.description,
                    f.director,
                    f.releaseYear AS 'release_year',
                    f.price,
                    f.duration,
                    f.video AS 'video_url',
                    f.coverImage AS 'cover_image_url',
                    f.createdAt AS 'created_at',
                    f.updatedAt AS 'updated_at',
                    GROUP_CONCAT(g.name) AS genres
                FROM
                    film f
                    LEFT JOIN FilmGenre fg ON f.id = fg.filmId
                    LEFT JOIN Genre g ON fg.genreId = g.id
                WHERE
                    f.id = ${id}
                GROUP BY f.id
            `;
            console.log("MAU DELETE FILM INI NIH")
            console.log(filmToDelete)
            if (!filmToDelete.length) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    status: 'error',
                    message: 'Film not found',
                    data: null,
                }));
                return;
            }
    
            await prisma.$queryRaw`
                DELETE FROM filmuser WHERE filmId = ${Number(id)}`;
            await prisma.$queryRaw`
                DELETE FROM filmgenre WHERE filmId = ${Number(id)}`;
            await prisma.$queryRaw`
                DELETE FROM film WHERE id = ${Number(id)}`;
            console.log("BERHASIL LEWAT MEMBUANG")
            const deletedFilm = filmToDelete[0];
    
            const formattedFilm = {
                id: deletedFilm.id.toString(),
                title: deletedFilm.title,
                description: deletedFilm.description,
                director: deletedFilm.director,
                release_year: deletedFilm.release_year,
                genre: deletedFilm.genres ? deletedFilm.genres.split(',') : [],
                video_url: deletedFilm.video_url,
                cover_image_url: deletedFilm.cover_image_url,
                created_at: new Date(deletedFilm.created_at).toISOString(),
                updated_at: new Date(deletedFilm.updated_at).toISOString(),
            };
    
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'success',
                message: 'Film deleted successfully',
                data: formattedFilm,
            }));
        } catch (error) {
            console.error('Error deleting film:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'error',
                message: 'Failed to delete film',
                data: null,
            }));
        }
    }
    
    
    else if (method === 'POST' && path === '/api/register') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            const { email, username, password, firstName, lastName } = JSON.parse(body);
            console.log('Received data:', { email, username, password, firstName, lastName });

            try {
                const existingUser = await prisma.user.findFirst({
                    where: {
                        OR: [
                            { email: email },
                            { username: username }
                        ]
                    }
                });

                if (existingUser) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Email or Username already exists' }));
                    return;
                }

                const hashedPassword = await bcrypt.hash(password, 10);
                const newUser = await prisma.user.create({
                    data: {
                        email: email,
                        username: username,
                        password: hashedPassword,
                        balance: 0,
                    }
                });

                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'User registered successfully', user: newUser }));
            } catch (error) {
                console.error('Error registering user:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal server error' }));
            }
        });
    }

    else if (method === 'POST' && path === '/api/login') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            const { emailOrUsername, password } = JSON.parse(body);
            console.log(emailOrUsername)
            console.log(password)
            try {
                const user = await prisma.$queryRaw`
        SELECT *
        FROM user
        WHERE email LIKE ${emailOrUsername} OR username LIKE ${emailOrUsername}
    `;
    console.log(user)
    if (user.length === 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid email/username or password' }));
        return;
    }

    const userData = user[0]; 

    const validPassword = await bcrypt.compare(password, userData.password);

    if (!validPassword) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid email/username or password' }));
        return;
    }

    const token = jwt.sign({ id: userData.id, username: userData.username, isAdmin: userData.isAdmin }, secretKey, { expiresIn: '1h' });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        token,
        isAdmin: userData.isAdmin,
        username: userData.username,
        email: userData.email,
        balance: userData.balance,
        films: userData.films,
        id: userData.id
    }));
    console.log(user)
            } catch (error) {
                console.error('Error logging in:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal server error' }));
            }
        });
    }

    else if (method === 'GET' && path === '/api/films') {
        try {
            const films = await prisma.film.findMany({
                include: {
                    genre: {
                        include: {
                            genre: true,
                        },
                    },
                },
            });
    
            console.log("INI FILM BANYAKK", films);
    
            const formattedFilms = films.map(film => ({
                id: film.id,
                title: film.title,
                description: film.description,
                director: film.director,
                release_year: film.releaseYear,
                genre: film.genre.map(fg => fg.genre.name), 
                price: film.price,
                duration: film.duration,
                cover_image_url: film.coverImage,
                created_at: film.createdAt,
                updated_at: film.updatedAt,
            }));
    
            // console.log("INI FORMATTED FILM", formattedFilms);
    
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(formattedFilms));
        } catch (error) {
            console.error('Error fetching films:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    }
    
    
    else if (method === 'GET' && path.startsWith('/api/films/')) {
        const id = path.split('/').pop();
        const userId = parsedUrl.query.userId;
    
        try {
            const film = await prisma.film.findUnique({
                where: { id: Number(id) },
                include: {
                    genre: {
                        include: {
                            genre: true,
                        },
                    },
                },
            });
    
            if (!film) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Film not found' }));
                return;
            }
    
            const purchaseCheck = await prisma.$queryRaw`SELECT 1 FROM FilmUser WHERE userId = ${Number(userId)} AND filmId = ${Number(id)}`;
    
            const isPurchased = purchaseCheck.length > 0;
            
            const genres = film.genre.map(fg => fg.genre.name).join(', ');
    
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ...film, genre: genres, isPurchased }));
        } catch (error) {
            console.error('Error fetching film details:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    }
    

    else if (method === 'GET' && path === '/api/users') {
        try {
            const users = await prisma.$queryRaw`SELECT * FROM user`;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(users));
        } catch (error) {
            console.error('Error fetching users:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to fetch users' }));
        }
    }

    else if (method === 'GET' && path.startsWith('/api/users/')) {
        const id = path.split('/').pop();

        try {
            const user = await prisma.$queryRaw`
                SELECT
                    id,
                    username,
                    email,
                    balance,
                    createdAt AS "created_at",
                    updatedAt AS "updated_at"
                FROM user
                WHERE id = ${Number(id)}
            `;

            if (!user.length) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'User not found' }));
                return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(user[0]));
        } catch (error) {
            console.error('Error fetching user details:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    }

    else if (method === 'POST' && path === '/api/purchasestatus') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            const { userId, filmId } = JSON.parse(body);

            try {
                const existingPurchase = await prisma.$queryRaw`
                    SELECT 1 FROM FilmUser WHERE userId = ${userId} AND filmId = ${filmId}`;

                if (existingPurchase.length) {
                    return res.writeHead(400, { 'Content-Type': 'application/json' })
                        .end(JSON.stringify({ message: 'Film already purchased' }));
                }

                const [user, film] = await Promise.all([
                    prisma.$queryRaw`
                        SELECT * FROM User WHERE id = ${userId}`,
                    prisma.$queryRaw`
                        SELECT * FROM Film WHERE id = ${filmId}`
                ]);

                if (!user.length || !film.length) {
                    return res.writeHead(404, { 'Content-Type': 'application/json' })
                        .end(JSON.stringify({ message: 'User or film not found' }));
                }

                const userRecord = user[0];
                const filmRecord = film[0];
                // console.log("TES BALANCE")
                // console.log(userRecord)
                // console.log(userRecord.balance)
                // console.log(filmRecord.price)
                if (userRecord.balance < filmRecord.price) {
                    return res.writeHead(400, { 'Content-Type': 'application/json' })
                        .end(JSON.stringify({ message: 'Not enough balance' }));
                }

                await prisma.$executeRaw`
                    INSERT INTO FilmUser (userId, filmId)
                    VALUES (${userId}, ${filmId})`;

                await prisma.$executeRaw`
                    UPDATE User
                    SET balance = balance - ${filmRecord.price}
                    WHERE id = ${userId}`;

                res.writeHead(200, { 'Content-Type': 'application/json' })
                    .end(JSON.stringify({ message: 'Purchase successful' }));
            } catch (error) {
                console.error('Error processing purchase:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' })
                    .end(JSON.stringify({ message: 'Internal server error' }));
            }
        });
    }

    else if (method === 'GET' && path === '/api/purchase') {
        const userId = parsedUrl.query.userId;

        try {
            const purchasedFilms = await prisma.$queryRaw`
                SELECT f.*
                FROM Film f
                INNER JOIN FilmUser fu ON f.id = fu.filmId
                WHERE fu.userId = ${Number(userId)}`;

            res.writeHead(200, { 'Content-Type': 'application/json' })
                .end(JSON.stringify(purchasedFilms));
        } catch (error) {
            console.error('Failed to fetch purchased films:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' })
                .end(JSON.stringify({ error: 'Failed to fetch purchased films' }));
        }
    }

    else if (method === 'GET' && path === '/api/wishlist') {
        const userId = parsedUrl.query.userId;

        try {
            const wishlistFilms = await prisma.$queryRaw`
                SELECT f.*
                FROM Film f
                INNER JOIN Wishlist w ON f.id = w.filmId
                WHERE w.userId = ${Number(userId)}`;

            res.writeHead(200, { 'Content-Type': 'application/json' })
                .end(JSON.stringify(wishlistFilms));
        } catch (error) {
            console.error('Failed to fetch wishlist films:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' })
                .end(JSON.stringify({ error: 'Failed to fetch wishlist films' }));
        }
    }

    else if (method === 'POST' && path === '/api/wishliststatus') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            const { userId, filmId } = JSON.parse(body);

            try {
                const wishlistCheck = await prisma.$queryRaw`
                    SELECT 1
                    FROM Wishlist
                    WHERE userId = ${Number(userId)} AND filmId = ${Number(filmId)}`;

                if (wishlistCheck.length > 0) {
                    await prisma.$executeRaw`
                        DELETE FROM Wishlist
                        WHERE userId = ${Number(userId)} AND filmId = ${Number(filmId)}`;

                    res.writeHead(200, { 'Content-Type': 'application/json' })
                        .end(JSON.stringify({ message: 'Removed from Wishlist', isWishlisted: false }));
                } else {
                    await prisma.$executeRaw`
                        INSERT INTO Wishlist (userId, filmId)
                        VALUES (${Number(userId)}, ${Number(filmId)})`;

                    res.writeHead(200, { 'Content-Type': 'application/json' })
                        .end(JSON.stringify({ message: 'Added to Wishlist', isWishlisted: true }));
                }
            } catch (error) {
                console.error('Error processing wishlist:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' })
                    .end(JSON.stringify({ message: 'Internal server error' }));
            }
        });
    }

});

server.listen(3001, () => {
    console.log('HTTPS Server is listening on port 3001');
});
