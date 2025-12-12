import type { CreateAgentSystemPrompts } from "../types/CreateAgentSystemPrompts"

const getServiceUrl = (id: number) => `${import.meta.env.VITE_API_URL}/agents/${id}/system-prompts`

export const getAgentSystemPrompts = async (id: number) => {
    const SERVICE_URL = getServiceUrl(id)
    const response = await fetch(SERVICE_URL)

    if (!response.ok) throw new Error('fetch agents system prompts failed')

    const data = await response.json()
    return data
}


export const createAgentSystemPrompts = async ({agentId, version, content}: CreateAgentSystemPrompts) => {
    try {
        const SERVICE_URL = getServiceUrl(agentId)
        const response = await fetch(
            SERVICE_URL,
            {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    agent_id: agentId,
                    version,
                    content,
                })
            }
        )

        if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json(); // 解析回傳資料
        return data;
    } catch (error) {
        console.error("Create agent system prompt failed:", error);
        throw error;
    }
}

export const partialUpdateAgentSystemPrompt = async({agentId, agentSystemPromptId, content}: {agentId: number; agentSystemPromptId: number; content: string}) => {
    try{
        const SERVICE_URL = getServiceUrl(agentId)
        const response = await fetch(
            `${SERVICE_URL}/${agentSystemPromptId}`,
            {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    content,
                })
            }
        )

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Update agent system prompt field failed:", error);
        throw error;
    }
}

export const deleteAgentSystemPrompt = async(id: number) => {
    try {
        const SERVICE_URL = getServiceUrl(id)
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

        const data = await response.json(); 
        return data;
    } catch (error) {
        console.error("Remove agent system prompt failed:", error);
        throw error;
    }
}