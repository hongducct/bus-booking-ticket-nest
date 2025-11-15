import { config } from 'dotenv';
import { AppDataSource } from './data-source';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity';

config();

async function createAdmin() {
  await AppDataSource.initialize();

  const userRepository = AppDataSource.getRepository(User);

  // Check if admin already exists
  const existingAdmin = await userRepository.findOne({
    where: { email: 'admin@example.com' },
  });

  if (existingAdmin) {
    console.log('Admin user already exists');
    await AppDataSource.destroy();
    return;
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = userRepository.create({
    email: 'admin@example.com',
    password: hashedPassword,
    name: 'Admin',
    role: UserRole.ADMIN,
  });

  await userRepository.save(admin);
  console.log('✅ Admin user created successfully!');
  console.log('Email: admin@example.com');
  console.log('Password: admin123');
  console.log('⚠️  Please change the password after first login!');

  await AppDataSource.destroy();
}

createAdmin().catch((error) => {
  console.error('Error creating admin:', error);
  process.exit(1);
});

