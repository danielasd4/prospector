import React from 'react'

export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-2 border-zinc-700 border-t-brand-400 rounded-full animate-spin" />
    </div>
  )
}
