import fs from "node:fs";
import type { ChatCompletionMessageFunctionToolCall } from "openai/resources";

const _read = (args: string) => {
    console.log(`This is the read tool with args: ${args}`);
    fs.readFile(args, "utf-8", (err, data) => {
        if (err) {
            throw new Error(`Error reading file: ${err.message}`);
        }
        // print to stdout per the requirements
        console.log(data);
    });
};

const _tools = {
    read: _read,
};

/**
 * `type` of tool_calls will always be "function" for tools
 */
export const dispatcher = (toolCall: ChatCompletionMessageFunctionToolCall) => {
    const { name, arguments: args } = toolCall.function;
    const deserialized = JSON.parse(args);

    console.log(`deserialized args: ${deserialized}`);

    switch (name) {
        case 'read':
            return _tools.read(deserialized);
        default:
            throw new Error(`No tool found with name: ${name}`);
    }
};