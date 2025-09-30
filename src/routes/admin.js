const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Reiniciar votos del sistema (solo borra votos y nominaciones)
router.post('/reset-system', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
      return res.status(403).json({ 
        success: false,
        error: 'Solo administradores pueden reiniciar el sistema' 
      });
    }

    const tenantId = req.user.tenantId;
    console.log('Resetting votes and nominations for tenant:', tenantId);

    // Delete only votes, nominations and finalists (keep categories and participants)
    const deletedVotes = await prisma.vote.deleteMany({
      where: { tenantId }
    });
    
    const deletedFinalists = await prisma.finalist.deleteMany({
      where: { tenantId }
    });
    
    const deletedNominations = await prisma.nomination.deleteMany({
      where: { tenantId }
    });

    // Reset all categories to NOMINATION status
    await prisma.category.updateMany({
      where: { tenantId },
      data: { status: 'NOMINATION' }
    });

    console.log('Votes and nominations reset complete!');

    res.status(200).json({
      success: true,
      message: 'Votos y nominaciones reiniciados exitosamente',
      data: {
        votesDeleted: deletedVotes.count,
        nominationsDeleted: deletedNominations.count,
        finalistsDeleted: deletedFinalists.count
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