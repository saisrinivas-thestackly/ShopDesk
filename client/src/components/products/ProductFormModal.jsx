import { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { validateProduct } from '../../utils/validation';
import { getErrorMessage, getFieldErrors } from '../../api/client';

const EMPTY_FORM = { name: '', category: '', price: '', stock: '', imageUrl: '' };

const toFormValues = (product) =>
  product
    ? { name: product.name, category: product.category, price: String(product.price), stock: String(product.stock), imageUrl: product.imageUrl || '' }
    : EMPTY_FORM;

export default function ProductFormModal({ product, categories, onClose, onSave }) {
  const [form, setForm] = useState(() => toFormValues(product));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  const isEdit = Boolean(product);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validateProduct(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    setApiError('');
    try {
      await onSave({
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price),
        stock: Number(form.stock),
        imageUrl: form.imageUrl.trim(),
      });
    } catch (err) {
      setErrors(getFieldErrors(err));
      setApiError(getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={saving ? () => {} : onClose}
      title={isEdit ? 'Edit product' : 'Add product'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="product-form" loading={saving}>
            {isEdit ? 'Save changes' : 'Add product'}
          </Button>
        </>
      }
    >
      {apiError && (
        <p role="alert" className="mb-4 rounded-control bg-danger/10 p-3 text-sm text-danger">
          {apiError}
        </p>
      )}
      <form id="product-form" onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input className="sm:col-span-2" label="Name" name="name" value={form.name} onChange={handleChange} error={errors.name} placeholder="e.g. Wireless Mouse" />
        <Select
          className="sm:col-span-2"
          label="Category"
          name="category"
          value={form.category}
          onChange={handleChange}
          error={errors.category}
          options={categories}
          placeholder="Choose a category"
        />
        <Input label="Price (₹)" name="price" type="number" inputMode="decimal" min="0" step="0.01" value={form.price} onChange={handleChange} error={errors.price} placeholder="0" />
        <Input label="Stock" name="stock" type="number" inputMode="numeric" min="0" step="1" value={form.stock} onChange={handleChange} error={errors.stock} placeholder="0" />
        <Input
          className="sm:col-span-2"
          label="Image URL (optional)"
          name="imageUrl"
          type="url"
          value={form.imageUrl}
          onChange={handleChange}
          error={errors.imageUrl}
          placeholder="https://..."
        />
      </form>
    </Modal>
  );
}
