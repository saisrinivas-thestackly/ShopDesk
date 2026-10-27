import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { getOrders, updateOrderStatus } from '../api';
import { getErrorMessage } from '../api/client';
import { useApi } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Pagination from '../components/ui/Pagination';
import DataState, { EmptyState } from '../components/ui/DataState';
import { orderColumns } from '../components/orders/orderColumns';
import { DownloadIcon } from '../components/ui/icons';
import { downloadCsv, ordersToCsv } from '../utils/csv';

const STATUSES = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];

export default function OrdersPage() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const page = Number(params.get('page')) || 1;

  const { data, setData, loading, error, reload } = useApi(() => getOrders({ status, page }), [status, page]);
  const [savingId, setSavingId] = useState(null);
  const [exporting, setExporting] = useState(false);

  const setFilter = (value) => setParams(value ? { status: value } : {});
  const setPage = (n) => setParams({ ...(status && { status }), ...(n > 1 && { page: String(n) }) });

  const changeStatus = async (order, newStatus) => {
    setSavingId(order.id);
    try {
      const { order: updated } = await updateOrderStatus(order.id, newStatus);
      setData((current) => ({ ...current, items: current.items.map((o) => (o.id === updated.id ? updated : o)) }));
      toast.success(`${updated.orderNo} marked as ${updated.status}`);
    } catch (err) {
      toast.error(`Could not update ${order.orderNo}: ${getErrorMessage(err)}`);
    } finally {
      setSavingId(null);
    }
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const all = await getOrders({ status, page: 1, limit: 1000 });
      downloadCsv(`shopdesk-orders${status ? `-${status.toLowerCase()}` : ''}.csv`, ordersToCsv(all.items));
      toast.success(`Exported ${all.items.length} orders`);
    } catch (err) {
      toast.error(`Export failed: ${getErrorMessage(err)}`);
    } finally {
      setExporting(false);
    }
  };

  const columns = [
    ...orderColumns,
    {
      key: 'change',
      header: 'Change status',
      render: (o) => (
        <Select
          size="sm"
          className="w-36"
          aria-label={`Change status of ${o.orderNo}`}
          value={o.status}
          disabled={savingId === o.id}
          onChange={(e) => changeStatus(o, e.target.value)}
          options={STATUSES}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Orders"
        description={data ? `${data.total} order${data.total === 1 ? '' : 's'}${status ? ` · ${status}` : ''}` : ' '}
        actions={
          <Button variant="secondary" icon={DownloadIcon} loading={exporting} onClick={exportCsv} disabled={!data || data.total === 0}>
            Export CSV
          </Button>
        }
      />
      <Card>
        <div role="tablist" aria-label="Filter by status" className="-mx-1 mb-4 flex gap-1 overflow-x-auto pb-1">
          {['', ...STATUSES].map((value) => (
            <button
              key={value || 'all'}
              type="button"
              role="tab"
              aria-selected={status === value}
              onClick={() => setFilter(value)}
              className={`shrink-0 cursor-pointer rounded-control px-3 py-1.5 text-sm transition-colors ${
                status === value ? 'bg-hover font-semibold text-ink' : 'text-muted hover:text-ink'
              }`}
            >
              {value || 'All'}
            </button>
          ))}
        </div>
        <DataState
          loading={loading}
          error={error}
          onRetry={reload}
          isEmpty={data?.items.length === 0}
          loadingRows={10}
          empty={
            <EmptyState
              title={status ? `No ${status.toLowerCase()} orders` : 'No orders yet'}
              message={status ? 'Try another status.' : 'Orders will appear here when customers buy something.'}
              action={
                status && (
                  <Button variant="secondary" size="sm" onClick={() => setFilter('')}>
                    Show all orders
                  </Button>
                )
              }
            />
          }
        >
          {data && (
            <>
              <Table columns={columns} rows={data.items} caption="Orders" />
              <Pagination page={data.page} totalPages={data.totalPages} total={data.total} limit={data.limit} onChange={setPage} />
            </>
          )}
        </DataState>
      </Card>
    </>
  );
}
