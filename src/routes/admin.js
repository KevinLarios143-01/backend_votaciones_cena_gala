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
        imageUrl: true,
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

// Actualizar información de usuario
router.put('/users/:userId', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
      return res.status(403).json({ 
        success: false,
        error: 'Solo administradores pueden modificar usuarios' 
      });
    }

    const { userId } = req.params;
    const { name, email, imageUrl } = req.body;

    // Verificar que el usuario pertenece al mismo tenant
    const existingUser = await prisma.user.findFirst({
      where: {
        id: userId,
        tenantId: req.user.tenantId
      }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(imageUrl !== undefined && { imageUrl })
      },
      select: {
        id: true,
        name: true,
        email: true,
        imageUrl: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: updatedUser
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al actualizar usuario',
      details: error.message
    });
  }
});

// Actualizar solo la foto de un usuario
router.put('/users/:userId/photo', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
      return res.status(403).json({ 
        success: false,
        error: 'Solo administradores pueden modificar fotos' 
      });
    }

    const { userId } = req.params;
    const { imageUrl } = req.body;

    // Verificar que el usuario pertenece al mismo tenant
    const existingUser = await prisma.user.findFirst({
      where: {
        id: userId,
        tenantId: req.user.tenantId
      }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Actualizar foto del usuario
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { imageUrl },
      select: {
        id: true,
        name: true,
        imageUrl: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Foto actualizada exitosamente',
      data: updatedUser
    });

  } catch (error) {
    console.error('Error updating photo:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al actualizar foto',
      details: error.message
    });
  }
});

// Obtener un usuario específico
router.get('/users/:userId', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
      return res.status(403).json({ 
        success: false,
        error: 'Solo administradores pueden ver usuarios' 
      });
    }

    const { userId } = req.params;

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        tenantId: req.user.tenantId
      },
      select: {
        id: true,
        name: true,
        email: true,
        imageUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener usuario'
    });
  }
});

module.exports = router;