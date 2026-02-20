/**
 * Core type definitions for the UX Audit Engine
 */

export type AuditCategory =
  | "Information Architecture"
  | "Visual Hierarchy"
  | "Content Strategy"
  | "Conversion Flow"
  | "Trust Signals"
  | "Technical/Performance"
  | "Accessibility";

export type AuditStatus = "Not Started" | "In Progress" | "Resolved" | "Won't Fix";

export type FindingScope = "Template-wide" | string; // "Template-wide" or specific site(s)

export type FindingSource =
  | "vision"
  | "deterministic"
  | "llm-content"
  | "axe-core"
  | "lighthouse"
  | "manual";

export interface AuditFinding {
  id: string;
  category: AuditCategory;
  description: string;
  evidence?: string;
  location?: string;
  userImpact: number; // 1-5
  estimatedEffort: number; // 1-5
  priorityScore: number; // userImpact / estimatedEffort
  recommendation?: string;
  criterion?: string;
  confidence: number; // 0-1
  scope: FindingScope;
  status: AuditStatus;
  source: FindingSource;
  helpUrl?: string;
}

export interface AuditReport {
  url: string;
  auditedAt: string;
  findings: AuditFinding[];
  summary: AuditSummary;
  scores: CategoryScores;
}

export interface AuditSummary {
  totalFindings: number;
  criticalFindings: number;
  quickWins: number;
  averagePriorityScore: number;
  topCategory: AuditCategory;
  overallHealthScore: number; // 0-100
}

export type CategoryScores = Record<AuditCategory, CategoryScore>;

export interface CategoryScore {
  findingCount: number;
  averageImpact: number;
  averageEffort: number;
  averagePriority: number;
  criticalCount: number;
}

export const ALL_CATEGORIES: AuditCategory[] = [
  "Information Architecture",
  "Visual Hierarchy",
  "Content Strategy",
  "Conversion Flow",
  "Trust Signals",
  "Technical/Performance",
  "Accessibility",
];
