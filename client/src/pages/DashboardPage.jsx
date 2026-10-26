import { Link } from 'react-router';
import { getStats } from '../api';
import { useApi } from '../hooks/useApi';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Table from '../components/ui/Table';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/DataState';
import OrdersChart from '../components/dashboard/OrdersChart';
import StatusBreakdown from '../components/dashboard/StatusBreakdown';
import { orderColumns } from '../components/orders/orderColumns';
import { formatCurrency } from '../utils/format';

function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4 md:gap-7" role="status" aria-label="Loading stats">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-[92px] animate-pulse sm:h-[108px] rounded-card bg-hover" />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { data, loading, error, reload } = useApi(() => getStats(), []);

  if (error) {
    return (
      <Card>
        <ErrorState message={error} onRetry={reload} />
      </Card>
    );
  }

  const cards = data?.cards;

  return (
    <div className="space-y-4 md:space-y-7">
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-semibold">Overview</h1>
        <span className="text-sm text-muted">Last 14 days</span>
      </div>
      {loading ? (
        <StatCardsSkeleton />
      ) : (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4 md:gap-7">
          <StatCard title="Total Products" value={cards.totalProducts} subtitle="In 4 categories" color="purple" />
          <StatCard title="Total Orders" value={cards.totalOrders} change={cards.ordersChange} color="blue" />
          <StatCard title="Revenue" value={formatCurrency(cards.revenue)} change={cards.revenueChange} color="purple" />
          <StatCard title="Low Stock Items" value={cards.lowStock} subtitle={`Stock below ${cards.lowStockLimit}`} color="blue" />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 md:gap-7">
        <Card className="lg:col-span-2">
          {loading ? (
            <LoadingState rows={6} label="Loading chart" />
          ) : data.cards.totalOrders === 0 ? (
            <EmptyState title="No orders yet" message="The chart will appear when the first orders come in." />
          ) : (
            <OrdersChart data={data.ordersPerDay} />
          )}
        </Card>
        <Card title="Orders by Status">
          {loading ? <LoadingState rows={4} label="Loading status counts" /> : <StatusBreakdown counts={data.statusCounts} />}
        </Card>
      </div>
      <Card
        title="Recent Orders"
        actions={
          <Link to="/orders" className="text-sm text-muted hover:text-ink">
            View all
          </Link>
        }
      >
        {loading ? (
          <LoadingState rows={5} label="Loading recent orders" />
        ) : data.recentOrders.length === 0 ? (
          <EmptyState title="No orders yet" message="New orders will show up here." />
        ) : (
          <Table columns={orderColumns} rows={data.recentOrders} caption="Five most recent orders" />
        )}
      </Card>
    </div>
  );
}
