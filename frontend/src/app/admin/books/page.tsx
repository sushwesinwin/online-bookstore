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

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data, isLoading } = useBooks({ page, limit: 10, search });
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
            Books Catalog
          </h1>
          <p className="mt-1 text-[#848785]">
            Manage your bookstore library and inventory.
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
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#848785]" />
        <Input
          placeholder="Search by title, author, or ISBN..."
          className="h-14 rounded-2xl border-[#E4E9E8] bg-white pl-12 pr-4 text-base focus:ring-2 focus:ring-[#0B7C6B]/20"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-[#E4E9E8] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E4E9E8] bg-[#F8FAFB]">
                <th className="px-6 py-5 text-xs font-semibold uppercase tracking-wider text-[#848785]">
                  Book
                </th>
                <th className="px-6 py-5 text-xs font-semibold uppercase tracking-wider text-[#848785]">
                  Category
                </th>
                <th className="px-6 py-5 text-xs font-semibold uppercase tracking-wider text-[#848785]">
                  Inventory
                </th>
                <th className="px-6 py-5 text-xs font-semibold uppercase tracking-wider text-[#848785]">
                  Price
                </th>
                <th className="px-4 py-5 text-right text-xs font-semibold uppercase tracking-wider text-[#848785]">
                  Actions
                </th>
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
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className="border-[#E4E9E8] bg-[#F8FAFB] px-3 font-medium text-[#101313]"
                        >
                          {book.category}
                        </Badge>
                      </td>
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
                      <td className="px-6 py-4 font-bold text-[#101313]">
                        ${parseFloat(book.price.toString()).toFixed(2)}
                      </td>
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
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#E4E9E8] bg-[#F8FAFB] px-6 py-4">
            <p className="text-sm text-[#848785]">
              Showing{' '}
              <span className="font-semibold text-[#101313]">
                {(page - 1) * 10 + 1}
              </span>{' '}
              to{' '}
              <span className="font-semibold text-[#101313]">
                {Math.min(page * 10, data.meta.total)}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-[#101313]">
                {data.meta.total}
              </span>{' '}
              books
            </p>
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
          <div className="grid grid-cols-2 gap-6">
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
                className="h-12 rounded-xl"
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
                className="h-12 rounded-xl"
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
                className="flex h-12 w-full rounded-xl border border-[#E4E9E8] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B7C6B]/20"
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
                className="h-12 rounded-xl"
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
                className="h-12 rounded-xl"
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
                className="h-12 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-[#101313]">
              Image URL
            </label>
            <Input
              required
              value={formData.imageUrl}
              onChange={e =>
                setFormData({ ...formData, imageUrl: e.target.value })
              }
              placeholder="https://example.com/cover.jpg"
              className="h-12 rounded-xl"
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
              className="min-h-[120px] w-full rounded-2xl border border-[#E4E9E8] p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B7C6B]/20"
              placeholder="Describe the book..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="h-12 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-12 rounded-xl bg-[#0B7C6B] hover:bg-[#096658] px-8"
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
