"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { deleteCookie } from "cookies-next";
import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  Truck,
  QrCode,
  BarChart3,
  Leaf,
  LogOut,
  User,
  Factory,
} from "lucide-react";
import Image from "next/image";

export function ManufacturerSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();

  const handleLogout = () => {
    deleteCookie("ykapptoken");
    router.push("/");
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between p-2">
          <SidebarTrigger className="ml-auto" />
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/manufacturer">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-green-600">
                  <Factory className="text-white size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Manufacturer</span>
                  <span className="truncate text-xs">NeevTrace Platform</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="py-6 text-lg duration-200 transition-colors"
                  asChild
                >
                  <Link href="/manufacturer">
                    <LayoutDashboard className="!size-5" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  className="py-6 text-lg duration-200 transition-colors"
                  asChild
                >
                  <Link href="/manufacturer/batch-registration">
                    <Package className="!size-5" />
                    <span>Batch Registration</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  className="py-6 text-lg duration-200 transition-colors"
                  asChild
                >
                  <Link href="/manufacturer/batches">
                    <BarChart3 className="!size-5" />
                    <span>Batch Management</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="!size-5" />
                <span>Logout</span>
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
