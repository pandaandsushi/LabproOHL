const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();
const secretKey = 'your_secret_key';
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));


const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log("NGETEST TOKEN")
    console.log(token)
    if (token == null) return res.sendStatus(401);
    
    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// PART ADMIN

// bingung sementara aku anggep token gakepake di /self soalnya buat apa..?
// or am i not getting it
app.get('/self', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.json({
            status: 'success',
            message: 'No token provided. Proceed to login.',
            data: null,
        });
    }
    
    jwt.verify(token, secretKey, async (err, user) => {
        if (err) {
            return res.status(403).json({ status: 'error', message: 'Invalid token', data: null });
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
                    films: true 
                }
            });
            
            if (!userData) {
                return res.status(404).json({ status: 'error', message: 'User not found', data: null });
            }
            
            res.json({
                status: 'success',
                message: 'User data retrieved successfully',
                data: {
                    id: userData.id.toString(),
                    username: userData.username,
                    token: token, 
                }
            });
        } catch (error) {
            console.error('Error fetching user data:', error);
            res.status(500).json({ status: 'error', message: 'Internal server error', data: null });
        }
    });
});



function authorizeAdmin(req, res, next) {
    if (!req.user.isAdmin) return res.sendStatus(403);
    next();
}
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const admin = await prisma.$queryRaw`
            SELECT id, username, password FROM user WHERE username = ${username} AND isAdmin = true
        `;

        if (admin.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid username',
                data: null,
            });
        }

        const adminUser = admin[0];

        const validPassword = await bcrypt.compare(password, adminUser.password);

        if (!validPassword) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid password',
                data: null,
            });
        }

        const token = jwt.sign({ id: adminUser.id, username: adminUser.username, isAdmin: true }, secretKey, { expiresIn: '1h' });

        res.json({
            status: 'success',
            message: 'Login successful!',
            data: {
                username: adminUser.username,
                token: token,
            },
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            data: null,
        });
    }
});


app.get('/users', async (req, res) => {
    try {
        const { q } = req.query;
        const searchQuery = q ? `%${q}%` : '%';

        const users = await prisma.$queryRaw`
            SELECT id, username, email, balance FROM user WHERE username LIKE ${searchQuery}
        `;

        const usersWithStringId = users.map(user => ({
            ...user,
            id: user.id.toString(),
        }));

        res.json({
            status: 'success',
            message: 'Users retrieved successfully',
            data: usersWithStringId,
        });
    } catch (error) {
        console.error('Error retrieving users:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve users',
            data: null,
        });
    }
});


app.get('/users/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id, 10);

        const user = await prisma.$queryRaw`
            SELECT id, username, email, balance FROM user WHERE id = ${userId}
        `;

        if (user.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found',
                data: null,
            });
        }

        res.json({
            status: 'success',
            message: 'User retrieved successfully',
            data: {
                ...user[0],
                id: user[0].id.toString(),
            },
        });
    } catch (error) {
        console.error('Error retrieving user:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve user',
            data: null,
        });
    }
});




app.post('/users/:id/balance', async (req, res) => {
    const userId = parseInt(req.params.id, 10);
    const { increment } = req.body;

    try {
        const user = await prisma.$queryRaw`
            SELECT id, username, email, balance FROM user WHERE id = ${userId}
        `;

        if (user.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found',
                data: null,
            });
        }

        await prisma.$queryRaw`
            UPDATE user SET balance = balance + ${increment} WHERE id = ${userId}
        `;

        const updatedUser = await prisma.$queryRaw`
            SELECT id, username, email, balance FROM user WHERE id = ${userId}
        `;

        res.json({
            status: 'success',
            message: 'Balance updated successfully',
            data: {
                ...updatedUser[0],
                id: updatedUser[0].id.toString(),
            },
        });
    } catch (error) {
        console.error('Error updating user balance:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update balance',
            data: null,
        });
    }
});



