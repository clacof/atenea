import type { ReactNode } from 'react'
import Card from '../atoms/Card'
import EmptyState from './EmptyState'

export interface DataTableColumn<T> {
  key: string
  header: ReactNode
  cell: (item: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  getRowKey: (item: T) => string | number
  emptyTitle: string
  emptyDescription?: string
}

export default function DataTable<T>({
  columns,
  data,
  getRowKey,
  emptyTitle,
  emptyDescription,
}: DataTableProps<T>) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/90 text-gray-300">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={`p-3 text-left font-semibold ${column.className ?? ''}`.trim()}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={getRowKey(item)} className="border-t border-gray-800 text-gray-100 transition hover:bg-gray-800/40">
                {columns.map((column) => (
                  <td key={column.key} className={`p-3 align-top ${column.className ?? ''}`.trim()}>
                    {column.cell(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 ? <EmptyState title={emptyTitle} description={emptyDescription} /> : null}
    </Card>
  )
}