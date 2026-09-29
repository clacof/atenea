import LoadingState from '@/components/atoms/LoadingState'

export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingState message="Cargando dashboard..." />
    </div>
  )
}