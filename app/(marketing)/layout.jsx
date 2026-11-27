import SiteHeader from "@/components/marketing/SiteHeader";

export default function MarketingLayout({ children }) {
  return (
    <div className="relative min-h-screen bg-background">
      <div className="main">
        <div className="gradient" />
      </div>
      <SiteHeader />
      <main className="relative z-10">{children}</main>
    </div>
  );
}
