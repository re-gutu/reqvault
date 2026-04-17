import { ReqVaultRequest, ExecuteRequest, ExecuteResponse } from "@/types";
import { toast } from "sonner";

const API_BASE = "/api"; // Thanks to the proxy we set up earlier

// ==================== REQUESTS CRUD ====================

export async function getAllRequests(): Promise<ReqVaultRequest[]> {
  const res = await fetch(`${API_BASE}/requests`);
  if (!res.ok) throw new Error("Failed to fetch requests");
  return res.json();
}

export async function getRequest(id: number): Promise<ReqVaultRequest> {
  const res = await fetch(`${API_BASE}/requests/${id}`);
  if (!res.ok) throw new Error("Failed to fetch request");
  return res.json();
}

export async function createRequest(
  data: Omit<ReqVaultRequest, "id" | "createdAt" | "updatedAt">,
): Promise<ReqVaultRequest> {
  const res = await fetch(`${API_BASE}/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    toast.error(`Failed to create request`);
    throw new Error("Failed to create request" + res);
  }
  toast.success(`${data.name} saved successfully.`);
  return res.json();
}

export async function updateRequest(
  id: number,
  data: Partial<ReqVaultRequest>,
) {
  const cleanData = {
    name: data.name,
    method: data.method,
    url: data.url,
    headers: data.headers || null,
    queryParams: data.queryParams || null,
    body: data.body !== undefined ? data.body : null,
    authType: data.authType || "none",
    authValue: data.authValue || null,
    tags: data.tags || null,
    collection: data.collection || null,
  };

  const res = await fetch(`${API_BASE}/requests/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cleanData),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to update request: ${res.status} - ${errorText}`);
  }

  toast.success(`${data.name} is updated successfully.`);
  return res.json();
}

export async function deleteRequest(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/requests/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete request");
}

// ==================== EXECUTE ====================

export async function executeRequest(
  payload: ExecuteRequest & { requestId?: number },
): Promise<ExecuteResponse> {
  const res = await fetch(`${API_BASE}/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Execution failed");
  }

  return data;
}

// ==================== HISTORY ====================

export async function getRequestHistory(requestId: number) {
  const res = await fetch(`${API_BASE}/history/${requestId}`);
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}
