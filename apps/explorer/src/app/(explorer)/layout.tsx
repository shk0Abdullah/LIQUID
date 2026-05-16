import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/layout/footer'
import { PageTransition } from '@/components/ui/page-transition'

export default function ExplorerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </div>
  )
}
