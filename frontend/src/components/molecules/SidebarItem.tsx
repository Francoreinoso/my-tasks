import { NavLink } from 'react-router';
import type { NavItem } from '@/types/navigation';

interface SidebarItemProps {
  item: NavItem;
  collapsed: boolean;
}

export function SidebarItem({ item, collapsed }: SidebarItemProps) {
  const Icon = item.icon;
  const baseClasses =
    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors';

  if (!item.enabled) {
    return (
      <div
        aria-disabled="true"
        title="Próximamente"
        className={`${baseClasses} cursor-not-allowed text-text-subtle`}
      >
        <Icon weight="light" size={20} aria-hidden="true" />
        {!collapsed && (
          <span className="flex-1">
            {item.label}
            <span className="ml-2 text-xs text-text-subtle/60">(pronto)</span>
          </span>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      end
      className={({ isActive }) =>
        `${baseClasses} ${
          isActive
            ? 'bg-accent/15 text-accent'
            : 'text-text-muted hover:bg-bg-elevated hover:text-text-primary'
        }`
      }
      aria-label={item.label}
    >
      <Icon weight="light" size={20} aria-hidden="true" />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );
}
