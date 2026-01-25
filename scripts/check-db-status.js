const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabaseStatus() {
  try {
    console.log('\n=== STATUS NEONDB TABELA ===\n');

    // AdminUser tabela
    const adminUsers = await prisma.adminUser.count();
    console.log(`📊 AdminUser: ${adminUsers} korisnika`);

    // Product tabela
    const products = await prisma.product.count();
    const activeProducts = await prisma.product.count({
      where: { isActive: true },
    });
    const inactiveProducts = await prisma.product.count({
      where: { isActive: false },
    });
    console.log(`📦 Product: ${products} proizvoda (${activeProducts} aktivnih, ${inactiveProducts} neaktivnih)`);

    // Order tabela
    const orders = await prisma.order.count();
    const pendingOrders = await prisma.order.count({
      where: { status: 'PENDING' },
    });
    const declinedOrders = await prisma.order.count({
      where: { status: 'DECLINED' },
    });
    const shippedOrders = await prisma.order.count({
      where: { status: 'SHIPPED' },
    });
    console.log(`🛒 Order: ${orders} narudžbina (${pendingOrders} na čekanju, ${declinedOrders} odbijenih, ${shippedOrders} poslatih)`);

    // EventRegistration tabela
    const registrations = await prisma.eventRegistration.count();
    const pendingRegs = await prisma.eventRegistration.count({
      where: { status: 'PENDING' },
    });
    const approvedRegs = await prisma.eventRegistration.count({
      where: { status: 'APPROVED' },
    });
    const declinedRegs = await prisma.eventRegistration.count({
      where: { status: 'DECLINED' },
    });
    console.log(`📝 EventRegistration: ${registrations} prijava (${pendingRegs} na čekanju, ${approvedRegs} odobrenih, ${declinedRegs} odbijenih)`);

    // CarImage tabela
    const carImages = await prisma.carImage.count();
    console.log(`🖼️  CarImage: ${carImages} slika\n`);

    // Detaljnije informacije
    console.log('=== DETALJNI PREGLED ===\n');

    // Poslednje 5 narudžbina
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { product: true },
    });
    if (recentOrders.length > 0) {
      console.log('Poslednje 5 narudžbina:');
      recentOrders.forEach((order) => {
        console.log(
          `  - ${order.fullName} (${order.email}) - ${order.productNameSnapshot} - ${order.status} - ${new Date(order.createdAt).toLocaleDateString('sr-RS')}`
        );
      });
      console.log('');
    }

    // Poslednje 5 prijava
    const recentRegs = await prisma.eventRegistration.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { images: true },
    });
    if (recentRegs.length > 0) {
      console.log('Poslednje 5 prijava:');
      recentRegs.forEach((reg) => {
        console.log(
          `  - ${reg.firstName} ${reg.lastName} (${reg.email}) - ${reg.carModel} - ${reg.status} - ${reg.images.length} slika - ${new Date(reg.createdAt).toLocaleDateString('sr-RS')}`
        );
      });
      console.log('');
    }

    // SQL upiti za direktnu proveru
    console.log('=== SQL UPITI ZA DIREKTNU PROVERU ===\n');
    console.log('-- Broj redova po tabelama:');
    console.log('SELECT');
    console.log('  (SELECT COUNT(*) FROM "AdminUser") as admin_users,');
    console.log('  (SELECT COUNT(*) FROM "Product") as products,');
    console.log('  (SELECT COUNT(*) FROM "Order") as orders,');
    console.log('  (SELECT COUNT(*) FROM "EventRegistration") as registrations,');
    console.log('  (SELECT COUNT(*) FROM "CarImage") as car_images;\n');

    console.log('-- Status narudžbina:');
    console.log('SELECT status, COUNT(*) as count FROM "Order" GROUP BY status;\n');

    console.log('-- Status prijava:');
    console.log('SELECT status, COUNT(*) as count FROM "EventRegistration" GROUP BY status;\n');

  } catch (error) {
    console.error('❌ Greška:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseStatus();
