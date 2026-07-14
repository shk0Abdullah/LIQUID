export interface NavDropdownItem {
  label: string;
  href: string;
}

export interface NavDropdownSection {
  title?: string;
  items: NavDropdownItem[];
}

export interface NavItem {
  label: string;
  href?: string;
  sections?: NavDropdownSection[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Blockchain",
    sections: [
      {
        title: "Transactions",
        items: [{ label: "View All Transactions", href: "/transactions" }],
      },
      {
        title: "Blocks",
        items: [{ label: "View All Blocks", href: "/blocks" }],
      },
    ],
  },
  {
    label: "Network",
    sections: [
      {
        items: [
          { label: "Nodes", href: "/nodes" },
          { label: "Network Stats", href: "/stats" },
        ],
      },
    ],
  },
];
