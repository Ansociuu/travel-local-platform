const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

console.log('Connecting to database...');
const prisma = new PrismaClient({
  datasource: {
    url: process.env.DATABASE_URL
  }
});

async function test() {
  try {
    const count = await prisma.user.count();
    console.log('User count:', count);
  } catch (e) {
    console.error('Error details:', e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
