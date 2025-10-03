const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Obtener todos los usuarios participantes del tenant (accesible para todos)
router.get('/users', authenticateToken, async (req, res) => {
  try {
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
    console.error('Error getting participants:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener participantes'
    });
  }
});

// Obtener participantes por categoría
router.get('/category/:categoryId', authenticateToken, async (req, res) => {
  try {
    const { categoryId } = req.params;

    const participants = await prisma.participant.findMany({
      where: { 
        categoryId,
        tenantId: req.user.tenantId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            imageUrl: true
          }
        },
        _count: {
          select: { nominations: true }
        }
      }
    });

    res.json(participants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener participantes' });
  }
});

// Crear participante (solo admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, categoryId } = req.body;

    const participant = await prisma.participant.create({
      data: {
        name,
        description,
        categoryId,
        tenantId: req.user.tenantId
      }
    });

    res.status(201).json(participant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear participante' });
  }
});

// Actualizar participante (solo admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const participant = await prisma.participant.update({
      where: { 
        id,
        tenantId: req.user.tenantId
      },
      data: {
        name,
        description
      }
    });

    res.json(participant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar participante' });
  }
});

// Eliminar participante (solo admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.participant.delete({
      where: { 
        id,
        tenantId: req.user.tenantId
      }
    });

    res.json({ message: 'Participante eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar participante' });
  }
});

module.exports = router;