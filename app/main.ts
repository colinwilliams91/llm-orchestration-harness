import OpenAI from "openai";
import type { ChatCompletion, ChatCompletionMessageParam } from "openai/resources";
import { ERRORS, EXTERNAL_URLS, MODEL } from "./constants";
import { CLIENT_REQ_CONFIG } from "./config";
import { validateHasChoices, hasToolCalls } from "./utils";
import { dispatcher } from "./api";

export type Context = {
    cache: ChatCompletionMessageParam[];
    client: OpenAI;
};

async function main() {
  try {
    const [, , flag, prompt] = process.argv;
    const API_KEY = process.env.OPENROUTER_API_KEY;
    const BASE_URL = process.env.OPENROUTER_BASE_URL ?? EXTERNAL_URLS.OPEN_ROUTER_BASE;

    if (!API_KEY)
      throw new Error(ERRORS.MISSING_API_KEY);
    if (flag !== "-p" || !prompt)
      throw new Error(ERRORS.MISSING_REQUIRED_P_FLAG);

    const client = new OpenAI({ apiKey: API_KEY, baseURL: BASE_URL });

    // TODO: IS THIS CACHE THE "CONTEXT WINDOW"?
    const cache: ChatCompletionMessageParam[] = [{ role: MODEL.USER_RBAC, content: prompt }];

    const context: Context = { cache, client };

    /* use print statements for debugging (stdout visible when running tests) */
    console.error("Begin program stdout:");

    while(true) // TODO: need a better loop termination condition (choice.finish_reason === "stop" or hasToolCalls false?)
    {
      // TODO: REFACTOR TO RESPONSE FROM CHATCOMPLETION API:
      // [Chat Completions with Responses](https://platform.openai.com/docs/guides/responses-vs-chat-completions?api-mode=responses)
      const response = await client.chat.completions.create({
        model: MODEL.NAME,
        messages: cache,
        tools: CLIENT_REQ_CONFIG.TOOLS,
      });

      validateHasChoices(response);

      // TODO: do we need to discriminate between tool calls and normal content at the API response level?
      // Or can we just always check for tool calls in the loop and handle accordingly?
      if (hasToolCalls(response))
      {
        try
        {
          const toolCalls = response.choices[0].message.tool_calls!;
          cache.push({ role: MODEL.ASSISTANT_RBAC, content: response.choices[0].message.content, tool_calls: toolCalls });

          for (const toolCall of toolCalls)
          {
            const res: string = dispatcher(toolCall);
            // console.log(toolCall.id);
            // console.dir(res);
            cache.push({ role: MODEL.TOOL_RBAC, tool_call_id: toolCall.id, content: res });
          }
        }
        catch (error)
        {
          console.error("Internal failure to dispatch:");
          console.error(error instanceof Error ? error.message : String(error));
        }
      }
      else
      {
        // TODO: return or print the final response content and break the loop (condition: empty tool_calls)
        // console.log("Final response from LLM:");
        console.log(response.choices[0].message.content);
        break;
      }
    }
    // console.log("this is the cache !!");
    // console.dir(cache);
  }
  catch (error)
  {
    console.error("Top Level ~ Fatal Error:");
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
