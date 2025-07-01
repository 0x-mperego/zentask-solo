import { cn } from '@/lib/utils';

interface ContentWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function ContentWrapper({ children, className }: ContentWrapperProps) {
  return <div className={cn('px-4 lg:px-6', className)}>{children}</div>;
}
