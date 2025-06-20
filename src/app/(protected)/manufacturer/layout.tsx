import React from 'react'
import { ManufacturerSidebar } from '@/components/layout/ManufacturerSidebar';
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
        <ManufacturerSidebar collapsible="icon" />
        <SidebarInset>
          <div className="border-b p-4">
            <SidebarTrigger />
          </div>
          <div>{children}</div>
        </SidebarInset>
      </SidebarProvider>
    );
  }