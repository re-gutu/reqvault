'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "./ui/badge";
import { useReqVaultContext } from "@/hooks/use-vault";

const ResponsePane = () => {
  const { currentResponse, isLoading } = useReqVaultContext();

  const statusLabel = isLoading
    ? "Sending"
    : currentResponse?.statusText || "No response";
  const durationLabel = isLoading
    ? "..."
    : currentResponse
      ? `${currentResponse.durationMs}ms`
      : "-";

  return (
    <div className="w-full h-full ">
      <div className="p-5 flex gap-6 font-mono">
        <Badge variant={"ghost"} className="border-l-primary text-sm">
          {statusLabel}
        </Badge>
        <Badge variant={"ghost"} className="text-muted-foreground flex items-start">
          {durationLabel}
        </Badge>
      </div>
      <Tabs defaultValue="account" className="w-full h-full">
        <TabsList variant={"line"} className="w-full flex justify-between p-0">
          <div>
            <TabsTrigger value="body">Body</TabsTrigger>
            <TabsTrigger value="headers">Headers</TabsTrigger>
          </div>
        </TabsList>
        <TabsContent value="body">
          <div className="w-full h-full flex items-center justify-center bg-muted"></div>
        </TabsContent>
        <TabsContent value="headers">
          <div className="w-full h-full flex items-center justify-center bg-muted"></div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResponsePane;
