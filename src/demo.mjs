import { requestGrokDecision } from "./grok-client.mjs";
import { executePaperOrder } from "./paper-executor.mjs";

const signal = {
  observedAt: "2026-09-02T12:00:00.000Z",
  source: "normalized-launch-stream",
  symbol: "FLOOD",
  mint: "FLOOD7jY2Rk9DemoMint111111111111111111",
  market: {
    priceUsd: 0.00004371,
    liquidityUsd: 128400,
    volume5mUsd: 93400,
    buySellRatio5m: 1.84,
    routeLatencyMs: 218,
  },
  risk: {
    creatorFlagCount: 0,
    bundleOverlapPercent: 1.7,
    top10HolderPercent: 18.9,
    liquidityControlVerified: true,
    dominantFlowClusterPercent: 13.2,
  },
};

const mockDecision = {
  action: "enter",
  confidence: 94.8,
  riskLevel: "low",
  checks: {
    creatorHistory: { passed: true, reason: "No prior flagged launches" },
    bundleOverlap: { passed: true, reason: "Overlap is below the configured ceiling" },
    lpStatus: { passed: true, reason: "Liquidity controls are verified" },
    holderConcentration: { passed: true, reason: "Top holders are within policy" },
    organicFlow: { passed: true, reason: "Flow is distributed across clusters" },
    routeLatency: { passed: true, reason: "Route is inside the latency ceiling" },
  },
  maxPositionSol: 0.42,
  slippageBps: 90,
  reason: "All mandatory checks passed inside configured limits.",
};

const useMock = process.argv.includes("--mock");

console.log("\nNERVE / GROK DECISION PROOF");
console.log("MODE: PAPER ONLY — NO TRANSACTION CAN BE SUBMITTED\n");

const decision = useMock ? mockDecision : await requestGrokDecision(signal);
const receipt = executePaperOrder(signal, decision);

console.log("SIGNAL");
console.log(JSON.stringify(signal, null, 2));
console.log("\nDECISION");
console.log(JSON.stringify(decision, null, 2));
console.log("\nEXECUTION RECEIPT");
console.log(JSON.stringify(receipt, null, 2));

