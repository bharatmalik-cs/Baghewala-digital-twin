// Defaults keep local development zero-config; deployments can set VITE_API_BASE.
const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:8000";
const WS_URL = BASE_URL.replace(/^http/, "ws");

export const fetchFieldSummary = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/field/summary`);
    if (!res.ok) throw new Error("Failed to fetch field summary");
    return await res.json();
  } catch (err) {
    console.error("API error:", err);
    return null;
  }
};

export const fetchWellTelemetry = async (wellId) => {
  try {
    const res = await fetch(`${BASE_URL}/api/well/${wellId}/telemetry`);
    if (!res.ok) throw new Error(`Failed to fetch well telemetry for ${wellId}`);
    return await res.json();
  } catch (err) {
    console.error("API error:", err);
    return null;
  }
};

export const updateWellControls = async (wellId, controls) => {
  try {
    const res = await fetch(`${BASE_URL}/api/well/${wellId}/control`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(controls),
    });
    if (!res.ok) throw new Error(`Failed to update controls for ${wellId}`);
    return await res.json();
  } catch (err) {
    console.error("API error:", err);
    return null;
  }
};

export const applyOptimization = async (wellId, scenario = {}) => {
  try {
    const res = await fetch(`${BASE_URL}/api/well/${wellId}/optimize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(scenario),
    });
    if (!res.ok) throw new Error(`Failed to apply optimization for ${wellId}`);
    return await res.json();
  } catch (err) {
    console.error("API error:", err);
    return null;
  }
};

export const fetchWellActions = async (wellId) => {
  try {
    const res = await fetch(`${BASE_URL}/api/well/${wellId}/actions`);
    if (!res.ok) throw new Error(`Failed to fetch actions for ${wellId}`);
    return await res.json();
  } catch (err) {
    console.error("API error:", err);
    return null;
  }
};

export const sendChatMessage = async (wellId, message) => {
  try {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ well_id: wellId, message }),
    });
    if (!res.ok) throw new Error("Failed to send chat message");
    return await res.json();
  } catch (err) {
    console.error("API error:", err);
    return null;
  }
};

export const connectWellWebSocket = (wellId, onData, onError) => {
  const ws = new WebSocket(`${WS_URL}/ws/telemetry/${wellId}`);
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onData(data);
    } catch (err) {
      console.error("WS message parse error:", err);
    }
  };

  ws.onerror = (err) => {
    if (onError) onError(err);
  };

  return ws;
};
