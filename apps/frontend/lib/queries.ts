import * as api from "./api";

export const requestsApi = {
  getAll: api.getAllRequests,
  getById: api.getRequest,
  create: api.createRequest,
  update: api.updateRequest,
  delete: api.deleteRequest,
};

export const executeApi = {
  run: api.executeRequest,
};

export const historyApi = {
  getForRequest: api.getRequestHistory,
};
