import React, { useState, useRef, useEffect } from 'react';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  minWidth?: number;
  defaultWidth?: number;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  emptyMessage?: string;
  className?: string;
  resizable?: boolean;
}

function Table<T extends { id?: string }>({
  columns,
  data,
  onRowClick,
  onSort,
  sortKey,
  sortDirection,
  emptyMessage = 'No data available',
  className = '',
  resizable = true,
}: TableProps<T>) {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const widths: Record<string, number> = {};
    columns.forEach((col) => {
      widths[col.key] = col.defaultWidth || 150;
    });
    return widths;
  });

  const [resizing, setResizing] = useState<{
    columnKey: string;
    startX: number;
    startWidth: number;
  } | null>(null);

  const tableRef = useRef<HTMLTableElement>(null);

  const handleSort = (key: string) => {
    if (!onSort) return;
    const newDirection =
      sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(key, newDirection);
  };

  const handleMouseDown = (e: React.MouseEvent, columnKey: string) => {
    if (!resizable) return;
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = columnWidths[columnKey] || 150;
    setResizing({ columnKey, startX, startWidth });
  };

  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - resizing.startX;
      const minWidth = columns.find((c) => c.key === resizing.columnKey)?.minWidth || 50;
      const newWidth = Math.max(minWidth, resizing.startWidth + diff);
      setColumnWidths((prev) => ({
        ...prev,
        [resizing.columnKey]: newWidth,
      }));
    };

    const handleMouseUp = () => {
      setResizing(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [resizing, columns]);

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  // Calculate total width for table
  const totalWidth = columns.reduce((sum, col) => sum + (columnWidths[col.key] || col.defaultWidth || 150), 0);

  return (
    <div className={`overflow-x-auto ${className} ${resizing ? 'select-none' : ''}`}>
      <table
        ref={tableRef}
        className="divide-y divide-gray-200 bg-white"
        style={{ tableLayout: 'fixed', width: `${totalWidth}px`, minWidth: `${totalWidth}px` }}
      >
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={column.key}
                scope="col"
                style={{ width: `${columnWidths[column.key] || 150}px` }}
                className={`
                  px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                  ${column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}
                  ${column.className || ''}
                  relative
                `}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.label}</span>
                  {column.sortable && sortKey === column.key && (
                    <span className="text-gray-400">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
                {resizable && index < columns.length - 1 && (
                  <div
                    className="absolute top-0 right-0 w-3 h-full cursor-col-resize group"
                    onMouseDown={(e) => handleMouseDown(e, column.key)}
                    style={{ zIndex: 10, marginRight: '-6px' }}
                    title="Drag to resize column"
                  >
                    <div className={`absolute top-0 right-1/2 w-0.5 h-full transition-colors ${
                      resizing?.columnKey === column.key 
                        ? 'bg-blue-500' 
                        : 'bg-transparent group-hover:bg-blue-400'
                    }`} />
                  </div>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr
              key={item.id || index}
              className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  style={{ width: `${columnWidths[column.key] || 150}px` }}
                  className={`px-6 py-4 text-sm text-gray-900 ${column.className || ''}`}
                >
                  {column.render
                    ? column.render(item)
                    : <div className="truncate">{(item as any)[column.key]}</div>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;

