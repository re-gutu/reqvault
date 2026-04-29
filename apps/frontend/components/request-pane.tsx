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
import KeyValueEditor from "./keyvalue-editor";
import type { KeyValuePair } from "./keyvalue-editor";
import BodyEditor from "./body-editor";
import { ChevronDown } from "lucide-react";

const RequestPane = () => {
  const {
    currentRequest,
    setCurrentRequest,
    saveCurrentRequest,
    sendRequest,
    isLoading,
  } = useReqVaultContext();

  const [localQueryParams, setLocalQueryParams] = React.useState<KeyValuePair[]>([]);
  const [localHeaders, setLocalHeaders] = React.useState<KeyValuePair[]>([]);
  const [localAuthType, setLocalAuthType] = React.useState<
    "none" | "bearer" | "basic" | "apikey"
  >("none");
  const [localAuthValue, setLocalAuthValue] = React.useState("");
  const lastHeadersRef = React.useRef<any>(null);
  const lastParamsRef = React.useRef<any>(null);
  const lastRequestIdRef = React.useRef<number | undefined>(undefined);

  // Helper: Convert KeyValuePair[] → object or null
  const convertToObject = (pairs: KeyValuePair[]): Record<string, string> | null => {
    const obj: Record<string, string> = {};
    pairs.forEach(({ key, value }) => {
      const trimmedKey = key.trim();
      const trimmedValue = value.trim();
      if (trimmedKey) {
        obj[trimmedKey] = trimmedValue;
      }
    });
    return Object.keys(obj).length > 0 ? obj : null;
  };

  React.useEffect(() => {
    if (!currentRequest) return;

    // Check if a different request was loaded OR if headers/params were updated externally
    const isNewRequestLoaded = currentRequest.id !== lastRequestIdRef.current;
    const areHeadersUpdatedExternally = currentRequest.headers !== lastHeadersRef.current;
    const areParamsUpdatedExternally = currentRequest.queryParams !== lastParamsRef.current;

    // ONLY sync if one of these is true.
    // If the user is just typing in the URL, these will all be false!
    if (isNewRequestLoaded || areHeadersUpdatedExternally || areParamsUpdatedExternally) {
      setLocalQueryParams(
        Object.entries(currentRequest.queryParams || {}).map(([key, value]) => ({
          key,
          value: String(value),
        })),
      );

      setLocalHeaders(
        Object.entries(currentRequest.headers || {}).map(([key, value]) => ({
          key,
          value: String(value),
        })),
      );
      setLocalAuthType(currentRequest.authType || "none");
      setLocalAuthValue(currentRequest.authValue || "");

      // Update refs to track the current state for the next render
      lastRequestIdRef.current = currentRequest.id;
      lastHeadersRef.current = currentRequest.headers;
      lastParamsRef.current = currentRequest.queryParams;
    }
  }, [currentRequest]);

const handleSend = () => {
  if (!currentRequest) return;

  const queryParamsObj = convertToObject(localQueryParams);
  const headersObj = convertToObject(localHeaders);

  const updatedRequest = {
    ...currentRequest,
    queryParams: queryParamsObj,
    headers: headersObj,
    authType: localAuthType,
    authValue: localAuthType === "none" ? null : localAuthValue.trim() || null,
  };

  // Keep state aligned for the UI
  setCurrentRequest(updatedRequest);

  // Bypasses React state lag by passing the object directly
  sendRequest(updatedRequest);
};

const handleSave = async () => {
  if (!currentRequest) return;

  const queryParamsObj = convertToObject(localQueryParams);
  const headersObj = convertToObject(localHeaders);
  const cleanedName = currentRequest.name.trim() || "Untitled Request";

  const updatedRequest = {
    ...currentRequest,
    name: cleanedName,
    queryParams: queryParamsObj,
    headers: headersObj,
    authType: localAuthType,
    authValue: localAuthType === "none" ? null : localAuthValue.trim() || null,
  };

  try {
    // Passes the clean, up-to-date object
    await saveCurrentRequest(updatedRequest);
  } catch (err) {
    console.error("Save failed", err);
  }
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

      <Tabs defaultValue="body" className="w-full h-full">
        <TabsList variant={"line"} className="w-full flex justify-between p-0">
          <div className="w-full flex justify-between">
            <div>
              <TabsTrigger value="params">Params</TabsTrigger>
              <TabsTrigger value="body">Body</TabsTrigger>
              <TabsTrigger value="headers">Headers</TabsTrigger>
              <TabsTrigger value="auth">Auth</TabsTrigger>
            </div>

            <div className="flex items-center gap-4 p-2">
              <Input
                value={currentRequest.name}
                onChange={(e) =>
                  setCurrentRequest((prev) => ({ ...prev, name: e.target.value }))
                }
                className="h-8 w-56"
                placeholder="Request name"
              />
              <Button 
              variant={"secondary"}
              onClick={handleSave}>
                Save
                <ChevronDown className="ml-1 w-4 h-4" />
              </Button>
            </div>
          </div>
        </TabsList>
        <TabsContent value="params">
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <KeyValueEditor
              title="Query Parameters"
              pairs={localQueryParams}
              onChange={setLocalQueryParams}
              placeholderKey="param"
              placeholderValue="value"
            />
          </div>
        </TabsContent>
        <TabsContent value="body">
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <BodyEditor
              body={currentRequest?.body ?? null}
              onChange={(newBody) =>
                setCurrentRequest((prev) => ({ ...prev, body: newBody }))
              }
            />
          </div>
        </TabsContent>

        <TabsContent value="headers">
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <KeyValueEditor
              title="Headers"
              pairs={localHeaders}
              onChange={setLocalHeaders}
              placeholderKey="Header-Name"
              placeholderValue="Value"
            />
          </div>
        </TabsContent>
        <TabsContent value="auth">
          <div className="w-full h-full bg-muted p-4 flex flex-col gap-3">
            <div className="max-w-xl flex flex-col gap-2">
              <p className="text-sm font-medium">Authentication</p>
              <Select
                value={localAuthType}
                onValueChange={(value) =>
                  setLocalAuthType(value as "none" | "bearer" | "basic" | "apikey")
                }
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="none">No Auth</SelectItem>
                    <SelectItem value="bearer">Bearer Token</SelectItem>
                    <SelectItem value="basic">Basic Auth</SelectItem>
                    <SelectItem value="apikey">API Key</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {localAuthType !== "none" && (
              <div className="max-w-xl flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">
                  {localAuthType === "bearer" && "Bearer token"}
                  {localAuthType === "basic" && "Basic auth value (username:password)"}
                  {localAuthType === "apikey" && "API key value"}
                </p>
                <Input
                  value={localAuthValue}
                  onChange={(e) => setLocalAuthValue(e.target.value)}
                  placeholder={
                    localAuthType === "bearer"
                      ? "token"
                      : localAuthType === "basic"
                        ? "username:password"
                        : "api-key"
                  }
                  className="font-mono"
                />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RequestPane;
