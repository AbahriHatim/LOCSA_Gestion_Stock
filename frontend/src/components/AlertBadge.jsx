import React from 'react'

const AlertBadge = ({ quantity, minQuantity }) => {
  // If minQuantity is provided and > 0, use dynamic thresholds
  if (minQuantity !== undefined && minQuantity > 0) {
    if (quantity <= minQuantity) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
          {quantity} — Stock critique
        </span>
      )
    }
    if (quantity <= minQuantity * 1.5) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
          {quantity} — Stock faible
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        {quantity} — OK
      </span>
    )
  }

  // Fallback: old behavior with fixed thresholds 5/10
  if (quantity <= 5) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
        {quantity} — Critique
      </span>
    )
  }
  if (quantity <= 10) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
        {quantity} — Faible
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
      {quantity} — Normal
    </span>
  )
}

export default AlertBadge
