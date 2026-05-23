import axios from "axios";
import { API_BASE } from "@/constants";
import type { OperationalStatus } from "@/types";

const client = axios.create({
  baseURL: API_BASE,
  timeout: 8000,
  headers: { "Content-Type": "application/json" },
});

export const api = {
  getStatus: (): Promise<OperationalStatus> =>
    client.get<OperationalStatus>("/status").then((r) => r.data),

  triggerRecommend: () =>
    client.post("/ai/recommend").then((r) => r.data),

  resolveRecommendation: (id: string) =>
    client.post(`/ai/resolve/${id}`).then((r) => r.data),

  resolveAlert: (id: string) =>
    client.post(`/alerts/${id}/resolve`).then((r) => r.data),

  escalateAlert: (message: string, severity: string = 'critical') =>
    client.post("/alerts/escalate", { message, severity, category: 'system' }).then((r) => r.data),

  simulate: {
    congestion:     (body = {}) => client.post("/simulate/congestion",      body).then((r) => r.data),
    weather:        (body = {}) => client.post("/simulate/weather",          body).then((r) => r.data),
    emergency:      (body = {}) => client.post("/simulate/emergency",        body).then((r) => r.data),
    gateBlockage:   (body = {}) => client.post("/simulate/gate-blockage",    body).then((r) => r.data),
    networkFailure: (body = {}) => client.post("/simulate/network-failure",  body).then((r) => r.data),
    reset:          ()           => client.post("/simulate/reset").then((r) => r.data),
  },
};
