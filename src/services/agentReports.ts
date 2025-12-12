const getServiceUrl = (id: number) =>
  `${import.meta.env.VITE_API_URL}/agents/${id}/reports`;

export const getAgenReports = async (id: number) => {
  const SERVICE_URL = getServiceUrl(id);
  const response = await fetch(SERVICE_URL);

  if (!response.ok) throw new Error("fetch agent reports failed");

  const data = await response.json();
  return data;
};

export const createAgentReport = async (data: {
  agent_id: number;
  system_prompt_id: number;
  agents_user_message_id: number;
}) => {
  try {
    const response = await fetch(
      "https://n8n.icetech.com.tw/webhook/ee624818-8010-4fd3-83dd-717dfedd8370",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Create agent report failed:', error);
    throw error;
  }
};
