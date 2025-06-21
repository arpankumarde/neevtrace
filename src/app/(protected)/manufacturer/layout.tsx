import React from 'react'
import { ManufacturerSidebar } from '@/components/layout/ManufacturerSidebar';
import {
    SidebarProvider,
    SidebarInset,
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
          <div>{children}</div>
        </SidebarInset>
      </SidebarProvider>
    );
  }