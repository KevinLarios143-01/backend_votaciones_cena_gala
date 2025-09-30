const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testLogin() {
  try {
    console.log('Testing database connection...');
    
    // Test connection
    const userCount = await prisma.user.count();
    console.log(`Found ${userCount} users in database`);
    
    // Find admin user
    const user = await prisma.user.findUnique({
      where: { email: 'admin@votaciones.com' }
    });
    
    if (!user) {
      console.log('Admin user not found');
      return;
    }
    
    console.log('Admin user found:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });
    
    // Test password
    const isValid = await bcrypt.compare('admin123', user.password);
    console.log('Password valid:', isValid);
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();