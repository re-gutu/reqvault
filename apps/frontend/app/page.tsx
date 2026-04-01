import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Homeview from "@/components/home-view";

export default function Home() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <Homeview />
    </SidebarProvider>
  );
}
