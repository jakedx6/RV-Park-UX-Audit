/**
 * Content Analyzer
 *
 * Analyzes extracted text content for readability, SEO keyword stuffing,
 * placeholder text, and content strategy issues.
 */

import Anthropic from "@anthropic-ai/sdk";
import { AuditFinding } from "../types";

const anthropic = new Anthropic();

export interface ContentAnalysisInput {
  visibleText: string;
  headings: { level: number; text: string }[];
  metaTitle: string;
  metaDescription: string;
  url: string;
}

/**
 * Deterministic content checks (no LLM needed)
 */
export function runDeterministicChecks(
  input: ContentAnalysisInput
): AuditFinding[] {
  const findings: AuditFinding[] = [];

  // Check for placeholder/lorem ipsum text
  const loremPatterns = [
    /lorem ipsum/i,
    /dolor sit amet/i,
    /consectetur adipiscing/i,
    /odio facilisis mauris/i,
    /massa vitae tortor/i,
  ];

  for (const pattern of loremPatterns) {
    if (pattern.test(input.visibleText)) {
      findings.push({
        id: `content-lorem-${Date.now()}`,
        category: "Content Strategy",
        description: `Placeholder/lorem ipsum text detected: "${pattern.source}"`,
        evidence: `Pattern "${pattern.source}" found in visible page text`,
        location: "Body content",
        userImpact: 5,
        estimatedEffort: 1,
        priorityScore: 5,
        recommendation:
          "Replace placeholder text with actual content immediately. This destroys credibility.",
        confidence: 1.0,
        scope: "Template-wide",
        status: "Not Started",
        source: "deterministic",
      });
    }
  }

  // Check heading hierarchy
  const headingLevels = input.headings.map((h) => h.level);
  if (headingLevels.length > 0) {
    // Should start with H1
    if (headingLevels[0] !== 1) {
      findings.push({
        id: `content-h1-${Date.now()}`,
        category: "Content Strategy",
        description: `Page does not start with an H1 heading (starts with H${headingLevels[0]})`,
        evidence: `First heading is H${headingLevels[0]}: "${input.headings[0].text}"`,
        location: "Page structure",
        userImpact: 2,
        estimatedEffort: 1,
        priorityScore: 2,
        recommendation: "Ensure page has a single H1 as the primary heading",
        confidence: 1.0,
        scope: "Template-wide",
        status: "Not Started",
        source: "deterministic",
      });
    }

    // Check for skipped levels (e.g., H1 → H3 with no H2)
    for (let i = 1; i < headingLevels.length; i++) {
      if (headingLevels[i] > headingLevels[i - 1] + 1) {
        findings.push({
          id: `content-heading-skip-${Date.now()}-${i}`,
          category: "Content Strategy",
          description: `Heading hierarchy skips from H${headingLevels[i - 1]} to H${headingLevels[i]}`,
          evidence: `"${input.headings[i - 1].text}" (H${headingLevels[i - 1]}) → "${input.headings[i].text}" (H${headingLevels[i]})`,
          location: "Page structure",
          userImpact: 2,
          estimatedEffort: 1,
          priorityScore: 2,
          recommendation: "Fix heading hierarchy to not skip levels",
          confidence: 1.0,
          scope: "Template-wide",
          status: "Not Started",
          source: "deterministic",
        });
        break; // One finding is enough
      }
    }

    // Multiple H1s
    const h1Count = headingLevels.filter((l) => l === 1).length;
    if (h1Count > 1) {
      findings.push({
        id: `content-multi-h1-${Date.now()}`,
        category: "Content Strategy",
        description: `Page has ${h1Count} H1 headings (should have exactly 1)`,
        evidence: `H1 headings: ${input.headings
          .filter((h) => h.level === 1)
          .map((h) => `"${h.text}"`)
          .join(", ")}`,
        location: "Page structure",
        userImpact: 2,
        estimatedEffort: 1,
        priorityScore: 2,
        recommendation: "Use a single H1 per page for SEO and accessibility",
        confidence: 1.0,
        scope: "Template-wide",
        status: "Not Started",
        source: "deterministic",
      });
    }
  }

  // Check meta tags
  if (!input.metaDescription) {
    findings.push({
      id: `content-meta-desc-${Date.now()}`,
      category: "Content Strategy",
      description: "Page is missing a meta description",
      evidence: "No meta description tag found",
      location: "HTML head",
      userImpact: 3,
      estimatedEffort: 1,
      priorityScore: 3,
      recommendation:
        "Add a compelling meta description (150-160 characters) for search results",
      confidence: 1.0,
      scope: "Template-wide",
      status: "Not Started",
      source: "deterministic",
    });
  }

  return findings;
}

/**
 * LLM-powered content analysis for subjective quality assessment
 */
export async function analyzeContent(
  input: ContentAnalysisInput,
  options: { model?: string } = {}
): Promise<AuditFinding[]> {
  const { model = "claude-haiku-4-5-20251001" } = options;

  // Run deterministic checks first
  const deterministicFindings = runDeterministicChecks(input);

  // Prepare text sample (cap for token efficiency)
  const textSample = input.visibleText.slice(0, 10000);

  const response = await anthropic.messages.create({
    model,
    max_tokens: 2048,
    system:
      "You are a content strategist evaluating website copy. Return findings as JSON only.",
    messages: [
      {
        role: "user",
        content: `Analyze this website text for content strategy issues.

URL: ${input.url}
Page Title: ${input.metaTitle}
Meta Description: ${input.metaDescription || "(missing)"}

VISIBLE TEXT (first 10,000 chars):
${textSample}

CHECK FOR:
1. SEO keyword stuffing (repeating location/keywords unnaturally)
2. Text written for search engines rather than humans
3. Generic/template copy that lacks personality
4. Missing or weak calls-to-action
5. Unclear value proposition
6. Tone inconsistency
7. Readability issues (too long, too jargon-heavy)

For each issue found, return:
{
  "category": "Content Strategy",
  "description": "specific issue",
  "evidence": "quote from the text showing the problem",
  "location": "where in the content",
  "userImpact": 1-5,
  "estimatedEffort": 1-5,
  "recommendation": "specific fix",
  "confidence": 0.0-1.0
}

Return ONLY a JSON array. No markdown. Return [] if no issues found.`,
      },
    ],
  });

  const textContent = response.content.find((block) => block.type === "text");
  if (!textContent || textContent.type !== "text") {
    return deterministicFindings;
  }

  try {
    let llmFindings: any[];
    try {
      llmFindings = JSON.parse(textContent.text);
    } catch {
      const match = textContent.text.match(/\[[\s\S]*\]/);
      llmFindings = match ? JSON.parse(match[0]) : [];
    }

    const parsedFindings: AuditFinding[] = llmFindings.map((f: any) => ({
      id: `content-llm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      category: "Content Strategy",
      description: f.description,
      evidence: f.evidence,
      location: f.location,
      userImpact: Math.max(1, Math.min(5, f.userImpact)),
      estimatedEffort: Math.max(1, Math.min(5, f.estimatedEffort)),
      priorityScore:
        Math.max(1, Math.min(5, f.userImpact)) /
        Math.max(1, Math.min(5, f.estimatedEffort)),
      recommendation: f.recommendation,
      confidence: f.confidence || 0.8,
      scope: "Template-wide",
      status: "Not Started",
      source: "llm-content",
    }));

    return [...deterministicFindings, ...parsedFindings];
  } catch {
    console.warn("[content] Failed to parse LLM response");
    return deterministicFindings;
  }
}
