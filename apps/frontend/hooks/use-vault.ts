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
    method: "GET",
    url: "http://localhost:3001/",
  });
  const [currentResponse, setCurrentResponse] =
    useState<ExecuteResponse | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ==================== SEND REQUEST (Only core logic) ====================
  const sendRequest = useCallback(async () => {
    if (!currentRequest) {
      console.warn("No current request to send");
      return;
    }

    setIsLoading(true);
    setCurrentResponse(null); // Clear previous response

    try {
      const response = await executeApi.run({
        method: currentRequest.method,
        url: currentRequest.url,
        headers: currentRequest.headers || {},
        queryParams: currentRequest.queryParams || {},
        body: currentRequest.body,
        authType: currentRequest.authType,
        authValue: currentRequest.authValue,
        // Only save to history if this request has already been saved (has an id)
        requestId: currentRequest.id || undefined,
      });

      setCurrentResponse(response);

      // Refresh history only if this is a saved request
      if (currentRequest.id) {
        const updatedHistory = await historyApi.getForRequest(
          currentRequest.id,
        );
        setHistory(updatedHistory);
      }
      console.log(response)
      // If no id → temporary request → do not save history
    } catch (error: any) {
      console.error("Execution failed:", error.message);

      setCurrentResponse({
        status: 0,
        statusText: "Request Failed",
        headers: {},
        body: null,
        durationMs: 0,
        sizeBytes: 0,
        timestamp: new Date().toISOString(),
        error: error.message || "Unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentRequest]);

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
