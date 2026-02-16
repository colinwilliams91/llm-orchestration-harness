import fs from "node:fs";
import type { ChatCompletionMessageToolCall } from "openai/resources";
import { ERRORS, TOOL_NAMES, type ReadFileArgs } from "../constants";
import { isValidToolName, validateArgsHaveFilePath } from "../utils";

const _read = (args: string) => {
    // console.log(`This is the read tool with args: ${args}`);

    const parsed = JSON.parse(args) as ReadFileArgs;
    validateArgsHaveFilePath(parsed);

    fs.readFile(parsed.file_path, "utf-8", (err, data) => {
        if (err) {
            throw new Error(`Error reading file: ${err.message}`);
        }

        // print to stdout per the requirements
        console.log(data);
    });
};

const _tools = {
    read_file: _read,
};

/**
 * `@note type` of tool_calls will always be "function" for tools
 */
export const dispatcher = (toolCall: ChatCompletionMessageToolCall) => {
    if (toolCall.type !== "function")
        throw new Error(ERRORS.UNSUPPORTED.TOOL_CALL_TYPE + toolCall.type);

    const { name: funcName, arguments: args } = toolCall.function;

    if (!isValidToolName(funcName))
        throw new Error(ERRORS.UNSUPPORTED.TOOL_NAME_NOT_FOUND + funcName);

    switch (funcName) {
        case TOOL_NAMES.READ_FILE: {
            // console.log(`Calling read_file with path: ${parsed.file_path}`);
            // TODO: do we need this return statement?
            return _tools.read_file(args);
        }
    }
};
