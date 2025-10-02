const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function checkMissingJniPros() {
  try {
    const usersData = JSON.parse(fs.readFileSync('../usuarios_cena_gala.json', 'utf8'));
    const tenant = await prisma.tenant.findUnique({ 
      where: { slug: 'jni-pros' },
      include: { users: true }
    });
    
    const jovenesPro = usersData.filter(u => u.grupo === 'Jóvenes Pro.');
    const currentEmails = tenant.users.map(u => u.email);
    
    console.log(`Usuarios esperados de Jóvenes Pro: ${jovenesPro.length}`);
    console.log(`Usuarios actuales en jni-pros: ${tenant.users.length}`);
    
    console.log('\n=== USUARIOS FALTANTES ===');
    const missing = jovenesPro.filter(u => !currentEmails.includes(`${u.username}@jni-pros.com`));
    
    if (missing.length === 0) {
      console.log('✓ Todos los usuarios están presentes');
    } else {
      missing.forEach(user => {
        console.log(`- ${user.nombre_completo} (${user.username}@jni-pros.com)`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMissingJniPros();