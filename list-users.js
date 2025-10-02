const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function listUsers() {
  try {
    const usersData = JSON.parse(fs.readFileSync('../usuarios_cena_gala.json', 'utf8'));
    
    console.log('=== USUARIOS JNI (Jóvenes valientes + Zona de impacto) ===\n');
    usersData.filter(u => u.grupo !== 'Jóvenes Pro.').forEach(user => {
      console.log(`${user.nombre_completo}`);
      console.log(`  Email: ${user.username}@jni.com`);
      console.log(`  Contraseña: ${user.password}`);
      console.log(`  Grupo: ${user.grupo}\n`);
    });
    
    console.log('\n=== USUARIOS JNI-PROS (Jóvenes Pro) ===\n');
    usersData.filter(u => u.grupo === 'Jóvenes Pro.').forEach(user => {
      console.log(`${user.nombre_completo}`);
      console.log(`  Email: ${user.username}@jni-pros.com`);
      console.log(`  Contraseña: ${user.password}`);
      console.log(`  Grupo: ${user.grupo}\n`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();