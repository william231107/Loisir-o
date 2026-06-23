import Link from "next/link";
import { ProSidebar } from "@/components/ProSidebar";
import { ProMobileNav } from "@/components/ProMobileNav";
import { getProDashboard } from "@/lib/pro";

export default async function ProLayout({ children }: { children: React.ReactNode }) {
  const { professional } = await getProDashboard();
  const companyName = professional?.company_name ?? "Mon établissement";

  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex w-60 flex-shrink-0 bg-ink">
        <ProSidebar companyName={companyName} />
      </aside>

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between px-5 py-3 bg-mist border-b border-sand">
          <Link href="/" className="lg:hidden text-lg font-extrabold font-display">Loisiréo Pro</Link>
          <div className="hidden lg:block" />
          <span className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold bg-ink text-white">
            {companyName.slice(0, 2).toUpperCase()}
          </span>
        </header>

        <ProMobileNav />

        <main className="p-5 max-w-5xl">{children}</main>
      </div>
    </div>
  );
}
