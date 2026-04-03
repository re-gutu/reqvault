import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import RequestPane from "./request-pane";
import ResponsePane from "./response-pane";
import { ReqVaultProvider } from "@/hooks/use-vault";

const Homeview = () => {
  return (
    <div className="h-screen w-full">
      <ReqVaultProvider>
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel>
            <RequestPane />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>
            <ResponsePane />
          </ResizablePanel>
        </ResizablePanelGroup>
      </ReqVaultProvider>
    </div>
  );
};

export default Homeview;
