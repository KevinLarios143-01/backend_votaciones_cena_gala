const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugParticipants() {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: 'jni-pros' },
      include: {
        users: { where: { role: 'PARTICIPANT' } },
        categories: {
          include: {
            participants: true
          }
        }
      }
    });
    
    console.log(`=== TENANT: ${tenant.name} ===`);
    console.log(`Usuarios PARTICIPANT: ${tenant.users.length}`);
    console.log(`Categorías: ${tenant.categories.length}`);
    
    tenant.categories.forEach(category => {
      console.log(`\nCategoría: ${category.name}`);
      console.log(`Participantes: ${category.participants.length}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugParticipants();