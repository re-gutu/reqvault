"use client";

import {
  createContext,
  createElement,
  useContext,
  useState,
  useCallback,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { ReqVaultRequest, ExecuteResponse } from "@/types";
import { executeApi, historyApi } from "@/lib/queries";

type ReqVaultContextValue = {
  currentRequest: ReqVaultRequest;
  currentResponse: ExecuteResponse | null;
  history: any[];
  isLoading: boolean;
  sendRequest: () => Promise<void>;
  setCurrentRequest: Dispatch<SetStateAction<ReqVaultRequest>>;
};

const ReqVaultContext = createContext<ReqVaultContextValue | null>(null);

function useReqVaultState(): ReqVaultContextValue {
  const [currentRequest, setCurrentRequest] = useState<ReqVaultRequest>({
    name: "unnamed request",
    method: "POST",
    url: "https://jsonplaceholder.typicode.com/posts",
  });
  const [currentResponse, setCurrentResponse] =
    useState<ExecuteResponse | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendRequest = useCallback(async () => {
    // Strong guard - only proceed if we have valid data
    if (!currentRequest || !currentRequest.url || !currentRequest.method) {
      console.warn(
        "Send blocked: invalid or missing currentRequest",
        currentRequest,
      );
      return;
    }

    // Prevent concurrent sends
    if (isLoading) {
      console.warn("Send blocked: already loading");
      return;
    }

    console.log("Sending request with:", {
      method: currentRequest.method,
      url: currentRequest.url,
      hasBody: !!currentRequest.body,
    });

    setIsLoading(true);
    setCurrentResponse(null);

    try {
      const response = await executeApi.run({
        method: currentRequest.method,
        url: currentRequest.url,
        headers: currentRequest.headers || {},
        queryParams: currentRequest.queryParams || {},
        body: currentRequest.body,
        authType: currentRequest.authType,
        authValue: currentRequest.authValue,
        requestId: currentRequest.id || undefined,
      });

      setCurrentResponse(response);

      if (currentRequest.id) {
        const updatedHistory = await historyApi.getForRequest(
          currentRequest.id,
        );
        setHistory(updatedHistory);
      }
    } catch (error: any) {
      console.error("Execution failed:", error);

      let errorMessage = "Unknown error occurred";

      if (error.name === "AbortError") {
        errorMessage = "Request timeout (30s)";
      } else if (
        error.message?.includes("Failed to fetch") ||
        error.message?.includes("NetworkError")
      ) {
        errorMessage =
          "Unable to connect to the URL. Check your internet connection or the URL.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setCurrentResponse({
        status: 0,
        statusText: "Request Failed",
        headers: {},
        body: null,
        durationMs: 0,
        sizeBytes: 0,
        timestamp: new Date().toISOString(),
        error: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentRequest, isLoading]);

  return {
    currentRequest,
    currentResponse,
    history,
    isLoading,
    sendRequest,
    setCurrentRequest,
  };
}

export function ReqVaultProvider({ children }: { children: ReactNode }) {
  const value = useReqVaultState();
  return createElement(ReqVaultContext.Provider, { value }, children);
}

export function useReqVaultContext() {
  const context = useContext(ReqVaultContext);
  if (!context) {
    throw new Error("useReqVaultContext must be used within ReqVaultProvider");
  }
  return context;
}
