const getServiceUrl = (id: number) =>
  `${import.meta.env.VITE_API_URL}/agents/${id}/reports`;

export const getAgenReports = async (id: number) => {
  const SERVICE_URL = getServiceUrl(id);
  const response = await fetch(SERVICE_URL);

  if (!response.ok) throw new Error("fetch agent reports failed");

  const data = await response.json();
  return data;
};
