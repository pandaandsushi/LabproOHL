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
    console.log({id})
    try {
        const film = await prisma.$queryRaw`SELECT * FROM film WHERE id = ${Number(id)}`;
        if (!film) {
            return res.status(404).json({ error: 'Film not found' });
        }
        console.log(film)
        console.log("MASUK KE SEBUAHFILM")
        
        res.json(film);
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
