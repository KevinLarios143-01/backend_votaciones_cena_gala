const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function createJniProsTenant() {
  try {
    // Crear tenant jni-pros
    let tenant = await prisma.tenant.findUnique({
      where: { slug: 'jni-pros' }
    });
    
    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          name: 'JNI Pros',
          slug: 'jni-pros',
          description: 'Tenant para Jóvenes Pro',
          isActive: true
        }
      });
      console.log('✓ Tenant JNI Pros creado');
    }

    // Leer datos de usuarios
    const usersData = JSON.parse(fs.readFileSync('../usuarios_cena_gala.json', 'utf8'));
    const jniTenant = await prisma.tenant.findUnique({ where: { slug: 'jni' } });
    
    // Filtrar usuarios de Jóvenes Pro
    const jovenesPro = usersData.filter(u => u.grupo === 'Jóvenes Pro.');
    
    console.log(`Moviendo ${jovenesPro.length} usuarios de Jóvenes Pro...`);
    
    for (const userData of jovenesPro) {
      const email = `${userData.username}@jni.com`;
      
      // Buscar usuario en tenant jni
      const user = await prisma.user.findUnique({
        where: { email_tenantId: { email, tenantId: jniTenant.id } }
      });
      
      if (user) {
        // Crear usuario en jni-pros
        const newUser = await prisma.user.create({
          data: {
            email: `${userData.username}@jni-pros.com`,
            password: user.password,
            name: user.name,
            role: 'PARTICIPANT',
            tenantId: tenant.id
          }
        });
        
        // Eliminar de jni
        await prisma.user.delete({ where: { id: user.id } });
        
        console.log(`✓ Movido: ${userData.nombre_completo}`);
      }
    }
    
    console.log('✓ Proceso completado');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createJniProsTenant();