import { ScanFlow } from '@/components/admin/ScanFlow'
import { requireAdmin } from '@/lib/auth'

export default async function ScanBookPage() {
  await requireAdmin()
  return <ScanFlow />
}