import { type ChatCompletion, type ChatCompletionMessageFunctionToolCall, type ChatCompletionMessageToolCall } from "openai/resources";
import { ERRORS, type IToolNames, TOOL_NAMES, type ToolArgsMap } from "../constants/index";

/**
 * @keyword has* for boolean return type
 * @keyword validate* for void return type (with error throwing)
 */

////////////////////////////////////////////
//// VALIDATION ////////////////////////////
////////////////////////////////////////////

export const validateHasChoices = (response: ChatCompletion & { _request_id?: string | null }): void => {
  // console.log("inside CHOICE VALIDATOR -- ");
  if (!response.choices || response.choices.length === 0)
    throw new Error(ERRORS.RESPONSE_MISSING_CHOICES);
  // TODO: get rid of these logs...
  // console.dir(response.choices[0]?.message);
};

export function validateArgsHaveFilePath<T>(args: T): asserts args is T & { file_path: string } {
  if (!args || typeof args !== "object" || !("file_path" in args))
    throw new Error(ERRORS.INVALID_ARGS.BASE + ERRORS.INVALID_ARGS.MISSING_FILE_PATH);

  if (!args.file_path || typeof args.file_path !== "string")
    throw new Error(ERRORS.INVALID_ARGS.BASE + ERRORS.INVALID_ARGS.INVALID_FILE_PATH);
}

export function validateFunctionTool(toolCall: ChatCompletionMessageToolCall): asserts toolCall is ChatCompletionMessageFunctionToolCall {
  if (toolCall.type !== "function")
    throw new Error(ERRORS.UNSUPPORTED.TOOL_CALL_TYPE + toolCall.type);
};

export const hasToolCalls = (response: ChatCompletion & { _request_id?: string | null }): boolean => {
  if (!response.choices[0].message.tool_calls || response.choices[0].message.tool_calls.length === 0)
    return false;
  else
    return true;
};

/**
 * Type guard to validate tool names at runtime
 * @param name string name of the tool to validate
 * @returns boolean indicating if the name is a valid tool name
 */
export const isValidToolName = (name: string): name is IToolNames => {
  return (Object.values(TOOL_NAMES) as readonly string[])
    .includes(name);
};

/**
 * Caller is responsible for validating response has tool calls before calling this function
 * @param response extended ChatCompletion response from OpenAI API
 * @returns ChatCompletionMessageToolCall
 */
export const getParsedToolCall = (
  toolCalls: ChatCompletionMessageToolCall[] | ChatCompletionMessageFunctionToolCall[]
  ): ChatCompletionMessageToolCall | ChatCompletionMessageFunctionToolCall => {
    throw new Error(ERRORS.UNSUPPORTED.NOT_IMPLEMENTED + getParsedToolCall.name);
};

////////////////////////////////////////////
//// PROCESSING ////////////////////////////
////////////////////////////////////////////

export const processResponseMessage = (res: string): string => res.trim();

export function parseToolArgs<T extends IToolNames>(
    toolName: T,
    args: string
): ToolArgsMap[T] {
    return JSON.parse(args);
}
