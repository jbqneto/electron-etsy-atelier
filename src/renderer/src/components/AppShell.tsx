import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Settings, MonitorCheck } from 'lucide-react'

type NavigationItem = {
  label: string
  icon: LucideIcon
  active?: boolean
}

type AppShellProps = {
  navigationItems: NavigationItem[]
  pingMessage: string
  pingStatus: 'idle' | 'loading' | 'success' | 'error'
  onPing: () => void
  children: ReactNode
}

export function AppShell({
  navigationItems,
  pingMessage,
  pingStatus,
  onPing,
  children
}: AppShellProps): React.JSX.Element {
  return (
    <div className="flex h-[100dvh] min-w-[920px] bg-zinc-950 text-zinc-100">
      <aside className="flex w-14 flex-col items-center justify-between border-r border-zinc-800 bg-zinc-950 py-3">
        <div className="flex flex-col gap-2">
          {navigationItems.map((item) => {
            const Icon = item.icon

            return (
              <button
                key={item.label}
                aria-label={item.label}
                className={`grid size-10 place-items-center border-l-2 transition ${
                  item.active
                    ? 'border-amber-400 bg-zinc-900 text-amber-300'
                    : 'border-transparent text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200'
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
          aria-label="Settings"
          className="grid size-10 place-items-center text-zinc-500 transition hover:bg-zinc-900 hover:text-zinc-200"
          title="Settings"
          type="button"
        >
          <Settings size={18} strokeWidth={1.8} />
        </button>
      </aside>

      <aside className="flex w-72 flex-col border-r border-zinc-800 bg-[#1f1f23]">
        <div className="border-b border-zinc-800 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            The Atelier
          </p>
          <h2 className="mt-1 text-sm font-semibold text-zinc-100">Production Workspace</h2>
        </div>

        <nav className="flex-1 overflow-hidden px-2 py-3">
          <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Modules
          </div>
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon

              return (
                <button
                  key={item.label}
                  className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition ${
                    item.active
                      ? 'bg-amber-400/10 text-amber-200 ring-1 ring-inset ring-amber-300/20'
                      : 'text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-100'
                  }`}
                  type="button"
                >
                  <Icon size={16} strokeWidth={1.8} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </nav>

        <div className="border-t border-zinc-800 p-3">
          <div className="rounded-md border border-zinc-800 bg-zinc-950/55 p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-300">
              <MonitorCheck size={15} className="text-amber-300" />
              Secure IPC check
            </div>
            <button
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-amber-300 px-3 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-amber-200 active:translate-y-px disabled:cursor-wait disabled:opacity-70"
              disabled={pingStatus === 'loading'}
              onClick={onPing}
              type="button"
            >
              {pingStatus === 'loading' ? 'Checking...' : 'Ping main process'}
            </button>
            <p
              className={`mt-3 min-h-9 rounded border px-2.5 py-2 text-xs leading-5 ${
                pingStatus === 'error'
                  ? 'border-red-500/30 bg-red-500/10 text-red-200'
                  : 'border-zinc-800 bg-zinc-900/70 text-zinc-400'
              }`}
            >
              {pingMessage}
            </p>
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  )
}
