import { describe, it, expect } from 'vitest';
import { validateLogin, validateProduct, validatePasswordChange } from './validation';

const goodProduct = { name: 'Lamp', category: 'Home & Kitchen', price: '999', stock: '5', imageUrl: '' };

describe('validateLogin', () => {
  it('needs an email and a password', () => {
    expect(validateLogin({ email: '', password: '' })).toEqual({
      email: 'Email is required',
      password: 'Password is required',
    });
  });

  it('rejects an invalid email', () => {
    expect(validateLogin({ email: 'admin@', password: 'x' }).email).toBe('Enter a valid email address');
  });

  it('accepts the demo login', () => {
    expect(validateLogin({ email: 'admin@shopdesk.dev', password: 'Admin@123' })).toEqual({});
  });
});

describe('validateProduct', () => {
  it('accepts a valid product', () => {
    expect(validateProduct(goodProduct)).toEqual({});
  });

  it('requires price greater than 0', () => {
    expect(validateProduct({ ...goodProduct, price: '0' }).price).toBeTruthy();
    expect(validateProduct({ ...goodProduct, price: '-5' }).price).toBeTruthy();
  });

  it('requires stock to be a whole number', () => {
    expect(validateProduct({ ...goodProduct, stock: '2.5' }).stock).toBeTruthy();
    expect(validateProduct({ ...goodProduct, stock: '-1' }).stock).toBeTruthy();
    expect(validateProduct({ ...goodProduct, stock: '0' }).stock).toBeUndefined();
  });

  it('requires a name and a category', () => {
    const errors = validateProduct({ ...goodProduct, name: '  ', category: '' });
    expect(errors.name).toBeTruthy();
    expect(errors.category).toBeTruthy();
  });
});

describe('validatePasswordChange', () => {
  it('checks length and that both new passwords match', () => {
    const errors = validatePasswordChange({ currentPassword: 'a', newPassword: 'short', confirmPassword: 'other' });
    expect(errors.newPassword).toBeTruthy();
    expect(errors.confirmPassword).toBe('Passwords do not match');
  });
});
