import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { type NavDropdownSection } from './nav-items'

interface NavDropdownProps {
  sections: NavDropdownSection[]
  className?: string
}

export function NavDropdown({ sections, className }: NavDropdownProps) {
  return (
    <div
      className={cn(
        'absolute left-0 top-[calc(100%+1px)] z-50 min-w-[220px] rounded-md border border-border bg-card py-2 shadow-[0_4px_20px_rgba(0,0,0,0.35)]',
        className,
      )}
    >
      {sections.map((section, si) => (
        <div key={si}>
          {si > 0 && <div className="my-1.5 border-t border-border" />}

          {section.title && (
            <div className="px-4 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              {section.title}
            </div>
          )}

          {section.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-4 py-[7px] text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </div>
      ))}
    </div>
  )
}
