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
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
}));

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
        // console.log("AJBDKAJB")
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
        // console.error("MASUK SINI");
        const films = await prisma.$queryRaw`SELECT * FROM film`; 
        res.json(films);
    } catch (error) {
        // console.error("NGEROR", error); 
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
        // Fetch the film details
        const film = await prisma.$queryRaw`
            SELECT * 
            FROM Film 
            WHERE id = ${Number(id)}
        `;

        if (!film.length) {
            return res.status(404).json({ error: 'Film not found' });
        }

        // cek udah beli
        const purchaseCheck = await prisma.$queryRaw`
            SELECT 1
            FROM FilmUser
            WHERE userId = ${Number(userId)} AND filmId = ${Number(id)}
        `;

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
    console.log({username})
    try {
        const user = await prisma.$queryRaw`SELECT * FROM user WHERE id = ${Number(id)}`;
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user data' });
    }
});

app.post('/api/purchase', async (req, res) => {
    const { userId, filmId } = req.body;
    try {
        // cek udh beli
        const existingPurchase = await prisma.$queryRaw`
            SELECT 1
            FROM FilmUser
            WHERE userId = ${userId} AND filmId = ${filmId}
        `;
        if (existingPurchase.length) {
            console.log("ALR PURCHASED!")
            return res.status(400).json({ message: 'Film already purchased' });//tes fallback
        }
        else{
            console.log("NOT YET PURCHASED!")
        }
        
        const [user, film] = await Promise.all([
            prisma.$queryRaw`
                SELECT * 
                FROM User
                WHERE id = ${userId}
            `,
            prisma.$queryRaw`
                SELECT * 
                FROM Film
                WHERE id = ${filmId}
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

app.post('/api/wishlist', async (req, res) => {
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


const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

function authorizeAdmin(req, res, next) {
    if (!req.user.isAdmin) return res.sendStatus(403);
    next();
}

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
