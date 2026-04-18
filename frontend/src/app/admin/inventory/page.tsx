'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Archive,
  Search,
  Loader2,
  ArrowUpCircle,
  AlertTriangle,
  FileBox,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import { booksApi } from '@/lib/api/books';
import { useUpdateInventory } from '@/lib/hooks/use-books';
import { toast } from 'sonner';

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [sortBy, setSortBy] = useState<
    'title' | 'author' | 'price' | 'createdAt' | 'inventory'
  >('inventory');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isColumnsOpen, setIsColumnsOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    bookDetails: true,
    isbn: true,
    category: true,
    stock: true,
    actions: true,
  });
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [stockValue, setStockValue] = useState<string>('');

  const updateInventory = useUpdateInventory();

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on new search
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'inventory', debouncedSearch, page, limit],
    queryFn: () =>
      booksApi.getBooks({
        search: debouncedSearch,
        page,
        limit,
        sortBy,
        sortOrder,
      }),
  });

  const pageSize = data?.meta?.limit ?? limit;

  const handleUpdateStock = async (id: string) => {
    if (!stockValue) return;

    const quantity = parseInt(stockValue, 10);
    if (isNaN(quantity) || quantity < 0) {
      toast.error('Please enter a valid non-negative number');
      return;
    }

    try {
      await updateInventory.mutateAsync({ id, quantity });
      toast.success('Inventory updated successfully');
      setEditingStockId(null);
      setStockValue('');
    } catch (error) {
      toast.error('Failed to update inventory');
    }
  };

  const startEditing = (book: any) => {
    setEditingStockId(book.id);
    setStockValue(book.inventory.toString());
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#101313] flex items-center gap-3">
            <div className="p-2.5 bg-[#E4FFFB] rounded-xl">
              <Archive className="h-7 w-7 text-[#0B7C6B]" />
            </div>
            Inventory Management
          </h1>
          <p className="mt-2 text-[#848785]">
            Manage book inventory, update stock quantities, and monitor low
            stock items.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="h-12 rounded-xl text-[#848785] border-[#E4E9E8] shadow-sm bg-white shrink-0"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Data
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#E4E9E8] shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#848785]" />
              <Input
                placeholder="Search inventory by book title, author, or ISBN..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-12 h-14 rounded-2xl border-[#E4E9E8] bg-white text-base max-w-2xl"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex bg-[#F8FAFB] rounded-2xl p-1.5 border border-[#E4E9E8]">
                <button className="px-4 py-2.5 rounded-xl bg-white shadow-sm text-sm font-bold text-[#101313] border border-[#E4E9E8]/50">
                  All Items
                </button>
                <button className="px-4 py-2.5 rounded-xl text-sm font-bold text-[#848785] hover:text-[#101313] transition-colors">
                  Low Stock
                </button>
              </div>

              <div className="flex items-center gap-2 rounded-2xl border border-[#E4E9E8] bg-white px-3 h-12 shadow-sm">
                <span className="text-xs font-semibold text-[#848785]">
                  Sort
                </span>
                <select
                  value={`${sortBy}:${sortOrder}`}
                  onChange={e => {
                    const [by, order] = e.target.value.split(':');
                    setSortBy(by as any);
                    setSortOrder(order as any);
                    setPage(1);
                  }}
                  className="text-sm font-bold text-[#101313] bg-transparent outline-none cursor-pointer pr-2"
                >
                  <option value="inventory:asc">Stock low → high</option>
                  <option value="inventory:desc">Stock high → low</option>
                  <option value="title:asc">Title A → Z</option>
                  <option value="title:desc">Title Z → A</option>
                  <option value="createdAt:desc">Newest first</option>
                  <option value="createdAt:asc">Oldest first</option>
                </select>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsColumnsOpen(o => !o)}
                  className="h-12 rounded-2xl border border-[#E4E9E8] bg-white px-4 text-sm font-bold text-[#101313] shadow-sm"
                >
                  Columns
                </button>
                {isColumnsOpen && (
                  <div className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-[#E4E9E8] bg-white shadow-lg p-2">
                    {[
                      { key: 'bookDetails', label: 'Book Details' },
                      { key: 'isbn', label: 'ISBN' },
                      { key: 'category', label: 'Category' },
                      { key: 'stock', label: 'Stock Level' },
                      { key: 'actions', label: 'Actions' },
                    ].map(col => (
                      <label
                        key={col.key}
                        className="flex items-center gap-2 px-2 py-1.5 text-sm text-[#101313] cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={(visibleColumns as any)[col.key]}
                          onChange={() =>
                            setVisibleColumns(prev => ({
                              ...prev,
                              [col.key]: !(prev as any)[col.key],
                            }))
                          }
                          className="h-4 w-4 rounded border-[#E4E9E8] text-[#0B7C6B] focus:ring-[#0B7C6B]/30"
                        />
                        {col.label}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="overflow-x-auto rounded-2xl border border-[#E4E9E8]">
            <table className="w-full text-left">
              <thead className="bg-[#F8FAFB] border-b border-[#E4E9E8]">
                <tr>
                  {visibleColumns.bookDetails && (
                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[#A6AAA9]">
                      Book Details
                    </th>
                  )}
                  {visibleColumns.isbn && (
                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[#A6AAA9]">
                      ISBN
                    </th>
                  )}
                  {visibleColumns.category && (
                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[#A6AAA9]">
                      Category
                    </th>
                  )}
                  {visibleColumns.stock && (
                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[#A6AAA9] w-[200px]">
                      Stock Level
                    </th>
                  )}
                  {visibleColumns.actions && (
                    <th className="px-6 py-5 text-right text-xs font-bold uppercase tracking-wider text-[#A6AAA9]">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E9E8]">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-[#0B7C6B] mb-2" />
                        <p className="text-[#848785]">
                          Loading inventory data...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : data?.data?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-[#848785]"
                    >
                      <div className="flex flex-col items-center justify-center gap-3">
                        <FileBox className="h-10 w-10 opacity-20" />
                        <p>No books found in inventory.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data?.data?.map(book => (
                    <tr
                      key={book.id}
                      className="group transition-colors hover:bg-[#F8FAFB]/50"
                    >
                      {visibleColumns.bookDetails && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-10 bg-[#F3F5F5] rounded shadow-sm overflow-hidden flex-shrink-0">
                              {book.imageUrl ? (
                                <img
                                  src={book.imageUrl}
                                  alt={book.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <FileBox className="h-4 w-4 text-[#A6AAA9]" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-[#101313] line-clamp-1">
                                {book.title}
                              </p>
                              <p className="text-xs text-[#848785]">
                                {book.author}
                              </p>
                            </div>
                          </div>
                        </td>
                      )}
                      {visibleColumns.isbn && (
                        <td className="px-6 py-4 text-sm text-[#848785] font-mono">
                          {book.isbn}
                        </td>
                      )}
                      {visibleColumns.category && (
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#F3F5F5] text-[#848785]">
                            {book.category}
                          </span>
                        </td>
                      )}
                      {visibleColumns.stock && (
                        <td className="px-6 py-4">
                          {editingStockId === book.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={stockValue}
                                onChange={e => setStockValue(e.target.value)}
                                className="w-20 h-9 rounded-lg border-[#E4E9E8] font-bold"
                                autoFocus
                              />
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStock(book.id)}
                                disabled={updateInventory.isPending}
                                className="h-9 px-3 bg-[#0B7C6B] hover:bg-[#096B5B] text-white rounded-lg"
                              >
                                {updateInventory.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  'Save'
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingStockId(null)}
                                className="h-9 px-3 text-[#848785]"
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="flex-1 flex items-center justify-between bg-[#F8FAFB] px-3 py-1.5 rounded-lg border border-[#E4E9E8]">
                                <span className="font-black text-[#101313]">
                                  {book.inventory}
                                </span>
                                {book.inventory <= 5 ? (
                                  <AlertTriangle className="h-4 w-4 text-[#FF4E3E]" />
                                ) : book.inventory <= 15 ? (
                                  <AlertTriangle className="h-4 w-4 text-[#F9B959]" />
                                ) : (
                                  <div className="h-2 w-2 rounded-full bg-[#17BD8D]" />
                                )}
                              </div>
                              <button
                                onClick={() => startEditing(book)}
                                className="p-1.5 text-[#848785] hover:text-[#0B7C6B] hover:bg-[#E4FFFB] rounded-lg transition-colors"
                                title="Quick update stock"
                              >
                                <ArrowUpCircle className="h-5 w-5" />
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                      {visibleColumns.actions && (
                        <td className="px-6 py-4 text-right">
                          {book.inventory <= 5 ? (
                            <span className="text-xs font-bold text-[#FF4E3E] bg-[#FFECEB] px-2 py-1 rounded-lg">
                              Low Stock
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-[#17BD8D] bg-[#DFFEF5] px-2 py-1 rounded-lg">
                              In Stock
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.meta && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <select
                    className="h-10 w-32 appearance-none rounded-lg border border-[#E4E9E8] bg-white px-3 pr-9 text-sm text-[#101313] focus:outline-none focus:ring-2 focus:ring-[#0B7C6B]/20"
                    value={limit}
                    onChange={e => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                  >
                    {[10, 20, 50, 100].map(size => (
                      <option key={size} value={size}>
                        {size} / page
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A6AAA9]" />
                </div>
                <p className="text-sm text-[#848785]">
                  Showing{' '}
                  <span className="font-bold text-[#101313]">
                    {data.meta.total === 0 ? 0 : (page - 1) * pageSize + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-bold text-[#101313]">
                    {Math.min(page * pageSize, data.meta.total)}
                  </span>{' '}
                  of{' '}
                  <span className="font-bold text-[#101313]">
                    {data.meta.total}
                  </span>{' '}
                  entries
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={!data.meta.hasPreviousPage}
                  className="border-[#E4E9E8]"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => p + 1)}
                  disabled={!data.meta.hasNextPage}
                  className="border-[#E4E9E8]"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
