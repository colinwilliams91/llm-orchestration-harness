import { type ChatCompletionTool } from "openai/resources";
import type { IToolNames } from "../constants";

/**
 * Advertises the tools that the client can call to the LLM. This is passed in as part of the `tools` property in the `ChatCompletionCreateParams` when making a chat completion request.
 * The LLM can then respond with tool calls that match the advertised tools, and the client can execute those tool calls and return the results back to the LLM in the next message in the conversation.
 * See [OpenAI API Reference - Chat Completions](https://platform.openai.com/docs/api-reference/chat/create#chat/create-tools) for more details on the API contract for tools.
 * Note that the tools themselves are not implemented at the API level -- they are just advertised here.
 * The actual implementation of the tools is up to the client, and is not visible to the LLM.
 * The client is responsible for parsing the tool calls from the LLM, executing the appropriate tool with the appropriate arguments, and returning the results back to the LLM in a way that it can understand
 *  (i.e. as a message with role "tool" and content that matches what the LLM expects).
 * The `dispatcher` function in `app/api/index.ts` is responsible for this
 */
export const CLIENT_REQ_CONFIG = {
    TOOLS: [
        {
            "type": "function",
            "function": {
                "name": "read_file" satisfies IToolNames,
                "description": "Read and return the contents of a file",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "file_path": {
                            "type": "string",
                            "description": "The path to the file to read"
                        }
                    },
                    "required": ["file_path"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "write_file" satisfies IToolNames,
                "description": "Write content to a file",
                "parameters": {
                    "type": "object",
                    "required": ["file_path", "content"],
                    "properties": {
                        "file_path": {
                            "type": "string",
                            "description": "The path of the file to write to"
                        },
                        "content": {
                            "type": "string",
                            "description": "The content to write to the file"
                        }
                    }
                }
            }
        }
    ] satisfies ChatCompletionTool[],
};
