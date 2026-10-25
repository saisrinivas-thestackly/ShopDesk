import 'dotenv/config';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { seedDatabase } from './seed.js';

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing. Copy .env.example to .env and set it.');
  process.exit(1);
}

try {
  await connectDB();
} catch (err) {
  console.error('Could not connect to MongoDB:', err.message);
  console.error('Check MONGO_URI in .env and that your IP is allowed in Atlas (Network Access).');
  process.exit(1);
}

if ((await User.countDocuments()) === 0) {
  console.log('Database is empty, adding demo data...');
  await seedDatabase();
}

const port = process.env.PORT || 5000;
createApp().listen(port, () => {
  console.log(`ShopDesk API running on http://localhost:${port}`);
});
