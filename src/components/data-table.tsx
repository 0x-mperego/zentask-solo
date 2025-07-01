'use client';

import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconLoader,
  IconTrendingUp,
} from '@tabler/icons-react';
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table';
import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { toast } from 'sonner';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useIsMobile } from '@/hooks/use-mobile';

export const schema = z.object({
  id: z.number(),
  header: z.string(),
  type: z.string(),
  status: z.string(),
  target: z.string(),
  limit: z.string(),
  reviewer: z.string(),
});

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    accessorKey: 'header',
    header: 'Header',
    cell: ({ row }) => {
      return <span className="font-medium">{row.original.header}</span>;
    },
    enableHiding: false,
  },
  {
    accessorKey: 'type',
    header: 'Section Type',
    cell: ({ row }) => (
      <div className="w-32">
        <Badge className="px-1.5 text-muted-foreground" variant="outline">
          {row.original.type}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge className="px-1.5 text-muted-foreground" variant="outline">
        {row.original.status === 'Done' ? (
          <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
        ) : (
          <IconLoader />
        )}
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: 'target',
    header: 'Target',
    cell: ({ row }) => (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
            loading: `Saving ${row.original.header}`,
            success: 'Done',
            error: 'Error',
          });
        }}
      >
        <Label className="sr-only" htmlFor={`${row.original.id}-target`}>
          Target
        </Label>
        <Input
          className="h-8 w-16 border-transparent bg-transparent shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background dark:bg-transparent dark:focus-visible:bg-input/30 dark:hover:bg-input/30"
          defaultValue={row.original.target}
          id={`${row.original.id}-target`}
          onClick={(e) => e.stopPropagation()}
        />
      </form>
    ),
  },
  {
    accessorKey: 'limit',
    header: 'Limit',
    cell: ({ row }) => (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
            loading: `Saving ${row.original.header}`,
            success: 'Done',
            error: 'Error',
          });
        }}
      >
        <Label className="sr-only" htmlFor={`${row.original.id}-limit`}>
          Limit
        </Label>
        <Input
          className="h-8 w-16 border-transparent bg-transparent shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background dark:bg-transparent dark:focus-visible:bg-input/30 dark:hover:bg-input/30"
          defaultValue={row.original.limit}
          id={`${row.original.id}-limit`}
          onClick={(e) => e.stopPropagation()}
        />
      </form>
    ),
  },
  {
    accessorKey: 'reviewer',
    header: 'Reviewer',
    cell: ({ row }) => {
      const isAssigned = row.original.reviewer !== 'Assign reviewer';

      if (isAssigned) {
        return row.original.reviewer;
      }

      return (
        <>
          <Label className="sr-only" htmlFor={`${row.original.id}-reviewer`}>
            Reviewer
          </Label>
          <Select>
            <SelectTrigger
              className="w-38 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
              id={`${row.original.id}-reviewer`}
              onClick={(e) => e.stopPropagation()}
              size="sm"
            >
              <SelectValue placeholder="Assign reviewer" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
              <SelectItem value="Jamik Tashpulatov">
                Jamik Tashpulatov
              </SelectItem>
            </SelectContent>
          </Select>
        </>
      );
    },
  },
  {
    id: 'actions',
    size: 40,
    maxSize: 40,
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
            size="icon"
            variant="ghost"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Make a copy</DropdownMenuItem>
          <DropdownMenuItem>Favorite</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

const chartData = [
  { month: 'January', desktop: 186, mobile: 80 },
  { month: 'February', desktop: 305, mobile: 200 },
  { month: 'March', desktop: 237, mobile: 120 },
  { month: 'April', desktop: 73, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'June', desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'var(--primary)',
  },
  mobile: {
    label: 'Mobile',
    color: 'var(--primary)',
  },
} satisfies ChartConfig;

export function DataTable({
  data: initialData,
}: {
  data: z.infer<typeof schema>[];
}) {
  const [data] = React.useState(() => initialData);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [selectedItem, setSelectedItem] = React.useState<z.infer<
    typeof schema
  > | null>(null);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const isMobile = useIsMobile();

  const handleRowClick = (item: z.infer<typeof schema>) => {
    setSelectedItem(item);
    setIsSheetOpen(true);
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="w-full flex-col justify-start gap-6">
      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
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
                        colSpan={header.colSpan}
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
                    className="cursor-pointer hover:bg-muted/50"
                    key={row.id}
                    onClick={() => handleRowClick(row.original)}
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
                    className="h-24 px-6 py-2 text-center"
                    colSpan={columns.length}
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="hidden flex-1 text-muted-foreground text-sm lg:flex">
            {table.getFilteredRowModel().rows.length} interventi totali
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label className="font-medium text-sm" htmlFor="rows-per-page">
                Rows per page
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
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                className="hidden h-8 w-8 p-0 lg:flex"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.setPageIndex(0)}
                variant="outline"
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                className="size-8"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
                size="icon"
                variant="outline"
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                className="size-8"
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
                size="icon"
                variant="outline"
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                className="hidden size-8 lg:flex"
                disabled={!table.getCanNextPage()}
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                size="icon"
                variant="outline"
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </div>
      {selectedItem && (
        <>
          {isMobile ? (
            <Drawer
              direction="bottom"
              onOpenChange={setIsSheetOpen}
              open={isSheetOpen}
            >
              <DrawerContent>
                <DrawerHeader className="gap-1">
                  <DrawerTitle>{selectedItem.header}</DrawerTitle>
                  <DrawerDescription>
                    Showing total visitors for the last 6 months
                  </DrawerDescription>
                </DrawerHeader>
                <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
                  <form className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3">
                      <Label htmlFor="header">Header</Label>
                      <Input defaultValue={selectedItem.header} id="header" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-3">
                        <Label htmlFor="type">Type</Label>
                        <Select defaultValue={selectedItem.type}>
                          <SelectTrigger className="w-full" id="type">
                            <SelectValue placeholder="Select a type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Table of Contents">
                              Table of Contents
                            </SelectItem>
                            <SelectItem value="Executive Summary">
                              Executive Summary
                            </SelectItem>
                            <SelectItem value="Technical Approach">
                              Technical Approach
                            </SelectItem>
                            <SelectItem value="Design">Design</SelectItem>
                            <SelectItem value="Capabilities">
                              Capabilities
                            </SelectItem>
                            <SelectItem value="Focus Documents">
                              Focus Documents
                            </SelectItem>
                            <SelectItem value="Narrative">Narrative</SelectItem>
                            <SelectItem value="Cover Page">
                              Cover Page
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-3">
                        <Label htmlFor="status">Status</Label>
                        <Select defaultValue={selectedItem.status}>
                          <SelectTrigger className="w-full" id="status">
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Done">Done</SelectItem>
                            <SelectItem value="In Progress">
                              In Progress
                            </SelectItem>
                            <SelectItem value="Not Started">
                              Not Started
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-3">
                        <Label htmlFor="target">Target</Label>
                        <Input defaultValue={selectedItem.target} id="target" />
                      </div>
                      <div className="flex flex-col gap-3">
                        <Label htmlFor="limit">Limit</Label>
                        <Input defaultValue={selectedItem.limit} id="limit" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Label htmlFor="reviewer">Reviewer</Label>
                      <Select defaultValue={selectedItem.reviewer}>
                        <SelectTrigger className="w-full" id="reviewer">
                          <SelectValue placeholder="Select a reviewer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
                          <SelectItem value="Jamik Tashpulatov">
                            Jamik Tashpulatov
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </form>
                </div>
                <DrawerFooter>
                  <Button>Submit</Button>
                  <DrawerClose asChild>
                    <Button variant="outline">Done</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          ) : (
            <Drawer
              direction="right"
              onOpenChange={setIsSheetOpen}
              open={isSheetOpen}
            >
              <DrawerContent>
                <DrawerHeader className="gap-1">
                  <DrawerTitle>{selectedItem.header}</DrawerTitle>
                  <DrawerDescription>
                    Showing total visitors for the last 6 months
                  </DrawerDescription>
                </DrawerHeader>
                <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
                  <ChartContainer config={chartConfig}>
                    <AreaChart
                      accessibilityLayer
                      data={chartData}
                      margin={{
                        left: 0,
                        right: 10,
                      }}
                    >
                      <CartesianGrid vertical={false} />
                      <XAxis
                        axisLine={false}
                        dataKey="month"
                        hide
                        tickFormatter={(value) => value.slice(0, 3)}
                        tickLine={false}
                        tickMargin={8}
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent indicator="dot" />}
                        cursor={false}
                      />
                      <Area
                        dataKey="mobile"
                        fill="var(--color-mobile)"
                        fillOpacity={0.6}
                        stackId="a"
                        stroke="var(--color-mobile)"
                        type="natural"
                      />
                      <Area
                        dataKey="desktop"
                        fill="var(--color-desktop)"
                        fillOpacity={0.4}
                        stackId="a"
                        stroke="var(--color-desktop)"
                        type="natural"
                      />
                    </AreaChart>
                  </ChartContainer>
                  <Separator />
                  <div className="grid gap-2">
                    <div className="flex gap-2 font-medium leading-none">
                      Trending up by 5.2% this month{' '}
                      <IconTrendingUp className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                      Showing total visitors for the last 6 months. This is just
                      some random text to test the layout. It spans multiple
                      lines and should wrap around.
                    </div>
                  </div>
                  <Separator />
                  <form className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3">
                      <Label htmlFor="header">Header</Label>
                      <Input defaultValue={selectedItem.header} id="header" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-3">
                        <Label htmlFor="type">Type</Label>
                        <Select defaultValue={selectedItem.type}>
                          <SelectTrigger className="w-full" id="type">
                            <SelectValue placeholder="Select a type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Table of Contents">
                              Table of Contents
                            </SelectItem>
                            <SelectItem value="Executive Summary">
                              Executive Summary
                            </SelectItem>
                            <SelectItem value="Technical Approach">
                              Technical Approach
                            </SelectItem>
                            <SelectItem value="Design">Design</SelectItem>
                            <SelectItem value="Capabilities">
                              Capabilities
                            </SelectItem>
                            <SelectItem value="Focus Documents">
                              Focus Documents
                            </SelectItem>
                            <SelectItem value="Narrative">Narrative</SelectItem>
                            <SelectItem value="Cover Page">
                              Cover Page
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-3">
                        <Label htmlFor="status">Status</Label>
                        <Select defaultValue={selectedItem.status}>
                          <SelectTrigger className="w-full" id="status">
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Done">Done</SelectItem>
                            <SelectItem value="In Progress">
                              In Progress
                            </SelectItem>
                            <SelectItem value="Not Started">
                              Not Started
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-3">
                        <Label htmlFor="target">Target</Label>
                        <Input defaultValue={selectedItem.target} id="target" />
                      </div>
                      <div className="flex flex-col gap-3">
                        <Label htmlFor="limit">Limit</Label>
                        <Input defaultValue={selectedItem.limit} id="limit" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Label htmlFor="reviewer">Reviewer</Label>
                      <Select defaultValue={selectedItem.reviewer}>
                        <SelectTrigger className="w-full" id="reviewer">
                          <SelectValue placeholder="Select a reviewer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
                          <SelectItem value="Jamik Tashpulatov">
                            Jamik Tashpulatov
                          </SelectItem>
                          <SelectItem value="Emily Whalen">
                            Emily Whalen
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </form>
                </div>
                <DrawerFooter>
                  <Button>Submit</Button>
                  <DrawerClose asChild>
                    <Button variant="outline">Done</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          )}
        </>
      )}
    </div>
  );
}
