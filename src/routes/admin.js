const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Reiniciar participantes del sistema
router.post('/reset-system', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
      return res.status(403).json({ 
        success: false,
        error: 'Solo administradores pueden reiniciar el sistema' 
      });
    }

    const tenantId = req.user.tenantId;
    console.log('Resetting participants for tenant:', tenantId);

    // Delete votes, nominations, finalists and participants
    await prisma.vote.deleteMany({ where: { tenantId } });
    await prisma.finalist.deleteMany({ where: { tenantId } });
    await prisma.nomination.deleteMany({ where: { tenantId } });
    await prisma.participant.deleteMany({ where: { tenantId } });

    // Reset all categories to NOMINATION status
    await prisma.category.updateMany({
      where: { tenantId },
      data: { status: 'NOMINATION' }
    });

    // Get all users and categories for this tenant
    const users = await prisma.user.findMany({
      where: { tenantId, role: 'PARTICIPANT' }
    });
    
    const categories = await prisma.category.findMany({
      where: { tenantId }
    });

    // Recreate participants for each category (12 per category)
    let totalParticipants = 0;
    for (const category of categories) {
      const shuffled = [...users].sort(() => 0.5 - Math.random());
      const selectedUsers = shuffled.slice(0, Math.min(12, users.length));

      for (const user of selectedUsers) {
        await prisma.participant.create({
          data: {
            name: user.name,
            description: `${user.name} - Participante`,
            categoryId: category.id,
            tenantId: tenantId
          }
        });
        totalParticipants++;
      }
    }

    console.log('System reset complete!');

    res.status(200).json({
      success: true,
      message: 'Sistema reiniciado exitosamente',
      data: {
        categoriesReset: categories.length,
        participantsCreated: totalParticipants
      }
    });

  } catch (error) {
    console.error('Error resetting system:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al reiniciar el sistema',
      details: error.message
    });
  }
});

module.exports = router;