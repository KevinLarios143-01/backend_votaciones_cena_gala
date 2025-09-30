const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Registro
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, tenantSlug } = req.body;

    if (!email || !password || !name || !tenantSlug) {
      return res.status(400).json({ error: 'Todos los campos son requeridos, incluyendo el código de encuesta' });
    }

    // Verificar que el tenant existe y está activo
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug }
    });

    if (!tenant) {
      return res.status(404).json({ error: 'Código de encuesta no válido' });
    }

    if (!tenant.isActive) {
      return res.status(403).json({ error: 'Esta encuesta no está disponible actualmente' });
    }

    // Verificar si el usuario ya existe en este tenant
    const existingUser = await prisma.user.findFirst({
      where: { 
        email,
        tenantId: tenant.id
      }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'El usuario ya existe en esta encuesta' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'PARTICIPANT',
        tenantId: tenant.id
      },
      include: { tenant: true }
    });

    // Crear participantes automáticamente para todas las categorías existentes del tenant
    const categories = await prisma.category.findMany({
      where: { tenantId: tenant.id }
    });

    for (const category of categories) {
      await prisma.participant.create({
        data: {
          name: user.name,
          description: `${user.name} - Candidato para ${category.name}`,
          categoryId: category.id,
          userId: user.id,
          tenantId: tenant.id
        }
      });
    }

    console.log(`Created ${categories.length} participants for user ${user.name}`);

    // Generar token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenant: user.tenant
      }
    });
  } catch (error) {
    console.error('Register error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Buscar usuario
    const user = await prisma.user.findFirst({
      where: { email },
      include: { tenant: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar que el tenant esté activo (excepto para SUPERADMIN)
    if (user.role !== 'SUPERADMIN' && user.tenant && !user.tenant.isActive) {
      return res.status(403).json({ error: 'Esta encuesta no está disponible actualmente' });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;