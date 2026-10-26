import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { formatCurrency, formatDate } from '../../utils/format';

export const orderColumns = [
  { key: 'orderNo', header: 'Order', render: (o) => <span className="font-medium">{o.orderNo}</span> },
  {
    key: 'customerName',
    header: 'Customer',
    render: (o) => (
      <span className="flex items-center gap-2">
        <Avatar name={o.customerName} size={24} />
        {o.customerName}
      </span>
    ),
  },
  { key: 'items', header: 'Items', render: (o) => o.items.reduce((n, i) => n + i.quantity, 0) },
  { key: 'createdAt', header: 'Date', render: (o) => formatDate(o.createdAt) },
  { key: 'total', header: 'Amount', render: (o) => formatCurrency(o.total) },
  { key: 'status', header: 'Status', render: (o) => <Badge status={o.status} /> },
];
