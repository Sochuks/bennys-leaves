import Link from 'next/link'
import { SignOutButton } from '@/components/admin/SignOutButton'
import { requireAdmin } from '@/lib/auth'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="min-h-dvh">
      <header className="border-b border-black/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <span className="h4">
            Benny's Leaves <span className="caption font-normal">— Admin</span>
          </span>
          <nav className="flex items-center gap-6">
            <Link href="/admin/books" className="ui-text">Inventory</Link>
            <Link href="/admin/books/new" className="ui-text">Add Book</Link>
            <Link href="/admin/books/scan" className="ui-text">Scan ISBN</Link>
            <Link href="/admin/books/import" className="ui-text">Bulk Import</Link>
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-8 sm:py-10">{children}</main>
    </div>
  )
}