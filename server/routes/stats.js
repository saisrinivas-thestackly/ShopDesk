import { Router } from 'express';
import { Product, LOW_STOCK_LIMIT } from '../models/Product.js';
import { Order, ORDER_STATUSES } from '../models/Order.js';

const router = Router();
const DAY_MS = 24 * 60 * 60 * 1000;
const CHART_DAYS = 14;

function dayKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function percentChange(current, previous) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

const round2 = (n) => Math.round(n * 100) / 100;
const paidTotal = (orders) => orders.filter((o) => o.status !== 'Cancelled').reduce((sum, o) => sum + o.total, 0);

router.get('/', async (req, res) => {
  const [totalProducts, lowStock, orders, recentOrders] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ stock: { $lt: LOW_STOCK_LIMIT } }),
    Order.find({}, 'total status createdAt').lean(),
    Order.find().sort({ createdAt: -1 }).limit(5),
  ]);

  const now = Date.now();

  const ageInDays = (o) => (now - new Date(o.createdAt).getTime()) / DAY_MS;
  const thisWeek = orders.filter((o) => ageInDays(o) < 7);
  const lastWeek = orders.filter((o) => ageInDays(o) >= 7 && ageInDays(o) < 14);

  const days = [];
  for (let i = CHART_DAYS - 1; i >= 0; i--) {
    days.push({ date: dayKey(new Date(now - i * DAY_MS)), orders: 0, revenue: 0 });
  }
  const dayMap = new Map(days.map((d) => [d.date, d]));
  for (const order of orders) {
    const day = dayMap.get(dayKey(new Date(order.createdAt)));
    if (!day) continue;
    day.orders += 1;
    if (order.status !== 'Cancelled') day.revenue += order.total;
  }

  const statusCounts = Object.fromEntries(
    ORDER_STATUSES.map((status) => [status, orders.filter((o) => o.status === status).length]),
  );

  res.json({
    cards: {
      totalProducts,
      totalOrders: orders.length,
      revenue: round2(paidTotal(orders)),
      lowStock,
      lowStockLimit: LOW_STOCK_LIMIT,
      ordersChange: percentChange(thisWeek.length, lastWeek.length),
      revenueChange: percentChange(paidTotal(thisWeek), paidTotal(lastWeek)),
    },
    ordersPerDay: days.map((d) => ({ ...d, revenue: round2(d.revenue) })),
    statusCounts,
    recentOrders,
  });
});

export default router;
