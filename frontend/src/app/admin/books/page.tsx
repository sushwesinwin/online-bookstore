'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import {
  useBooks,
  useCategories,
  useCreateBook,
  useUpdateBook,
  useDeleteBook,
} from '@/lib/hooks/use-books';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';

export default function AdminBooks() {
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'author' | 'price' | 'createdAt' | 'inventory'>(
    'createdAt'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isColumnsOpen, setIsColumnsOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    book: true,
    category: true,
    inventory: true,
    price: true,
    actions: true,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data, isLoading } = useBooks({
    page,
    limit,
    search,
    sortBy,
    sortOrder,
  });
  const { data: categories } = useCategories();

  const createBook = useCreateBook();
  const updateBook = useUpdateBook();
  const deleteBook = useDeleteBook();

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: '',
    isbn: '',
    price: '',
    inventory: '',
    description: '',
    imageUrl: '',
  });

  if (!mounted) return null;

  const pageSize = data?.meta?.limit ?? limit;

  const handleOpenModal = (book: any = null) => {
    if (book) {
      setEditingBook(book);
      setFormData({
        title: book.title,
        author: book.author,
        category: book.category,
        isbn: book.isbn,
        price: book.price.toString(),
        inventory: book.inventory.toString(),
        description: book.description || '',
        imageUrl: book.imageUrl || '',
      });
    } else {
      setEditingBook(null);
      setFormData({
        title: '',
        author: '',
        category: '',
        isbn: '',
        price: '',
        inventory: '',
        description: '',
        imageUrl: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      inventory: parseInt(formData.inventory),
    };

    if (editingBook) {
      await updateBook.mutateAsync({ id: editingBook.id, data: payload });
    } else {
      await createBook.mutateAsync(payload as any);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this book?')) {
      await deleteBook.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#101313]">
            Books
          </h1>
          <p className="mt-1 text-[#848785]">
            Manage your Lumora library and inventory.
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="h-12 rounded-xl bg-[#0B7C6B] hover:bg-[#096658] px-6 shadow-lg shadow-[#0B7C6B]/20"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add New Book
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 md:left-4 top-1/2 h-4 w-4 md:h-5 md:w-5 -translate-y-1/2 text-[#848785]" />
          <Input
            placeholder="Search by title, author, or ISBN..."
            className="h-12 md:h-14 rounded-xl md:rounded-2xl border-[#E4E9E8] bg-white pl-10 md:pl-12 pr-4 text-sm md:text-base focus:ring-2 focus:ring-[#0B7C6B]/20"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl md:rounded-2xl border border-[#E4E9E8] bg-white px-3 md:px-4 h-12 md:h-14 shadow-sm">
            <span className="text-xs font-semibold text-[#848785]">Sort</span>
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
              <option value="createdAt:desc">Newest first</option>
              <option value="createdAt:asc">Oldest first</option>
              <option value="title:asc">Title A → Z</option>
              <option value="title:desc">Title Z → A</option>
              <option value="price:asc">Price low → high</option>
              <option value="price:desc">Price high → low</option>
              <option value="inventory:desc">Stock high → low</option>
              <option value="inventory:asc">Stock low → high</option>
            </select>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsColumnsOpen(o => !o)}
              className="h-12 md:h-14 rounded-xl md:rounded-2xl border border-[#E4E9E8] bg-white px-4 text-sm font-bold text-[#101313] shadow-sm"
            >
              Columns
            </button>
            {isColumnsOpen && (
              <div className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-[#E4E9E8] bg-white shadow-lg p-2">
                {[
                  { key: 'book', label: 'Book' },
                  { key: 'category', label: 'Category' },
                  { key: 'inventory', label: 'Inventory' },
                  { key: 'price', label: 'Price' },
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

      {/* Mobile Cards */}
      <div className="block lg:hidden space-y-3">
        {isLoading
          ? Array(5)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-[#E4E9E8] p-4 animate-pulse"
                >
                  <div className="flex gap-3">
                    <div className="h-24 w-16 rounded-lg bg-[#F3F5F5]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-[#F3F5F5] rounded" />
                      <div className="h-3 w-24 bg-[#F3F5F5] rounded" />
                      <div className="h-4 w-20 bg-[#F3F5F5] rounded" />
                    </div>
                  </div>
                </div>
              ))
          : data?.data.map(book => (
              <div
                key={book.id}
                className="bg-white rounded-2xl border border-[#E4E9E8] p-4 shadow-sm"
              >
                <div className="flex gap-3">
                  <div className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-[#F3F5F5] shadow-sm">
                    {book.imageUrl ? (
                      <img
                        src={book.imageUrl}
                        alt={book.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#A6AAA9]">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <h3 className="font-bold text-[#101313] line-clamp-2 text-sm">
                        {book.title}
                      </h3>
                      <p className="text-sm text-[#848785] truncate">
                        {book.author}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className="text-xs border-[#E4E9E8] bg-[#F8FAFB]"
                      >
                        {book.category}
                      </Badge>
                      <div className="flex items-center text-xs">
                        <div
                          className={`mr-1.5 h-2 w-2 rounded-full ${
                            book.inventory > 10
                              ? 'bg-[#17BD8D]'
                              : book.inventory > 0
                                ? 'bg-[#F9B959]'
                                : 'bg-[#FF4E3E]'
                          }`}
                        />
                        {book.inventory} in stock
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-lg font-black text-[#101313]">
                        ${parseFloat(book.price.toString()).toFixed(2)}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleOpenModal(book)}
                          className="p-2 rounded-lg text-[#848785] active:bg-[#F3F5F5] active:text-[#0B7C6B]"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(book.id)}
                          className="p-2 rounded-lg text-[#848785] active:bg-[#FFECEB] active:text-[#FF4E3E]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-hidden rounded-3xl border border-[#E4E9E8] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E4E9E8] bg-[#F8FAFB]">
                {visibleColumns.book && (
                  <th className="px-6 py-5 text-xs font-semibold uppercase tracking-wider text-[#848785]">
                    Book
                  </th>
                )}
                {visibleColumns.category && (
                  <th className="px-6 py-5 text-xs font-semibold uppercase tracking-wider text-[#848785]">
                    Category
                  </th>
                )}
                {visibleColumns.inventory && (
                  <th className="px-6 py-5 text-xs font-semibold uppercase tracking-wider text-[#848785]">
                    Inventory
                  </th>
                )}
                {visibleColumns.price && (
                  <th className="px-6 py-5 text-xs font-semibold uppercase tracking-wider text-[#848785]">
                    Price
                  </th>
                )}
                {visibleColumns.actions && (
                  <th className="px-4 py-5 text-right text-xs font-semibold uppercase tracking-wider text-[#848785]">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E9E8]">
              {isLoading
                ? Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-12 w-9 rounded bg-[#F3F5F5]"></div>
                            <div className="space-y-2">
                              <div className="h-4 w-32 rounded bg-[#F3F5F5]"></div>
                              <div className="h-3 w-24 rounded bg-[#F3F5F5]"></div>
                            </div>
                          </div>
                        </td>
                        <td colSpan={4} className="px-6 py-4">
                          <div className="h-4 w-full rounded bg-[#F3F5F5]"></div>
                        </td>
                      </tr>
                    ))
                : data?.data.map(book => (
                    <tr
                      key={book.id}
                      className="group transition-colors hover:bg-[#F8FAFB]/50"
                    >
                      {visibleColumns.book && (
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <div className="relative h-14 w-10 flex-shrink-0 overflow-hidden rounded-md bg-[#F3F5F5] shadow-sm">
                            {book.imageUrl ? (
                              <img
                                src={book.imageUrl}
                                alt={book.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[#A6AAA9]">
                                <ImageIcon className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-[#101313] line-clamp-1">
                              {book.title}
                            </div>
                            <div className="text-xs text-[#848785]">
                              {book.author}
                            </div>
                            <div className="mt-1 text-[10px] text-[#A6AAA9]">
                              {book.isbn}
                            </div>
                          </div>
                        </div>
                      </td>
                      )}
                      {visibleColumns.category && (
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className="border-[#E4E9E8] bg-[#F8FAFB] px-3 font-medium text-[#101313]"
                        >
                          {book.category}
                        </Badge>
                      </td>
                      )}
                      {visibleColumns.inventory && (
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div
                            className={`mr-2 h-2 w-2 rounded-full ${
                              book.inventory > 10
                                ? 'bg-[#17BD8D]'
                                : book.inventory > 0
                                  ? 'bg-[#F9B959]'
                                  : 'bg-[#FF4E3E]'
                            }`}
                          />
                          <span className="font-semibold text-[#101313]">
                            {book.inventory}
                          </span>
                          <span className="ml-1 text-xs text-[#848785]">
                            in stock
                          </span>
                        </div>
                      </td>
                      )}
                      {visibleColumns.price && (
                      <td className="px-6 py-4 font-bold text-[#101313]">
                        ${parseFloat(book.price.toString()).toFixed(2)}
                      </td>
                      )}
                      {visibleColumns.actions && (
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleOpenModal(book)}
                            className="rounded-lg p-2 text-[#848785] transition-colors hover:bg-[#F3F5F5] hover:text-[#0B7C6B]"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(book.id)}
                            className="rounded-lg p-2 text-[#848785] transition-colors hover:bg-[#FFECEB] hover:text-[#FF4E3E]"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                      )}
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-t border-[#E4E9E8] bg-[#F8FAFB] px-6 py-4">
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
                <span className="font-semibold text-[#101313]">
                  {data.meta.total === 0 ? 0 : (page - 1) * pageSize + 1}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-[#101313]">
                  {Math.min(page * pageSize, data.meta.total)}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-[#101313]">
                  {data.meta.total}
                </span>{' '}
                books
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-lg border-[#E4E9E8]"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!data.meta.hasPreviousPage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex h-9 min-w-[36px] items-center justify-center rounded-lg bg-white px-3 text-sm font-bold text-[#101313] shadow-sm">
                {page}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-lg border-[#E4E9E8]"
                onClick={() => setPage(p => p + 1)}
                disabled={!data.meta.hasNextPage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Book Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBook ? 'Edit Book Details' : 'Add New Book to Catalog'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#101313]">
                Book Title
              </label>
              <Input
                required
                value={formData.title}
                onChange={e =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g. The Great Gatsby"
                className="h-11 md:h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#101313]">
                Author Name
              </label>
              <Input
                required
                value={formData.author}
                onChange={e =>
                  setFormData({ ...formData, author: e.target.value })
                }
                placeholder="e.g. F. Scott Fitzgerald"
                className="h-11 md:h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#101313]">
                Category
              </label>
              <select
                required
                value={formData.category}
                onChange={e =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="flex h-11 md:h-12 w-full rounded-xl border border-[#E4E9E8] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B7C6B]/20"
              >
                <option value="">Select a category</option>
                {categories?.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="Fiction">Fiction</option>
                <option value="Mystery">Mystery</option>
                <option value="Sci-Fi">Sci-Fi</option>
                <option value="Fantasy">Fantasy</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#101313]">
                ISBN Number
              </label>
              <Input
                required
                value={formData.isbn}
                onChange={e =>
                  setFormData({ ...formData, isbn: e.target.value })
                }
                placeholder="978-0-XXXX-XXXX"
                className="h-11 md:h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#101313]">
                Price ($)
              </label>
              <Input
                required
                type="number"
                step="0.01"
                value={formData.price}
                onChange={e =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="0.00"
                className="h-11 md:h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#101313]">
                Inventory (Stock)
              </label>
              <Input
                required
                type="number"
                value={formData.inventory}
                onChange={e =>
                  setFormData({ ...formData, inventory: e.target.value })
                }
                placeholder="0"
                className="h-11 md:h-12 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-[#101313]">
              Image URL
            </label>
            <Input
              value={formData.imageUrl}
              onChange={e =>
                setFormData({ ...formData, imageUrl: e.target.value })
              }
              placeholder="https://example.com/cover.jpg (optional)"
              className="h-11 md:h-12 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-[#101313]">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="min-h-[100px] md:min-h-[120px] w-full rounded-xl md:rounded-2xl border border-[#E4E9E8] p-3 md:p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B7C6B]/20"
              placeholder="Describe the book..."
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="h-11 md:h-12 rounded-xl w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-11 md:h-12 rounded-xl bg-[#0B7C6B] hover:bg-[#096658] px-6 md:px-8 w-full sm:w-auto"
              disabled={createBook.isPending || updateBook.isPending}
            >
              {(createBook.isPending || updateBook.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingBook ? 'Update Book' : 'Add Book'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
