'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Loader2,
  Plus,
  Minus,
  Trash2,
  Check,
  ShoppingCart,
  ArrowRight,
} from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { booksApi } from '@/lib/api/books';
import { useCreateAdminOrder } from '@/lib/hooks/use-orders';
import { useRouter } from 'next/navigation';

export default function NewPurchasePage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [userSearch, setUserSearch] = useState('');
  const [debouncedUserSearch, setDebouncedUserSearch] = useState('');

  const [bookSearch, setBookSearch] = useState('');
  const [debouncedBookSearch, setDebouncedBookSearch] = useState('');
  const [selectedBooks, setSelectedBooks] = useState<
    { id: string; title: string; price: number; quantity: number }[]
  >([]);

  const createOrderMutation = useCreateAdminOrder();

  // Debounce searches
  useEffect(() => {
    const t = setTimeout(() => setDebouncedUserSearch(userSearch), 300);
    return () => clearTimeout(t);
  }, [userSearch]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedBookSearch(bookSearch), 300);
    return () => clearTimeout(t);
  }, [bookSearch]);

  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['admin', 'users', debouncedUserSearch],
    queryFn: () =>
      adminApi.getUsers({ search: debouncedUserSearch, limit: 10 }),
    enabled: step === 1,
  });

  const { data: booksData, isLoading: isLoadingBooks } = useQuery({
    queryKey: ['books', debouncedBookSearch],
    queryFn: () =>
      booksApi.getBooks({ search: debouncedBookSearch, limit: 12 }),
    enabled: step === 2,
  });

  const handleCreateOrder = async () => {
    if (!selectedUserId || selectedBooks.length === 0) return;

    try {
      await createOrderMutation.mutateAsync({
        userId: selectedUserId,
        items: selectedBooks.map(b => ({ bookId: b.id, quantity: b.quantity })),
      });
      router.push('/admin/orders');
    } catch (error) {
      console.error('Failed to create order', error);
    }
  };

  const addBook = (book: any) => {
    if (selectedBooks.find(b => b.id === book.id)) return;
    setSelectedBooks([...selectedBooks, { ...book, quantity: 1 }]);
  };

  const updateQuantity = (id: string, delta: number) => {
    setSelectedBooks(
      selectedBooks.map(b => {
        if (b.id === id) {
          return { ...b, quantity: Math.max(1, b.quantity + delta) };
        }
        return b;
      })
    );
  };

  const removeBook = (id: string) => {
    setSelectedBooks(selectedBooks.filter(b => b.id !== id));
  };

  const totalAmount = selectedBooks.reduce(
    (acc, curr) => acc + curr.price * curr.quantity,
    0
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#101313] flex items-center gap-3">
            <div className="p-2.5 bg-[#E4FFFB] rounded-xl">
              <ShoppingCart className="h-7 w-7 text-[#0B7C6B]" />
            </div>
            New Purchase
          </h1>
          <p className="mt-2 text-[#848785]">
            Create a manual purchase order for a customer.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#E4E9E8] shadow-sm overflow-hidden">
        {/* Progress Bar */}
        <div className="flex bg-[#F8FAFB] border-b border-[#E4E9E8]">
          <button
            onClick={() => setStep(1)}
            className={`flex-1 py-4 text-sm font-bold transition-colors ${
              step === 1
                ? 'text-[#0B7C6B] border-b-2 border-[#0B7C6B]'
                : 'text-[#848785] hover:bg-[#F3F5F5]'
            }`}
          >
            1. Select Customer
          </button>
          <button
            onClick={() => {
              if (selectedUserId) setStep(2);
            }}
            disabled={!selectedUserId}
            className={`flex-1 py-4 text-sm font-bold transition-colors ${
              step === 2
                ? 'text-[#0B7C6B] border-b-2 border-[#0B7C6B]'
                : 'text-[#848785] hover:bg-[#F3F5F5]'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            2. Add Books to Order
          </button>
        </div>

        <div className="p-6 md:p-8 min-h-[500px]">
          {step === 1 && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#848785]" />
                <Input
                  placeholder="Search customer by name or email..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="pl-12 h-14 rounded-2xl border-[#E4E9E8] bg-white text-base"
                />
              </div>

              <div className="h-[350px] overflow-y-auto border border-[#E4E9E8] rounded-2xl divide-y divide-[#E4E9E8]">
                {isLoadingUsers ? (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#848785]" />
                  </div>
                ) : usersData?.data?.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-[#848785] gap-2">
                    <Search className="h-8 w-8 opacity-20" />
                    <p>No customers found.</p>
                  </div>
                ) : (
                  usersData?.data?.map(user => (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      className={`p-4 flex items-center justify-between cursor-pointer transition-all ${
                        selectedUserId === user.id
                          ? 'bg-[#E4FFFB] border-l-4 border-[#0B7C6B]'
                          : 'hover:bg-[#F8FAFB] border-l-4 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-linear-to-br from-[#0B7C6B] to-[#17BD8D] flex items-center justify-center text-white font-bold text-sm">
                          {user.firstName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-[#101313]">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-[#848785] text-sm">{user.email}</p>
                        </div>
                      </div>
                      {selectedUserId === user.id && (
                        <div className="bg-[#0B7C6B] p-1.5 rounded-full text-white">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!selectedUserId}
                  className="h-12 bg-[#0B7C6B] hover:bg-[#096B5B] text-white px-8 rounded-xl"
                >
                  Continue to Books <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Books Selection */}
              <div className="lg:col-span-2 space-y-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#848785]" />
                  <Input
                    placeholder="Search books..."
                    value={bookSearch}
                    onChange={e => setBookSearch(e.target.value)}
                    className="pl-12 h-14 rounded-2xl border-[#E4E9E8] bg-white text-base"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4 h-[400px] overflow-y-auto pr-2 pb-4">
                  {isLoadingBooks ? (
                    <div className="col-span-2 flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-[#848785]" />
                    </div>
                  ) : booksData?.data?.length === 0 ? (
                    <div className="col-span-2 flex items-center justify-center h-full text-[#848785]">
                      No books found.
                    </div>
                  ) : (
                    booksData?.data?.map(book => {
                      const isSelected = selectedBooks.some(
                        b => b.id === book.id
                      );
                      return (
                        <div
                          key={book.id}
                          className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                            isSelected
                              ? 'border-[#0B7C6B] bg-[#E4FFFB]'
                              : 'border-[#E4E9E8] hover:border-[#0B7C6B]/30 hover:shadow-md bg-white'
                          }`}
                        >
                          <div className="flex items-start gap-3 mb-4">
                            {book.imageUrl ? (
                              <img
                                src={book.imageUrl}
                                alt={book.title}
                                className="w-16 h-20 object-cover rounded shadow-sm"
                              />
                            ) : (
                              <div className="w-16 h-20 bg-[#F3F5F5] rounded flex items-center justify-center flex-shrink-0">
                                <span className="text-[#A6AAA9] text-xs">
                                  No Cover
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-[#101313] text-sm line-clamp-2">
                                {book.title}
                              </p>
                              <p className="text-[#848785] text-xs mt-1">
                                {book.author}
                              </p>
                              <p className="font-bold text-[#0B7C6B] mt-2">
                                ${book.price}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant={isSelected ? 'outline' : 'default'}
                            className={`w-full ${isSelected ? 'border-[#0B7C6B] text-[#0B7C6B]' : 'bg-[#0B7C6B] hover:bg-[#096B5B] text-white'}`}
                            onClick={() =>
                              isSelected ? removeBook(book.id) : addBook(book)
                            }
                          >
                            {isSelected ? 'Remove' : 'Add to Order'}
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="flex flex-col h-[500px] border border-[#E4E9E8] rounded-2xl overflow-hidden bg-white shadow-sm">
                <div className="bg-[#F8FAFB] px-6 py-4 border-b border-[#E4E9E8]">
                  <h3 className="font-black text-lg text-[#101313]">
                    Order Summary
                  </h3>
                  <p className="text-sm text-[#848785] mt-1">
                    {selectedBooks.length}{' '}
                    {selectedBooks.length === 1 ? 'item' : 'items'}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                  {selectedBooks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-[#848785] gap-3">
                      <ShoppingCart className="h-10 w-10 opacity-20" />
                      <p className="text-sm">No items in order</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#E4E9E8]">
                      {selectedBooks.map(book => (
                        <div
                          key={book.id}
                          className="p-4 hover:bg-[#F8FAFB] rounded-xl transition-colors mb-1"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <p className="font-bold text-sm text-[#101313] line-clamp-2 flex-1 pr-4">
                              {book.title}
                            </p>
                            <button
                              onClick={() => removeBook(book.id)}
                              className="text-[#A6AAA9] hover:text-[#FF4E3E] transition-colors mt-0.5"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 bg-[#F3F5F5] rounded-lg p-1">
                              <button
                                onClick={() => updateQuantity(book.id, -1)}
                                className="p-1.5 hover:bg-white rounded-md transition-colors"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="text-sm font-bold w-6 text-center">
                                {book.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(book.id, 1)}
                                className="p-1.5 hover:bg-white rounded-md transition-colors"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <p className="font-bold text-[#101313]">
                              ${(book.price * book.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-[#F8FAFB] p-6 border-t border-[#E4E9E8]">
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-bold text-[#848785]">
                      Total Amount
                    </span>
                    <span className="font-black text-3xl text-[#101313]">
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <Button
                    onClick={handleCreateOrder}
                    disabled={
                      selectedBooks.length === 0 ||
                      createOrderMutation.isPending
                    }
                    className="w-full h-14 bg-[#0B7C6B] hover:bg-[#096B5B] text-white rounded-xl text-lg font-bold shadow-lg"
                  >
                    {createOrderMutation.isPending ? (
                      <span className="flex items-center">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />{' '}
                        Processing...
                      </span>
                    ) : (
                      'Create Purchase Order'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
