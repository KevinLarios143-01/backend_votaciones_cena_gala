const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixJniParticipants() {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: 'jni' }
    });
    
    // Limpiar todos los datos
    await prisma.vote.deleteMany({ where: { tenantId: tenant.id } });
    await prisma.finalist.deleteMany({ where: { tenantId: tenant.id } });
    await prisma.nomination.deleteMany({ where: { tenantId: tenant.id } });
    await prisma.participant.deleteMany({ where: { tenantId: tenant.id } });
    
    // Obtener usuarios y categorías
    const users = await prisma.user.findMany({
      where: { tenantId: tenant.id, role: 'PARTICIPANT' }
    });
    
    const categories = await prisma.category.findMany({
      where: { tenantId: tenant.id }
    });
    
    console.log(`JNI - Creando participantes: ${users.length} usuarios x ${categories.length} categorías`);
    
    // Crear participantes para cada categoría (TODOS los usuarios con fotos)
    for (const category of categories) {
      for (const user of users) {
        await prisma.participant.create({
          data: {
            name: user.name,
            description: `${user.name} - Participante`,
            imageUrl: user.imageUrl,
            categoryId: category.id,
            tenantId: tenant.id
          }
        });
      }
      console.log(`✓ ${category.name}: ${users.length} participantes`);
    }
    
    // Reset categorías a NOMINATION
    await prisma.category.updateMany({
      where: { tenantId: tenant.id },
      data: { status: 'NOMINATION' }
    });
    
    console.log('✓ JNI participantes recreados correctamente');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixJniParticipants();