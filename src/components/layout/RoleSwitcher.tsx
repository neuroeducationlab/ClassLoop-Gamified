import { useNavigate } from 'react-router-dom'
import { GraduationCap, Presentation } from 'lucide-react'
import { useApp, type Role } from '@/context/AppContext'
import { cn } from '@/lib/utils'

const OPTIONS: { role: Role; labelKey: 'teacher' | 'student'; icon: typeof Presentation; to: string }[] = [
  { role: 'teacher', labelKey: 'teacher', icon: Presentation, to: '/teacher' },
  { role: 'student', labelKey: 'student', icon: GraduationCap, to: '/student' },
]

export default function RoleSwitcher() {
  const { role, setRole, t } = useApp()
  const navigate = useNavigate()

  return (
    <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-pink-50 p-1">
      {OPTIONS.map(({ role: value, labelKey, icon: Icon, to }) => (
        <button
          key={value}
          type="button"
          onClick={() => {
            setRole(value)
            navigate(to)
          }}
          className={cn(
            // icon-only on a phone: both labels side by side are wider than the
            // screen and would push the whole page sideways
            'inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm font-medium transition-colors sm:px-3',
            role === value
              ? 'bg-pink-600 text-paper'
              : 'text-grey-600 hover:text-pink-600',
          )}
          aria-label={t(labelKey)}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">{t(labelKey)}</span>
        </button>
      ))}
    </div>
  )
}
