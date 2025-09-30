const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de la base de datos...');

  // Crear usuario administrador
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@votaciones.com' },
    update: {},
    create: {
      email: 'admin@votaciones.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'ADMIN'
    }
  });

  // Crear usuarios participantes de ejemplo
  const participants = [
    { email: 'juan@example.com', name: 'Juan Pérez' },
    { email: 'maria@example.com', name: 'María García' },
    { email: 'carlos@example.com', name: 'Carlos López' },
    { email: 'ana@example.com', name: 'Ana Martínez' },
    { email: 'luis@example.com', name: 'Luis Rodríguez' }
  ];

  for (const participant of participants) {
    await prisma.user.upsert({
      where: { email: participant.email },
      update: {},
      create: {
        email: participant.email,
        password: await bcrypt.hash('123456', 10),
        name: participant.name,
        role: 'PARTICIPANT'
      }
    });
  }

  // Crear categorías de ejemplo
  const categories = [
    {
      name: 'Mejor Empleado del Año',
      description: 'Reconocimiento al empleado más destacado'
    },
    {
      name: 'Mejor Innovación',
      description: 'Proyecto más innovador del año'
    },
    {
      name: 'Mejor Trabajo en Equipo',
      description: 'Equipo que mejor trabajó en conjunto'
    }
  ];

  for (const category of categories) {
    const existingCategory = await prisma.category.findFirst({
      where: { name: category.name }
    });
    
    const createdCategory = existingCategory || await prisma.category.create({
      data: {
        name: category.name,
        description: category.description,
        status: 'NOMINATION'
      }
    });

    // Crear participantes para cada categoría
    const categoryParticipants = [
      { name: 'Candidato A', description: 'Descripción del candidato A' },
      { name: 'Candidato B', description: 'Descripción del candidato B' },
      { name: 'Candidato C', description: 'Descripción del candidato C' },
      { name: 'Candidato D', description: 'Descripción del candidato D' },
      { name: 'Candidato E', description: 'Descripción del candidato E' }
    ];

    for (const participant of categoryParticipants) {
      await prisma.participant.create({
        data: {
          name: participant.name,
          description: participant.description,
          categoryId: createdCategory.id
        }
      });
    }
  }

  console.log('Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });