const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const photoData = {
  'Pamela Molina': 'https://drive.google.com/open?id=19rYuBbDHNt6U2MK0WwrEykHlY-aF5XvR',
  'Lucrecia Estefania Chen Cuellar': 'https://drive.google.com/open?id=1gt5THomATWKRAErsdoPCxpkeBN5n9o4A',
  'José Miguel Ayala Arriaza': 'https://drive.google.com/open?id=1Wy80BF-IAg1i8shBAd5TAJmpD1KisbEP',
  'Charito Xuc T.': 'https://drive.google.com/open?id=1cWkDt3SpyYug9YcTp5eec9dlR_Ms4s2m',
  'Andreé Alessandro Espinoza Barrientos': 'https://drive.google.com/open?id=1-ObWo1STAKV7RlvCujoqveKPX6Fkm9B1',
  'Zoe Daniella Urízar Rivas': 'https://drive.google.com/open?id=15KmU2NCComJ-dtve5rpVxVD4dkWh-ZZa',
  'Jossy Ayala': 'https://drive.google.com/open?id=146c8xiagBfakcc0t-WjHDv2buZ1vZ3NC',
  'Evelyn Violetta Urízar Rivas': 'https://drive.google.com/open?id=1WeB_AlwVdAIXO76t3HkSuH8BByEshleU',
  'Ana Esther Jordán Ortiz': 'https://drive.google.com/open?id=1cFqjn-zKDbtKZkq_FZirwtnhI2ibWnb-',
  'Emely Aracely Chen Pérez': 'https://drive.google.com/open?id=14IZ5qWGa3ohITNIR-qaYLKaCvfxZ4EZ8',
  'KEVIN ALEXANDER LARIOS GRAMAJO': 'https://drive.google.com/open?id=1a8e7aY63OOaFTEx5izqrQdlJ1Pv0OLE8',
  'Estefany Michelle Enriquez Fuentes': 'https://drive.google.com/open?id=1yg0dJuZf7mMB_XWjMYDG_lACAj1GMcpR',
  'Paola Mishelle Hengstenberg Prera': 'https://drive.google.com/open?id=1Jl6GnYZrO-0ymruKUEuHbVQzngQ3EH70',
  'Ronald Jacob Chicoj': 'https://drive.google.com/open?id=1LRIWDU35V5JX_KhM6Y9-CWyZtDDc63nk',
  'Heylin Jamileth Díaz Leonardo': 'https://drive.google.com/open?id=1SC1EKLjftizgzRa1qCMId_axczBB7M6N',
  'Karina Yancor': 'https://drive.google.com/open?id=1AnOlZYXLiyuEBWAKfG4KQxqQJHAirLZX',
  'Beverly Michelle Larios Gramajo': 'https://drive.google.com/open?id=1OkwTkck4fW8g-VihEaAfg98-7VTONCn4',
  'Ayleen Castro': 'https://drive.google.com/open?id=1bWSG6L1UxCJwGX0eNLGquotTbEnrsusC',
  'CARLOS EDUARDO FIGUEROA ESTRADA': 'https://drive.google.com/open?id=1jW8lehu2nAuRPd8GaM8JGiGz59xMI85t',
  'Diego Alejandro Leche Noeriega': 'https://drive.google.com/open?id=1zMUddLdf62t6vPTrubP9ST5Y5oHf5Yoj',
  'Sheyla Dayan Lemus Lemus': 'https://drive.google.com/open?id=12iAxpUNnMSExHJrLzMNbQh_YOCVDySiw',
  'GABRIELA ESPAÑA': 'https://drive.google.com/open?id=1tL7OAp7Mp2PM4hCvZ74W39H0YrSKmyiO',
  'William Alexander Ayala Camas': 'https://drive.google.com/open?id=1vlQ-1zQaMUcOViq1ZH6fdHjuCR8zOIdF',
  'Jonathan Vinicio Lemus': 'https://drive.google.com/open?id=1E84hpmNP7CcyHCwE5y4lqArzmFh0fuAB',
  'Jonatan Míqueas Girón Enriquez': 'https://drive.google.com/open?id=1aGpGyNLptGyZ812TIcpgA9C5XYoyf3pl',
  'Elio Gerardo López Cifuentes': 'https://drive.google.com/open?id=1Pf_dkdey2VednbRh5vC_ki1n2_f_kNV6',
  'Irene Alejandra Choc Calvo': 'https://drive.google.com/open?id=1ypDHbdOja9o7VeHJ9ifKQUlkLkf5DWUZ',
  'Valery Mishel Ayala Camas': 'https://drive.google.com/open?id=1fz1cX8tX9bZpgfc1efcTAxzh7WmI8T-a',
  'Anna Isabel Ortega Durán': 'https://drive.google.com/open?id=1psH-Muw0-Auqo1swKQ-1D9F7LKwmBGtP',
  'Sandra Dalila Calicio Charuc': 'https://drive.google.com/open?id=1kE3bD4E-tdmOdMPtLZKoNStRoTPmGR9B',
  'Sofia Urizar': 'https://drive.google.com/open?id=1V1j_qXQximUrje_oeM-FXCBn8jrZd_Q7',
  'Caleb Cristian Garcia Navas': 'https://drive.google.com/open?id=1ioxu2TALkdghwxR-hrzGOGwB3uf28UVo',
  'Débora Elizabeth Chicoj Boc': 'https://drive.google.com/open?id=1SLGzlZEx15TTsDs8NEWwqrD3iPQPk6ZY',
  'Freddy Alejandro Velásquez Soto': 'https://drive.google.com/open?id=1QpgyxCkX__Q8M6R3zl7m8k8QFwLHR7Cq',
  'diego alejandro mijangos menchu': 'https://drive.google.com/open?id=1cF6I29Hd9MGGztO_ftSwobpbhBXAMY9s',
  'Hector Emanuel Soto Corzo': 'https://drive.google.com/open?id=1LIFTAqXsYpPGus10eWdLoH-JtoKPHkeB',
  'Paula Urizar': 'https://drive.google.com/open?id=1k4UmpT5FLsUiawCGHhqQKWKwHpkwBy5v',
  'Jorge Jr Fuentes': 'https://drive.google.com/open?id=1KDstsN8S-1RDEjXSiV3Qa5r4XxFkyIis',
  'Ivanna Elizabeth Urizar Ayala': 'https://drive.google.com/open?id=1aEpVS-bz3Xhszj6SKeKsjyZgCMzE5fvI'
};

async function updatePhotos() {
  try {
    console.log('Actualizando fotos de usuarios...');
    
    for (const [name, photoUrl] of Object.entries(photoData)) {
      const users = await prisma.user.findMany({
        where: { name: { contains: name.trim() } }
      });
      
      for (const user of users) {
        await prisma.user.update({
          where: { id: user.id },
          data: { imageUrl: photoUrl }
        });
        console.log(`✓ ${user.name}: foto actualizada`);
      }
    }
    
    // También actualizar participantes
    for (const [name, photoUrl] of Object.entries(photoData)) {
      const participants = await prisma.participant.findMany({
        where: { name: { contains: name.trim() } }
      });
      
      for (const participant of participants) {
        await prisma.participant.update({
          where: { id: participant.id },
          data: { imageUrl: photoUrl }
        });
      }
    }
    
    console.log('✓ Fotos actualizadas en usuarios y participantes');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePhotos();