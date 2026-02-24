import fs from "node:fs";
import type { ChatCompletionMessageToolCall } from "openai/resources";
import { ERRORS, TOOL_NAMES, type ReadFileArgs } from "../constants";
import { isValidToolName, processResponseMessage, validateArgsHaveFilePath, validateFunctionTool } from "../utils";

const _read = (args: string): string => {
    const parsed = JSON.parse(args) as ReadFileArgs;
    validateArgsHaveFilePath(parsed);

    try
    {
        const output = fs.readFileSync(parsed.file_path, "utf-8");
        return processResponseMessage(output);
    }
    catch (error)
    {
        throw new Error(ERRORS.FAILED_TO_READ_FILE + (error instanceof Error ? error.message : String(error)));
    }
};

const _push_m_cache = (args: string): string => {
    throw new Error(ERRORS.UNSUPPORTED.NOT_IMPLEMENTED + _push_m_cache.name);
}

const _tools = {
    read_file: _read,
    // push_messages_cache: _push_m_cache,
};

/**
 * `@note type` of tool_calls will always be "function" for tools
 */
export const dispatcher = (toolCall: ChatCompletionMessageToolCall): string => {
    validateFunctionTool(toolCall);

    const { name: funcName, arguments: args } = toolCall.function;

    if (!isValidToolName(funcName))
        throw new Error(ERRORS.UNSUPPORTED.TOOL_NAME_NOT_FOUND + funcName);

    switch (funcName) {
        case TOOL_NAMES.READ_FILE:
            const res = _tools.read_file(args);
            // TODO: How do we get the `res` back up to the layer that calls the tool (main.ts currently)?
            // Do we need to change the dispatcher signature to return a string?
            // Does this begin to overload the responsibility of the dispatcher function?
            return res;
    }
};
