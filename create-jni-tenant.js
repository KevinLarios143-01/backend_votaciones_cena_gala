const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createJniTenant() {
  try {
    // Verificar si el tenant ya existe
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug: 'jni' }
    });
    
    if (existingTenant) {
      console.log('El tenant JNI ya existe:', existingTenant);
      return existingTenant;
    }
    
    // Crear el tenant JNI
    const tenant = await prisma.tenant.create({
      data: {
        name: 'JNI',
        slug: 'jni',
        description: 'Tenant para JNI',
        isActive: true
      }
    });
    
    console.log('✓ Tenant JNI creado exitosamente:');
    console.log(`  ID: ${tenant.id}`);
    console.log(`  Nombre: ${tenant.name}`);
    console.log(`  Slug: ${tenant.slug}`);
    console.log(`  Descripción: ${tenant.description}`);
    console.log(`  Activo: ${tenant.isActive}`);
    
    return tenant;
    
  } catch (error) {
    console.error('Error al crear el tenant JNI:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createJniTenant();