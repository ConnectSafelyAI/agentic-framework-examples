import { tool } from "@langchain/core/tools";
import { z } from "zod";
import type { Person } from "./types.js";

const CONNECTSAFELY_API_TOKEN = process.env.CONNECTSAFELY_API_TOKEN || "";

interface ApiPerson {
  profileUrl?: string;
  profileId?: string;
  profileUrn?: string;
  firstName?: string;
  lastName?: string;
  headline?: string;
  currentPosition?: string;
  location?: string;
  connectionDegree?: string;
  isPremium?: boolean;
  isOpenToWork?: boolean;
  profilePicture?: string;
}

interface ApiResponse {
  success?: boolean;
  people?: ApiPerson[];
  pagination?: Record<string, unknown>;
  hasMore?: boolean;
  error?: string;
}

function extractCompany(headline: string): string {
  if (!headline) return "";
  const match = headline.match(/(?:at|@|-)\s*([^|]+?)(?:\s*\||$)/i);
  return match ? match[1].trim() : "";
}

export const searchPeopleTool = tool(
  async ({ keywords, location, title, limit }) => {
    const payload: Record<string, unknown> = {
      keywords,
      limit: Math.min(limit, 100),
    };

    if (location) payload.location = location;
    if (title) payload.title = title;

    const res = await fetch(
      "https://api.connectsafely.ai/linkedin/search/people",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CONNECTSAFELY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to search people: ${res.statusText}`);
    }

    let data = await res.json() as ApiResponse | ApiResponse[];

    // Handle array wrapper
    if (Array.isArray(data)) {
      data = data[0] || {};
    }

    if (!data.success && data.error) {
      throw new Error(data.error);
    }

    const people = data.people || [];

    // Format results
    const formattedPeople: Person[] = people.map((person) => ({
      profileUrl: person.profileUrl || "",
      profileId: person.profileId || "",
      profileUrn: person.profileUrn || "",
      fullName: `${person.firstName || ""} ${person.lastName || ""}`.trim(),
      firstName: person.firstName || "",
      lastName: person.lastName || "",
      headline: person.headline || "",
      currentPosition: person.currentPosition || "",
      company: extractCompany(person.headline || ""),
      location: person.location || "",
      connectionDegree: person.connectionDegree || "",
      isPremium: person.isPremium || false,
      isOpenToWork: person.isOpenToWork || false,
      profilePicture: person.profilePicture || "",
    }));

    return JSON.stringify({
      success: true,
      people: formattedPeople,
      count: formattedPeople.length,
      hasMore: data.hasMore || false,
      searchParams: { keywords, location, title, limit },
    });
  },
  {
    name: "search-people",
    description: "Search for LinkedIn profiles/people by keywords, location, and job title. Returns profile information for export.",
    schema: z.object({
      keywords: z.string().describe("Search keywords (e.g., 'CEO SaaS', 'Software Engineer')"),
      location: z.string().optional().describe("Geographic filter (e.g., 'United States')"),
      title: z.string().optional().describe("Job title filter (e.g., 'Head of Growth')"),
      limit: z.number().default(100).describe("Maximum results (1-100)"),
    }),
  }
);
