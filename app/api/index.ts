import fs from "node:fs";
import type { ChatCompletionMessageToolCall } from "openai/resources";
import { ERRORS, TOOL_NAMES, type ReadFileArgs } from "../constants";
import { isValidToolName, processResponseMessage, validateArgsHaveFilePath, validateFunctionTool } from "../utils";

const _read = (args: string) => {
    // console.log(`This is the read tool with args: ${args}`)

    const parsed = JSON.parse(args) as ReadFileArgs;
    validateArgsHaveFilePath(parsed);

    try {
        // console.log(`Calling read_file with path: ${parsed.file_path}`);
        const data = fs.readFileSync(parsed.file_path, "utf-8");
        const output = processResponseMessage(data);
        // print to stdout per the requirements
        console.log(output);
    } catch (error) {
        throw new Error(ERRORS.FAILED_TO_READ_FILE + (error instanceof Error ? error.message : String(error)));
    }
};

const _tools = {
    read_file: _read,
};

/**
 * `@note type` of tool_calls will always be "function" for tools
 */
export const dispatcher = (toolCall: ChatCompletionMessageToolCall) => {
    validateFunctionTool(toolCall);

    const { name: funcName, arguments: args } = toolCall.function;

    if (!isValidToolName(funcName))
        throw new Error(ERRORS.UNSUPPORTED.TOOL_NAME_NOT_FOUND + funcName);

    switch (funcName) {
        case TOOL_NAMES.READ_FILE:
            _tools.read_file(args);
            break;
    }
};
