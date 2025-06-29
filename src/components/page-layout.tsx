"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { 
  SidebarInset, 
  SidebarProvider, 
  SidebarTrigger 
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { PageHeader } from "@/components/page-header"
import { ContentWrapper } from "@/components/content-wrapper"
import { useAuth } from "@/contexts/AuthContext"
import { ThemeToggle } from "@/components/theme-toggle"

interface PageLayoutProps {
  children: React.ReactNode
  // Props for basic layout (old PageLayout behavior)
  breadcrumbItems?: Array<{
    label: string
    href?: string
    isCurrentPage?: boolean
  }>
  requireAuth?: boolean
  // Props for management layout (old ManagementPageLayout behavior)
  title?: string
  description?: string
  customActionButton?: React.ReactNode
  parentPage?: string
  parentHref?: string
  showParentBreadcrumb?: boolean
  isAdminPage?: boolean
}

export function PageLayout({
  children,
  breadcrumbItems = [],
  requireAuth = true,
  title,
  description,
  customActionButton,
  parentPage,
  parentHref,
  showParentBreadcrumb = false,
  isAdminPage = false,
}: PageLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth()

  if (requireAuth && (isLoading || !isAuthenticated)) {
    return null
  }

  // Se title è fornito, usa il comportamento ManagementPageLayout
  const isManagementMode = !!title

  // Costruisce l'array di breadcrumb items per management mode
  let finalBreadcrumbItems = breadcrumbItems
  
  if (isManagementMode) {
    const managementBreadcrumbs = []
    
    if (isAdminPage) {
      managementBreadcrumbs.push({
        label: "Impostazioni",
        // Nessun href - non cliccabile
      })
    }
    
    if (showParentBreadcrumb && parentPage && parentHref) {
      managementBreadcrumbs.push({
        label: parentPage,
        href: parentHref
      })
    }
    
    managementBreadcrumbs.push({
      label: title,
      isCurrentPage: true
    })

    finalBreadcrumbItems = managementBreadcrumbs
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-end gap-2 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <ThemeToggle />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <SidebarTrigger className="-ml-2 mb-2" />
          {isManagementMode ? (
            <>
              <PageHeader title={title} description={description} actionButton={customActionButton} />
              <ContentWrapper>
                {children}
              </ContentWrapper>
            </>
          ) : (
            children
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 