import { Router } from 'express';
import mongoose from 'mongoose';
import { CATEGORIES, Product, validateProduct } from '../models/Product.js';
import { findPage, readPageParams } from '../utils/paginate.js';
import { HttpError } from '../utils/httpError.js';

const router = Router();

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function findProductOr404(id) {
  const product = mongoose.isValidObjectId(id) ? await Product.findById(id) : null;
  if (!product) throw new HttpError(404, 'Product not found');
  return product;
}

router.get('/', async (req, res) => {
  const { page, limit } = readPageParams(req.query, 10, 100);
  const search = String(req.query.search ?? '').trim();
  const category = String(req.query.category ?? '');

  const filter = {};
  if (search) filter.name = { $regex: escapeRegex(search), $options: 'i' };
  if (category) filter.category = category;

  const result = await findPage(Product, filter, { page, limit });

  res.json({ ...result, categories: CATEGORIES });
});

router.post('/', async (req, res) => {
  const product = await Product.create(validateProduct(req.body ?? {}));
  res.status(201).json({ product, message: 'Product created' });
});

router.put('/:id', async (req, res) => {
  const product = await findProductOr404(req.params.id);
  product.set(validateProduct(req.body ?? {}));
  await product.save();
  res.json({ product, message: 'Product updated' });
});

router.delete('/:id', async (req, res) => {
  const product = await findProductOr404(req.params.id);
  await product.deleteOne();
  res.json({ message: 'Product deleted' });
});

export default router;
