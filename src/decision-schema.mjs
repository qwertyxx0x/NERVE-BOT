const checkSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    passed: { type: "boolean" },
    reason: { type: "string" },
  },
  required: ["passed", "reason"],
};

export const decisionSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    action: { type: "string", enum: ["enter", "watch", "reject"] },
    confidence: { type: "number", minimum: 0, maximum: 100 },
    riskLevel: { type: "string", enum: ["low", "medium", "high"] },
    checks: {
      type: "object",
      additionalProperties: false,
      properties: {
        creatorHistory: checkSchema,
        bundleOverlap: checkSchema,
        lpStatus: checkSchema,
        holderConcentration: checkSchema,
        organicFlow: checkSchema,
        routeLatency: checkSchema,
      },
      required: [
        "creatorHistory",
        "bundleOverlap",
        "lpStatus",
        "holderConcentration",
        "organicFlow",
        "routeLatency",
      ],
    },
    maxPositionSol: { type: "number", minimum: 0, maximum: 1 },
    slippageBps: { type: "integer", minimum: 0, maximum: 300 },
    reason: { type: "string" },
  },
  required: [
    "action",
    "confidence",
    "riskLevel",
    "checks",
    "maxPositionSol",
    "slippageBps",
    "reason",
  ],
};

export function validateDecision(decision) {
  const actions = new Set(["enter", "watch", "reject"]);
  const risks = new Set(["low", "medium", "high"]);
  const requiredChecks = [
    "creatorHistory",
    "bundleOverlap",
    "lpStatus",
    "holderConcentration",
    "organicFlow",
    "routeLatency",
  ];

  if (!decision || typeof decision !== "object") {
    throw new Error("Decision must be an object.");
  }
  if (!actions.has(decision.action) || !risks.has(decision.riskLevel)) {
    throw new Error("Decision contains an unsupported action or risk level.");
  }
  if (!Number.isFinite(decision.confidence) || decision.confidence < 0 || decision.confidence > 100) {
    throw new Error("Confidence must be between 0 and 100.");
  }
  if (!Number.isFinite(decision.maxPositionSol) || decision.maxPositionSol < 0 || decision.maxPositionSol > 1) {
    throw new Error("maxPositionSol must be between 0 and 1.");
  }
  if (!Number.isInteger(decision.slippageBps) || decision.slippageBps < 0 || decision.slippageBps > 300) {
    throw new Error("slippageBps must be an integer between 0 and 300.");
  }
  for (const name of requiredChecks) {
    const check = decision.checks?.[name];
    if (!check || typeof check.passed !== "boolean" || typeof check.reason !== "string") {
      throw new Error(`Missing or invalid check: ${name}.`);
    }
  }

  return decision;
}

