'use client';

import { IconInnerShadowTop } from '@tabler/icons-react';
import { Contact, Logs, Settings2 } from 'lucide-react';
import type * as React from 'react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
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
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';

// Data for ZenTask navigation
const data = {
  navMain: [
    {
      title: 'Interventi',
      url: '/',
      icon: Logs,
      isActive: true,
    },
    {
      title: 'Clienti',
      url: '/clienti',
      icon: Contact,
    },
    {
      title: 'Impostazioni',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'Generali',
          url: '/impostazioni/generali',
        },
        {
          title: 'Utenti',
          url: '/impostazioni/utenti',
        },
        {
          title: 'Attività',
          url: '/impostazioni/attivita',
        },
        {
          title: 'Stati',
          url: '/impostazioni/stati',
        },
      ],
    },
  ],
};

function CompanySwitcher() {
  const { companyName, companyDescription, companyLogo } = useSettings();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild size="lg">
          <a href="/">
            {companyLogo ? (
              <img
                alt={companyName}
                className="aspect-square size-8 rounded-lg object-contain"
                src={companyLogo}
              />
            ) : (
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
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
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const { userAvatar } = useSettings();

  // Create user data for NavUser component
  const userData = {
    name: user ? `${user.firstName} ${user.lastName}` : 'Admin User',
    email: user?.email || 'admin@zentask.local',
    avatar: userAvatar || '/avatars/admin.jpg',
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <CompanySwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
