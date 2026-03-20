import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const Pagination = ({ currentPage, totalPages, totalElements, pageSize, onPageChange }) => {
  if (totalPages <= 1) return null

  const from = currentPage * pageSize + 1
  const to = Math.min((currentPage + 1) * pageSize, totalElements)

  const pages = []
  const maxVisible = 5
  let start = Math.max(0, currentPage - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages - 1, start + maxVisible - 1)
  if (end - start < maxVisible - 1) start = Math.max(0, end - maxVisible + 1)

  for (let i = start; i <= end; i++) pages.push(i)

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {from}–{to} sur <span className="font-medium text-gray-700 dark:text-gray-200">{totalElements}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
        </button>

        {start > 0 && (
          <>
            <button onClick={() => onPageChange(0)} className="px-3 py-1 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">1</button>
            {start > 1 && <span className="px-1 text-gray-400">…</span>}
          </>
        )}

        {pages.map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              p === currentPage
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {p + 1}
          </button>
        ))}

        {end < totalPages - 1 && (
          <>
            {end < totalPages - 2 && <span className="px-1 text-gray-400">…</span>}
            <button onClick={() => onPageChange(totalPages - 1)} className="px-3 py-1 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">{totalPages}</button>
          </>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

export default Pagination
