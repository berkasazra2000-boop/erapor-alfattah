// components/ui/PageHeader.tsx

type Props = {
  title: string
  subtitle?: string
  badge?: string
  actions?: React.ReactNode
}

export default function PageHeader({ title, subtitle, badge, actions }: Props) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
      <div>
        {badge && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {badge}
          </div>
        )}
        <h1
          className="text-2xl md:text-3xl font-bold text-slate-900"
          style={{ fontFamily: 'var(--font-jakarta)' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-slate-500 mt-1.5">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}