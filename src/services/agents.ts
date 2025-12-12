
import type { CreateAgent } from "../types/CreateAgent";

const SERVICE_URL = `${import.meta.env.VITE_API_URL}/agents/`

export const getAgents = async () => {
    const response = await fetch(SERVICE_URL)

    if (!response.ok) throw new Error('fetch agents failed')

    const data = await response.json()
    return data
}

export const createAgent = async ({name, alias}: CreateAgent) => {
    try {
        const response = await fetch(
            SERVICE_URL,
            {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({name, alias})
            }
        )

        if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json(); // 解析回傳資料
        return data;
    } catch (error) {
        console.error("Create agent failed:", error);
        throw error;
    }
}

export const deleteAgent = async(id: number) => {
    try {
        const response = await fetch(
            `${SERVICE_URL}?id=${id}`,
            {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json"
                },
            }
        )

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json(); // 解析回傳資料
        return data;
    } catch (error) {
        console.error("Create agent failed:", error);
        throw error;
    }
}