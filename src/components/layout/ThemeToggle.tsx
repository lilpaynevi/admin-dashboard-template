import { Monitor, Moon, Sun } from 'lucide-react';

import { Dropdown, DropdownItem } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useTheme, type ThemePreference } from '@/providers/ThemeProvider';

const OPTIONS: Array<{ value: ThemePreference; label: string; icon: typeof Sun }> = [
  { value: 'light', label: 'Clair', icon: Sun },
  { value: 'dark', label: 'Sombre', icon: Moon },
  // « Système » est une option à part entière, pas un défaut caché : c'est le
  // seul moyen pour l'utilisateur de revenir au suivi automatique.
  { value: 'system', label: 'Système', icon: Monitor },
];

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <Dropdown
      trigger={() => (
        <button
          type="button"
          aria-label="Changer de thème"
          className="flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-raised hover:text-foreground"
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="size-[18px]" aria-hidden="true" />
          ) : (
            <Sun className="size-[18px]" aria-hidden="true" />
          )}
        </button>
      )}
    >
      {OPTIONS.map((option) => (
        <DropdownItem
          key={option.value}
          icon={<option.icon className="size-4" />}
          onClick={() => setTheme(option.value)}
        >
          <span className={cn(theme === option.value && 'font-semibold text-primary')}>
            {option.label}
          </span>
        </DropdownItem>
      ))}
    </Dropdown>
  );
}
