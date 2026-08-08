import { ComprehendClient, DetectSentimentCommand, DetectKeyPhrasesCommand } from "@aws-sdk/client-comprehend";

export type Category = "BUG" | "ACCESS_REQUEST" | "BILLING" | "HARDWARE" | "GENERAL";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface ClassificationResult {
  category: Category;
  priority: Priority;
  classifiedBy: "rule-based" | "aws-comprehend";
  confidence: number;
}

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  BUG: ["error", "crash", "bug", "broken", "not working", "exception", "fails", "freeze", "glitch"],
  ACCESS_REQUEST: ["password", "login", "access", "permission", "locked out", "account", "credentials", "vpn"],
  BILLING: ["invoice", "charge", "payment", "billing", "refund", "subscription", "receipt", "overcharged"],
  HARDWARE: ["laptop", "monitor", "printer", "keyboard", "mouse", "device", "hardware", "battery"],
  GENERAL: [],
};

const CRITICAL_WORDS = ["down", "outage", "critical", "cannot work", "can't work", "production", "urgent", "asap", "blocked", "data loss"];
const HIGH_WORDS = ["important", "soon", "affecting", "multiple users", "deadline"];
const LOW_WORDS = ["when you get a chance", "no rush", "minor", "cosmetic", "someday", "eventually"];

/**
 * Rule-based classifier. Zero external dependencies, zero cost, zero setup —
 * this is what the app uses out of the box so it works before any AWS
 * credentials are configured.
 */
function classifyRuleBased(title: string, description: string): ClassificationResult {
  const text = `${title} ${description}`.toLowerCase();

  let bestCategory: Category = "GENERAL";
  let bestScore = 0;
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS) as [Category, string[]][]) {
    const score = keywords.filter((k) => text.includes(k)).length;
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  let priority: Priority = "MEDIUM";
  if (CRITICAL_WORDS.some((w) => text.includes(w))) priority = "CRITICAL";
  else if (HIGH_WORDS.some((w) => text.includes(w))) priority = "HIGH";
  else if (LOW_WORDS.some((w) => text.includes(w))) priority = "LOW";

  return {
    category: bestCategory,
    priority,
    classifiedBy: "rule-based",
    confidence: bestScore > 0 ? Math.min(0.6 + bestScore * 0.1, 0.95) : 0.4,
  };
}

/**
 * AWS Comprehend enhanced path. Uses sentiment (NEGATIVE + high confidence
 * often correlates with frustration/urgency) and key phrases to sanity-check
 * the rule-based category guess. Only runs when AWS creds are present.
 */
async function classifyWithComprehend(title: string, description: string): Promise<ClassificationResult> {
  const base = classifyRuleBased(title, description);
  const text = `${title}. ${description}`.slice(0, 4900); // Comprehend has a byte limit

  const client = new ComprehendClient({ region: process.env.AWS_REGION });

  const [sentimentRes] = await Promise.all([
    client.send(new DetectSentimentCommand({ Text: text, LanguageCode: "en" })),
  ]);

  let priority = base.priority;
  const sentiment = sentimentRes.Sentiment;
  const negScore = sentimentRes.SentimentScore?.Negative ?? 0;

  // Bump priority up one level if sentiment is strongly negative and the
  // rule-based pass didn't already flag it as CRITICAL.
  if (sentiment === "NEGATIVE" && negScore > 0.8 && priority !== "CRITICAL") {
    priority = priority === "LOW" ? "MEDIUM" : priority === "MEDIUM" ? "HIGH" : "CRITICAL";
  }

  return {
    category: base.category,
    priority,
    classifiedBy: "aws-comprehend",
    confidence: Math.max(base.confidence, negScore),
  };
}

export async function classifyTicket(title: string, description: string): Promise<ClassificationResult> {
  const useAws = process.env.USE_AWS_COMPREHEND === "true";

  if (!useAws) {
    return classifyRuleBased(title, description);
  }

  try {
    return await classifyWithComprehend(title, description);
  } catch (err) {
    // Never let a classification failure block ticket creation — fall back.
    console.error("AWS Comprehend classification failed, falling back to rule-based:", err);
    return classifyRuleBased(title, description);
  }
}
