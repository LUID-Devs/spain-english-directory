require('ts-node/register');

const { initDb } = require('./lib/initDb');

async function main() {
  try {
    await initDb();
    console.log('✅ Database synced successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
