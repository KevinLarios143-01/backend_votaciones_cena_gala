const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding multi-tenant database...');

  // Create Tenants
  const tenant1 = await prisma.tenant.create({
    data: {
      name: 'Empresa Demo',
      slug: 'empresa-demo',
      description: 'Empresa de demostración para votaciones',
      isActive: true
    }
  });

  const tenant2 = await prisma.tenant.create({
    data: {
      name: 'Organización ABC',
      slug: 'organizacion-abc',
      description: 'Segunda organización de prueba',
      isActive: true
    }
  });

  console.log(`✅ Created tenants: ${tenant1.name}, ${tenant2.name}`);

  // Create Users for Tenant 1
  const hashedPassword = await bcrypt.hash('123456', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  const admin1 = await prisma.user.create({
    data: {
      email: 'admin@empresa-demo.com',
      password: adminPassword,
      name: 'Admin Empresa Demo',
      role: 'ADMIN',
      tenantId: tenant1.id
    }
  });

  const users1 = await Promise.all([
    prisma.user.create({
      data: {
        email: 'juan@empresa-demo.com',
        password: hashedPassword,
        name: 'Juan Pérez',
        role: 'PARTICIPANT',
        tenantId: tenant1.id
      }
    }),
    prisma.user.create({
      data: {
        email: 'maria@empresa-demo.com',
        password: hashedPassword,
        name: 'María García',
        role: 'PARTICIPANT',
        tenantId: tenant1.id
      }
    }),
    prisma.user.create({
      data: {
        email: 'carlos@empresa-demo.com',
        password: hashedPassword,
        name: 'Carlos López',
        role: 'PARTICIPANT',
        tenantId: tenant1.id
      }
    }),
    prisma.user.create({
      data: {
        email: 'ana@empresa-demo.com',
        password: hashedPassword,
        name: 'Ana Sánchez',
        role: 'PARTICIPANT',
        tenantId: tenant1.id
      }
    })
  ]);

  // Create Users for Tenant 2
  const admin2 = await prisma.user.create({
    data: {
      email: 'admin@organizacion-abc.com',
      password: adminPassword,
      name: 'Admin Organización ABC',
      role: 'ADMIN',
      tenantId: tenant2.id
    }
  });

  const users2 = await Promise.all([
    prisma.user.create({
      data: {
        email: 'pedro@organizacion-abc.com',
        password: hashedPassword,
        name: 'Pedro González',
        role: 'PARTICIPANT',
        tenantId: tenant2.id
      }
    }),
    prisma.user.create({
      data: {
        email: 'lucia@organizacion-abc.com',
        password: hashedPassword,
        name: 'Lucía Martínez',
        role: 'PARTICIPANT',
        tenantId: tenant2.id
      }
    })
  ]);

  console.log(`✅ Created ${users1.length + 1} users for ${tenant1.name}`);
  console.log(`✅ Created ${users2.length + 1} users for ${tenant2.name}`);

  // Update tenants with admin users
  await prisma.tenant.update({
    where: { id: tenant1.id },
    data: { adminUserId: admin1.id }
  });

  await prisma.tenant.update({
    where: { id: tenant2.id },
    data: { adminUserId: admin2.id }
  });

  // Create Categories for Tenant 1
  const categories1 = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Mejor Compañero de Trabajo',
        description: 'Reconoce a quien siempre está dispuesto a ayudar y colaborar',
        status: 'NOMINATION',
        tenantId: tenant1.id
      }
    }),
    prisma.category.create({
      data: {
        name: 'Innovación del Año',
        description: 'Para quien propuso la mejor idea innovadora',
        status: 'NOMINATION',
        tenantId: tenant1.id
      }
    })
  ]);

  // Create Categories for Tenant 2
  const categories2 = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Liderazgo Excepcional',
        description: 'Reconoce las mejores cualidades de liderazgo',
        status: 'NOMINATION',
        tenantId: tenant2.id
      }
    }),
    prisma.category.create({
      data: {
        name: 'Trabajo en Equipo',
        description: 'Para quien mejor colabora en equipo',
        status: 'NOMINATION',
        tenantId: tenant2.id
      }
    })
  ]);

  console.log(`✅ Created ${categories1.length} categories for ${tenant1.name}`);
  console.log(`✅ Created ${categories2.length} categories for ${tenant2.name}`);

  // Create Participants for Tenant 1
  for (const category of categories1) {
    for (const user of users1) {
      await prisma.participant.create({
        data: {
          name: user.name,
          description: `${user.name} - Candidato para ${category.name}`,
          categoryId: category.id,
          userId: user.id,
          tenantId: tenant1.id
        }
      });
    }
  }

  // Create Participants for Tenant 2
  for (const category of categories2) {
    for (const user of users2) {
      await prisma.participant.create({
        data: {
          name: user.name,
          description: `${user.name} - Candidato para ${category.name}`,
          categoryId: category.id,
          userId: user.id,
          tenantId: tenant2.id
        }
      });
    }
  }

  console.log('✅ Created participants for all categories');

  // Create SuperAdmin (no tenant)
  const superAdminPassword = await bcrypt.hash('superadmin123', 10);
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@votaciones.com',
      password: superAdminPassword,
      name: 'Super Administrador',
      role: 'SUPERADMIN',
      tenantId: tenant1.id // Temporary, will be handled differently
    }
  });

  console.log('✅ Created SuperAdmin');

  console.log('\n🎉 Multi-tenant seeding completed!');
  console.log('\n📋 Access Information:');
  console.log('\n👑 SuperAdmin:');
  console.log('   SuperAdmin: superadmin@votaciones.com / superadmin123');
  console.log('\n🏢 Empresa Demo:');
  console.log('   Admin: admin@empresa-demo.com / admin123');
  console.log('   Users: juan@empresa-demo.com, maria@empresa-demo.com, carlos@empresa-demo.com, ana@empresa-demo.com / 123456');
  console.log('\n🏢 Organización ABC:');
  console.log('   Admin: admin@organizacion-abc.com / admin123');
  console.log('   Users: pedro@organizacion-abc.com, lucia@organizacion-abc.com / 123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });