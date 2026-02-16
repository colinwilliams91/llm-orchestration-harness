import { type ChatCompletion, type ChatCompletionMessageFunctionToolCall, type ChatCompletionMessageToolCall } from "openai/resources";
import { ERRORS, type IToolNames, TOOL_NAMES } from "../constants/index";

export const validateHasChoices = (response: ChatCompletion & { _request_id?: string | null }): void => {
  if (!response.choices || response.choices.length === 0) {
    throw new Error(ERRORS.RESPONSE_MISSING_CHOICES);
  }
};

export function validateArgsHaveFilePath<T>(args: T): asserts args is T & { file_path: string } {
  if (!args || typeof args !== "object" || !("file_path" in args)) {
      throw new Error(`Invalid arguments: missing file_path property`);
  }
  if (!args.file_path || typeof args.file_path !== "string") {
      throw new Error(`Invalid arguments: file_path must be a non-empty string`);
  }
}

// if (!parsed.file_path || typeof parsed.file_path !== 'string') {
//     throw new Error(`Invalid arguments for _read tool call: missing or invalid file_path`);
// }

export const hasToolCalls = (response: ChatCompletion & { _request_id?: string | null }): boolean => {
  if (!response.choices[0].message.tool_calls || response.choices[0].message.tool_calls.length === 0) {
    return false;
  } else {
    return true;
  }
};

/**
 * Type guard to validate tool names at runtime
 * @param name string name of the tool to validate
 * @returns boolean indicating if the name is a valid tool name
 */
export const isValidToolName = (name: string): name is IToolNames => {
    return (Object.values(TOOL_NAMES) as readonly string[]).includes(name);
};

/**
 * Caller is responsible for validating response has tool calls before calling this function
 * @param response extended ChatCompletion response from OpenAI API
 * @returns ChatCompletionMessageToolCall
 */
// export const getParsedToolCall = (
//   toolCalls: ChatCompletionMessageToolCall[] | ChatCompletionMessageFunctionToolCall[]
//   ): ChatCompletionMessageToolCall | ChatCompletionMessageFunctionToolCall => {

// };