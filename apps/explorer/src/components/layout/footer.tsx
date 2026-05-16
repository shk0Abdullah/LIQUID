import Link from 'next/link'
import { Blocks, ArrowLeftRight, Network, Droplets } from 'lucide-react'

const exploreLinks = [
  { label: 'Blocks', href: '/blocks', icon: Blocks },
  { label: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
]

const networkLinks = [
  { label: 'Nodes', href: '/nodes', icon: Network },
]

export function Footer() {
  return (
    <footer className="mt-auto border-t-4 border-primary bg-secondary text-white/70">
      {/* Main content */}
      <div className="mx-auto max-w-container px-4 py-10 lg:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20">
                <Droplets className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-bold text-white">Liquid Explorer</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-white/50">
              A real-time blockchain network explorer for the Liquid distributed ledger. Track
              blocks, transactions, and peer nodes as they propagate through the network.
            </p>
          </div>

          {/* Explore column */}
          <div>
            <h3 className="mb-3 text-2xs font-semibold uppercase tracking-widest text-white/40">
              Explore
            </h3>
            <ul className="space-y-2">
              {exploreLinks.map(({ label, href, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="flex items-center gap-2 text-xs text-white/60 transition-colors hover:text-white"
                  >
                    <Icon className="h-3.5 w-3.5 text-primary/70" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Network column */}
          <div>
            <h3 className="mb-3 text-2xs font-semibold uppercase tracking-widest text-white/40">
              Network
            </h3>
            <ul className="space-y-2">
              {networkLinks.map(({ label, href, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="flex items-center gap-2 text-xs text-white/60 transition-colors hover:text-white"
                  >
                    <Icon className="h-3.5 w-3.5 text-primary/70" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Status indicator */}
            <div className="mt-4 flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-2xs text-white/40">All systems operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-container items-center justify-between px-4 py-3 lg:px-6">
          <p className="text-2xs text-white/30">
            © {new Date().getFullYear()} Liquid Explorer
          </p>
          <p className="text-2xs text-white/30">Built on the Liquid Network</p>
        </div>
      </div>
    </footer>
  )
}
