import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../lib/theme'

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  return <button aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'} className="grid size-10 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={toggleTheme} type="button">{isDark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}</button>
}
