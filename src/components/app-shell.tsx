"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  BookHeart,
  PanelLeft,
  User,
} from "lucide-react";
import { Logo } from "@/components/logo";

const navItems = [
  { href: "/profile", label: "Profile", icon: User },
  { href: "/diet-plan", label: "Diet Plan", icon: BookHeart },
  { href: "/diet-dashboard", label: "Dashboard", icon: PanelLeft },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/') {
    return <>{children}</>;
  }

  const accent = "#309c3e";

  return (
    <SidebarProvider>
      {/* Sidebar kept only for small screens (mobile drawer) */}
      <div className="md:hidden">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-3">
              <Link href="/">
                <Logo />
              </Link>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      tooltip={{ children: item.label, side: "right" }}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </div>

      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-gradient-to-b from-[#071821] to-[#061419] px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-md overflow-hidden" style={{ background: "rgba(255,255,255,0.03)" }}>
                <img src="/images/logo_project.svg" alt="ChronoDietAI Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-semibold text-slate-100">ChronoDietAI</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm ${pathname === item.href ? 'bg-[rgba(48,156,62,0.14)] text-[#e6f6ec]' : 'text-slate-200 hover:bg-[rgba(255,255,255,0.02)]'}`}
              >
                <item.icon className="inline-block mr-2 align-text-bottom" />
                {item.label}
              </Link>
            ))}

            <SidebarTrigger className="ml-2 md:hidden">
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </SidebarTrigger>
          </nav>

          {/* On small screens show trigger on right */}
          <div className="md:hidden">
            <SidebarTrigger>
              <PanelLeft className="h-5 w-5 text-slate-200" />
            </SidebarTrigger>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
