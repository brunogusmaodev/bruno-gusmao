"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Tag,
  Kanban,
  ListTodo,
  PartyPopper,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { signOut, useSession } from "@/lib/auth-client";

const NAV_PAINEL = [{ label: "Dashboard", href: "/ControlPanel", icon: LayoutDashboard }];
const NAV_CONTEUDO = [
  { label: "Projetos", href: "/ControlPanel/projects", icon: FolderKanban },
  { label: "Posts", href: "/ControlPanel/posts", icon: FileText },
  { label: "Badges", href: "/ControlPanel/badges", icon: Tag },
];
const NAV_ORGANIZACAO = [
  { label: "Kanban", href: "/ControlPanel/kanban", icon: Kanban },
  { label: "Todos", href: "/ControlPanel/todos", icon: ListTodo },
];
const NAV_EVENTO = [{ label: "Evento", href: "/ControlPanel/event", icon: PartyPopper }];

const navGroups = [
  { label: "Painel", items: NAV_PAINEL },
  { label: "Conteúdo", items: NAV_CONTEUDO },
  { label: "Organização", items: NAV_ORGANIZACAO },
  { label: "Evento", items: NAV_EVENTO },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const isActive = (href: string) =>
    href === "/ControlPanel" ? pathname === href : pathname.startsWith(href);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="px-3 py-4">
        <Link href="/" className="flex items-center gap-3 px-1">
          <div className="relative size-8 overflow-hidden rounded-lg bg-gradient-to-br from-brand/20 to-cyan/20 ring-1 ring-border">
            <Image src="/brand/logo-64.png" alt="" fill className="object-contain p-0.5" />
          </div>
          <span className="font-heading text-base font-bold tracking-wider text-foreground group-data-[collapsible=icon]:hidden">
            PAINEL
          </span>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="py-2">
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map(({ label, href, icon: Icon }) => (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      render={<Link href={href} />}
                      isActive={isActive(href)}
                      tooltip={label}
                      className="data-[active=true]:bg-brand/15 data-[active=true]:text-brand"
                    >
                      <Icon className="size-4" />
                      <span className="font-medium">{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="px-3 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              tooltip="Sair"
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="size-4" />
              <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
                <span className="truncate font-heading text-xs text-foreground">
                  {session?.user?.name ?? "Usuário"}
                </span>
                <span className="truncate text-xs text-muted-foreground">Sair da conta</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
