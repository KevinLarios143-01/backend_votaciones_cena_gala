const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const categories = [
  { name: "El más Puntual", description: "El que siempre llega primero a cada actividad." },
  { name: "El que llega Tarde", description: "El que nunca se salva de entrar después de la hora." },
  { name: "El más Molestón", description: "Aquel que siempre está bromeando y fastidiando al grupo." },
  { name: "El que siempre tiene Hambre", description: "El que en cada reunión anda buscando comida." },
  { name: "El que se Duerme en las Prédicas", description: "El que batalla contra el sueño durante los mensajes." },
  { name: "El más Despistado", description: "El que se le olvidan cosas o anda en otro mundo." },
  { name: "El más Callado", description: "El que casi no habla, pero siempre acompaña con su presencia." },
  { name: "El más Sonriente", description: "El que contagia alegría con su sonrisa en todo momento." },
  { name: "El más Servicial", description: "El que siempre está dispuesto a ayudar en lo que se necesite." },
  { name: "El más Participativo", description: "El que nunca falta en juegos, dinámicas y actividades." },
  { name: "Revelación del Año", description: "Nuevo integrante que sorprendió con su entusiasmo y compromiso." },
  { name: "Espíritu de Unidad", description: "Quien promueve la armonía y mantiene al grupo unido." }
];

async function createJniProsCategories() {
  try {
    const tenant = await prisma.tenant.findUnique({ where: { slug: 'jni-pros' } });
    
    console.log(`Creando ${categories.length} categorías en JNI Pros...`);
    
    for (const categoryData of categories) {
      await prisma.category.create({
        data: {
          name: categoryData.name,
          description: categoryData.description,
          status: 'NOMINATION',
          tenantId: tenant.id
        }
      });
      console.log(`✓ ${categoryData.name}`);
    }
    
    console.log('✓ Todas las categorías creadas en JNI Pros');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createJniProsCategories();