'use client';

import React from 'react';
import Link from 'next/link';

interface Category {
  name: string;
  emoji: string;
  color: string;
}

const categories: Category[] = [
  { name: 'Fiction', emoji: '📚', color: 'from-[#0B7C6B] to-[#17BD8D]' },
  { name: 'Mystery', emoji: '🔍', color: 'from-[#219FFF] to-[#17BD8D]' },
  { name: 'Romance', emoji: '💕', color: 'from-[#FF4E3E] to-[#FF6320]' },
  { name: 'Sci-Fi', emoji: '🚀', color: 'from-[#219FFF] to-[#0B7C6B]' },
  { name: 'Biography', emoji: '👤', color: 'from-[#17BD8D] to-[#0B7C6B]' },
  { name: 'Business', emoji: '💼', color: 'from-[#FF6320] to-[#FFA118]' },
  { name: 'History', emoji: '📜', color: 'from-[#FFA118] to-[#17BD8D]' },
  { name: 'Self-Help', emoji: '🌟', color: 'from-[#17BD8D] to-[#219FFF]' },
];

export function InfiniteScrollCategories() {
  return (
    <div className="relative overflow-hidden py-8">
      {/* Gradient overlays for fade effect */}
      <div className="absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-[#F9FCFB] to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-[#F9FCFB] to-transparent pointer-events-none" />

      {/* Scrolling container */}
      <div className="flex animate-infinite-scroll">
        {/* First set of categories */}
        {categories.map((category, index) => (
          <Link
            key={`first-${index}`}
            href={`/books?category=${category.name}`}
          >
            <div className="group relative bg-white rounded-xl p-6 mx-3 text-center hover:shadow-xl transition-all duration-300 cursor-pointer border border-[#E4E9E8] min-w-[140px]">
              <div
                className={`absolute inset-0 bg-linear-to-br ${category.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity`}
              />
              <div className="text-4xl mb-3">{category.emoji}</div>
              <div className="font-semibold text-[#101313] whitespace-nowrap">
                {category.name}
              </div>
            </div>
          </Link>
        ))}

        {/* Duplicate set for seamless loop */}
        {categories.map((category, index) => (
          <Link
            key={`second-${index}`}
            href={`/books?category=${category.name}`}
          >
            <div className="group relative bg-white rounded-xl p-6 mx-3 text-center hover:shadow-xl transition-all duration-300 cursor-pointer border border-[#E4E9E8] min-w-[140px]">
              <div
                className={`absolute inset-0 bg-linear-to-br ${category.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity`}
              />
              <div className="text-4xl mb-3">{category.emoji}</div>
              <div className="font-semibold text-[#101313] whitespace-nowrap">
                {category.name}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
