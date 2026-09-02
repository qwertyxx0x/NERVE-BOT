import { applyPolicyGate } from "./policy-gate.mjs";

export function executePaperOrder(signal, decision, options = {}) {
  const mode = options.mode ?? process.env.EXECUTION_MODE ?? "paper";
  if (mode !== "paper") {
    throw new Error("This public executor is paper-only and cannot submit transactions.");
  }

  const gate = applyPolicyGate(decision, options.policy);
  if (!gate.approved) {
    return {
      status: "rejected",
      mode: "paper",
      symbol: signal.symbol,
      reasons: gate.failures,
    };
  }

  const referencePriceUsd = Number(signal.market.priceUsd);
  const simulatedFillPriceUsd = referencePriceUsd * (1 + gate.cappedSlippageBps / 10_000);

  return {
    status: "filled",
    mode: "paper",
    receipt: `paper_${signal.mint.slice(0, 6)}_${decision.confidence.toFixed(1)}`,
    symbol: signal.symbol,
    sizeSol: gate.cappedPositionSol,
    referencePriceUsd,
    simulatedFillPriceUsd: Number(simulatedFillPriceUsd.toFixed(10)),
    slippageBps: gate.cappedSlippageBps,
    transactionSubmitted: false,
  };
}

