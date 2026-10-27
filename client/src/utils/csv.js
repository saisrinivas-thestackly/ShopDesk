const cell = (value) => `"${String(value).replaceAll('"', '""')}"`;

export function ordersToCsv(orders) {
  const header = ['Order No', 'Customer', 'Items', 'Total (INR)', 'Status', 'Date'];
  const rows = orders.map((o) => [
    o.orderNo,
    o.customerName,
    o.items.map((i) => `${i.name} x${i.quantity}`).join('; '),
    o.total,
    o.status,
    new Date(o.createdAt).toISOString(),
  ]);
  return [header, ...rows].map((row) => row.map(cell).join(',')).join('\n');
}

export function downloadCsv(filename, csvText) {
  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
