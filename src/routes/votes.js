const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();
const prisma = new PrismaClient();

// Verificar si el usuario ya votó en una categoría
router.get('/user-vote/:categoryId', authenticateToken, async (req, res) => {
  try {
    const { categoryId } = req.params;
    const userId = req.user.id;

    const vote = await prisma.vote.findFirst({
      where: {
        userId,
        categoryId,
        tenantId: req.user.tenantId
      },
      include: {
        finalist: {
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
            }
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        hasVoted: !!vote,
        vote: vote || null
      }
    });
  } catch (error) {
    console.error('Error checking user vote:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al verificar voto del usuario' 
    });
  }
});

// Crear voto
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
  const { categoryId, finalistId } = req.body;
  const userId = req.user.id;

  if (!categoryId || !finalistId) {
    return res.status(400).json({
      success: false,
      error: 'CategoryId y finalistId son requeridos'
    });
  }

  // Verificar que la categoría esté en fase de votación final
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

  if (category.status !== 'VOTING_FINAL') {
    return res.status(400).json({
      success: false,
      error: 'La categoría no está en fase de votación final'
    });
  }

  // Verificar si ya votó en esta categoría
  const existingVote = await prisma.vote.findFirst({
    where: {
      userId,
      categoryId,
      tenantId: req.user.tenantId
    }
  });

  if (existingVote) {
    return res.status(409).json({
      success: false,
      error: 'Ya has votado en esta categoría'
    });
  }

  // Crear voto
  const vote = await prisma.vote.create({
    data: {
      userId,
      categoryId,
      finalistId,
      tenantId: req.user.tenantId
    },
    include: {
      finalist: {
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
          }
        }
      }
    }
  });

  res.status(201).json({
    success: true,
    data: vote,
    message: 'Voto registrado exitosamente'
  });
}));

// Obtener resultados por categoría
router.get('/results/:categoryId', authenticateToken, async (req, res) => {
  try {
    const { categoryId } = req.params;

    const results = await prisma.finalist.findMany({
      where: { 
        categoryId,
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
        votes: {
          _count: 'desc'
        }
      }
    });

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener resultados' });
  }
});

// Obtener estadísticas generales por tenant
router.get('/stats', authenticateToken, asyncHandler(async (req, res) => {
  const tenantId = req.user.tenantId;
  
  const totalUsers = await prisma.user.count({
    where: { 
      tenantId,
      role: 'PARTICIPANT'
    }
  });
  const totalCategories = await prisma.category.count({
    where: { tenantId }
  });
  const totalNominations = await prisma.nomination.count({
    where: { tenantId }
  });
  const totalVotes = await prisma.vote.count({
    where: { tenantId }
  });

  const categoriesWithStats = await prisma.category.findMany({
    where: { tenantId },
    include: {
      _count: {
        select: {
          nominations: true,
          votes: true,
          participants: true
        }
      }
    }
  });

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalCategories,
      totalNominations,
      totalVotes,
      categoriesWithStats
    },
    message: 'Estadísticas obtenidas exitosamente'
  });
}));

module.exports = router;