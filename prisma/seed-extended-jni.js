const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedExtendedJniPros() {
  console.log('🌱 Seeding JNI-PROS with EXTENDED test data...');

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: 'jni-pros' }
    });

    if (!tenant) {
      console.error('❌ Tenant jni-pros not found');
      return;
    }

    // Limpiar datos existentes
    await prisma.vote.deleteMany({ where: { tenantId: tenant.id } });
    await prisma.finalist.deleteMany({ where: { tenantId: tenant.id } });
    await prisma.nomination.deleteMany({ where: { tenantId: tenant.id } });
    await prisma.participant.deleteMany({ where: { tenantId: tenant.id } });
    await prisma.category.deleteMany({ where: { tenantId: tenant.id } });
    await prisma.user.deleteMany({ where: { tenantId: tenant.id, role: 'PARTICIPANT' } });

    console.log('✅ Cleaned existing data');

    // Crear 20 usuarios participantes
    const participants = [
      { name: 'Ana García', email: 'ana@jnipros.com', description: 'Desarrolladora Senior Frontend - React/Angular' },
      { name: 'Carlos Mendoza', email: 'carlos@jnipros.com', description: 'Arquitecto de Software - Microservicios' },
      { name: 'María López', email: 'maria@jnipros.com', description: 'Product Manager - Estrategia Digital' },
      { name: 'Juan Rodríguez', email: 'juan@jnipros.com', description: 'DevOps Engineer - AWS/Docker' },
      { name: 'Laura Sánchez', email: 'laura@jnipros.com', description: 'UX/UI Designer - Design Systems' },
      { name: 'Pedro Martín', email: 'pedro@jnipros.com', description: 'Backend Developer - Node.js/Python' },
      { name: 'Sofia Herrera', email: 'sofia@jnipros.com', description: 'QA Lead - Automation Testing' },
      { name: 'Diego Torres', email: 'diego@jnipros.com', description: 'Mobile Developer - React Native/Flutter' },
      { name: 'Carmen Ruiz', email: 'carmen@jnipros.com', description: 'Data Scientist - ML/AI' },
      { name: 'Roberto Silva', email: 'roberto@jnipros.com', description: 'Scrum Master - Agile Coach' },
      { name: 'Valentina Cruz', email: 'valentina@jnipros.com', description: 'Frontend Developer - Vue.js/TypeScript' },
      { name: 'Andrés Morales', email: 'andres@jnipros.com', description: 'Cloud Engineer - Azure/GCP' },
      { name: 'Isabella Jiménez', email: 'isabella@jnipros.com', description: 'Cybersecurity Specialist' },
      { name: 'Fernando Castro', email: 'fernando@jnipros.com', description: 'Full Stack Developer - MEAN Stack' },
      { name: 'Camila Vargas', email: 'camila@jnipros.com', description: 'Business Analyst - Process Optimization' },
      { name: 'Sebastián Rojas', email: 'sebastian@jnipros.com', description: 'Database Administrator - PostgreSQL/MongoDB' },
      { name: 'Natalia Peña', email: 'natalia@jnipros.com', description: 'Technical Writer - Documentation' },
      { name: 'Alejandro Vega', email: 'alejandro@jnipros.com', description: 'Solutions Architect - Enterprise Systems' },
      { name: 'Gabriela Ortiz', email: 'gabriela@jnipros.com', description: 'Marketing Technology Specialist' },
      { name: 'Ricardo Delgado', email: 'ricardo@jnipros.com', description: 'Site Reliability Engineer - Monitoring' }
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

    // Crear 8 categorías con diferentes estados
    const categories = [
      {
        name: 'Mejor Desarrollador del Año',
        description: 'Reconoce la excelencia técnica y contribución al desarrollo de software',
        status: 'FINISHED'
      },
      {
        name: 'Innovador del Año',
        description: 'Para quien propuso las mejores ideas y soluciones creativas',
        status: 'FINISHED'
      },
      {
        name: 'Mejor Colaborador',
        description: 'Reconoce el trabajo en equipo y apoyo constante a compañeros',
        status: 'FINISHED'
      },
      {
        name: 'Líder del Año',
        description: 'Para quien demostró mejores habilidades de liderazgo y mentoría',
        status: 'VOTING_FINAL'
      },
      {
        name: 'Mejor Mentor',
        description: 'Reconoce a quien mejor guía y desarrolla el talento del equipo',
        status: 'VOTING_FINAL'
      },
      {
        name: 'Especialista Técnico del Año',
        description: 'Para el experto que resuelve los desafíos técnicos más complejos',
        status: 'SELECTION_FINALISTS'
      },
      {
        name: 'Mejor Comunicador',
        description: 'Reconoce habilidades excepcionales de comunicación y presentación',
        status: 'NOMINATION'
      },
      {
        name: 'Espíritu de Equipo',
        description: 'Para quien mejor representa los valores y cultura de la empresa',
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

    // Crear participantes para cada categoría (12 por categoría)
    for (const category of createdCategories) {
      const shuffled = [...createdUsers].sort(() => 0.5 - Math.random());
      const selectedUsers = shuffled.slice(0, 12);

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

    // Procesar cada categoría según su estado
    for (const category of createdCategories) {
      const participants = await prisma.participant.findMany({
        where: { categoryId: category.id }
      });

      console.log(`🔄 Processing ${category.name} (${category.status})`);

      if (['FINISHED', 'VOTING_FINAL', 'SELECTION_FINALISTS'].includes(category.status)) {
        // Crear nominaciones realistas
        const nominators = createdUsers.slice(0, 10); // 10 usuarios nominan
        
        for (const nominator of nominators) {
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

        // Generar finalistas (top 4)
        const nominationCounts = await prisma.nomination.groupBy({
          by: ['participantId'],
          where: { categoryId: category.id },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 4
        });

        for (const nomination of nominationCounts) {
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

        console.log(`  ✅ Created nominations and finalists`);

        // Si está finalizada, crear votos
        if (category.status === 'FINISHED') {
          const finalists = await prisma.finalist.findMany({
            where: { categoryId: category.id }
          });

          const voters = createdUsers.slice(0, 15); // 15 usuarios votan
          
          // Distribución de votos más realista
          const voteDistribution = [
            { weight: 0.35, count: Math.floor(voters.length * 0.35) },
            { weight: 0.28, count: Math.floor(voters.length * 0.28) },
            { weight: 0.22, count: Math.floor(voters.length * 0.22) },
            { weight: 0.15, count: Math.floor(voters.length * 0.15) }
          ];

          let voterIndex = 0;
          for (let i = 0; i < finalists.length; i++) {
            const votesToCreate = voteDistribution[i].count;
            for (let j = 0; j < votesToCreate && voterIndex < voters.length; j++) {
              await prisma.vote.create({
                data: {
                  userId: voters[voterIndex].id,
                  finalistId: finalists[i].id,
                  categoryId: category.id,
                  tenantId: tenant.id
                }
              });
              voterIndex++;
            }
          }

          console.log(`  ✅ Created ${voterIndex} votes`);
        }

      } else if (category.status === 'NOMINATION') {
        // Nominaciones parciales para categorías en proceso
        const nominators = createdUsers.slice(0, 5);
        
        for (const nominator of nominators) {
          const shuffledParticipants = [...participants].sort(() => 0.5 - Math.random());
          const nominated = shuffledParticipants.slice(0, Math.floor(Math.random() * 3) + 1);

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

        console.log(`  ✅ Created partial nominations`);
      }
    }

    // Estadísticas finales
    const finalStats = await prisma.user.count({ where: { tenantId: tenant.id, role: 'PARTICIPANT' } });
    const totalNominations = await prisma.nomination.count({ where: { tenantId: tenant.id } });
    const totalVotes = await prisma.vote.count({ where: { tenantId: tenant.id } });

    console.log('🎉 EXTENDED JNI-PROS seeding completed!');
    console.log('📊 Final Statistics:');
    console.log(`   - ${finalStats} participant users`);
    console.log(`   - ${createdCategories.length} categories`);
    console.log(`   - ${totalNominations} total nominations`);
    console.log(`   - ${totalVotes} total votes`);
    console.log('   - 3 categories FINISHED (ready for ceremony)');
    console.log('   - 2 categories in VOTING_FINAL');
    console.log('   - 1 category in SELECTION_FINALISTS');
    console.log('   - 2 categories in NOMINATION');

  } catch (error) {
    console.error('❌ Error in extended seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedExtendedJniPros();