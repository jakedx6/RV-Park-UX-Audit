/**
 * Vision Analyzer
 *
 * Sends screenshots to Claude's vision API with structured evaluation
 * criteria and returns parsed findings.
 */

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs/promises";
import path from "path";
import { AuditFinding, AuditCategory } from "../types";
import { getCriteria } from "../criteria";

const anthropic = new Anthropic();

export interface VisionAnalysisOptions {
  model?: string;
  category: AuditCategory;
  screenshotPaths: string[];
  additionalContext?: string;
}

export async function analyzeScreenshots(
  options: VisionAnalysisOptions
): Promise<AuditFinding[]> {
  const {
    model = "claude-sonnet-4-5-20250514",
    category,
    screenshotPaths,
    additionalContext = "",
  } = options;

  const criteria = getCriteria(category);

  // Build image content blocks
  const imageBlocks = await Promise.all(
    screenshotPaths.map(async (screenshotPath) => {
      const imageData = await fs.readFile(screenshotPath);
      const base64 = imageData.toString("base64");
      const ext = path.extname(screenshotPath).slice(1).toLowerCase();
      const mediaType =
        ext === "png"
          ? "image/png"
          : ext === "jpg" || ext === "jpeg"
          ? "image/jpeg"
          : "image/webp";

      return {
        type: "image" as const,
        source: {
          type: "base64" as const,
          media_type: mediaType,
          data: base64,
        },
      };
    })
  );

  const systemPrompt = `You are an expert UX auditor. You analyze website screenshots using structured evaluation criteria and return findings as JSON.

RULES:
- Only report genuine issues you can see evidence for in the screenshots
- Do NOT fabricate or hallucinate issues
- For each finding, cite specific visual evidence (location, element description)
- Rate severity and effort using the provided scales
- Return an empty array if no issues are found for a criterion
- Be specific in descriptions — vague findings are useless`;

  const userPrompt = `Evaluate these website screenshots for **${category}** issues.

EVALUATION CRITERIA:
${criteria.checklist.map((item, i) => `${i + 1}. ${item}`).join("\n")}

SEVERITY SCALE (userImpact):
1 = Minor cosmetic annoyance
2 = Noticeable friction, user can work around it
3 = Meaningful negative impact on experience
4 = Significant barrier to understanding or completing tasks
5 = Critical — breaks trust, blocks conversion, or makes site unusable

EFFORT SCALE (estimatedEffort):
1 = Quick fix (< 1 hour, copy change or config tweak)
2 = Small task (a few hours, single component edit)
3 = Moderate effort (half day to full day, may require design decisions)
4 = Significant work (multi-day, template/structural changes)
5 = Major project (redesign, new features, or platform changes)

${additionalContext ? `ADDITIONAL CONTEXT:\n${additionalContext}\n` : ""}
Return a JSON array of findings. Each finding must have this exact structure:
{
  "category": "${category}",
  "description": "Specific description of the issue",
  "evidence": "What you see in the screenshot that demonstrates this issue",
  "location": "Where on the page (e.g., 'header', 'above the fold', 'footer')",
  "userImpact": 1-5,
  "estimatedEffort": 1-5,
  "recommendation": "Specific actionable fix",
  "criterion": "Which checklist item this relates to",
  "confidence": 0.0-1.0
}

Return ONLY valid JSON. No markdown, no explanation.`;

  const response = await anthropic.messages.create({
    model,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: [...imageBlocks, { type: "text" as const, text: userPrompt }],
      },
    ],
  });

  // Extract text response
  const textContent = response.content.find((block) => block.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response from Claude");
  }

  // Parse JSON from response
  const rawFindings = parseJSON(textContent.text);

  // Transform into AuditFinding objects
  return rawFindings.map((finding: any) => ({
    id: generateId(),
    category: finding.category || category,
    description: finding.description,
    evidence: finding.evidence,
    location: finding.location,
    userImpact: clamp(finding.userImpact, 1, 5),
    estimatedEffort: clamp(finding.estimatedEffort, 1, 5),
    priorityScore:
      clamp(finding.userImpact, 1, 5) / clamp(finding.estimatedEffort, 1, 5),
    recommendation: finding.recommendation,
    criterion: finding.criterion,
    confidence: clamp(finding.confidence || 0.8, 0, 1),
    scope: "Template-wide",
    status: "Not Started",
    source: "vision",
  }));
}

function parseJSON(text: string): any[] {
  // Try direct parse first
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    // Try extracting JSON from markdown code block
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      const parsed = JSON.parse(match[1]);
      return Array.isArray(parsed) ? parsed : [parsed];
    }

    // Try finding array in the text
    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      const parsed = JSON.parse(arrayMatch[0]);
      return Array.isArray(parsed) ? parsed : [parsed];
    }

    throw new Error(`Failed to parse JSON from response: ${text.slice(0, 200)}`);
  }
}

function generateId(): string {
  return `f-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
