import Sidebar from './Sidebar'

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-auto pb-20 md:pb-0">
        {children}
      </main>
    </div>
  )
}
