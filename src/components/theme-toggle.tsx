import { Moon, Sun } from 'lucide-react'
import { useTheme } from './theme-context'
import { cn } from '~/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white transition hover:bg-white/10',
        className,
      )}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}
