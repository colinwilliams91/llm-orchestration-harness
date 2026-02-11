import { type ChatCompletion, type ChatCompletionMessageFunctionToolCall, type ChatCompletionMessageToolCall } from "openai/resources";
import { ERRORS } from "../constants/index";

export const validateHasChoices = (response: ChatCompletion & { _request_id?: string | null }): void => {
  if (!response.choices || response.choices.length === 0) {
    throw new Error(ERRORS.RESPONSE_MISSING_CHOICES);
  }
};

export const hasToolCalls = (response: ChatCompletion & { _request_id?: string | null }): boolean => {
  if (!response.choices[0].message.tool_calls || response.choices[0].message.tool_calls.length === 0) {
    return false;
  } else {
    return true;
  }
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