app.delete('/users/:id', async (req, res) => {
    const userId = parseInt(req.params.id, 10);

    try {
        const user = await prisma.$queryRaw`
            SELECT id, username, email, balance FROM user WHERE id = ${userId}
        `;

        if (user.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found',
                data: null,
            });
        }

        await prisma.$queryRaw`
            DELETE FROM user WHERE id = ${userId}
        `;

        res.json({
            status: 'success',
            message: 'User deleted successfully',
            data: {
                ...user[0],
                id: user[0].id.toString(),
            },
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete user',
            data: null,
        });
    }
});


app.get('/films', async (req, res) => {
    try {
        const { q } = req.query;
        const searchQuery = q ? `%${q}%` : '%';
        const films = await prisma.$queryRaw`
            SELECT
                id,
                title,
                director,
                releaseYear AS "release_year",
                price,
                duration,
                coverImage AS "cover_image_url",
                createdat AS "created_at",
                updatedat AS "updated_at"
            FROM film
            WHERE title LIKE ${searchQuery} OR director LIKE ${searchQuery}
        `;
        console.log("CEK FILM")
        console.log(films)
        res.json({
            status: 'success',
            message: 'Films retrieved successfully',
            data: films,
        });
    } catch (error) {
        console.error('Error retrieving films:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve films',
            data: null,
        });
    }
});

app.delete('/films/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const filmId = id;

        const film = await prisma.$queryRaw`
            SELECT id, title, description, director, release_year, genre, video_url, created_at, updated_at FROM films WHERE id = ${filmId}`;

        if (film.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Film not found',
                data: null,
            });
        }

        await prisma.$queryRaw`
            DELETE FROM films WHERE id = ${filmId}`;

        res.json({
            status: 'success',
            message: 'Film deleted successfully',
            data: film[0],
        });
    } catch (error) {
        console.error('Error deleting film:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete film',
            data: null,
        });
    }
});



// PART API BUAT FE AMBIL DATA

app.post('/api/register', async (req, res) => {
    const { email, username, password, firstName, lastName } = req.body;
    console.log('Received data:', req.body);

    try {
        // cek dupe
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { username: username }
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Email or Username already exists' });
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

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



app.post('/api/login', async (req, res) => {
    const { emailOrUsername, password } = req.body;

    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: emailOrUsername },
                    { username: emailOrUsername }
                ]
            }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid email/username or password' });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid email/username or password' });
        }

        const token = jwt.sign({ id: user.id, username: user.username, isAdmin: user.isAdmin }, secretKey, { expiresIn: '1h' });
        console.log(user.balance)
        res.json({
            token,
            isAdmin: user.isAdmin,
            username: user.username,
            email: user.email,
            balance: user.balance,
            films: user.films,
            id: user.id
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/api/films', async (req, res) => {
    try {
        const films = await prisma.$queryRaw`SELECT * FROM film`; 
        res.json(films);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch films' });
    }
});
  
app.get('/api/users', async (req, res) => {
    try {
        const films = await prisma.$queryRaw`SELECT * FROM users`; 
        res.json(films);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch films' });
    }
});

