import { validateDecision } from "./decision-schema.mjs";

export const DEFAULT_POLICY = Object.freeze({
  minimumConfidence: 90,
  maximumPositionSol: 0.5,
  maximumSlippageBps: 120,
  allowedRiskLevels: ["low"],
});

export function applyPolicyGate(decision, policy = DEFAULT_POLICY) {
  validateDecision(decision);

  const failures = [];
  const failedChecks = Object.entries(decision.checks)
    .filter(([, check]) => !check.passed)
    .map(([name]) => name);

  if (decision.action !== "enter") failures.push(`model action is ${decision.action}`);
  if (decision.confidence < policy.minimumConfidence) failures.push("confidence below policy minimum");
  if (!policy.allowedRiskLevels.includes(decision.riskLevel)) failures.push("risk level is not allowed");
  if (decision.maxPositionSol > policy.maximumPositionSol) failures.push("position exceeds policy maximum");
  if (decision.slippageBps > policy.maximumSlippageBps) failures.push("slippage exceeds policy maximum");
  if (failedChecks.length) failures.push(`failed checks: ${failedChecks.join(", ")}`);

  return {
    approved: failures.length === 0,
    failures,
    cappedPositionSol: Math.min(decision.maxPositionSol, policy.maximumPositionSol),
    cappedSlippageBps: Math.min(decision.slippageBps, policy.maximumSlippageBps),
  };
}

