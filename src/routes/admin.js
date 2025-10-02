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

    // Recreate participants for each category (all users with their photos)
    let totalParticipants = 0;
    for (const category of categories) {
      for (const user of users) {
        await prisma.participant.create({
          data: {
            name: user.name,
            description: `${user.name} - Participante`,
            imageUrl: user.imageUrl,
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

// Eliminar todos los usuarios participantes
router.post('/delete-all-users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
      return res.status(403).json({ 
        success: false,
        error: 'Solo administradores pueden eliminar usuarios' 
      });
    }

    const tenantId = req.user.tenantId;
    console.log('Deleting all participant users for tenant:', tenantId);

    // Delete all related data first
    await prisma.vote.deleteMany({ where: { tenantId } });
    await prisma.finalist.deleteMany({ where: { tenantId } });
    await prisma.nomination.deleteMany({ where: { tenantId } });
    await prisma.participant.deleteMany({ where: { tenantId } });

    // Delete only PARTICIPANT users (keep ADMIN and SUPERADMIN)
    const deletedUsers = await prisma.user.deleteMany({
      where: { 
        tenantId,
        role: 'PARTICIPANT'
      }
    });

    // Reset all categories to NOMINATION status
    await prisma.category.updateMany({
      where: { tenantId },
      data: { status: 'NOMINATION' }
    });

    console.log('All participant users deleted!');

    res.status(200).json({
      success: true,
      message: 'Todos los usuarios participantes eliminados exitosamente',
      data: {
        usersDeleted: deletedUsers.count
      }
    });

  } catch (error) {
    console.error('Error deleting users:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al eliminar usuarios',
      details: error.message
    });
  }
});

// Obtener todos los usuarios del tenant
router.get('/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
      return res.status(403).json({ 
        success: false,
        error: 'Solo administradores pueden ver usuarios' 
      });
    }

    const users = await prisma.user.findMany({
      where: { 
        tenantId: req.user.tenantId,
        role: 'PARTICIPANT'
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      },
      orderBy: { name: 'asc' }
    });

    res.status(200).json({
      success: true,
      data: users
    });

  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener usuarios'
    });
  }
});

module.exports = router;