import 'dotenv/config';
import { pathToFileURL } from 'node:url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from './config/db.js';
import { User } from './models/User.js';
import { Product } from './models/Product.js';
import { Order } from './models/Order.js';

function createRandom(seed) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}
const random = createRandom(42);
const randomInt = (min, max) => min + Math.floor(random() * (max - min + 1));
const pick = (list) => list[Math.floor(random() * list.length)];

const PRODUCTS = [
  ['Wireless Earbuds Pro', 'Electronics', 2499, 42],
  ['Smart Watch Series 5', 'Electronics', 5999, 18],
  ['Bluetooth Speaker Mini', 'Electronics', 1799, 7],
  ['USB-C Fast Charger 65W', 'Electronics', 1299, 64],
  ['Mechanical Keyboard', 'Electronics', 3499, 23],
  ['Wireless Mouse', 'Electronics', 799, 85],
  ['Power Bank 20000mAh', 'Electronics', 1899, 4],
  ['Noise Cancelling Headphones', 'Electronics', 7999, 12],
  ['Classic Denim Jacket', 'Fashion', 2299, 30],
  ['Cotton Crew T-Shirt', 'Fashion', 499, 120],
  ['Running Sneakers', 'Fashion', 3199, 26],
  ['Leather Wallet', 'Fashion', 899, 9],
  ['Canvas Backpack', 'Fashion', 1499, 40],
  ['Aviator Sunglasses', 'Fashion', 1199, 15],
  ['Wool Beanie', 'Fashion', 399, 3],
  ['Linen Kurta', 'Fashion', 1599, 34],
  ['Ceramic Coffee Mug Set', 'Home & Kitchen', 699, 48],
  ['Non-stick Frying Pan', 'Home & Kitchen', 1099, 21],
  ['Glass Water Bottle', 'Home & Kitchen', 449, 76],
  ['Bamboo Cutting Board', 'Home & Kitchen', 599, 8],
  ['Aroma Diffuser', 'Home & Kitchen', 1399, 17],
  ['Cotton Bath Towel', 'Home & Kitchen', 549, 58],
  ['Steel Lunch Box', 'Home & Kitchen', 749, 37],
  ['Yoga Mat 6mm', 'Sports', 999, 44],
  ['Adjustable Dumbbells', 'Sports', 4499, 6],
  ['Skipping Rope', 'Sports', 299, 90],
  ['Football Size 5', 'Sports', 899, 28],
  ['Badminton Racket Set', 'Sports', 1699, 19],
  ['Resistance Bands', 'Sports', 649, 52],
  ['Cycling Gloves', 'Sports', 549, 11],
];

const CUSTOMERS = [
  'Aarav Sharma', 'Diya Patel', 'Vihaan Reddy', 'Ananya Iyer', 'Arjun Nair',
  'Ishita Gupta', 'Kabir Singh', 'Meera Joshi', 'Rohan Das', 'Saanvi Rao',
  'Natali Craig', 'Drew Cano', 'Andi Lane', 'Kate Morrison', 'Koray Okumus',
  'Orlando Diggs', 'Priya Menon', 'Rahul Verma', 'Sneha Kulkarni', 'Zoya Khan',
];

function statusForAge(daysAgo) {
  const roll = random();
  if (daysAgo <= 1) return roll < 0.7 ? 'Pending' : 'Shipped';
  if (daysAgo <= 4) return roll < 0.25 ? 'Pending' : roll < 0.75 ? 'Shipped' : roll < 0.92 ? 'Delivered' : 'Cancelled';
  return roll < 0.1 ? 'Shipped' : roll < 0.88 ? 'Delivered' : 'Cancelled';
}

export async function seedDatabase() {
  const now = new Date();

  const users = [
    {
      name: 'Admin User',
      email: 'admin@shopdesk.dev',
      passwordHash: await bcrypt.hash('Admin@123', 10),
      avatarUrl: '',
    },
  ];

  const products = PRODUCTS.map(([name, category, price, stock], index) => {
    const createdAt = new Date(now.getTime() - (PRODUCTS.length - index) * 3600 * 1000);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return {
      _id: new mongoose.Types.ObjectId(),
      name,
      category,
      price,
      stock,
      imageUrl: `https://picsum.photos/seed/${slug}/96/96`,
      createdAt,
      updatedAt: createdAt,
    };
  });

  const orders = [];
  for (let i = 0; i < 50; i++) {
    const daysAgo = randomInt(0, 13);
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo);
    const latest = daysAgo === 0 ? now.getTime() : dayStart.getTime() + 86400000 - 1;
    const createdAt = new Date(dayStart.getTime() + random() * (latest - dayStart.getTime()));

    const itemCount = randomInt(1, 3);
    const chosen = new Set();
    while (chosen.size < itemCount) chosen.add(pick(products));
    const items = [...chosen].map((p) => ({
      product: p._id,
      name: p.name,
      price: p.price,
      quantity: randomInt(1, 3),
    }));

    orders.push({
      orderNo: '',
      customerName: pick(CUSTOMERS),
      items,
      total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: statusForAge(daysAgo),
      createdAt,
      updatedAt: createdAt,
    });
  }

  orders.sort((a, b) => a.createdAt - b.createdAt);
  orders.forEach((order, index) => {
    order.orderNo = `SD-${1001 + index}`;
  });

  await Promise.all([User.deleteMany({}), Product.deleteMany({}), Order.deleteMany({})]);
  await User.insertMany(users);
  await Product.insertMany(products, { timestamps: false });
  await Order.insertMany(orders, { timestamps: false });

  console.log(`Seeded ${users.length} user, ${products.length} products, ${orders.length} orders`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await connectDB();
    await seedDatabase();
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}
