export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin({ email, password }) {
  const errors = {};
  if (!email.trim()) errors.email = 'Email is required';
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Enter a valid email address';
  if (!password) errors.password = 'Password is required';
  return errors;
}

export function validateProduct({ name, category, price, stock, imageUrl }) {
  const errors = {};
  if (!name.trim()) errors.name = 'Name is required';
  else if (name.trim().length > 100) errors.name = 'Name must be 100 characters or less';

  if (!category) errors.category = 'Category is required';

  if (price === '') errors.price = 'Price is required';
  else if (Number.isNaN(Number(price)) || Number(price) <= 0) errors.price = 'Price must be greater than 0';

  if (stock === '') errors.stock = 'Stock is required';
  else if (!Number.isInteger(Number(stock)) || Number(stock) < 0) errors.stock = 'Stock must be a whole number (0 or more)';

  if (imageUrl.trim() && !/^https?:\/\//i.test(imageUrl.trim())) errors.imageUrl = 'Image URL must start with http:// or https://';
  return errors;
}

export function validateProfileName({ name }) {
  const errors = {};
  if (!name.trim()) errors.name = 'Name is required';
  else if (name.trim().length > 60) errors.name = 'Name must be 60 characters or less';
  return errors;
}

export function validatePasswordChange({ currentPassword, newPassword, confirmPassword }) {
  const errors = {};
  if (!currentPassword) errors.currentPassword = 'Current password is required';
  if (!newPassword) errors.newPassword = 'New password is required';
  else if (newPassword.length < 8) errors.newPassword = 'New password must be at least 8 characters';
  if (confirmPassword !== newPassword) errors.confirmPassword = 'Passwords do not match';
  return errors;
}
