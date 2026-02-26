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

    // TODO: IS THIS CACHE THE "CONTEXT WINDOW"? -> i don't think so (just our client side memory of the conversation history)
    const cache: ChatCompletionMessageParam[] = [{ role: MODEL.USER_RBAC, content: prompt }];

    const context: Context = { cache, client };

    console.error("Begin program stdout:");

    while(true)
    {
      // TODO: REFACTOR TO RESPONSE FROM CHATCOMPLETION API:
      // [Chat Completions with Responses](https://platform.openai.com/docs/guides/responses-vs-chat-completions?api-mode=responses)
      const response = await client.chat.completions.create({
        model: MODEL.NAME,
        messages: cache,
        tools: CLIENT_REQ_CONFIG.TOOLS,
      });

      // console.log("LLM res {outer block - aka WHILE} ->");
      // console.dir(response);
      // console.log("LLM message content {outer block- aka WHILE} ->");
      // console.log(response.choices[0].message);
      validateHasChoices(response);

      if (hasToolCalls(response))
      {
        try
        {
          const toolCalls = response.choices[0].message.tool_calls!;
          // ...cache the LLM response with role "assistant", its content and requested tool calls
          cache.push({ role: MODEL.ASSISTANT_RBAC, content: response.choices[0].message.content, tool_calls: toolCalls });

          for (const toolCall of toolCalls)
          {
            const res: string = dispatcher(toolCall);
            // console.log("Tool call {inner block} ->");
            // console.dir(toolCall);

            // ...push our internal output (content) from the tool call back to the cache w/ role "tool" and tool_call_id GUID
            cache.push({ role: MODEL.TOOL_RBAC, tool_call_id: toolCall.id, content: res });
          }
        }
        catch (error)
        {
          console.error("Internal failure to dispatch:");
          console.error(error instanceof Error ? error.message : String(error));
        }
      }
      // ...LLM made no choices, it sets finish_reason to "stop" -> we cache response content -> end chat
      else // (!response.choices.length || response.choices[0].finish_reason === "stop")
      {
        cache.push({ role: MODEL.ASSISTANT_RBAC, content: response.choices[0].message.content });
        // ...message.content is LLM determined output based on entire conversation context
        console.log(response.choices[0].message.content);
        break;
      }
    }
  }
  catch (error)
  {
    console.error("Top Level ~ Fatal Error:");
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
