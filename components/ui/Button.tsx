// components/ui/Button.tsx
import Link from 'next/link'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md'

type BaseProps = {
  variant?: Variant
  size?: Size
  children: React.ReactNode
  className?: string
}

const styles: Record<Variant, string> = {
  primary:
    'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 hover:from-emerald-600 hover:to-emerald-700',
  secondary:
    'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300',
  danger:
    'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100',
  ghost: 'text-slate-600 hover:bg-slate-100',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex items-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${sizes[size]} ${className}`}
      style={{ fontFamily: 'var(--font-jakarta)' }}
      {...props}
    >
      {children}
    </button>
  )
}

export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  children,
  className = '',
}: BaseProps & { href: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 font-medium transition-all duration-200 ${styles[variant]} ${sizes[size]} ${className}`}
      style={{ fontFamily: 'var(--font-jakarta)' }}
    >
      {children}
    </Link>
  )
}