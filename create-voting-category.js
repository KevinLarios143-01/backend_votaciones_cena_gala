const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createVotingCategory() {
  try {
    console.log('Creating voting category with finalists...');
    
    // Get a category to update
    const categories = await prisma.category.findMany();
    if (categories.length === 0) {
      console.log('No categories found');
      return;
    }
    
    const category = categories[1]; // Use second category
    console.log(`Using category: ${category.name}`);
    
    // Get participants for this category
    const participants = await prisma.participant.findMany({
      where: { categoryId: category.id }
    });
    
    console.log(`Found ${participants.length} participants`);
    
    // Create some nominations first
    const users = await prisma.user.findMany({
      where: { role: 'PARTICIPANT' }
    });
    
    // Clear existing nominations and finalists
    await prisma.nomination.deleteMany({
      where: { categoryId: category.id }
    });
    
    await prisma.finalist.deleteMany({
      where: { categoryId: category.id }
    });
    
    // Create nominations for top 4 participants
    const topParticipants = participants.slice(0, 4);
    
    for (let i = 0; i < topParticipants.length; i++) {
      const participant = topParticipants[i];
      const nominationCount = 10 - i * 2; // 10, 8, 6, 4 nominations
      
      // Create multiple nominations for each participant
      for (let j = 0; j < Math.min(nominationCount, users.length); j++) {
        try {
          await prisma.nomination.create({
            data: {
              userId: users[j % users.length].id,
              categoryId: category.id,
              participantId: participant.id
            }
          });
        } catch (error) {
          // Skip if already exists
        }
      }
    }
    
    // Create finalists
    for (let i = 0; i < topParticipants.length; i++) {
      const participant = topParticipants[i];
      const nominationCount = 10 - i * 2;
      
      await prisma.finalist.create({
        data: {
          categoryId: category.id,
          participantId: participant.id,
          nominationCount: nominationCount
        }
      });
    }
    
    // Update category status to VOTING_FINAL
    await prisma.category.update({
      where: { id: category.id },
      data: { status: 'VOTING_FINAL' }
    });
    
    console.log(`Category ${category.name} updated to VOTING_FINAL with ${topParticipants.length} finalists`);
    
    // Verify finalists
    const finalists = await prisma.finalist.findMany({
      where: { categoryId: category.id },
      include: { participant: true }
    });
    
    console.log('Finalists created:');
    finalists.forEach(f => {
      console.log(`- ${f.participant.name}: ${f.nominationCount} nominations`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createVotingCategory();