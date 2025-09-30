const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestNominations() {
  try {
    console.log('Creating test nominations...');
    
    // Get users and categories
    const users = await prisma.user.findMany({
      where: { role: 'PARTICIPANT' }
    });
    
    const categories = await prisma.category.findMany();
    
    if (users.length === 0 || categories.length === 0) {
      console.log('No users or categories found');
      return;
    }
    
    // Create nomination for first user in first category
    const firstUser = users[0]; // juan@example.com
    const firstCategory = categories[0];
    
    // Get participants for this category
    const participants = await prisma.participant.findMany({
      where: { categoryId: firstCategory.id }
    });
    
    if (participants.length === 0) {
      console.log('No participants found');
      return;
    }
    
    // Check if nomination already exists
    const existingNomination = await prisma.nomination.findFirst({
      where: {
        userId: firstUser.id,
        categoryId: firstCategory.id
      }
    });
    
    if (existingNomination) {
      console.log(`User ${firstUser.name} already nominated in ${firstCategory.name}`);
    } else {
      // Create nomination for second participant (not nominating themselves)
      const targetParticipant = participants[1];
      
      const nomination = await prisma.nomination.create({
        data: {
          userId: firstUser.id,
          categoryId: firstCategory.id,
          participantId: targetParticipant.id
        },
        include: {
          participant: true
        }
      });
      
      console.log(`Created nomination: ${firstUser.name} nominated ${targetParticipant.name} in ${firstCategory.name}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestNominations();