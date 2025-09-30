const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    console.log('Creating SuperAdmin...');
    
    // Get any tenant (SuperAdmin needs a tenantId for now)
    const tenant = await prisma.tenant.findFirst();
    
    if (!tenant) {
      console.log('No tenants found. Please run seed first.');
      return;
    }
    
    // Check if SuperAdmin already exists
    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: 'SUPERADMIN' }
    });
    
    if (existingSuperAdmin) {
      console.log('SuperAdmin already exists:', existingSuperAdmin.email);
      return;
    }
    
    // Create SuperAdmin
    const superAdminPassword = await bcrypt.hash('superadmin123', 10);
    const superAdmin = await prisma.user.create({
      data: {
        email: 'superadmin@votaciones.com',
        password: superAdminPassword,
        name: 'Super Administrador',
        role: 'SUPERADMIN',
        tenantId: tenant.id // Temporary assignment
      }
    });
    
    console.log('✅ SuperAdmin created successfully!');
    console.log('👑 SuperAdmin: superadmin@votaciones.com / superadmin123');
    
  } catch (error) {
    console.error('Error creating SuperAdmin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();