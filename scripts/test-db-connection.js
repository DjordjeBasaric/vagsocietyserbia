const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  try {
    console.log('\n=== TEST KONEKCIJE SA NEONDB ===\n');
    console.log('Pokušavam da se povežem sa bazom...\n');
    
    // Pokušaj jednostavnog upita
    await prisma.$connect();
    console.log('✅ Konekcija uspešna!\n');
    
    // Test jednostavnog upita
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ SQL upit uspešan:', result);
    
    // Proveri verziju PostgreSQL-a
    const version = await prisma.$queryRaw`SELECT version()`;
    console.log('\n📊 Verzija PostgreSQL-a:');
    console.log(version[0].version);
    
    // Proveri tabele
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    console.log('\n📋 Tabele u bazi:');
    tables.forEach((table) => {
      console.log(`  - ${table.table_name}`);
    });
    
  } catch (error) {
    console.error('\n❌ GREŠKA PRI KONEKCIJI:\n');
    console.error('Tip greške:', error.constructor.name);
    console.error('Poruka:', error.message);
    
    if (error.code) {
      console.error('Kod greške:', error.code);
    }
    
    console.error('\n💡 MOGUĆI UZROCI:');
    console.error('1. NeonDB baza je pauzirana - aktivirajte je u NeonDB dashboard-u');
    console.error('2. Connection string nije ispravan');
    console.error('3. Problem sa mrežom ili firewall-om');
    console.error('4. Baza je obrisana ili ne postoji');
    
    console.error('\n🔧 PREPORUKE:');
    console.error('- Proverite NeonDB dashboard: https://console.neon.tech');
    console.error('- Proverite da li je baza aktivna');
    console.error('- Proverite connection string u .env fajlu');
    
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
