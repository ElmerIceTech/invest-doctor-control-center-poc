const getServiceUrl = (agentId: number) =>
  `${import.meta.env.VITE_API_URL}/agents/${agentId}/user-messages`;

export const getAgentUserMessages = async (agentId: number) => {
  const SERVICE_URL = getServiceUrl(agentId);
  const response = await fetch(SERVICE_URL);

  if (!response.ok) throw new Error("fetch agent user messages failed");

  const data = await response.json();
  return data;
};

export const generateAgentUserMsg = async (agentId: number, ticker: string = "2330.TW") => {
  const response = await fetch(
    "https://n8n.icetech.com.tw/webhook/41e45338-3d75-4999-a2d3-b68258d947d4",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agentId: agentId,
        ticker: ticker,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
};
