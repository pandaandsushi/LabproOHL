const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
    await prisma.filmGenre.deleteMany({});
    await prisma.filmUser.deleteMany({});
    await prisma.wishlist.deleteMany({});
    await prisma.genre.deleteMany({});
    await prisma.film.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$executeRaw`ALTER TABLE User AUTO_INCREMENT = 1`;
    await prisma.$executeRaw`ALTER TABLE Genre AUTO_INCREMENT = 1`;
    await prisma.$executeRaw`ALTER TABLE Film AUTO_INCREMENT = 1`;
    await prisma.$executeRaw`ALTER TABLE FilmGenre AUTO_INCREMENT = 1`;
    await prisma.$executeRaw`ALTER TABLE FilmUser AUTO_INCREMENT = 1`;
    await prisma.$executeRaw`ALTER TABLE Wishlist AUTO_INCREMENT = 1`;
    console.log('Existing users deleted');

    const users = [
        { username: 'adminuser', email: 'adminemail@gmail.com', password: 'adminpassword', isAdmin: true },
        { username: 'user1', email: 'user1@example.com', password: 'password1', isAdmin: false },
        { username: 'user2', email: 'user2@example.com', password: 'password2', isAdmin: false },
        { username: 'user3', email: 'user3@example.com', password: 'password3', isAdmin: false },
        // Add more users as needed
    ];

    for (const user of users) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await prisma.user.create({
            data: {
                username: user.username,
                email: user.email,
                password: hashedPassword,
                isAdmin: user.isAdmin,
            },
        });
    }

    console.log('User seeded');
    
    await prisma.genre.createMany({
        data: [
            { name: 'Action' },
            { name: 'Comedy' },
            { name: 'Drama' },
            { name: 'Thriller' },
            { name: 'Sci-Fi' },
            { name: 'Horror' },
            { name: 'Romance' },
            { name: 'Adventure' },
            { name: 'Fantasy' },
            { name: 'Mystery' },
            // Add more genres as needed
        ],
    });
    console.log('Genres seeded');
    await prisma.film.createMany({
        data: [
            { title: 'Fast x Furious 1', director: 'Director 1', coverImage: 'img/Dummy1.jpg', description: 'Description 1', releaseYear: 2020, price: 1.0, duration: 120 },
            { title: 'Fast x Furious 2', director: 'Director 2', coverImage: 'img/Dummy2.jpg', description: 'Description 2', releaseYear: 2021, price: 11.0, duration: 130 },
            { title: 'Fast x Furious 3', director: 'Director 3', coverImage: 'img/Dummy3.jpg', description: 'Description 3', releaseYear: 2022, price: 12.0, duration: 120 },
            { title: 'Fast x Furious 4', director: 'Director 4', coverImage: 'img/Dummy4.jpg', description: 'Description 4', releaseYear: 2023, price: 16.0, duration: 150 },
            { title: 'Fast x Furious 5', director: 'Director 5', coverImage: 'img/Dummy5.jpg', description: 'Description 5', releaseYear: 2020, price: 1.0, duration: 120 },
            { title: 'Fast x Furious 6', director: 'Director 6', coverImage: 'img/Dummy6.jpg', description: 'Description 6', releaseYear: 2021, price: 11.0, duration: 130 },
            { title: 'Fast x Furious 7', director: 'Director 7', coverImage: 'img/Dummy7.jpg', description: 'Description 7', releaseYear: 2022, price: 12.0, duration: 120 },
            { title: 'Fast x Furious 8', director: 'Director 8', coverImage: 'img/Dummy8.jpg', description: 'Description 8', releaseYear: 2023, price: 16.0, duration: 150 },
            // Add more films as needed
        ],
    });
    console.log('Database seeded');

    const allFilms = await prisma.film.findMany();
    const allGenres = await prisma.genre.findMany();

    for (const film of allFilms) {
        const randomGenres = random(allGenres);

        for (const genre of randomGenres) {
            await prisma.filmGenre.create({
                data: {
                    filmId: film.id,
                    genreId: genre.id,
                },
            });
        }
    }

    console.log('Random Film-Genre associations created');
}

// random dikit lah
function random(genres) {
    const shuffled = genres.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.floor(Math.random() * genres.length) + 1);
    return selected;
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
