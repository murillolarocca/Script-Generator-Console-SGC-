const { SYSTEM_PROMPT } = require("./systemPrompt");
const { RESPOND_TOOL } = require("./tool");

const API_URL = "https://api.anthropic.com/v1/messages";

async function askSGC(messages) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY não configurada. Copie .env.example para .env e defina sua chave."
    );
  }
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5-20250929";

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: [RESPOND_TOOL],
      tool_choice: { type: "tool", name: "responder" },
      messages,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Erro na API Anthropic (${res.status}): ${text}`);
  }

  const data = await res.json();
  const toolUse = (data.content || []).find((b) => b.type === "tool_use");
  if (!toolUse) {
    throw new Error("A resposta da IA não incluiu o formato esperado.");
  }

  return { assistantMessage: { role: "assistant", content: data.content }, toolUse };
}

module.exports = { askSGC };