app.get('/api/films/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.query.userId;

    try {
        const film = await prisma.$queryRaw`
            SELECT * FROM Film WHERE id = ${Number(id)}
        `;

        if (!film.length) {
            return res.status(404).json({ error: 'Film not found' });
        }

        // cek udah beli
        const purchaseCheck = await prisma.$queryRaw`
            SELECT 1 FROM FilmUser WHERE userId = ${Number(userId)} AND filmId = ${Number(id)}`;

        const isPurchased = purchaseCheck.length > 0;
        // console.log("NGECEK ISPURCHASED DI SERVER")
        // console.log(isPurchased)
        // console.log(userId)
        // console.log(id)
        res.json({ ...film[0], isPurchased });
    } catch (error) {
        console.error('Error fetching film details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/api/users/:id', async (req, res) => {
    const { username } = req.params;
    // console.log({username})
    try {
        const user = await prisma.$queryRaw`SELECT * FROM user WHERE id = ${Number(id)}`;
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user data' });
    }
});

app.post('/api/purchasestatus', async (req, res) => {
    const { userId, filmId } = req.body;
    try {
        // cek udh beli
        const existingPurchase = await prisma.$queryRaw`
            SELECT 1 FROM FilmUser WHERE userId = ${userId} AND filmId = ${filmId}`;
        if (existingPurchase.length) {
            console.log("ALR PURCHASED!")
            return res.status(400).json({ message: 'Film already purchased' });//tes fallback
        }
        else{
            console.log("NOT YET PURCHASED!")
        }
        
        const [user, film] = await Promise.all([
            prisma.$queryRaw`
                SELECT * FROM User WHERE id = ${userId}`,
            prisma.$queryRaw`
                SELECT * FROM Film WHERE id = ${filmId}
            `
        ]);
        if (!user.length || !film.length) {
            return res.status(404).json({ message: 'User or film not found' });
        }

        const userRecord = user[0];
        const filmRecord = film[0];

        // cek duid cukup
        if (userRecord.balance < filmRecord.price) {
            return res.status(400).json({ message: 'Not enough balance' });
        }
        else{
            console.log('Balance enough')
        }

        await prisma.$executeRaw`
            INSERT INTO FilmUser (userId, filmId)
            VALUES (${userId}, ${filmId})
        `;
        // console.log("BERHASIL CREATE RECORD")

        await prisma.$executeRaw`
            UPDATE User
            SET balance = balance - ${filmRecord.price}
            WHERE id = ${userId}
        `;
        // console.log("BERHASIL KURANGIN DUID")
        res.status(200).json({ message: 'Purchase successful' });
    } catch (error) {
        console.error('Error processing purchase:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/purchase', async (req, res) => {
    const { userId } = req.query;

    try {
        const purchasedFilms = await prisma.$queryRaw`
            SELECT f.*
            FROM Film f
            INNER JOIN FilmUser fu ON f.id = fu.filmId
            WHERE fu.userId = ${Number(userId)}
        `;

        res.json(purchasedFilms);
    } catch (error) {
        console.error('Failed to fetch purchased films:', error);
        res.status(500).json({ error: 'Failed to fetch purchased films' });
    }
});


app.get('/api/wishlist', async (req, res) => {
    const { userId } = req.query;

    try {
        const wishlistFilms = await prisma.$queryRaw`
            SELECT f.*
            FROM Film f
            INNER JOIN Wishlist w ON f.id = w.filmId
            WHERE w.userId = ${Number(userId)}
        `;

        res.json(wishlistFilms);
    } catch (error) {
        console.error('Failed to fetch wishlist films:', error);
        res.status(500).json({ error: 'Failed to fetch wishlist films' });
    }
});


app.post('/api/wishliststatus', async (req, res) => {
    const { filmId } = req.body;
    const userId = req.body.userId;

    try {
        const wishlistCheck = await prisma.$queryRaw`
            SELECT 1
            FROM Wishlist
            WHERE userId = ${Number(userId)} AND filmId = ${Number(filmId)}
        `;
        
        if (wishlistCheck.length > 0) {
            await prisma.$executeRaw`
                DELETE FROM Wishlist
                WHERE userId = ${Number(userId)} AND filmId = ${Number(filmId)}
            `;
            return res.status(200).json({ message: 'Removed from Wishlist', isWishlisted: false });
        } else {
            // Film is not in the wishlist, add it
            await prisma.$executeRaw`
                INSERT INTO Wishlist (userId, filmId)
                VALUES (${Number(userId)}, ${Number(filmId)})
            `;
            return res.status(200).json({ message: 'Added to Wishlist', isWishlisted: true });
        }
    } catch (error) {
        console.error('Error processing wishlist:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
