import { NavLogo } from './nav-logo'
import { NavMenu } from './nav-menu'
import { NavSearch } from './nav-search'
import { MobileMenu } from './mobile-menu'
import { ScrollHeader } from './scroll-header'

export function Navbar() {
  return (
    <ScrollHeader>
      <div className="mx-auto flex h-[60px] max-w-[1400px] items-center gap-1 px-4 lg:px-6">
        {/* Logo */}
        <NavLogo />

        {/* Vertical divider */}
        <div className="mx-2 hidden h-4 w-px shrink-0 bg-border lg:block" aria-hidden="true" />

        {/* Desktop nav */}
        <NavMenu />

        {/* Search bar — fills remaining space on desktop */}
        <div className="ml-auto hidden max-w-[540px] flex-1 items-center pl-2 lg:flex">
          <NavSearch />
        </div>

        {/* Mobile controls */}
        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <MobileMenu />
        </div>
      </div>
    </ScrollHeader>
  )
}
