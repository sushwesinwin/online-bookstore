import React from 'react';
import { User, Type, Hash } from 'lucide-react';
import { Button } from './button';

export function AdvancedSearch() {
  return (
    <div className="w-full max-w-5xl mx-auto rounded-[2rem] p-4 sm:p-6 bg-white/40 backdrop-blur-xl shadow-2xl border border-white/40">
      <div className="flex flex-col md:flex-row items-end gap-4 md:gap-6">
        {/* Author Field */}
        <div className="flex-1 w-full">
          <div className="flex items-center gap-2 mb-2 px-2">
            <User className="w-4 h-4 text-gray-800" />
            <label className="text-sm font-semibold text-gray-800">
              Author
            </label>
          </div>
          <input
            type="text"
            placeholder="Enter author"
            className="w-full bg-white/80 focus:bg-white transition-colors duration-200 rounded-full px-6 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none shadow-inner"
          />
        </div>

        {/* Title Field */}
        <div className="flex-1 w-full">
          <div className="flex items-center gap-2 mb-2 px-2">
            <Type className="w-4 h-4 text-gray-800" />
            <label className="text-sm font-semibold text-gray-800">Title</label>
          </div>
          <input
            type="text"
            placeholder="Enter title"
            className="w-full bg-white/80 focus:bg-white transition-colors duration-200 rounded-full px-6 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none shadow-inner"
          />
        </div>

        {/* Keyword or ISBN Field */}
        <div className="flex-1 w-full">
          <div className="flex items-center gap-2 mb-2 px-2">
            <Hash className="w-4 h-4 text-gray-800" />
            <label className="text-sm font-semibold text-gray-800">
              Keyword or ISBN
            </label>
          </div>
          <input
            type="text"
            placeholder="Enter keyword or ISBN"
            className="w-full bg-white/80 focus:bg-white transition-colors duration-200 rounded-full px-6 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none shadow-inner"
          />
        </div>

        {/* Search Button */}
        <div className="w-full md:w-auto mt-4 md:mt-0">
          <Button className="w-full md:w-auto rounded-full bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 h-auto text-base font-semibold shadow-lg shadow-orange-500/30 transition-all duration-300 hover:scale-105 active:scale-95">
            Search
          </Button>
        </div>
      </div>
    </div>
  );
}
