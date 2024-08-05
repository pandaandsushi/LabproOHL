const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('adminpassword', 10);
    await prisma.user.upsert({
        where: { email: 'adminemail@gmail.com' },
        update: {},
        create: {
            email: 'adminemail@gmail.com',
            username: 'adminuser',
            password: password,
            isAdmin: true
        }
    });
}

main()
    .then(() => {
        console.log('Admin user seeded');
    })
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
