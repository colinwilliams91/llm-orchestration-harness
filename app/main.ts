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

    /////////////////////////////////////
    // VALIDATE AUTHENTICATION & INPUT //
    if (!API_KEY)
      throw new Error(ERRORS.MISSING_API_KEY);
    if (flag !== "-p" || !prompt)
      throw new Error(ERRORS.MISSING_REQUIRED_P_FLAG);

    /////////////////////////////////////
    // INSTANTIATE AND REQUEST //////////
    const client = new OpenAI({ apiKey: API_KEY, baseURL: BASE_URL });

    const cache: ChatCompletionMessageParam[] = [{ role: MODEL.CHAT_RBAC, content: prompt }];

    const context: Context = { cache, client };

    const response = await client.chat.completions.create({
      model: MODEL.NAME,
      messages: cache,
      tools: CLIENT_REQ_CONFIG.TOOLS,
    });

    /* use print statements for debugging (stdout visible when running tests) */
    console.error("Begin program stdout:");

    /////////////////////////////////////
    // RESPONSE HANDLING ////////////////
    validateHasChoices(response);

    // TODO: include validateHasChoices in loop or only before?
    while(true) // TODO: need a better loop termination condition (choice.finish_reason === "stop" or hasToolCalls false?)
    {

      // TODO: do we need to discriminate between tool calls and normal content at the API response level?
      // Or can we just always check for tool calls in the loop and handle accordingly?
      if (hasToolCalls(response))
      {
        try
        {
          const res = dispatcher(response.choices[0].message.tool_calls![0]);
          console.log(res);
          // TODO: need to figure out how to feed the tool response back into the conversation context
          // and continue the conversation with the updated context (i.e. with the tool response included in the message history)
          cache.push({ role: MODEL.CHAT_RBAC, content: res });
          // TODO: what condition terminates the agent loop?
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
        console.log(response.choices[0].message.content);
      }
    }

  }
  catch (error)
  {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
