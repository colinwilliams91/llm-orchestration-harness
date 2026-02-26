import fs from "node:fs";
import { execSync } from "node:child_process";
import type { ChatCompletionMessageToolCall } from "openai/resources";
import { ERRORS, TOOL_NAMES, type BashArgs, type ReadFileArgs, type WriteFileArgs } from "../constants";
import { isValidToolName, processResponseMessage, validateArgsHaveFilePath, validateFunctionTool } from "../utils";

// TODO: add BPE (tokenizer) service layer that all dispatched tool calls go through (caching layer in main())

const _read = (args: string): string => {
    const parsed = JSON.parse(args) satisfies ReadFileArgs;
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

const _write = (args: string): string => {
    const parsed = JSON.parse(args) satisfies WriteFileArgs;
    validateArgsHaveFilePath(parsed);

    try {
        fs.writeFileSync(parsed.file_path, parsed.content, "utf-8");
        return "File written successfully";
    } catch (error) {
        throw new Error(ERRORS.FAILED_TO_READ_FILE + (error instanceof Error ? error.message : String(error)));
    }
};

const _bash = (args: string): string => {
    console.log("inside bash tool !!");
    console.log(args);
    const parsed = JSON.parse(args) satisfies BashArgs;
    return execSync(parsed.command, { encoding: "utf-8" });
};

const _tools = {
    read_file: _read,
    write_file: _write,
    Bash: _bash,
} as const;

/**
 * `@note type` of tool_calls will always be "function" for tools
 */
export const dispatcher = (toolCall: ChatCompletionMessageToolCall): string => {
    validateFunctionTool(toolCall);

    const { name: funcName, arguments: args } = toolCall.function;

    if (!isValidToolName(funcName))
        throw new Error(ERRORS.UNSUPPORTED.TOOL_NAME_NOT_FOUND + funcName);

    return _tools[funcName](args);
};
