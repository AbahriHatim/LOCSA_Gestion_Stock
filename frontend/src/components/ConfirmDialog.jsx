import React from 'react'
import { AlertTriangle, Trash2, X } from 'lucide-react'

const ConfirmDialog = ({ isOpen, title, message, confirmLabel = 'Confirmer', variant = 'danger', onConfirm, onCancel }) => {
  if (!isOpen) return null

  const isDanger = variant === 'danger'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {isDanger
              ? <Trash2 size={18} className="text-red-500" />
              : <AlertTriangle size={18} className="text-amber-500" />}
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
          <div className="flex gap-3">
            <button onClick={onCancel} className="btn-secondary flex-1 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
              Annuler
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
