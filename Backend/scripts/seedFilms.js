const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.film.createMany({
        data: [
            { title: 'Film 3', director: 'Director 3', coverImage: 'img/Dummy3.jpg', description: 'Description 3', releaseYear: 2020, genre: 'Genre 1', price: 10.0, duration: 120 },
            { title: 'Film 4', director: 'Director 4', coverImage: 'img/Dummy4.jpg', description: 'Description 2', releaseYear: 2021, genre: 'Genre 2', price: 12.0, duration: 130 },
            { title: 'Film 5', director: 'Director 5', coverImage: 'img/Dummy5.jpg', description: 'Description 5', releaseYear: 2020, genre: 'Genre 1', price: 10.0, duration: 120 },
            { title: 'Film 6', director: 'Director 6', coverImage: 'img/Dummy6.jpg', description: 'Description 6', releaseYear: 2021, genre: 'Genre 6', price: 16.0, duration: 150 },
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
