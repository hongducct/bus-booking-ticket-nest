import { AppDataSource } from './data-source';
import { seedDatabase } from './seed';

async function runSeed() {
  try {
    await AppDataSource.initialize();
    console.log('📦 Database connected, starting seed...');
    
    await seedDatabase(AppDataSource);
    
    await AppDataSource.destroy();
    console.log('✅ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

runSeed();

