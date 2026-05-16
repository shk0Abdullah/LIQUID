import Image from 'next/image'
import Link from 'next/link'

export function NavLogo() {
  return (
    <Link
      href="/"
      className="flex shrink-0 items-center gap-2 py-1 outline-none focus-visible:ring-1 focus-visible:ring-ring"
      aria-label="Liquid Explorer home"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm">
        <Image
          src="/image.png"
          alt="Liquid Explorer logo"
          width={36}
          height={36}
          className="object-contain"
          priority
        />
      </div>

      {/* Wordmark */}
      <span className="hidden text-[15px] font-semibold tracking-tight text-foreground sm:block">
        Liquid
      </span>
    </Link>
  )
}
