import { Fragment, type ReactNode, useState } from 'react'
import Card from '../atoms/Card'
import Button from '../atoms/Button'
import { TableRowSkeleton } from '../atoms/Skeleton'
import EmptyState from './EmptyState'
import { cn } from '@/lib/utils'

export interface DataTableColumn<T> {
  key: string
  header: ReactNode
  cell: (item: T) => ReactNode
  className?: string
  essential?: boolean
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  getRowKey: (item: T) => string | number
  emptyTitle: string
  emptyDescription?: string
  renderExpanded?: (item: T) => ReactNode
  /** Filas por pagina (paginacion en cliente). Sin valor muestra todo. */
  pageSize?: number
  loading?: boolean
}

export default function DataTable<T>({
  columns,
  data,
  getRowKey,
  emptyTitle,
  emptyDescription,
  renderExpanded,
  pageSize,
  loading = false,
}: DataTableProps<T>) {
  const [expandedRow, setExpandedRow] = useState<string | number | null>(null)
  const [page, setPage] = useState(1)
  const essentialColumns = columns.filter((c) => c.essential)

  const totalPages = pageSize ? Math.max(1, Math.ceil(data.length / pageSize)) : 1
  // Si cambian los datos (filtros) y la pagina queda fuera de rango, volver a la ultima valida
  const currentPage = Math.min(page, totalPages)
  const rows = pageSize ? data.slice((currentPage - 1) * pageSize, currentPage * pageSize) : data

  const toggleRow = (key: string | number) => {
    setExpandedRow((prev) => (prev === key ? null : key))
  }

  return (
    <Card className="overflow-hidden">
      <div className="hidden md:block md:overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/90 text-gray-300">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={cn('p-3 text-left font-semibold', column.className)}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} columns={columns.length} />)}
            {!loading && rows.map((item) => {
              const rowKey = getRowKey(item)
              const isExpanded = expandedRow === rowKey
              const isClickable = typeof renderExpanded === 'function'
              const handleRowClick = () => {
                if (!isClickable) return
                toggleRow(rowKey)
              }

              return (
                <Fragment key={rowKey}>
                  <tr
                    onClick={handleRowClick}
                    {...(isClickable
                      ? {
                          tabIndex: 0,
                          'aria-expanded': isExpanded,
                          onKeyDown: (e: React.KeyboardEvent) => {
                            // Solo la fila; no interceptar teclas de botones internos
                            if (e.target !== e.currentTarget) return
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              toggleRow(rowKey)
                            }
                          },
                        }
                      : {})}
                    className={cn(
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-purple-500',
                      'border-t border-gray-800 text-gray-100 transition',
                      isClickable ? 'cursor-pointer hover:bg-gray-800/60' : 'hover:bg-gray-800/40',
                    )}
                  >
                    {columns.map((column) => (
                      <td key={column.key} className={cn('p-3 align-top', column.className)}>
                        {column.cell(item)}
                      </td>
                    ))}
                  </tr>
                  {isClickable && isExpanded && (
                    <tr className="border-t border-gray-900 bg-black/30">
                      <td colSpan={columns.length} className="p-4">
                        {renderExpanded?.(item)}
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-gray-800 md:hidden">
        {loading && (
          <div className="p-3 text-sm text-gray-400" role="status">
            Cargando...
          </div>
        )}
        {!loading && rows.map((item) => {
          const rowKey = getRowKey(item)
          const isExpanded = expandedRow === rowKey
          return (
            <div key={rowKey} className="flex flex-col">
              <button
                type="button"
                onClick={() => toggleRow(rowKey)}
                className="flex w-full items-center justify-between p-3 text-left text-sm font-medium text-gray-200 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                aria-expanded={isExpanded}
              >
                <div className="flex flex-col">
                  {essentialColumns.map((col) => (
                    <div key={col.key} className={cn('p-0.5', col.className)}>
                      {col.cell(item)}
                    </div>
                  ))}
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className={cn('h-5 w-5 shrink-0 transition-transform', isExpanded ? 'rotate-180' : '')}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {isExpanded && (
                <div className="flex flex-col gap-2 bg-black/20 p-3 pt-0">
                  {columns
                    .filter((col) => !col.essential)
                    .map((col) => (
                      <div key={col.key} className={cn('flex flex-col py-1', col.className)}>
                        <span className="text-xs text-gray-500">{col.header}</span>
                        <span className="text-sm">{col.cell(item)}</span>
                      </div>
                    ))}
                  {renderExpanded && (
                    <div className="border-t border-white/5 pt-2 text-sm text-gray-100">
                      {renderExpanded(item)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {!loading && data.length === 0 ? <EmptyState title={emptyTitle} description={emptyDescription} /> : null}

      {pageSize && totalPages > 1 ? (
        <nav
          className="flex items-center justify-between gap-3 border-t border-gray-800 px-3 py-2 text-sm text-gray-400"
          aria-label="Paginacion"
        >
          <span>
            {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, data.length)} de {data.length}
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
              aria-label="Pagina anterior"
            >
              ‹
            </Button>
            <span aria-current="page">
              {currentPage} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="secondary"
              disabled={currentPage === totalPages}
              onClick={() => setPage(currentPage + 1)}
              aria-label="Pagina siguiente"
            >
              ›
            </Button>
          </div>
        </nav>
      ) : null}
    </Card>
  )
}
