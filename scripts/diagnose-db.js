const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

console.log('\n=== DIJAGNOSTIKA NEONDB KONEKCIJE ===\n');

// Proveri .env fajl
console.log('1. Proveravam DATABASE_URL iz .env fajla...');
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('❌ DATABASE_URL nije pronađen u environment varijablama!');
  process.exit(1);
}

// Maskiraj password u prikazu
const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':****@');
console.log('✅ DATABASE_URL pronađen:', maskedUrl);

// Parsiraj connection string
try {
  const url = new URL(dbUrl.replace('postgresql://', 'http://'));
  console.log('\n2. Parsiranje connection string-a:');
  console.log('   Host:', url.hostname);
  console.log('   Port:', url.port || '5432 (default)');
  console.log('   Database:', url.pathname.replace('/', ''));
  console.log('   SSL Mode:', url.searchParams.get('sslmode') || 'not specified');
} catch (e) {
  console.log('⚠️  Ne mogu da parsujem connection string:', e.message);
}

// Test konekcije sa različitim timeout-ima
console.log('\n3. Pokušavam konekciju sa bazom...');
const prisma = new PrismaClient({
  log: ['error'],
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});

async function testConnection() {
  try {
    // Pokušaj sa kratkim timeout-om
    console.log('   Pokušavam $connect()...');
    await Promise.race([
      prisma.$connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout nakon 10 sekundi')), 10000)
      )
    ]);
    
    console.log('✅ Konekcija uspešna!\n');
    
    // Test jednostavnog upita
    console.log('4. Testiram SQL upit...');
    const result = await prisma.$queryRaw`SELECT 1 as test, NOW() as current_time`;
    console.log('✅ SQL upit uspešan:', result[0]);
    
    // Proveri tabele
    console.log('\n5. Proveravam tabele u bazi...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    if (tables.length === 0) {
      console.log('⚠️  Nema tabela u bazi - možda migracije nisu pokrenute');
    } else {
      console.log(`✅ Pronađeno ${tables.length} tabela:`);
      tables.forEach((table) => {
        console.log(`   - ${table.table_name}`);
      });
    }
    
    // Proveri broj redova u svakoj tabeli
    console.log('\n6. Broj redova po tabelama:');
    const tableNames = tables.map(t => t.table_name);
    for (const tableName of tableNames) {
      try {
        const count = await prisma.$queryRawUnsafe(
          `SELECT COUNT(*) as count FROM "${tableName}"`
        );
        console.log(`   ${tableName}: ${count[0].count} redova`);
      } catch (e) {
        console.log(`   ${tableName}: greška pri brojanju`);
      }
    }
    
  } catch (error) {
    console.error('\n❌ GREŠKA PRI KONEKCIJI:\n');
    console.error('Tip:', error.constructor.name);
    console.error('Poruka:', error.message);
    
    if (error.code) {
      console.error('Kod:', error.code);
    }
    
    // Detaljnija analiza greške
    console.error('\n📋 ANALIZA GREŠKE:');
    
    if (error.message.includes("Can't reach database server")) {
      console.error('   → Server nije dostupan na toj adresi');
      console.error('   → Mogući uzroci:');
      console.error('     1. NeonDB baza je pauzirana (serverless baze se pauziraju nakon neaktivnosti)');
      console.error('     2. Hostname je promenjen ili baza je migrirana');
      console.error('     3. Problem sa mrežom ili firewall-om');
    } else if (error.message.includes('authentication')) {
      console.error('   → Problem sa autentifikacijom');
      console.error('   → Proverite username i password u connection string-u');
    } else if (error.message.includes('timeout')) {
      console.error('   → Timeout - server ne odgovara');
      console.error('   → Baza je verovatno pauzirana');
    }
    
    console.error('\n🔧 PREPORUKE:');
    console.error('1. Otvorite NeonDB dashboard: https://console.neon.tech');
    console.error('2. Proverite da li projekat/baza postoji');
    console.error('3. Ako je baza pauzirana, kliknite "Resume" ili "Activate"');
    console.error('4. Ako baza ne postoji, možda je obrisana - kreirajte novu');
    console.error('5. Kopirajte novi connection string iz dashboard-a ako je potrebno');
    
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
