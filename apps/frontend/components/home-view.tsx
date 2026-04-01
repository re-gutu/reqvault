import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import RequestPane from "./request-pane";
import ResponsePane from "./response-pane";

const Homeview = () => {
  return (
    <div className="h-screen w-full">
    <ResizablePanelGroup orientation="horizontal">
      <ResizablePanel><RequestPane /></ResizablePanel>
      <ResizableHandle />
      <ResizablePanel><ResponsePane /></ResizablePanel>
    </ResizablePanelGroup></div>
  );
};

export default Homeview;
