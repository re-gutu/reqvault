"use client";

import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useState,
  useCallback,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { ReqVaultRequest, ExecuteResponse } from "@/types";
import { executeApi, historyApi, requestsApi } from "@/lib/queries";
import { toast } from "sonner";

type ReqVaultContextValue = {
  currentRequest: ReqVaultRequest;
  currentResponse: ExecuteResponse | null;
  history: any[];
  isLoading: boolean;
  requestsList: ReqVaultRequest[];
  loadAllRequests: () => Promise<void>;
  createNewRequest: () => Promise<void>;
  selectRequest: (request: ReqVaultRequest) => Promise<void>;
  deleteRequest: (requestId: number) => Promise<void>;
  sendRequest: (customRequest?: ReqVaultRequest) => Promise<void>;
  setCurrentRequest: Dispatch<SetStateAction<ReqVaultRequest>>;
  saveCurrentRequest: (
    customRequest?: ReqVaultRequest,
  ) => Promise<ReqVaultRequest | undefined>;
};

const ReqVaultContext = createContext<ReqVaultContextValue | null>(null);

function useReqVaultState(): ReqVaultContextValue {
  const [currentRequest, setCurrentRequest] = useState<ReqVaultRequest>({
    name: "",
    method: "GET",
    url: "https://",
  });
  const [currentResponse, setCurrentResponse] =
    useState<ExecuteResponse | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [requestsList, setRequestsList] = useState<ReqVaultRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load all saved requests (for sidebar)
  const loadAllRequests = useCallback(async () => {
    try {
      const list = await requestsApi.getAll();
      setRequestsList(list);
      // toast("Stored collections loaded");
    } catch (err) {
      console.error("Failed to load requests list", err);
      toast.error("Failed to load requests list");
    }
  }, []);

  useEffect(() => {
    loadAllRequests();
  }, [loadAllRequests]);

  // Create a new empty request
  const createNewRequest = useCallback(async () => {
    const newRequest: ReqVaultRequest = {
      name: "",
      method: "GET",
      url: "https://",
      headers: {},
      queryParams: {},
      body: null,
      authType: "none",
      authValue: null,
      tags: [],
      collection: null,
    };

    setCurrentRequest(newRequest);
    toast("Cleared request pane");
    setCurrentResponse(null);
    setHistory([]);
  }, []);

  // Select / Load an existing saved request
  const selectRequest = useCallback(async (request: ReqVaultRequest) => {
    setCurrentRequest(request);
    setCurrentResponse(null);

    if (request.id) {
      try {
        const hist = await historyApi.getForRequest(request.id);
        setHistory(hist);
      } catch (err) {
        console.error("Failed to load history", err);
        setHistory([]);
      }
    } else {
      setHistory([]);
    }
  }, []);

  const deleteRequest = useCallback(
    async (requestId: number) => {
      try {
        await toast.promise(
          (async () => {
            await requestsApi.delete(requestId);
            await loadAllRequests();
          })(),
          {
            loading: "Deleting request ...",
            success: `Request ${requestId} has been deleted`,
            error: "Failed to delete request",
          },
        );

        if (currentRequest.id === requestId) {
          await createNewRequest();
        }
      } catch (err) {
        console.error("Failed to delete request", err);
        toast.error("Failed to delete request");
      }
    },
    [createNewRequest, currentRequest.id, loadAllRequests],
  );

  const sendRequest = useCallback(
    async (customRequest?: ReqVaultRequest) => {
      // Prevent concurrent sends
      if (isLoading) {
        console.warn("Send blocked: already loading");
        return;
      }

      setIsLoading(true);
      setCurrentResponse(null);

      // Fall back to context state if no direct payload was passed
      const requestToRun = customRequest || currentRequest;

      try {
        const response = await executeApi.run({
          method: requestToRun.method, // Used requestToRun
          url: requestToRun.url,
          headers: requestToRun.headers || {},
          queryParams: requestToRun.queryParams || {},
          body: requestToRun.body,
          authType: requestToRun.authType,
          authValue: requestToRun.authValue,
          requestId: requestToRun.id || undefined,
        });

        setCurrentResponse(response);

        if (requestToRun.id) {
          const updatedHistory = await historyApi.getForRequest(
            requestToRun.id,
          );
          setHistory(updatedHistory);
        }
      } catch (error: any) {
        // ... Your existing catch block stays the same ...
      } finally {
        setIsLoading(false);
      }
    },
    [currentRequest, isLoading],
  ); // currentRequest dependency remains correct

  const saveCurrentRequest = useCallback(
    async (customRequest?: ReqVaultRequest) => {
      // Added optional parameter

      const requestToSave = customRequest || currentRequest;

      if (!requestToSave) return;

      try {
        let savedRequest: ReqVaultRequest;

        if (requestToSave.id) {
          // Update existing
          savedRequest = await requestsApi.update(
            requestToSave.id,
            requestToSave,
          );
        } else {
          // Create new
          savedRequest = await requestsApi.create(requestToSave);
        }

        // Update context with the saved version (now has id)
        setCurrentRequest(savedRequest);
        await loadAllRequests();

        return savedRequest;
      } catch (err) {
        console.error("Failed to save request:", err);
        throw err;
      }
    },
    [currentRequest, loadAllRequests],
  );

  return {
    currentRequest,
    currentResponse,
    history,
    requestsList,
    isLoading,
    loadAllRequests,
    createNewRequest,
    selectRequest,
    deleteRequest,
    sendRequest,
    setCurrentRequest,
    saveCurrentRequest,
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
