"use client"

import * as React from "react"
import {
  IconInnerShadowTop,
} from "@tabler/icons-react"
import { Settings2, Logs, Contact } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"
import { useSettings } from "@/contexts/SettingsContext"
import { ThemeToggle } from "@/components/ui/theme-toggle"

// Data for ZenTask navigation
const data = {
  navMain: [
    {
      title: "Interventi",
      url: "/",
      icon: Logs,
      isActive: true,
    },
    {
      title: "Clienti",
      url: "/clienti",
      icon: Contact,
    },
    {
      title: "Impostazioni",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Generali",
          url: "/impostazioni/generali",
        },
        {
          title: "Utenti", 
          url: "/impostazioni/utenti",
        },
        {
          title: "Attività",
          url: "/impostazioni/attivita",
        },
        {
          title: "Stati",
          url: "/impostazioni/stati",
        },
      ],
    },
  ],
}

function CompanySwitcher() {
  const { companyName, companyDescription, companyLogo } = useSettings()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          asChild
        >
          <a href="/">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={companyName}
                className="aspect-square size-8 object-contain rounded-lg"
              />
            ) : (
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <IconInnerShadowTop className="size-4" />
              </div>
            )}
            <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate font-medium">{companyName}</span>
              <span className="truncate text-xs">{companyDescription}</span>
            </div>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const { userAvatar } = useSettings()

  // Create user data for NavUser component
  const userData = {
    name: user ? `${user.firstName} ${user.lastName}` : "Admin User",
    email: user?.email || "admin@zentask.local",
    avatar: userAvatar || "/avatars/admin.jpg",
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <CompanySwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className="flex-col !items-stretch !p-0">
        <div className="flex grow flex-col" />
        <div className="p-2">
          <ThemeToggle />
        </div>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

