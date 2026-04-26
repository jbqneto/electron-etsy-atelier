import { useState, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Boxes, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

type NavigationItem = {
  label: string
  icon: LucideIcon
  active?: boolean
}

type AppShellProps = {
  navigationItems: NavigationItem[]
  children: ReactNode
}

export function AppShell({
  navigationItems,
  children
}: AppShellProps): React.JSX.Element {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const ToggleIcon = isSidebarCollapsed ? PanelLeftOpen : PanelLeftClose

  return (
    <div className="relative flex h-[100dvh] min-w-[920px] overflow-hidden bg-[#101216] text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(214,174,78,0.11),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(255,255,255,0.04),_transparent_28%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.015),transparent_28%,rgba(0,0,0,0.18)_100%)]" />

      <aside className="relative z-10 flex w-16 flex-col items-center justify-between border-r border-white/5 bg-[#0f1115]/95 py-3">
        <div className="flex flex-col items-center gap-3">
          <div className="grid size-10 place-items-center rounded-2xl border border-amber-300/15 bg-amber-300/10 text-amber-300 shadow-[0_0_0_1px_rgba(217,176,74,0.08),0_16px_30px_rgba(0,0,0,0.28)]">
            <Boxes size={16} strokeWidth={1.8} />
          </div>
          {navigationItems.map((item) => {
            const Icon = item.icon

            return (
              <button
                key={item.label}
                aria-label={item.label}
                className={`grid size-10 place-items-center rounded-2xl border transition duration-200 ${
                  item.active
                    ? 'border-amber-300/20 bg-amber-300/10 text-amber-200 shadow-[0_8px_24px_rgba(214,174,78,0.12)]'
                    : 'border-transparent text-zinc-500 hover:bg-white/5 hover:text-zinc-200'
                }`}
                title={item.label}
                type="button"
              >
                <Icon size={18} strokeWidth={1.8} />
              </button>
            )
          })}
        </div>
        <button
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="grid size-10 place-items-center rounded-2xl text-zinc-500 transition duration-200 hover:bg-white/5 hover:text-zinc-200"
          onClick={() => setIsSidebarCollapsed((current) => !current)}
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          type="button"
        >
          <ToggleIcon size={18} strokeWidth={1.8} />
        </button>
      </aside>

      {!isSidebarCollapsed ? (
        <aside className="relative z-10 flex w-80 flex-col border-r border-white/5 bg-[#13161b]/96 backdrop-blur-xl">
          <div className="border-b border-white/5 px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
              The Atelier
            </p>
            <div className="mt-1 flex items-end justify-between gap-3">
              <h2 className="text-base font-semibold tracking-[-0.02em] text-zinc-50">
                Production Workspace
              </h2>
              <span className="rounded-full border border-amber-300/15 bg-amber-300/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-amber-200">
                Local
              </span>
            </div>
          </div>

          <nav className="flex-1 overflow-hidden px-4 py-4">
            <div className="mb-3 flex items-center justify-between px-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Modules
              <span className="text-zinc-600">6</span>
            </div>
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon

                return (
                  <button
                    key={item.label}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition duration-200 ${
                      item.active
                        ? 'border border-amber-300/15 bg-amber-300/10 text-amber-100 shadow-[0_10px_30px_rgba(214,174,78,0.08)]'
                        : 'border border-transparent text-zinc-400 hover:border-white/5 hover:bg-white/5 hover:text-zinc-100'
                    }`}
                    type="button"
                  >
                    <Icon size={16} strokeWidth={1.8} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </nav>

      </aside>
      ) : null}

      <main className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col bg-[#101317]/80 backdrop-blur-[2px]">
        {children}
      </main>
    </div>
  )
}
