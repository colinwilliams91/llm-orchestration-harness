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
    console.error("Logs from your program will appear here!");

    /////////////////////////////////////
    // RESPONSE HANDLING ////////////////
    validateHasChoices(response);

    if (hasToolCalls(response))
      dispatcher(response.choices[0].message.tool_calls![0]);
    else
      console.log(response.choices[0].message.content);

  } catch (error) {

    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
