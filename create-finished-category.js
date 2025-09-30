const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createFinishedCategory() {
  try {
    console.log('Creating finished category with results...');
    
    // Get first category and update to FINISHED
    const categories = await prisma.category.findMany();
    if (categories.length === 0) {
      console.log('No categories found');
      return;
    }
    
    const category = categories[0];
    console.log(`Using category: ${category.name}`);
    
    // Get participants for this category
    const participants = await prisma.participant.findMany({
      where: { categoryId: category.id }
    });
    
    // Get users
    const users = await prisma.user.findMany({
      where: { role: 'PARTICIPANT' }
    });
    
    // Clear existing data
    await prisma.vote.deleteMany({ where: { categoryId: category.id } });
    await prisma.finalist.deleteMany({ where: { categoryId: category.id } });
    await prisma.nomination.deleteMany({ where: { categoryId: category.id } });
    
    // Create nominations for top 4 participants
    const topParticipants = participants.slice(0, 4);
    
    // Create one nomination per user for different participants
    for (let i = 0; i < users.length && i < topParticipants.length; i++) {
      const user = users[i];
      const participant = topParticipants[i % topParticipants.length];
      
      await prisma.nomination.create({
        data: {
          userId: user.id,
          categoryId: category.id,
          participantId: participant.id
        }
      });
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
    
    // Create votes for finalists
    const finalists = await prisma.finalist.findMany({
      where: { categoryId: category.id }
    });
    
    // Create one vote per user for different finalists
    for (let i = 0; i < users.length && i < finalists.length; i++) {
      const user = users[i];
      const finalist = finalists[i % finalists.length];
      
      await prisma.vote.create({
        data: {
          userId: user.id,
          categoryId: category.id,
          finalistId: finalist.id
        }
      });
    }
    
    // Update category status to FINISHED
    await prisma.category.update({
      where: { id: category.id },
      data: { status: 'FINISHED' }
    });
    
    console.log(`Category ${category.name} updated to FINISHED with complete results`);
    
    // Show results
    const results = await prisma.finalist.findMany({
      where: { categoryId: category.id },
      include: {
        participant: true,
        _count: {
          select: { votes: true }
        }
      },
      orderBy: {
        votes: {
          _count: 'desc'
        }
      }
    });
    
    console.log('Final results:');
    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.participant.name}: ${result._count.votes} votos`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createFinishedCategory();