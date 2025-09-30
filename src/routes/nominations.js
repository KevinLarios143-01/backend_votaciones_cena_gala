const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Crear nominación
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { categoryId, participantId } = req.body;
    const userId = req.user.id;

    console.log('Creating nomination:', { userId, categoryId, participantId });

    if (!categoryId || !participantId) {
      return res.status(400).json({ 
        success: false,
        error: 'CategoryId y participantId son requeridos' 
      });
    }

    // Verificar que la categoría esté en fase de nominación
    const category = await prisma.category.findUnique({
      where: { 
        id: categoryId,
        tenantId: req.user.tenantId
      }
    });

    if (!category) {
      return res.status(404).json({ 
        success: false,
        error: 'Categoría no encontrada' 
      });
    }

    if (category.status !== 'NOMINATION') {
      return res.status(400).json({ 
        success: false,
        error: 'La categoría no está en fase de nominación' 
      });
    }

    // Verificar si ya nominó a este participante
    const existingNomination = await prisma.nomination.findFirst({
      where: {
        userId,
        categoryId,
        participantId,
        tenantId: req.user.tenantId
      }
    });

    if (existingNomination) {
      return res.status(409).json({ 
        success: false,
        error: 'Ya has nominado a este participante' 
      });
    }

    // Verificar límite de 3 nominaciones por categoría
    const nominationCount = await prisma.nomination.count({
      where: {
        userId,
        categoryId,
        tenantId: req.user.tenantId
      }
    });

    if (nominationCount >= 3) {
      return res.status(409).json({ 
        success: false,
        error: 'Ya has alcanzado el límite de 3 nominaciones por categoría' 
      });
    }

    // Crear nominación
    const nomination = await prisma.nomination.create({
      data: {
        userId,
        categoryId,
        participantId,
        tenantId: req.user.tenantId
      },
      include: {
        participant: true
      }
    });

    console.log('Nomination created successfully:', nomination.id);

    res.status(201).json({
      success: true,
      data: nomination,
      message: 'Nominación creada exitosamente'
    });
  } catch (error) {
    console.error('Nomination creation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al crear nominación',
      details: error.message
    });
  }
});

// Verificar nominaciones del usuario en una categoría
router.get('/user-nomination/:categoryId', authenticateToken, async (req, res) => {
  try {
    const { categoryId } = req.params;
    const userId = req.user.id;

    const nominations = await prisma.nomination.findMany({
      where: {
        userId,
        categoryId,
        tenantId: req.user.tenantId
      },
      include: {
        participant: true
      }
    });

    res.status(200).json({
      success: true,
      data: {
        nominationCount: nominations.length,
        nominations: nominations,
        canNominate: nominations.length < 3
      }
    });
  } catch (error) {
    console.error('Error checking user nominations:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al verificar nominaciones del usuario' 
    });
  }
});

// Obtener nominaciones por categoría
router.get('/category/:categoryId', authenticateToken, async (req, res) => {
  try {
    const { categoryId } = req.params;

    const nominations = await prisma.nomination.groupBy({
      by: ['participantId'],
      where: { 
        categoryId,
        tenantId: req.user.tenantId
      },
      _count: {
        participantId: true
      },
      orderBy: {
        _count: {
          participantId: 'desc'
        }
      }
    });

    // Obtener detalles de participantes
    const participantIds = nominations.map(n => n.participantId);
    const participants = await prisma.participant.findMany({
      where: { id: { in: participantIds } }
    });

    const result = nominations.map(nomination => {
      const participant = participants.find(p => p.id === nomination.participantId);
      return {
        participant,
        nominationCount: nomination._count.participantId
      };
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener nominaciones' });
  }
});

// Generar finalistas automáticamente (solo admin)
router.post('/generate-finalists/:categoryId', authenticateToken, async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
      return res.status(403).json({ 
        success: false,
        error: 'Solo administradores pueden generar finalistas' 
      });
    }

    // Verificar que hay nominaciones antes de generar finalistas
    const nominationCount = await prisma.nomination.count({
      where: {
        categoryId,
        tenantId: req.user.tenantId
      }
    });

    if (nominationCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se pueden generar finalistas sin nominaciones'
      });
    }

    // Obtener top 4 nominados
    const topNominations = await prisma.nomination.groupBy({
      by: ['participantId'],
      where: { 
        categoryId,
        tenantId: req.user.tenantId
      },
      _count: {
        participantId: true
      },
      orderBy: {
        _count: {
          participantId: 'desc'
        }
      },
      take: 4
    });

    // Eliminar finalistas existentes
    await prisma.finalist.deleteMany({
      where: {
        categoryId,
        tenantId: req.user.tenantId
      }
    });

    // Crear finalistas
    const finalists = await Promise.all(
      topNominations.map(nomination =>
        prisma.finalist.create({
          data: {
            categoryId,
            participantId: nomination.participantId,
            nominationCount: nomination._count.participantId,
            tenantId: req.user.tenantId
          },
          include: {
            participant: true
          }
        })
      )
    );

    // Actualizar estado de categoría
    await prisma.category.update({
      where: { 
        id: categoryId,
        tenantId: req.user.tenantId
      },
      data: { status: 'SELECTION_FINALISTS' }
    });

    res.status(200).json({
      success: true,
      data: finalists,
      message: 'Finalistas generados exitosamente'
    });
  } catch (error) {
    console.error('Error generating finalists:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al generar finalistas' 
    });
  }
});

module.exports = router;