import { MessageSquarePlus, Filter } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  onNewChat: () => void;
  onOpenFilters: () => void;
  isTimeWindowActive: boolean;
}

export function AppSidebar({ onNewChat, onOpenFilters, isTimeWindowActive }: AppSidebarProps) {
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onNewChat} disabled={!isTimeWindowActive}>
                  <MessageSquarePlus className="h-5 w-5" />
                  {open && <span>New Chat</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onOpenFilters} disabled={!isTimeWindowActive}>
                  <Filter className="h-5 w-5" />
                  {open && <span>Set Interest Filters</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
