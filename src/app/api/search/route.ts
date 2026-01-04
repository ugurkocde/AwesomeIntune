import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { openai, AI_MODEL } from "~/lib/openai";
import { getAllTools } from "~/lib/tools.server";
import { z } from "zod";

const SearchResultSchema = z.object({
  results: z.array(
    z.object({
      toolId: z.string(),
      relevance: z.string(),
      confidence: z.number().min(0).max(100),
    })
  ),
});

export type AISearchResult = z.infer<typeof SearchResultSchema>;

const SYSTEM_PROMPT = `You are a precise assistant that matches user problems with relevant tools from the Awesome Intune collection.

Given a user's problem description and a catalog of tools, identify which tools DIRECTLY help solve their problem.

Each tool has:
- id: unique identifier (use this exact value in toolId)
- name: display name
- description: what the tool does
- keywords: search terms and use cases the tool addresses
- category: tool category
- type: tool type (web-app, powershell-module, cli-tool, etc.)
- author: who created it

CRITICAL MATCHING RULES:
1. Focus on the user's PRIMARY INTENT and ACTION, not just related topics
2. Only return tools that DIRECTLY help accomplish the user's goal
3. A tool mentioning a platform (e.g., "macOS") does NOT make it relevant for all tasks on that platform
4. Avoid tangentially related tools - if a tool doesn't directly solve the problem, exclude it

RELEVANCE EXAMPLES:
- Query: "How do I deploy apps to Mac devices?"
  - GOOD: Tools that upload/deploy/distribute apps (intune-uploader)
  - GOOD: Tools that track app versions for deployment planning
  - BAD: macOS monitoring tools (don't help deploy apps)
  - BAD: Security baseline tools (about security policies, not app deployment)
  - BAD: Policy explorer tools (about browsing policies, not deploying apps)

- Query: "How do I troubleshoot Autopilot enrollment?"
  - GOOD: Diagnostic tools for Autopilot
  - BAD: General Windows tools that don't specifically help with Autopilot

CONFIDENCE SCORING:
- 90-100: Tool directly and specifically addresses the user's exact problem
- 80-89: Tool strongly helps with the problem, may require some interpretation
- 70-79: Tool is relevant but not the primary solution
- Below 70: Do not include - too tangential

OUTPUT RULES:
- Only return tools with confidence >= 80
- Maximum 5 results, ordered by confidence (highest first)
- If no tools meet the threshold, return an empty results array
- Provide a brief explanation (1-2 sentences) focusing on HOW the tool helps

IMPORTANT: You MUST respond with valid JSON in this exact format:
{
  "results": [
    {"toolId": "exact-tool-id-from-catalog", "relevance": "Brief explanation of why this tool helps", "confidence": 95}
  ]
}`;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { query?: string };
    const query = body.query?.trim();

    if (!query || query.length < 3) {
      return NextResponse.json(
        { error: "Query must be at least 3 characters" },
        { status: 400 }
      );
    }

    const tools = getAllTools();

    // Send full tool data including keywords for better semantic matching
    const toolCatalog = tools.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      keywords: t.keywords,
      category: t.category,
      type: t.type,
      author: t.author,
    }));

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `User's problem: "${query}"

Available tools:
${JSON.stringify(toolCatalog, null, 2)}

Identify which tools can help solve this problem and explain why. Respond with JSON only.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ results: [] });
    }

    try {
      const parsed = JSON.parse(content) as unknown;
      const result = SearchResultSchema.parse(parsed);
      return NextResponse.json(result);
    } catch {
      console.error("Failed to parse AI response:", content);
      return NextResponse.json({ results: [] });
    }
  } catch (error) {
    console.error("AI search error:", error);
    return NextResponse.json(
      { error: "AI search failed", results: [] },
      { status: 500 }
    );
  }
}
