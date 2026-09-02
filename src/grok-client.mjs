import { decisionSchema, validateDecision } from "./decision-schema.mjs";

const DEFAULT_BASE_URL = "https://api.x.ai/v1";

function extractText(content) {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map((part) => part?.text ?? "").join("");
  }
  return "";
}

export async function requestGrokDecision(signal, options = {}) {
  const apiKey = options.apiKey ?? process.env.XAI_API_KEY;
  const model = options.model ?? process.env.XAI_MODEL ?? "grok-4.6";
  const baseUrl = options.baseUrl ?? process.env.XAI_BASE_URL ?? DEFAULT_BASE_URL;

  if (!apiKey) {
    throw new Error("XAI_API_KEY is missing. Use `npm run demo:mock` for the offline proof.");
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: [
            "You are NERVE's risk decision layer.",
            "Evaluate only the normalized telemetry supplied by the user.",
            "Never invent missing evidence or claim certainty.",
            "Return a decision matching the supplied JSON schema.",
            "You do not execute trades and you never request private keys.",
          ].join(" "),
        },
        {
          role: "user",
          content: JSON.stringify(signal),
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "nerve_trade_decision",
          strict: true,
          schema: decisionSchema,
        },
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`xAI request failed (${response.status}): ${detail.slice(0, 500)}`);
  }

  const payload = await response.json();
  const raw = extractText(payload.choices?.[0]?.message?.content);
  if (!raw) throw new Error("xAI returned no decision content.");

  return validateDecision(JSON.parse(raw));
}

