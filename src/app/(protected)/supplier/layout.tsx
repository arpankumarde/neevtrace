import React from 'react'
import { SupplierSidebar } from '@/components/layout/SupplierSidebar';
import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
  } from "@/components/ui/sidebar";

  export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <SidebarProvider>
        <SupplierSidebar collapsible="icon" />
        <SidebarInset>
          <div className="border-b p-4">
            <SidebarTrigger />
          </div>
          <div>{children}</div>
        </SidebarInset>
      </SidebarProvider>
    );
  }