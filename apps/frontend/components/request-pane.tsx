"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";
import { useReqVaultContext } from "@/hooks/use-vault";

const RequestPane = () => {
  const {
    currentRequest,
    setCurrentRequest,
    sendRequest,
    isLoading,
  } = useReqVaultContext();
  const handleSend = () => {
    sendRequest();
  };

  return (
    <div className="w-full h-full flex flex-col gap-2 py-4">
      <div className="w-full flex gap-2 px-4">
        <Select
          value={currentRequest.method}
          onValueChange={(method) =>
            setCurrentRequest((prev) => ({ ...prev, method }))
          }
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="PATCH">PATCH</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Input
          value={currentRequest.url}
          onChange={(e) =>
            setCurrentRequest((prev) => ({ ...prev, url: e.target.value }))
          }
        />
        <Button
          className="px-8 font-heading font-semibold uppercase self-end"
          onClick={handleSend}
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Send"}
        </Button>
      </div>

      <Tabs defaultValue="account" className="w-full h-full">
        <TabsList variant={"line"} className="w-full flex justify-between p-0">
          <div>
            <TabsTrigger value="query-params">Query Params</TabsTrigger>
            <TabsTrigger value="body">Body</TabsTrigger>
            <TabsTrigger value="headers">Headers</TabsTrigger>
            <TabsTrigger value="auth">Auth</TabsTrigger>
          </div>
        </TabsList>
        <TabsContent value="body">
          <div className="w-full h-full flex items-center justify-center bg-muted"></div>
        </TabsContent>
        <TabsContent value="query-params">
          <div className="w-full h-full flex items-center justify-center bg-muted"></div>
        </TabsContent>
        <TabsContent value="headers">
          <div className="w-full h-full flex items-center justify-center bg-muted"></div>
        </TabsContent>
        <TabsContent value="auth">
          <div className="w-full h-full flex items-center justify-center bg-muted"></div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RequestPane;
