const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCategories() {
  try {
    const categories = await prisma.category.findMany();
    console.log('Categories status:');
    categories.forEach(cat => {
      console.log(`- ${cat.name}: ${cat.status}`);
    });
    
    // Update first category to NOMINATION status
    if (categories.length > 0) {
      await prisma.category.update({
        where: { id: categories[0].id },
        data: { status: 'NOMINATION' }
      });
      console.log(`Updated ${categories[0].name} to NOMINATION status`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories();