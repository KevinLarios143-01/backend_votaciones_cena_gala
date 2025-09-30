const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware para verificar rol SUPERADMIN
const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'SUPERADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requiere rol de SuperAdmin'
    });
  }
  next();
};

// Obtener todos los tenants
router.get('/tenants', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const tenants = await prisma.tenant.findMany({
      include: {
        _count: {
          select: {
            users: true,
            categories: true,
            nominations: true,
            votes: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: tenants,
      message: 'Tenants obtenidos exitosamente'
    });
  } catch (error) {
    console.error('Error getting tenants:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener tenants'
    });
  }
});

// Crear nuevo tenant
router.post('/tenants', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { name, slug, description, adminEmail, adminName, adminPassword } = req.body;

    if (!name || !slug || !adminEmail || !adminName || !adminPassword) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos son requeridos'
      });
    }

    // Verificar que el slug sea único
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug }
    });

    if (existingTenant) {
      return res.status(409).json({
        success: false,
        error: 'El slug ya existe'
      });
    }

    // Crear tenant
    const tenant = await prisma.tenant.create({
      data: {
        name,
        slug,
        description,
        isActive: true
      }
    });

    // Crear admin del tenant
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        role: 'ADMIN',
        tenantId: tenant.id
      }
    });

    // Actualizar tenant con adminUserId
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { adminUserId: admin.id }
    });

    res.status(201).json({
      success: true,
      data: { tenant, admin: { id: admin.id, name: admin.name, email: admin.email } },
      message: 'Tenant creado exitosamente'
    });
  } catch (error) {
    console.error('Error creating tenant:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear tenant'
    });
  }
});

// Obtener estadísticas globales
router.get('/stats', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const totalTenants = await prisma.tenant.count();
    const activeTenants = await prisma.tenant.count({ where: { isActive: true } });
    const totalUsers = await prisma.user.count();
    const totalCategories = await prisma.category.count();
    const totalNominations = await prisma.nomination.count();
    const totalVotes = await prisma.vote.count();

    // Estadísticas por tenant
    const tenantStats = await prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            users: true,
            categories: true,
            nominations: true,
            votes: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        global: {
          totalTenants,
          activeTenants,
          totalUsers,
          totalCategories,
          totalNominations,
          totalVotes
        },
        tenantStats
      },
      message: 'Estadísticas obtenidas exitosamente'
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas'
    });
  }
});

// Obtener categorías de un tenant específico
router.get('/tenants/:tenantId/categories', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { tenantId } = req.params;

    const categories = await prisma.category.findMany({
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
      data: categories,
      message: 'Categorías obtenidas exitosamente'
    });
  } catch (error) {
    console.error('Error getting tenant categories:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener categorías del tenant'
    });
  }
});

// Activar/Desactivar tenant
router.patch('/tenants/:tenantId/status', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { isActive } = req.body;

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: { isActive }
    });

    res.status(200).json({
      success: true,
      data: tenant,
      message: `Tenant ${isActive ? 'activado' : 'desactivado'} exitosamente`
    });
  } catch (error) {
    console.error('Error updating tenant status:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar estado del tenant'
    });
  }
});

module.exports = router;