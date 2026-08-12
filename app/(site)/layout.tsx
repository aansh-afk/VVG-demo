import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

/** Chrome shared by every public page. The portal has its own shell. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
