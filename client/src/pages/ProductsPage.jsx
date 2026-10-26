import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api';
import { getErrorMessage } from '../api/client';
import { useApi } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Pagination from '../components/ui/Pagination';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import DataState, { EmptyState } from '../components/ui/DataState';
import ProductFormModal from '../components/products/ProductFormModal';
import ProductThumb from '../components/products/ProductThumb';
import { EditIcon, PlusIcon, SearchIcon, TrashIcon } from '../components/ui/icons';
import { formatCurrency } from '../utils/format';

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Kitchen', 'Sports'];
const LOW_STOCK = 10;

export default function ProductsPage() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const search = params.get('search') || '';
  const category = params.get('category') || '';
  const page = Number(params.get('page')) || 1;

  const { data, loading, error, reload } = useApi(() => getProducts({ search, category, page }), [search, category, page]);

  const [searchText, setSearchText] = useState(search);
  const [lastSearch, setLastSearch] = useState(search);
  if (search !== lastSearch) {
    setLastSearch(search);
    setSearchText(search);
  }

  const searchTimer = useRef(null);
  useEffect(() => () => clearTimeout(searchTimer.current), []);

  const handleSearchChange = (value) => {
    setSearchText(value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => updateParams({ search: value, page: 1 }), 300);
  };

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  function updateParams(changes) {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => {
      if (value === '' || value === 1) next.delete(key);
      else next.set(key, String(value));
    });
    setParams(next);
  }

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (product) => {
    setEditing(product);
    setFormOpen(true);
  };

  const handleSave = async (values) => {
    try {
      if (editing) {
        await updateProduct(editing.id, values);
        toast.success(`"${values.name}" updated`);
      } else {
        await createProduct(values);
        toast.success(`"${values.name}" added`);
      }
    } catch (err) {
      toast.error(`Could not save: ${getErrorMessage(err)}`);
      throw err;
    }
    setFormOpen(false);
    reload();
  };

  const handleDelete = async () => {
    setDeleteBusy(true);
    try {
      await deleteProduct(deleting.id);
      toast.success(`"${deleting.name}" deleted`);
      setDeleting(null);
      if (data.items.length === 1 && page > 1) updateParams({ page: page - 1 });
      else reload();
    } catch (err) {
      toast.error(`Could not delete: ${getErrorMessage(err)}`);
    } finally {
      setDeleteBusy(false);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Product',
      render: (p) => (
        <span className="flex items-center gap-3">
          <ProductThumb name={p.name} src={p.imageUrl} />
          <span className="font-medium">{p.name}</span>
        </span>
      ),
    },
    { key: 'category', header: 'Category', render: (p) => <span className="text-muted">{p.category}</span> },
    { key: 'price', header: 'Price', render: (p) => formatCurrency(p.price) },
    {
      key: 'stock',
      header: 'Stock',
      render: (p) =>
        p.stock < LOW_STOCK ? (
          <span className="inline-flex items-center gap-1.5 font-medium text-danger">
            {p.stock}
            <span className="rounded-full bg-danger/10 px-2 py-0.5 text-xs">Low</span>
          </span>
        ) : (
          p.stock
        ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      className: 'text-right',
      render: (p) => (
        <span className="inline-flex gap-1">
          <button type="button" onClick={() => openEdit(p)} aria-label={`Edit ${p.name}`} className="cursor-pointer rounded-control p-1.5 text-muted hover:bg-hover hover:text-ink">
            <EditIcon size={18} />
          </button>
          <button type="button" onClick={() => setDeleting(p)} aria-label={`Delete ${p.name}`} className="cursor-pointer rounded-control p-1.5 text-muted hover:bg-danger/10 hover:text-danger">
            <TrashIcon size={18} />
          </button>
        </span>
      ),
    },
  ];

  const hasFilters = Boolean(search || category);

  return (
    <>
      <PageHeader
        title="Products"
        description={data ? `${data.total} product${data.total === 1 ? '' : 's'}` : ' '}
        actions={
          <Button icon={PlusIcon} onClick={openAdd}>
            Add product
          </Button>
        }
      />
      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <Input
            className="flex-1"
            type="search"
            aria-label="Search products"
            placeholder="Search by name"
            value={searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            rightSlot={<SearchIcon size={16} className="mr-1 text-muted" />}
          />
          <Select
            className="sm:w-56"
            aria-label="Filter by category"
            value={category}
            onChange={(e) => updateParams({ category: e.target.value, page: 1 })}
            options={data?.categories || CATEGORIES}
            placeholder="All categories"
          />
        </div>
        <DataState
          loading={loading}
          error={error}
          onRetry={reload}
          isEmpty={data?.items.length === 0}
          loadingRows={10}
          empty={
            hasFilters ? (
              <EmptyState
                title="No products match"
                message="Try a different search or category."
                action={
                  <Button variant="secondary" size="sm" onClick={() => setParams({})}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <EmptyState
                title="No products yet"
                message="Add your first product to get started."
                action={
                  <Button size="sm" icon={PlusIcon} onClick={openAdd}>
                    Add product
                  </Button>
                }
              />
            )
          }
        >
          {data && (
            <>
              <Table columns={columns} rows={data.items} caption="Products" />
              <Pagination page={data.page} totalPages={data.totalPages} total={data.total} limit={data.limit} onChange={(n) => updateParams({ page: n })} />
            </>
          )}
        </DataState>
      </Card>
      {formOpen && (
        <ProductFormModal
          key={editing?.id || 'new'}
          product={editing}
          categories={data?.categories || CATEGORIES}
          onClose={() => setFormOpen(false)}
          onSave={handleSave}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete product?"
        message={deleting ? `"${deleting.name}" will be removed permanently. This cannot be undone.` : ''}
        loading={deleteBusy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
