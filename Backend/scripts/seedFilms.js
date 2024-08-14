const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.film.deleteMany({});
    await prisma.film.createMany({
        data: [
            { title: 'Fast x Furious 1', director: 'Director 1', coverImage: '../../Frontend/public/img/Dummy1.jpg', description: 'Description 1', releaseYear: 2020, genre: 'Genre 1', price: 1.0, duration: 120 },
            { title: 'Fast x Furious 2', director: 'Director 2', coverImage: 'img/Dummy2.jpg', description: 'Description 2', releaseYear: 2021, genre: 'Genre 2', price: 11.0, duration: 130 },
            { title: 'Fast x Furious 3', director: 'Director 3', coverImage: 'img/Dummy3.jpg', description: 'Description 3', releaseYear: 2022, genre: 'Genre 3', price: 12.0, duration: 120 },
            { title: 'Fast x Furious 4', director: 'Director 4', coverImage: 'img/Dummy4.jpg', description: 'Description 4', releaseYear: 2023, genre: 'Genre 4', price: 16.0, duration: 150 },
            { title: 'Fast x Furious 5', director: 'Director 5', coverImage: 'img/Dummy5.jpg', description: 'Description 5', releaseYear: 2020, genre: 'Genre 5', price: 1.0, duration: 120 },
            { title: 'Fast x Furious 6', director: 'Director 6', coverImage: 'img/Dummy6.jpg', description: 'Description 6', releaseYear: 2021, genre: 'Genre 6', price: 11.0, duration: 130 },
            { title: 'Fast x Furious 7', director: 'Director 7', coverImage: 'img/Dummy7.jpg', description: 'Description 7', releaseYear: 2022, genre: 'Genre 7', price: 12.0, duration: 120 },
            { title: 'Fast x Furious 8', director: 'Director 8', coverImage: 'img/Dummy8.jpg', description: 'Description 8', releaseYear: 2023, genre: 'Genre 8', price: 16.0, duration: 150 },
            // Add more films as needed
        ],
    });
    console.log('Database seeded');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
