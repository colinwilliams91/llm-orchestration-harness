import type { ChatCompletionToolMessageParam } from "openai/resources";
import { processResponseMessage } from "../app/utils/index";

/**
 * This is like a REPL to test out any of the utility functions
 * @note run with `bun .\test\index.ts`
 */

processResponseMessage(`This is a test response message from the utils test file. It has extra spaces and newlines that should be cleaned up.

Let's see if it works! (no special characters)`);

processResponseMessage("\n hi \n this \n has \n new lines.");

/* This accurately represents a dummy LLM response */
const dummyLLMResponse: ChatCompletionToolMessageParam = { role: "tool", tool_call_id: "1234", content: "hellow worl" };
