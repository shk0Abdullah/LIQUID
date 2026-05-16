export interface NavDropdownItem {
  label: string
  href: string
}

export interface NavDropdownSection {
  title?: string
  items: NavDropdownItem[]
}

export interface NavItem {
  label: string
  href?: string
  sections?: NavDropdownSection[]
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'Blockchain',
    sections: [
      {
        title: 'Transactions',
        items: [
          { label: 'View All Transactions', href: '/transactions' },
          { label: 'Pending Transactions', href: '/transactions/pending' },
        ],
      },
      {
        title: 'Blocks',
        items: [
          { label: 'View All Blocks', href: '/blocks' },
          { label: 'Forked Blocks (Reorgs)', href: '/blocks/forked' },
        ],
      },
      {
        title: 'Accounts',
        items: [
          { label: 'Top Accounts', href: '/accounts' },
        ],
      },
    ],
  },
  {
    label: 'Network',
    sections: [
      {
        items: [
          { label: 'Nodes', href: '/nodes' },
          { label: 'Validators', href: '/validators' },
          { label: 'Network Stats', href: '/stats' },
          { label: 'Peer Map', href: '/peers' },
        ],
      },
    ],
  },
  {
    label: 'Resources',
    sections: [
      {
        items: [
          { label: 'Charts & Statistics', href: '/charts' },
          { label: 'API Documentation', href: '/api-docs' },
          { label: 'Knowledge Base', href: '/docs' },
        ],
      },
    ],
  },
]
