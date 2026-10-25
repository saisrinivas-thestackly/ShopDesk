import mongoose from 'mongoose';
import { HttpError } from '../utils/httpError.js';

export const CATEGORIES = ['Electronics', 'Fashion', 'Home & Kitchen', 'Sports'];
export const LOW_STOCK_LIMIT = 10;

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 100 },
    category: { type: String, required: true, enum: CATEGORIES },
    price: { type: Number, required: true, min: [0.01, 'Price must be greater than 0'] },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock must be 0 or more'],
      validate: { validator: Number.isInteger, message: 'Stock must be a whole number' },
    },
    imageUrl: { type: String, default: '', trim: true },
  },
  { timestamps: true },
);

export const Product = mongoose.model('Product', productSchema);

export function validateProduct(input) {
  const errors = {};
  const name = String(input.name ?? '').trim();
  const category = String(input.category ?? '').trim();
  const price = Number(input.price);
  const stock = Number(input.stock);
  const imageUrl = String(input.imageUrl ?? '').trim();

  if (!name) errors.name = 'Name is required';
  else if (name.length > 100) errors.name = 'Name must be 100 characters or less';

  if (!CATEGORIES.includes(category)) errors.category = `Category must be one of: ${CATEGORIES.join(', ')}`;

  if (input.price === '' || input.price == null || Number.isNaN(price)) errors.price = 'Price is required';
  else if (price <= 0) errors.price = 'Price must be greater than 0';

  if (input.stock === '' || input.stock == null || Number.isNaN(stock)) errors.stock = 'Stock is required';
  else if (!Number.isInteger(stock) || stock < 0) errors.stock = 'Stock must be a whole number (0 or more)';

  if (imageUrl && !/^https?:\/\//i.test(imageUrl)) errors.imageUrl = 'Image URL must start with http:// or https://';

  if (Object.keys(errors).length > 0) {
    throw new HttpError(400, 'Please fix the highlighted fields', errors);
  }

  return { name, category, price: Math.round(price * 100) / 100, stock, imageUrl };
}
