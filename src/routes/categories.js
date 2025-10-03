const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();
const prisma = new PrismaClient();

// Obtener todas las categorías
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    where: { tenantId: req.user.tenantId },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              imageUrl: true
            }
          }
        }
      },
      _count: {
        select: {
          nominations: true,
          votes: true
        }
      }
    }
  });

  res.status(200).json({
    success: true,
    data: categories,
    message: 'Categorías obtenidas exitosamente'
  });
}));

// Crear categoría (solo admin)
router.post('/', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  const { name, description, nominationStartDate, nominationEndDate, votingStartDate, votingEndDate } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      error: 'El nombre de la categoría es requerido'
    });
  }

  const category = await prisma.category.create({
    data: {
      name,
      description,
      tenantId: req.user.tenantId,
      nominationStartDate: nominationStartDate ? new Date(nominationStartDate) : null,
      nominationEndDate: nominationEndDate ? new Date(nominationEndDate) : null,
      votingStartDate: votingStartDate ? new Date(votingStartDate) : null,
      votingEndDate: votingEndDate ? new Date(votingEndDate) : null
    }
  });

  // Crear participantes automáticamente para todos los usuarios PARTICIPANT del tenant
  const users = await prisma.user.findMany({
    where: {
      tenantId: req.user.tenantId,
      role: 'PARTICIPANT'
    }
  });

  for (const user of users) {
    await prisma.participant.create({
      data: {
        name: user.name,
        description: `${user.name} - Candidato para ${category.name}`,
        categoryId: category.id,
        userId: user.id,
        tenantId: req.user.tenantId
      }
    });
  }

  console.log(`Created ${users.length} participants for category ${category.name}`);

  res.status(201).json({
    success: true,
    data: category,
    message: 'Categoría creada exitosamente'
  });
}));

// Actualizar estado de categoría (solo admin)
router.patch('/:id/status', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      error: 'El estado es requerido'
    });
  }

  // Validaciones específicas por estado
  if (status === 'VOTING_FINAL') {
    // Verificar que hay nominaciones antes de pasar a votación
    const nominationCount = await prisma.nomination.count({
      where: {
        categoryId: id,
        tenantId: req.user.tenantId
      }
    });

    if (nominationCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se puede iniciar la votación sin nominaciones'
      });
    }

    // Verificar que hay finalistas
    const finalistCount = await prisma.finalist.count({
      where: {
        categoryId: id,
        tenantId: req.user.tenantId
      }
    });

    if (finalistCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se puede iniciar la votación sin finalistas. Genera los finalistas primero'
      });
    }
  }

  if (status === 'FINISHED') {
    // Verificar que hay votos antes de finalizar
    const voteCount = await prisma.vote.count({
      where: {
        categoryId: id,
        tenantId: req.user.tenantId
      }
    });

    if (voteCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se puede finalizar la votación sin votos'
      });
    }
  }

  const category = await prisma.category.update({
    where: { 
      id,
      tenantId: req.user.tenantId
    },
    data: { status }
  });

  res.status(200).json({
    success: true,
    data: category,
    message: 'Estado de categoría actualizado exitosamente'
  });
}));

// Reabrir nominaciones (solo admin) - NO elimina datos existentes
router.patch('/:id/reopen-nominations', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Solo cambiar estado a NOMINATION (mantener finalistas, votos y nominaciones existentes)
  const category = await prisma.category.update({
    where: { 
      id,
      tenantId: req.user.tenantId
    },
    data: { status: 'NOMINATION' }
  });

  res.status(200).json({
    success: true,
    data: category,
    message: 'Nominaciones reabiertas exitosamente - Todos los datos existentes se mantienen'
  });
}));

// Reabrir votaciones (solo admin) - NO elimina votos existentes
router.patch('/:id/reopen-voting', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Solo cambiar estado a VOTING_FINAL (mantener votos existentes)
  const category = await prisma.category.update({
    where: { 
      id,
      tenantId: req.user.tenantId
    },
    data: { status: 'VOTING_FINAL' }
  });

  res.status(200).json({
    success: true,
    data: category,
    message: 'Votaciones reabiertas exitosamente - Los votos existentes se mantienen'
  });
}));

// Eliminar categoría (solo admin)
router.delete('/:id', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Verificar que la categoría existe y pertenece al tenant
  const category = await prisma.category.findFirst({
    where: {
      id,
      tenantId: req.user.tenantId
    }
  });

  if (!category) {
    return res.status(404).json({
      success: false,
      error: 'Categoría no encontrada'
    });
  }

  // Eliminar categoría (cascade eliminará participantes, nominaciones, votos, finalistas)
  await prisma.category.delete({
    where: {
      id,
      tenantId: req.user.tenantId
    }
  });

  res.status(200).json({
    success: true,
    message: 'Categoría eliminada exitosamente'
  });
}));

// Obtener finalistas de una categoría
router.get('/:id/finalists', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const finalists = await prisma.finalist.findMany({
    where: { 
      categoryId: id,
      tenantId: req.user.tenantId
    },
    include: {
      participant: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              imageUrl: true
            }
          }
        }
      },
      _count: {
        select: { votes: true }
      }
    },
    orderBy: {
      nominationCount: 'desc'
    }
  });

  res.status(200).json({
    success: true,
    data: finalists,
    message: 'Finalistas obtenidos exitosamente'
  });
}));

module.exports = router;