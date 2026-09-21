import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { getSessionCookieHeader } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Painel Administrativo",
  description: "Gerenciamento de conteúdo do portfolio de Bruno Gusmão.",
  robots: { index: false, follow: false },
};

export default async function ControlPanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const sessionCookie =
    cookieStore.get("__Secure-better-auth.session_token") ??
    cookieStore.get("better-auth.session_token");

  if (!sessionCookie) {
    redirect("/login");
  }

  const authHeaders = await getSessionCookieHeader();
  const base = process.env.API_URL ?? "http://localhost:3001";
  const res = await fetch(`${base}/api/auth/get-session`, {
    headers: authHeaders,
    cache: "no-store",
  });
  const session = await res.json();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="relative min-h-screen bg-background">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-radial opacity-50" />
        <div className="pointer-events-none fixed inset-0 -z-10 bg-dot opacity-20" />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
