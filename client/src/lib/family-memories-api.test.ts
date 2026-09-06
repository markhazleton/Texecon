import {
  fetchFamilyMemories,
  getFamilyMemoriesEndpoint,
  parseFamilyMemoriesResponse,
} from "./family-memories-api";

const memory = {
  personName: "Mark Hazleton",
  personPronouns: "he/him",
  relationshipToJared: "Youngest son of Jared",
  body: "A family memory.",
};

describe("family memories API", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses the static mock API endpoint by default", () => {
    expect(getFamilyMemoriesEndpoint()).toBe("/mock-api/family-memories.json");
  });

  it("fetches and validates the mock response", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify([memory]), { status: 200 }));

    await expect(fetchFamilyMemories()).resolves.toEqual([memory]);
    expect(fetchMock).toHaveBeenCalledWith(
      "/mock-api/family-memories.json",
      expect.objectContaining({ headers: { Accept: "application/json" } })
    );
  });

  it("accepts a CMS-style response envelope", () => {
    expect(parseFamilyMemoriesResponse({ success: true, data: { memories: [memory] } })).toEqual([
      memory,
    ]);
  });

  it("rejects malformed content", () => {
    expect(() => parseFamilyMemoriesResponse([{ personName: "Incomplete" }])).toThrow(
      "expected schema"
    );
  });
});
