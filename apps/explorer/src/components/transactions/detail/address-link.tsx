import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { CopyButton } from './copy-button'

interface AddressLinkProps {
  address: string
  showCopy?: boolean
  truncate?: boolean
  className?: string
}

export function AddressLink({
  address,
  showCopy = true,
  truncate = true,
  className,
}: AddressLinkProps) {
  const display = truncate
    ? `${address.slice(0, 14)}…${address.slice(-6)}`
    : address

  return (
    <span className="inline-flex items-center gap-1">
      <Link
        href={`/accounts/${address}`}
        title={address}
        className={cn(
          'font-mono text-sm text-primary underline-offset-2 hover:underline',
          className,
        )}
      >
        {display}
      </Link>
      {showCopy && <CopyButton value={address} />}
    </span>
  )
}
