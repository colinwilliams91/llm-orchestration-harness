import type { ChatCompletionAssistantMessageParam, ChatCompletionMessageParam, ChatCompletionToolMessageParam, ChatCompletionUserMessageParam } from "openai/resources";

export const MODEL = {
    NAME: "anthropic/claude-haiku-4.5",
    USER_RBAC: "user" satisfies ChatCompletionUserMessageParam["role"],
    TOOL_RBAC: "tool" satisfies ChatCompletionToolMessageParam["role"],
    ASSISTANT_RBAC: "assistant" satisfies ChatCompletionAssistantMessageParam["role"]
} as const;

export const EXTERNAL_URLS = {
    OPEN_ROUTER_BASE: "https://openrouter.ai/api/v1"
} as const;

export const ERRORS = {
    MISSING_API_KEY: "OPENROUTER_API_KEY is not set",
    MISSING_REQUIRED_P_FLAG: "error: -p flag is required",
    RESPONSE_MISSING_CHOICES: "no choices in response",
    FAILED_TO_READ_FILE: "Error reading file: ",
    INVALID_ARGS: {
        BASE: "Invalid arguments: ",
        MISSING_FILE_PATH: "missing file_path property",
        INVALID_FILE_PATH: "file_path must be a non-empty string",
    },
    UNSUPPORTED: {
        TOOL_CALL_TYPE: "Currently unsupported tool call type: ",
        TOOL_NAME_NOT_FOUND: "No tool found with name: ",
        NOT_IMPLEMENTED: "Not implemented yet: ",
    },
};

// TODO: should types live somewhere else?
export const TOOL_NAMES = {
    READ_FILE: "read_file",
    WRITE_FILE: "write_file",
    BASH: "Bash",
} as const;

// Tool argument types
export interface ReadFileArgs {
    file_path: string;
}

export interface WriteFileArgs {
    file_path: string;
    content: string;
}

export interface BashArgs {
    command: string;
}

export type IToolNames = typeof TOOL_NAMES[keyof typeof TOOL_NAMES];

/**
 * Re-implement this once we want dynamic tool parsing
 * The parser function below it can leverage the Map
 */
// Map tool names to their argument types
export type ToolArgsMap = {
    [TOOL_NAMES.READ_FILE]: ReadFileArgs;
    [TOOL_NAMES.WRITE_FILE]: WriteFileArgs;
    [TOOL_NAMES.BASH]: BashArgs;
};

/**
 * See above comment
 */
// function parseToolArgs<T extends IToolNames>(
//     toolName: T,
//     args: string
// ): ToolArgsMap[T] {
//     return JSON.parse(args);
// }