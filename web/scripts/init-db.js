const { execSync } = require('child_process');

console.log('Initializing database schema...');

try {
  // Push the schema to the database
  execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
  console.log('Database schema initialized successfully!');
  
  // Optional: Generate Prisma Client
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('Prisma Client generated successfully!');
} catch (error) {
  console.error('Failed to initialize database:', error.message);
  process.exit(1);
}