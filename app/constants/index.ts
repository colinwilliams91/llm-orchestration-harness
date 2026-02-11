import type { ChatCompletionMessageParam } from "openai/resources";

export const MODEL = {
    NAME: "anthropic/claude-haiku-4.5",
    CHAT_RBAC: "user" satisfies ChatCompletionMessageParam["role"],
} as const;

export const EXTERNAL_URLS = {
    OPEN_ROUTER_BASE: "https://openrouter.ai/api/v1"
} as const;

export const ERRORS = {
    MISSING_API_KEY: "OPENROUTER_API_KEY is not set",
    MISSING_REQUIRED_P_FLAG: "error: -p flag is required",
    RESPONSE_MISSING_CHOICES: "no choices in response",
};
