const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkJniProsUsers() {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: 'jni-pros' },
      include: {
        users: {
          orderBy: { name: 'asc' }
        }
      }
    });
    
    console.log(`=== USUARIOS EN JNI-PROS (${tenant.users.length}) ===\n`);
    
    tenant.users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   ID: ${user.id}\n`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkJniProsUsers();