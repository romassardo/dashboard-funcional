import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'glass-card rounded-lg p-6 shadow-xl',
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: CardProps) {
  return (
    <div className={cn('flex flex-col space-y-1.5 mb-4', className)} {...props} />
  )
}

export function CardTitle({ className, ...props }: CardProps) {
  return (
    <h3 className={cn('text-xl font-semibold leading-none tracking-tight', className)} {...props} />
  )
}

export function CardDescription({ className, ...props }: CardProps) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
}

export function CardContent({ className, ...props }: CardProps) {
  return <div className={cn('pt-0', className)} {...props} />
}
