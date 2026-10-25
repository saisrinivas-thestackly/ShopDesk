import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from './Input';

describe('Input', () => {
  it('links the label to the input', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('calls onChange while typing', async () => {
    const onChange = vi.fn();
    render(<Input label="Name" onChange={onChange} />);

    await userEvent.type(screen.getByLabelText('Name'), 'abc');

    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it('shows the error message and marks the input invalid', () => {
    render(<Input label="Price" error="Price must be greater than 0" />);

    const input = screen.getByLabelText('Price');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Price must be greater than 0');
    expect(input).toHaveAccessibleDescription('Price must be greater than 0');
  });
});
