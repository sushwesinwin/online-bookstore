'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => (
    <div className="h-40 w-full animate-pulse bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center text-gray-400">
      Loading editor...
    </div>
  ),
});

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function WysiwygEditor({ value, onChange, placeholder }: EditorProps) {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link'],
        ['clean'],
      ],
    }),
    []
  );

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'link',
  ];

  return (
    <div className="w-full">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || 'Write here...'}
        className="bg-white"
      />
    </div>
  );
}
