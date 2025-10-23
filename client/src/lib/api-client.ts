// WebSpark CMS API Client with caching for TexEcon
// Supports both build-time data fetching and runtime fallback with cached data

export interface WebSparkPage {
  id: number;
  action: string;
  controller: string;
  argument: string;
  description: string;
  keywords: string;
  display_navigation: boolean;
  order: number;
  domain_id: number;
  domain_name: string | null;
  domain_url: string | null;
  icon: string;
  isHomePage: boolean;
  modified: string | null;
  modified_w3c: string;
  content: string;
  api_url: string | null;
}

export interface WebSparkWebsiteData {
  success: boolean;
  data: {
    description: string;
    id: number;
    menu: WebSparkPage[];
  };
}

export interface ApiClientConfig {
  baseUrl: string;
  authToken: string;
  websiteId: number;
  cookies?: string;
}

class WebSparkApiClient {
  private config: ApiClientConfig;
  private cache: Map<string, { data: WebSparkWebsiteData; timestamp: number }> = new Map();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes cache

  constructor(config: ApiClientConfig) {
    this.config = config;
  }

  private getCacheKey(endpoint: string): string {
    return `${endpoint}_${this.config.websiteId}`;
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheExpiry;
  }

  private async fetchFromAPI(endpoint: string): Promise<WebSparkWebsiteData> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      Accept: "application/json",
      Authorization: `Bearer ${this.config.authToken}`,
    };

    if (this.config.cookies) {
      headers["Cookie"] = this.config.cookies;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getWebsiteData(): Promise<WebSparkWebsiteData> {
    const endpoint = `/api/WebCMS/websites/${this.config.websiteId}`;
    const cacheKey = this.getCacheKey(endpoint);

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    try {
      const data = await this.fetchFromAPI(endpoint);

      // Cache the successful response
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error("Failed to fetch from API, using fallback data:", error);

      // Return fallback data if available in cache (even expired)
      if (cached) {
        return cached.data;
      }

      // Final fallback - return cached data from localStorage or default structure
      return this.getFallbackData();
    }
  }

  private getFallbackData(): WebSparkWebsiteData {
    // Try to get cached data from localStorage (for static builds)
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("texecon-cached-data");
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          console.warn("Failed to parse cached data from localStorage");
        }
      }
    }

    // Ultimate fallback with basic structure
    return {
      success: false,
      data: {
        description: "TexEcon.com - Texas Economic Analysis",
        id: 1,
        menu: [],
      },
    };
  }

  // Save data to localStorage for static site generation
  saveCachedData(data: WebSparkWebsiteData): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("texecon-cached-data", JSON.stringify(data));
        localStorage.setItem("texecon-cache-timestamp", Date.now().toString());
      } catch (e) {
        console.warn("Failed to save data to localStorage:", e);
      }
    }
  }

  // Clear expired cache entries
  clearExpiredCache(): void {
    const entries = Array.from(this.cache.entries());
    for (const [key, value] of entries) {
      if (!this.isCacheValid(value.timestamp)) {
        this.cache.delete(key);
      }
    }
  }
}

// Create singleton instance
const apiConfig: ApiClientConfig = {
  baseUrl: "https://webspark.markhazleton.com",
  authToken: "MARKHAZLETON-WEB",
  websiteId: 1,
  cookies:
    ".AspNetCore.Antiforgery.DlpvxuBJxZo=CfDJ8C3wmONpH_FLphaqQtDLGRYuZc_a6WnqAFCJfLk5gXJrPIrBzDAeMRGaHM4nB5VvGscxdzWEpjSr7P-E-0av185InEN6AE2QazEDzVNGLwOv1YYKrBVcpf6eBMIlbj9VeHo13fpOQv8sQ8wfTdIPSVs; .AspNetCore.Antiforgery.tvaVAstoha0=CfDJ8Nbddi0GFelFlLbYOyee0tfWE9b5PkLjyFJg97tQfv-GWRusAl0d4PL5WAOjzXx995KePx9GIyNblQkMqphqPReqakafy-zTGGoKK0ElSDzofhH2vROOsgNY4bmQkupPlUEXTG8CCxs5Am0CjkGfjiA",
};

export const websparkClient = new WebSparkApiClient(apiConfig);

// Build-time data fetching function
export async function fetchBuildTimeData(): Promise<WebSparkWebsiteData | null> {
  try {
    const data = await websparkClient.getWebsiteData();
    websparkClient.saveCachedData(data);
    return data;
  } catch (error) {
    console.error("Build-time data fetch failed:", error);
    return null;
  }
}

// Helper to transform API data to our application format
export function transformWebSparkData(apiData: WebSparkWebsiteData) {
  if (!apiData.success || !apiData.data.menu) {
    return null;
  }

  const pages = apiData.data.menu;

  // Find pages with specific arguments/content types
  const homePage = pages.find((page) => page.isHomePage || page.argument === "home");
  const aboutPages = pages.filter(
    (page) => page.argument?.includes("about") || page.description?.toLowerCase().includes("team")
  );
  const analysisPages = pages.filter(
    (page) =>
      page.argument?.includes("analysis") || page.description?.toLowerCase().includes("economic")
  );

  return {
    siteInfo: {
      title: apiData.data.description,
      description: homePage?.description || "Texas Economic Analysis & Commentary",
    },
    navigation: pages
      .filter((page) => page.display_navigation)
      .sort((a, b) => a.order - b.order)
      .map((page) => ({
        id: page.argument || page.id.toString(),
        label: page.argument?.charAt(0).toUpperCase() + page.argument?.slice(1) || "Page",
        description: page.description,
        content: page.content,
      })),
    pages: {
      home: homePage,
      about: aboutPages,
      analysis: analysisPages,
      all: pages,
    },
  };
}
