const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const categories = [
  {
    name: "El más Puntual",
    description: "El que siempre llega primero a cada actividad."
  },
  {
    name: "El que llega Tarde",
    description: "El que nunca se salva de entrar después de la hora."
  },
  {
    name: "El más Molestón",
    description: "Aquel que siempre está bromeando y fastidiando al grupo."
  },
  {
    name: "El que siempre tiene Hambre",
    description: "El que en cada reunión anda buscando comida."
  },
  {
    name: "El que se Duerme en las Prédicas",
    description: "El que batalla contra el sueño durante los mensajes."
  },
  {
    name: "El más Despistado",
    description: "El que se le olvidan cosas o anda en otro mundo."
  },
  {
    name: "El más Callado",
    description: "El que casi no habla, pero siempre acompaña con su presencia."
  },
  {
    name: "El más Sonriente",
    description: "El que contagia alegría con su sonrisa en todo momento."
  },
  {
    name: "El más Servicial",
    description: "El que siempre está dispuesto a ayudar en lo que se necesite."
  },
  {
    name: "El más Participativo",
    description: "El que nunca falta en juegos, dinámicas y actividades."
  },
  {
    name: "Revelación del Año",
    description: "Nuevo integrante que sorprendió con su entusiasmo y compromiso."
  },
  {
    name: "Espíritu de Unidad",
    description: "Quien promueve la armonía y mantiene al grupo unido."
  }
];

async function createJniCategories() {
  try {
    // Buscar el tenant JNI
    const tenant = await prisma.tenant.findUnique({
      where: { slug: 'jni' }
    });
    
    if (!tenant) {
      console.error('Error: El tenant JNI no existe. Ejecuta primero create-jni-tenant.js');
      return;
    }
    
    console.log('Usando tenant:', tenant.name);
    console.log(`Creando ${categories.length} categorías...\n`);
    
    let created = 0;
    let skipped = 0;
    
    for (const categoryData of categories) {
      // Verificar si la categoría ya existe
      const existingCategory = await prisma.category.findFirst({
        where: {
          name: categoryData.name,
          tenantId: tenant.id
        }
      });
      
      if (existingCategory) {
        console.log(`⚠️  Categoría ya existe: ${categoryData.name}`);
        skipped++;
        continue;
      }
      
      // Crear la categoría
      const category = await prisma.category.create({
        data: {
          name: categoryData.name,
          description: categoryData.description,
          status: 'NOMINATION',
          tenantId: tenant.id
        }
      });
      
      console.log(`✓ Categoría creada: ${category.name}`);
      created++;
    }
    
    console.log(`\n=== RESUMEN ===`);
    console.log(`Categorías creadas: ${created}`);
    console.log(`Categorías omitidas (ya existían): ${skipped}`);
    console.log(`Total procesadas: ${categories.length}`);
    
    // Mostrar todas las categorías del tenant
    const allCategories = await prisma.category.findMany({
      where: { tenantId: tenant.id },
      orderBy: { name: 'asc' }
    });
    
    console.log(`\n=== CATEGORÍAS EN EL TENANT JNI ===`);
    allCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name}`);
      console.log(`   ${cat.description}`);
      console.log(`   Estado: ${cat.status}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error al crear las categorías:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createJniCategories();