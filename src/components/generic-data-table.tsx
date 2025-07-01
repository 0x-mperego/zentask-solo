'use client';

import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from '@tabler/icons-react';
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useIsMobile } from '@/hooks/use-mobile';

interface GenericDataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  showPagination?: boolean;
  showItemCount?: boolean;
  onRowClick?: (row: TData) => void;
  itemName?: string;
  mobileCardRender?: (item: TData, onClick?: () => void) => React.ReactNode;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateAction?: React.ReactNode;
  toolbar?: React.ReactNode;
  // Supporto per ricerca e filtri
  searchKey?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filteredData?: TData[];
}

export function GenericDataTable<TData>({
  data,
  columns,
  showPagination = true,
  showItemCount = true,
  onRowClick,
  itemName = 'elementi',
  mobileCardRender,
  emptyStateTitle,
  emptyStateDescription,
  emptyStateAction,
  toolbar,
  searchKey,
  searchValue,
  onSearchChange,
  filteredData,
}: GenericDataTableProps<TData>) {
  const isMobile = useIsMobile();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  // Usa i dati filtrati se forniti, altrimenti usa i dati originali
  const tableData = filteredData || data;

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="w-full space-y-4">
      {toolbar && toolbar}
      {isMobile && mobileCardRender ? (
        // Mobile Card View
        <div className="space-y-3">
          {table.getRowModel().rows?.length ? (
            table
              .getRowModel()
              .rows.map((row) => (
                <div key={row.id}>
                  {mobileCardRender(
                    row.original,
                    onRowClick ? () => onRowClick(row.original) : undefined
                  )}
                </div>
              ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">
                    {emptyStateTitle || 'Nessun risultato trovato'}
                  </h3>
                  {emptyStateDescription && (
                    <p className="max-w-md text-muted-foreground">
                      {emptyStateDescription}
                    </p>
                  )}
                  {emptyStateAction && (
                    <div className="pt-2">{emptyStateAction}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        // Desktop Table View
        <div className="rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        className={
                          header.column.id === 'actions'
                            ? 'w-10 pr-4 pl-2'
                            : 'px-6'
                        }
                        key={header.id}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    className={
                      onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''
                    }
                    data-state={row.getIsSelected() && 'selected'}
                    key={row.id}
                    onClick={
                      onRowClick ? () => onRowClick(row.original) : undefined
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        className={
                          cell.column.id === 'actions'
                            ? 'w-10 py-2 pr-4 pl-2'
                            : 'px-6 py-2'
                        }
                        key={cell.id}
                        onClick={
                          cell.column.id === 'actions'
                            ? (e) => e.stopPropagation()
                            : undefined
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    className="px-6 py-12 text-center"
                    colSpan={columns.length}
                  >
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">
                        {emptyStateTitle || 'Nessun risultato trovato'}
                      </h3>
                      {emptyStateDescription && (
                        <p className="mx-auto max-w-md text-muted-foreground">
                          {emptyStateDescription}
                        </p>
                      )}
                      {emptyStateAction && (
                        <div className="pt-2">{emptyStateAction}</div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      {showPagination && table.getPageCount() > 1 && (
        <div className="flex items-center justify-between px-4">
          {showItemCount && (
            <div className="hidden flex-1 text-muted-foreground text-sm lg:flex">
              {table.getFilteredRowModel().rows.length} {itemName} totali
            </div>
          )}
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label className="font-medium text-sm" htmlFor="rows-per-page">
                Righe per pagina
              </Label>
              <Select
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
                value={`${table.getState().pagination.pageSize}`}
              >
                <SelectTrigger className="w-20" id="rows-per-page" size="sm">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center font-medium text-sm">
              Pagina {table.getState().pagination.pageIndex + 1} di{' '}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                className="hidden h-8 w-8 p-0 lg:flex"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.setPageIndex(0)}
                variant="outline"
              >
                <span className="sr-only">Vai alla prima pagina</span>
                <IconChevronsLeft />
              </Button>
              <Button
                className="size-8"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
                size="icon"
                variant="outline"
              >
                <span className="sr-only">Vai alla pagina precedente</span>
                <IconChevronLeft />
              </Button>
              <Button
                className="size-8"
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
                size="icon"
                variant="outline"
              >
                <span className="sr-only">Vai alla pagina successiva</span>
                <IconChevronRight />
              </Button>
              <Button
                className="hidden size-8 lg:flex"
                disabled={!table.getCanNextPage()}
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                size="icon"
                variant="outline"
              >
                <span className="sr-only">Vai all'ultima pagina</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      )}
      {(!showPagination || table.getPageCount() <= 1) && showItemCount && (
        <div className="flex items-center px-4">
          <div className="text-muted-foreground text-sm">
            {table.getFilteredRowModel().rows.length} {itemName} totali
          </div>
        </div>
      )}
    </div>
  );
}
