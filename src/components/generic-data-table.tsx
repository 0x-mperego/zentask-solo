"use client"

import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useIsMobile } from "@/hooks/use-mobile"

interface GenericDataTableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData>[]
  showPagination?: boolean
  showItemCount?: boolean
  onRowClick?: (row: TData) => void
  itemName?: string
  mobileCardRender?: (item: TData, onClick?: () => void) => React.ReactNode
  emptyStateTitle?: string
  emptyStateDescription?: string
  emptyStateAction?: React.ReactNode
  toolbar?: React.ReactNode
  // Supporto per ricerca e filtri
  searchKey?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  filteredData?: TData[]
}

export function GenericDataTable<TData>({
  data,
  columns,
  showPagination = true,
  showItemCount = true,
  onRowClick,
  itemName = "elementi",
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
  const isMobile = useIsMobile()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )

  // Usa i dati filtrati se forniti, altrimenti usa i dati originali
  const tableData = filteredData || data

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
  })

  return (
    <div className="w-full space-y-4">
      {toolbar && toolbar}
      {isMobile && mobileCardRender ? (
        // Mobile Card View
        <div className="space-y-3">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <div key={row.id}>
                {mobileCardRender(row.original, onRowClick ? () => onRowClick(row.original) : undefined)}
              </div>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    {emptyStateTitle || "Nessun risultato trovato"}
                  </h3>
                  {emptyStateDescription && (
                    <p className="text-muted-foreground max-w-md">
                      {emptyStateDescription}
                    </p>
                  )}
                  {emptyStateAction && (
                    <div className="pt-2">
                      {emptyStateAction}
                    </div>
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
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead 
                        key={header.id}
                        className={header.column.id === "actions" ? "pl-2 pr-4 w-10" : "px-6"}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell 
                        key={cell.id}
                        className={cell.column.id === "actions" ? "pl-2 pr-4 py-2 w-10" : "px-6 py-2"}
                        onClick={cell.column.id === "actions" ? (e) => e.stopPropagation() : undefined}
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
                    colSpan={columns.length}
                    className="text-center px-6 py-12"
                  >
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        {emptyStateTitle || "Nessun risultato trovato"}
                      </h3>
                      {emptyStateDescription && (
                        <p className="text-muted-foreground max-w-md mx-auto">
                          {emptyStateDescription}
                        </p>
                      )}
                      {emptyStateAction && (
                        <div className="pt-2">
                          {emptyStateAction}
                        </div>
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
            <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
              {table.getFilteredRowModel().rows.length} {itemName} totali
            </div>
          )}
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Righe per pagina
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
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
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Pagina {table.getState().pagination.pageIndex + 1} di{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Vai alla prima pagina</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Vai alla pagina precedente</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Vai alla pagina successiva</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
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
  )
}
