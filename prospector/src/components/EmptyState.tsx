import React from 'react'

export function EmptyState({ title, description, icon: Icon }: { title: string; description?: string; icon?: any }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {Icon && <Icon className="w-12 h-12 text-zinc-700 mb-4" />}
      <h3 className="text-base font-semibold text-zinc-300">{title}</h3>
      {description && <p className="text-sm text-zinc-600 mt-1 max-w-xs">{description}</p>}
    </div>
  )
}
