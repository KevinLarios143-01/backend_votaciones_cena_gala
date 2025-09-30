const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateToUserParticipants() {
  try {
    console.log('Updating system to use users as participants...');
    
    // Delete existing data
    await prisma.vote.deleteMany();
    await prisma.finalist.deleteMany();
    await prisma.nomination.deleteMany();
    await prisma.participant.deleteMany();
    
    console.log('Cleared existing participant data');
    
    // Get all users and categories
    const users = await prisma.user.findMany({
      where: { role: 'PARTICIPANT' }
    });
    
    const categories = await prisma.category.findMany();
    
    console.log(`Found ${users.length} users and ${categories.length} categories`);
    
    // Create participants from users for each category
    for (const category of categories) {
      for (const user of users) {
        await prisma.participant.create({
          data: {
            name: user.name,
            description: `${user.name} - Candidato para ${category.name}`,
            categoryId: category.id,
            userId: user.id // We'll add this field to link to user
          }
        });
      }
      console.log(`Created ${users.length} participants for ${category.name}`);
    }
    
    console.log('✅ Updated system to use users as participants');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateToUserParticipants();