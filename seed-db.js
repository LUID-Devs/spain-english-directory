require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    moduleResolution: 'node',
  },
});

const seedModule = require('./lib/seed');
const seed = seedModule.default || seedModule;

async function main() {
  await seed();
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
