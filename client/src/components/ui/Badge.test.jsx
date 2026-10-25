import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from './Badge';

describe('Badge', () => {
  it.each(['Pending', 'Shipped', 'Delivered', 'Cancelled'])('shows the %s status', (status) => {
    render(<Badge status={status} />);
    expect(screen.getByText(status)).toBeInTheDocument();
  });

  it('uses a different colour for each status', () => {
    const { rerender, container } = render(<Badge status="Delivered" />);
    expect(container.firstChild.className).toContain('text-status-delivered');

    rerender(<Badge status="Cancelled" />);
    expect(container.firstChild.className).toContain('text-status-cancelled');
  });

  it('falls back to a neutral style for an unknown status', () => {
    const { container } = render(<Badge status="Lost" />);
    expect(container.firstChild.className).toContain('text-muted');
  });
});
