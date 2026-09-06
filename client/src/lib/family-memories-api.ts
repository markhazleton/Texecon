export interface FamilyMemory {
  personName: string;
  relationshipToJared: string;
  body: string;
}

type CmsFamilyMemoriesResponse = {
  success?: boolean;
  data?: FamilyMemory[] | { memories?: FamilyMemory[] };
  memories?: FamilyMemory[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isFamilyMemory(value: unknown): value is FamilyMemory {
  return (
    isRecord(value) &&
    typeof value.personName === "string" &&
    typeof value.relationshipToJared === "string" &&
    typeof value.body === "string"
  );
}

function extractMemories(payload: unknown): unknown[] | null {
  if (Array.isArray(payload)) return payload;
  if (!isRecord(payload)) return null;

  const response = payload as CmsFamilyMemoriesResponse;
  if (Array.isArray(response.memories)) return response.memories;
  if (Array.isArray(response.data)) return response.data;
  if (isRecord(response.data) && Array.isArray(response.data.memories)) {
    return response.data.memories;
  }

  return null;
}

export function parseFamilyMemoriesResponse(payload: unknown): FamilyMemory[] {
  const memories = extractMemories(payload);
  if (!memories || !memories.every(isFamilyMemory)) {
    throw new Error("The family memories response does not match the expected schema.");
  }

  return memories;
}

export function getFamilyMemoriesEndpoint(): string {
  const configuredEndpoint = import.meta.env.VITE_FAMILY_MEMORIES_API_URL?.trim();
  if (configuredEndpoint) return configuredEndpoint;

  return `${import.meta.env.BASE_URL}mock-api/family-memories.json`;
}

/**
 * Fetches family memories from the mock JSON endpoint today. Set
 * VITE_FAMILY_MEMORIES_API_URL when the CMS endpoint becomes available.
 */
export async function fetchFamilyMemories(signal?: AbortSignal): Promise<FamilyMemory[]> {
  const request: RequestInit = {
    headers: { Accept: "application/json" },
  };
  if (signal) request.signal = signal;

  const response = await fetch(getFamilyMemoriesEndpoint(), request);

  if (!response.ok) {
    throw new Error(`Unable to load family memories (${response.status}).`);
  }

  return parseFamilyMemoriesResponse(await response.json());
}
