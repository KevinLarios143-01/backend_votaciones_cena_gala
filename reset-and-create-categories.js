const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetAndCreateCategories() {
  try {
    console.log('Resetting database and creating new categories...');
    
    // Delete all data in order (respecting foreign keys)
    await prisma.vote.deleteMany();
    await prisma.finalist.deleteMany();
    await prisma.nomination.deleteMany();
    await prisma.participant.deleteMany();
    await prisma.category.deleteMany();
    
    console.log('All existing data deleted');
    
    // Create new categories
    const categories = [
      {
        name: 'Mejor Compañero de Trabajo',
        description: 'Reconoce a quien siempre está dispuesto a ayudar y colaborar',
        status: 'NOMINATION'
      },
      {
        name: 'Innovación del Año',
        description: 'Para quien propuso la mejor idea innovadora',
        status: 'NOMINATION'
      },
      {
        name: 'Liderazgo Excepcional',
        description: 'Reconoce las mejores cualidades de liderazgo',
        status: 'NOMINATION'
      }
    ];
    
    const createdCategories = [];
    
    for (const categoryData of categories) {
      const category = await prisma.category.create({
        data: categoryData
      });
      createdCategories.push(category);
      console.log(`Created category: ${category.name}`);
    }
    
    // Create participants for each category
    const participantNames = [
      'Ana García', 'Carlos López', 'María Rodríguez', 'Juan Martínez',
      'Laura Sánchez', 'Pedro González', 'Sofia Hernández', 'Diego Torres',
      'Carmen Ruiz', 'Miguel Ángel', 'Lucía Morales', 'Roberto Silva'
    ];
    
    for (const category of createdCategories) {
      // Create 8 participants per category
      for (let i = 0; i < 8; i++) {
        const participantName = participantNames[i % participantNames.length];
        await prisma.participant.create({
          data: {
            name: `${participantName} - ${category.name}`,
            description: `Candidato para ${category.name}`,
            categoryId: category.id
          }
        });
      }
      console.log(`Created 8 participants for ${category.name}`);
    }
    
    console.log('\n✅ Database reset complete!');
    console.log('📋 New categories created:');
    createdCategories.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.status})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAndCreateCategories();