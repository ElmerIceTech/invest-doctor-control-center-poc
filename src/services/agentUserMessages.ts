const getServiceUrl = (agentId: number) =>
  `${import.meta.env.VITE_API_URL}/agents/${agentId}/user-messages`;

export const getAgentUserMessages = async (agentId: number) => {
  const SERVICE_URL = getServiceUrl(agentId);
  const response = await fetch(SERVICE_URL);

  if (!response.ok) throw new Error("fetch agent user messages failed");

  const data = await response.json();
  console.log('getAgentUserMessages', data)
  return data;
};
