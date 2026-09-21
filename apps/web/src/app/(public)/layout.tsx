import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { EventPopupProvider } from "@/hooks/use-event-popup";
import { EventPopup } from "@/components/layout/event-popup";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <EventPopupProvider>
      <div className="relative flex min-h-screen flex-col">
        <Header />
        <div className="h-20" />
        <main className="flex-1">{children}</main>
        <Footer />
        <EventPopup />
      </div>
    </EventPopupProvider>
  );
}
