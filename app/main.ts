import OpenAI from "openai";
import { ERRORS, EXTERNAL_URLS, MODEL } from "./constants";
import { CLIENT_REQ_CONFIG } from "./config";
import { validateHasChoices, hasToolCalls } from "./utils";
import { dispatcher } from "./api";

async function main() {
  try {

    const [, , flag, prompt] = process.argv;
    const API_KEY = process.env.OPENROUTER_API_KEY;
    const BASE_URL = process.env.OPENROUTER_BASE_URL ?? EXTERNAL_URLS.OPEN_ROUTER_BASE;

    /////////////////////////////////////
    // VALIDATE AUTHENTICATION & INPUT //
    /////////////////////////////////////
    if (!API_KEY)
      throw new Error(ERRORS.MISSING_API_KEY);
    if (flag !== "-p" || !prompt)
      throw new Error(ERRORS.MISSING_REQUIRED_P_FLAG);

    /////////////////////////////////////
    // INSTANTIATE AND REQUEST //////////
    /////////////////////////////////////
    const client = new OpenAI({ apiKey: API_KEY, baseURL: BASE_URL });

    const response = await client.chat.completions.create({
      model: MODEL.NAME,
      messages: [{ role: MODEL.CHAT_RBAC, content: prompt }],
      tools: CLIENT_REQ_CONFIG.TOOLS,
    });

    /////////////////////////////////////
    // RESPONSE HANDLING ////////////////
    /////////////////////////////////////
    validateHasChoices(response);

    if (hasToolCalls(response)) {
      // TODO: fix the weird typing issue here (api type ChatCompletionMessageFunctionToolCall is the only one with `function` property)
      dispatcher(response.choices[0].message.tool_calls?[0]);
    }

    /* use print statements for debugging (visible when running tests) */
    console.error("Logs from your program will appear here!");
    console.log(response.choices[0].message.content);

  } catch (error) {

    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
