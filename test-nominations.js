const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testNominations() {
  try {
    console.log('=== TESTING NOMINATIONS ===');
    
    // Get categories
    const categories = await prisma.category.findMany({
      include: {
        participants: true
      }
    });
    
    console.log(`Found ${categories.length} categories`);
    
    if (categories.length > 0) {
      const category = categories[0];
      console.log(`Category: ${category.name} (${category.status})`);
      console.log(`Participants: ${category.participants.length}`);
      
      if (category.participants.length > 0) {
        const participant = category.participants[0];
        console.log(`First participant: ${participant.name}`);
        
        // Get a user
        const user = await prisma.user.findFirst({
          where: { role: 'PARTICIPANT' }
        });
        
        if (user) {
          console.log(`User: ${user.name}`);
          
          // Check existing nominations
          const existing = await prisma.nomination.findFirst({
            where: {
              userId: user.id,
              categoryId: category.id
            }
          });
          
          console.log(`Existing nomination: ${existing ? 'Yes' : 'No'}`);
          
          if (!existing) {
            // Create nomination
            const nomination = await prisma.nomination.create({
              data: {
                userId: user.id,
                categoryId: category.id,
                participantId: participant.id
              },
              include: {
                participant: true
              }
            });
            
            console.log('Nomination created:', nomination.id);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNominations();