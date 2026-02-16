import { type ChatCompletionTool } from "openai/resources";
import type { IToolNames } from "../constants";

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
        }
    ] satisfies ChatCompletionTool[],
};
