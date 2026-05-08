import { SidebarItem } from '@/components/molecules/SidebarItem';
import { NAV_ITEMS } from '@/types/navigation';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={`flex flex-col border-r border-border-default bg-bg-surface/80 backdrop-blur-md transition-[width] duration-200 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
      aria-label="Navegación principal"
    >
      <header className="flex items-center justify-between border-b border-border-default p-4">
        {!collapsed && (
          <h1 className="font-mono text-lg tracking-tight text-accent">my-tasks</h1>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          aria-expanded={!collapsed}
          className="ml-auto rounded-md p-2 text-text-muted hover:bg-bg-elevated hover:text-text-primary"
        >
          <span aria-hidden="true" className="block text-lg leading-none">
            {collapsed ? '»' : '«'}
          </span>
        </button>
      </header>

      <nav className="flex flex-col gap-1 p-3">
        {NAV_ITEMS.map((item) => (
          <SidebarItem key={item.id} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {!collapsed && (
        <footer className="mt-auto border-t border-border-default p-4 text-xs text-text-subtle">
          <p>v0.1.0</p>
          <p className="mt-1">Hecho con ☕ y 桜</p>
        </footer>
      )}
    </aside>
  );
}
