import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Homeview from "@/components/home-view";
import { ReqVaultProvider } from "@/hooks/use-vault";


export default function Home() {
  return (
    <ReqVaultProvider>
      <SidebarProvider>
        <AppSidebar />
        <Homeview />
      </SidebarProvider>
    </ReqVaultProvider>
  );
}
