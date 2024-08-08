const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
    // Delete all existing users
    await prisma.user.deleteMany({});
    console.log('Existing users deleted');

    // Define the users to be seeded
    const users = [
        { username: 'adminuser', email: 'adminemail@gmail.com', password: 'adminpassword', isAdmin: true },
        { username: 'user1', email: 'user1@example.com', password: 'password1', isAdmin: false },
        { username: 'user2', email: 'user2@example.com', password: 'password2', isAdmin: false },
        { username: 'user3', email: 'user3@example.com', password: 'password3', isAdmin: false },
        // Add more users as needed
    ];

    // Hash passwords and create users
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

    console.log('User database seeded with hashed passwords');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
