export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="empty-state">
      <div className="icon-wrap">
        <svg
          className="icon animate-leaf-sway"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 21s-7-4.5-9-9c-1.2-2.7 0-6 3-6.5C8 5 10 6.5 12 9c2-2.5 4-4 6-3.5 3 .5 4.2 3.8 3 6.5-2 4.5-9 9-9 9Z" />
        </svg>
      </div>
      <h4 className="h4">{title}</h4>
      <p className="body mt-1.5 text-caption!">{description}</p>
    </div>
  )
}