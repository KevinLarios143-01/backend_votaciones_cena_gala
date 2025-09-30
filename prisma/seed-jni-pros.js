const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedJniPros() {
  console.log('🌱 Seeding JNI-PROS tenant with test data...');

  try {
    // Buscar el tenant jni-pros
    const tenant = await prisma.tenant.findUnique({
      where: { slug: 'jni-pros' }
    });

    if (!tenant) {
      console.error('❌ Tenant jni-pros not found');
      return;
    }

    console.log('✅ Found tenant:', tenant.name);

    // Crear usuarios participantes
    const participants = [
      { name: 'Ana García', email: 'ana@jnipros.com', description: 'Desarrolladora Senior Frontend' },
      { name: 'Carlos Mendoza', email: 'carlos@jnipros.com', description: 'Arquitecto de Software' },
      { name: 'María López', email: 'maria@jnipros.com', description: 'Product Manager' },
      { name: 'Juan Rodríguez', email: 'juan@jnipros.com', description: 'DevOps Engineer' },
      { name: 'Laura Sánchez', email: 'laura@jnipros.com', description: 'UX/UI Designer' },
      { name: 'Pedro Martín', email: 'pedro@jnipros.com', description: 'Backend Developer' },
      { name: 'Sofia Herrera', email: 'sofia@jnipros.com', description: 'QA Lead' },
      { name: 'Diego Torres', email: 'diego@jnipros.com', description: 'Mobile Developer' },
      { name: 'Carmen Ruiz', email: 'carmen@jnipros.com', description: 'Data Scientist' },
      { name: 'Roberto Silva', email: 'roberto@jnipros.com', description: 'Scrum Master' },
      { name: 'Valentina Cruz', email: 'valentina@jnipros.com', description: 'Frontend Developer' },
      { name: 'Andrés Morales', email: 'andres@jnipros.com', description: 'Cloud Engineer' }
    ];

    const createdUsers = [];
    for (const participant of participants) {
      const user = await prisma.user.create({
        data: {
          name: participant.name,
          email: participant.email,
          password: await bcrypt.hash('123456', 10),
          role: 'PARTICIPANT',
          tenantId: tenant.id
        }
      });
      createdUsers.push({ ...user, description: participant.description });
    }

    console.log('✅ Created', createdUsers.length, 'participant users');

    // Crear categorías
    const categories = [
      {
        name: 'Mejor Desarrollador del Año',
        description: 'Reconoce la excelencia técnica y contribución al equipo',
        status: 'FINISHED'
      },
      {
        name: 'Innovador del Año',
        description: 'Para quien propuso las mejores ideas y soluciones creativas',
        status: 'FINISHED'
      },
      {
        name: 'Mejor Colaborador',
        description: 'Reconoce el trabajo en equipo y apoyo a compañeros',
        status: 'VOTING_FINAL'
      },
      {
        name: 'Líder del Año',
        description: 'Para quien demostró mejores habilidades de liderazgo',
        status: 'NOMINATION'
      }
    ];

    const createdCategories = [];
    for (const categoryData of categories) {
      const category = await prisma.category.create({
        data: {
          ...categoryData,
          tenantId: tenant.id
        }
      });
      createdCategories.push(category);
    }

    console.log('✅ Created', createdCategories.length, 'categories');

    // Crear participantes para cada categoría
    for (const category of createdCategories) {
      // Seleccionar 8 usuarios aleatorios para cada categoría
      const shuffled = [...createdUsers].sort(() => 0.5 - Math.random());
      const selectedUsers = shuffled.slice(0, 8);

      for (const user of selectedUsers) {
        await prisma.participant.create({
          data: {
            name: user.name,
            description: user.description,
            categoryId: category.id,
            tenantId: tenant.id
          }
        });
      }
    }

    console.log('✅ Created participants for all categories');

    // Crear nominaciones y votos según el estado de cada categoría
    for (const category of createdCategories) {
      const participants = await prisma.participant.findMany({
        where: { categoryId: category.id }
      });

      if (category.status === 'FINISHED' || category.status === 'VOTING_FINAL') {
        // Crear nominaciones (simulando que ya pasó la fase)
        const nominators = createdUsers.slice(0, 6); // 6 usuarios nominan
        
        for (const nominator of nominators) {
          // Cada usuario nomina 3 participantes diferentes
          const shuffledParticipants = [...participants].sort(() => 0.5 - Math.random());
          const nominated = shuffledParticipants.slice(0, 3);

          for (const participant of nominated) {
            await prisma.nomination.create({
              data: {
                userId: nominator.id,
                participantId: participant.id,
                categoryId: category.id,
                tenantId: tenant.id
              }
            });
          }
        }

        // Generar finalistas (top 4 más nominados)
        const nominationCounts = await prisma.nomination.groupBy({
          by: ['participantId'],
          where: { categoryId: category.id },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 4
        });

        for (const [index, nomination] of nominationCounts.entries()) {
          const participant = await prisma.participant.findUnique({
            where: { id: nomination.participantId }
          });

          await prisma.finalist.create({
            data: {
              participantId: participant.id,
              categoryId: category.id,
              tenantId: tenant.id
            }
          });
        }

        console.log(`✅ Created nominations and finalists for ${category.name}`);

        // Si está finalizada, crear votos
        if (category.status === 'FINISHED') {
          const finalists = await prisma.finalist.findMany({
            where: { categoryId: category.id }
          });

          const voters = createdUsers.slice(0, 8); // 8 usuarios votan
          
          for (const voter of voters) {
            // Cada usuario vota por un finalista (distribución realista)
            const weights = [0.4, 0.3, 0.2, 0.1]; // Probabilidades para cada finalista
            const random = Math.random();
            let selectedIndex = 0;
            let cumulative = 0;

            for (let i = 0; i < weights.length; i++) {
              cumulative += weights[i];
              if (random <= cumulative) {
                selectedIndex = i;
                break;
              }
            }

            const selectedFinalist = finalists[selectedIndex];
            
            await prisma.vote.create({
              data: {
                userId: voter.id,
                finalistId: selectedFinalist.id,
                categoryId: category.id,
                tenantId: tenant.id
              }
            });
          }

          console.log(`✅ Created votes for ${category.name}`);
        }
      } else if (category.status === 'NOMINATION') {
        // Solo algunas nominaciones para categoría en proceso
        const nominators = createdUsers.slice(0, 3); // Solo 3 usuarios han nominado
        
        for (const nominator of nominators) {
          const shuffledParticipants = [...participants].sort(() => 0.5 - Math.random());
          const nominated = shuffledParticipants.slice(0, 2); // Solo 2 nominaciones cada uno

          for (const participant of nominated) {
            await prisma.nomination.create({
              data: {
                userId: nominator.id,
                participantId: participant.id,
                categoryId: category.id,
                tenantId: tenant.id
              }
            });
          }
        }

        console.log(`✅ Created partial nominations for ${category.name}`);
      }
    }

    console.log('🎉 JNI-PROS tenant seeded successfully!');
    console.log('📊 Summary:');
    console.log(`   - ${createdUsers.length} users created`);
    console.log(`   - ${createdCategories.length} categories created`);
    console.log('   - Participants, nominations, and votes distributed across categories');
    console.log('   - Ready for testing the complete voting flow!');

  } catch (error) {
    console.error('❌ Error seeding JNI-PROS:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedJniPros();