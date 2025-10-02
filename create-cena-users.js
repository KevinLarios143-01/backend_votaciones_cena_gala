const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const prisma = new PrismaClient();

async function createCenaUsers() {
  try {
    // Leer datos de usuarios
    const usersData = JSON.parse(fs.readFileSync('../usuarios_cena_gala.json', 'utf8'));
    
    // Buscar el tenant JNI
    const tenant = await prisma.tenant.findUnique({
      where: { slug: 'jni' }
    });
    
    if (!tenant) {
      console.error('Error: El tenant JNI no existe. Ejecuta primero create-jni-tenant.js');
      return;
    }
    
    console.log('Usando tenant:', tenant.name);
    
    console.log(`Procesando ${usersData.length} usuarios...`);
    
    let created = 0;
    let skipped = 0;
    
    for (const userData of usersData) {
      const email = `${userData.username}@jni.com`;
      
      // Verificar si el usuario ya existe
      const existingUser = await prisma.user.findUnique({
        where: {
          email_tenantId: {
            email: email,
            tenantId: tenant.id
          }
        }
      });
      
      if (existingUser) {
        console.log(`Usuario ya existe: ${email}`);
        skipped++;
        continue;
      }
      
      // Hashear contraseña
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Crear usuario
      const user = await prisma.user.create({
        data: {
          email: email,
          password: hashedPassword,
          name: userData.nombre_completo,
          imageUrl: userData.foto_url,
          role: 'PARTICIPANT',
          tenantId: tenant.id
        }
      });
      
      // Los participantes se crearán después cuando se definan las categorías
      // Por ahora solo guardamos la información del usuario
      
      console.log(`✓ Usuario creado: ${userData.nombre_completo} (${email})`);
      created++;
    }
    
    console.log(`\n=== RESUMEN ===`);
    console.log(`Usuarios creados: ${created}`);
    console.log(`Usuarios omitidos (ya existían): ${skipped}`);
    console.log(`Total procesados: ${usersData.length}`);
    
    // Mostrar algunos ejemplos de credenciales
    console.log(`\n=== EJEMPLOS DE CREDENCIALES ===`);
    for (let i = 0; i < Math.min(5, usersData.length); i++) {
      const user = usersData[i];
      console.log(`${user.nombre_completo}:`);
      console.log(`  Email: ${user.username}@jni.com`);
      console.log(`  Contraseña: ${user.password}`);
      console.log(`  Grupo: ${user.grupo}`);
      console.log(`  Foto: ${user.foto_url}`);
      console.log('');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createCenaUsers();