const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkRegistrations() {
  try {
    console.log('\n=== Sve prijave ===\n');
    const allRegistrations = await prisma.eventRegistration.findMany({
      include: { images: true },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`Ukupno prijava: ${allRegistrations.length}\n`);

    const pending = allRegistrations.filter((r) => r.status === 'PENDING');
    const approved = allRegistrations.filter((r) => r.status === 'APPROVED');
    const declined = allRegistrations.filter((r) => r.status === 'DECLINED');

    console.log(`Na čekanju (PENDING): ${pending.length}`);
    console.log(`Odobrene (APPROVED): ${approved.length}`);
    console.log(`Odbijene (DECLINED): ${declined.length}\n`);

    console.log('\n=== Detalji po statusu ===\n');

    if (pending.length > 0) {
      console.log('--- Na čekanju ---');
      pending.forEach((reg) => {
        console.log(
          `- ${reg.firstName} ${reg.lastName} (${reg.email}) - ${reg.carModel} - ${reg.status}`
        );
      });
      console.log('');
    }

    if (approved.length > 0) {
      console.log('--- Odobrene ---');
      approved.forEach((reg) => {
        console.log(
          `- ${reg.firstName} ${reg.lastName} (${reg.email}) - ${reg.carModel} - ${reg.status}`
        );
      });
      console.log('');
    }

    if (declined.length > 0) {
      console.log('--- Odbijene ---');
      declined.forEach((reg) => {
        console.log(
          `- ${reg.firstName} ${reg.lastName} (${reg.email}) - ${reg.carModel} - ${reg.status}`
        );
      });
      console.log('');
    }

    // SQL upit za direktnu proveru
    console.log('\n=== SQL upit za direktnu proveru ===\n');
    console.log('SELECT status, COUNT(*) as count');
    console.log('FROM "EventRegistration"');
    console.log('GROUP BY status;\n');
  } catch (error) {
    console.error('Greška:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRegistrations();
