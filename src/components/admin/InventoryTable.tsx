import type { Book, ConditionTag, BookStatus } from '@/types/book'

const conditionLabel: Record<ConditionTag, string> = {
  LIKE_NEW: 'Like New',
  GENTLY_LOVED: 'Gently Loved',
  WELL_TREASURED: 'Well-Treasured',
}

const conditionClass: Record<ConditionTag, string> = {
  LIKE_NEW: 'condition-tag like-new',
  GENTLY_LOVED: 'condition-tag',
  WELL_TREASURED: 'condition-tag well-treasured',
}

const statusLabel: Record<BookStatus, string> = {
  AVAILABLE: 'Available',
  OFFLINE_DISTRIBUTION: 'Offline',
  RESERVED: 'Reserved',
  CLAIMED: 'Claimed',
  DELIVERED: 'Delivered',
}

const statusClass: Record<BookStatus, string> = {
  AVAILABLE: 'status-badge status-available',
  OFFLINE_DISTRIBUTION: 'status-badge status-warning',
  RESERVED: 'status-badge status-info',
  CLAIMED: 'status-badge status-available',
  DELIVERED: 'status-badge status-available',
}

export function InventoryTable({ books }: { books: Book[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Legacy ID</th>
            <th>Title</th>
            <th>Author</th>
            <th>Condition</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id}>
              <td className="mono-id">{book.legacy_id}</td>
              <td className="body font-medium">{book.title}</td>
              <td className="caption">{book.author}</td>
              <td>
                <span className={conditionClass[book.condition_tag]}>
                  <span className="condition-dot" />
                  {conditionLabel[book.condition_tag]}
                </span>
              </td>
              <td>
                <span className={statusClass[book.status]}>
                  <span className="dot" />
                  {statusLabel[book.status]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}