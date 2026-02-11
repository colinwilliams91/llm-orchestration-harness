import OpenAI from "openai";
import { ERRORS, EXTERNAL_URLS, MODEL } from "./constants";
import { CLIENT_REQ_CONFIG } from "./config";

async function main() {
  const [, , flag, prompt] = process.argv;
  const API_KEY = process.env.OPENROUTER_API_KEY;
  const BASE_URL = process.env.OPENROUTER_BASE_URL ?? EXTERNAL_URLS.OPEN_ROUTER_BASE;

  if (!API_KEY)
  {
    throw new Error(ERRORS.MISSING_API_KEY);
  }
  if (flag !== "-p" || !prompt)
  {
    throw new Error(ERRORS.MISSING_REQUIRED_P_FLAG);
  }

  const client = new OpenAI({ apiKey: API_KEY, baseURL: BASE_URL });

  const response = await client.chat.completions.create({
    model: MODEL.NAME,
    messages: [{ role: MODEL.CHAT_RBAC, content: prompt }],
    tools: CLIENT_REQ_CONFIG.TOOLS,
  });

  if (!response.choices || response.choices.length === 0)
  {
    throw new Error(ERRORS.RESPONSE_MISSING_CHOICES);
  }

  // You can use print statements as follows for debugging, they'll be visible when running tests.
  console.error("Logs from your program will appear here!");

  console.log(response.choices[0].message.content);
}

main();
