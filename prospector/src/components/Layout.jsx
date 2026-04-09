import React from 'react'
import Sidebar from './Sidebar'
import { OnboardingTour } from './OnboardingTour'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-zinc-950">
      <OnboardingTour />
      <Sidebar />
      <main className="md:ml-56 pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  )
}
