import { Router } from 'express';
import mongoose from 'mongoose';
import { ORDER_STATUSES, Order } from '../models/Order.js';
import { findPage, readPageParams } from '../utils/paginate.js';
import { HttpError } from '../utils/httpError.js';

const router = Router();
const statusError = () => new HttpError(400, `Status must be one of: ${ORDER_STATUSES.join(', ')}`, { status: 'Invalid status' });

router.get('/', async (req, res) => {
  const { page, limit } = readPageParams(req.query, 10, 1000);
  const status = String(req.query.status ?? '');
  if (status && !ORDER_STATUSES.includes(status)) throw statusError();

  const result = await findPage(Order, status ? { status } : {}, { page, limit });
  res.json({ ...result, statuses: ORDER_STATUSES });
});

router.patch('/:id/status', async (req, res) => {
  const status = req.body?.status;
  if (!ORDER_STATUSES.includes(status)) throw statusError();

  const order = mongoose.isValidObjectId(req.params.id) ? await Order.findById(req.params.id) : null;
  if (!order) throw new HttpError(404, 'Order not found');

  order.status = status;
  await order.save();
  res.json({ order, message: `Order ${order.orderNo} marked as ${order.status}` });
});

export default router;
