const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixJniProsUsers() {
  try {
    const usersData = JSON.parse(fs.readFileSync('../usuarios_cena_gala.json', 'utf8'));
    const tenant = await prisma.tenant.findUnique({ where: { slug: 'jni-pros' } });
    
    // Eliminar usuario incorrecto
    await prisma.user.deleteMany({
      where: {
        email: 'kevin@gmail.com',
        tenantId: tenant.id
      }
    });
    console.log('✓ Usuario incorrecto eliminado');
    
    // Obtener usuarios actuales
    const currentUsers = await prisma.user.findMany({
      where: { tenantId: tenant.id }
    });
    
    const currentEmails = currentUsers.map(u => u.email);
    const jovenesPro = usersData.filter(u => u.grupo === 'Jóvenes Pro.');
    
    console.log(`Verificando ${jovenesPro.length} usuarios de Jóvenes Pro...`);
    
    for (const userData of jovenesPro) {
      const email = `${userData.username}@jni-pros.com`;
      
      if (!currentEmails.includes(email)) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        await prisma.user.create({
          data: {
            email: email,
            password: hashedPassword,
            name: userData.nombre_completo,
            role: 'PARTICIPANT',
            tenantId: tenant.id
          }
        });
        
        console.log(`✓ Usuario agregado: ${userData.nombre_completo}`);
      }
    }
    
    // Verificar total final
    const finalUsers = await prisma.user.findMany({
      where: { tenantId: tenant.id }
    });
    
    console.log(`\n✓ Total usuarios en jni-pros: ${finalUsers.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixJniProsUsers();