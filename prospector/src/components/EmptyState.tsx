import React from 'react'

export function EmptyState({
  title,
  description,
  icon: Icon,
}: {
  title: string
  description?: string
  icon?: any
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <Icon className="w-12 h-12 text-gray-300 mb-4" />}
      <h3 className="text-lg font-medium text-gray-700">{title}</h3>
      {description && (
        <p className="text-sm text-gray-400 mt-1 max-w-xs">{description}</p>
      )}
    </div>
  )
}
