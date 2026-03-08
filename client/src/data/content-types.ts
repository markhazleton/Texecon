// Auto-generated types from WebSpark API
export interface CachedContent {
  metadata: {
    title: string;
    description: string;
    lastUpdated: string;
    sourcePages: number;
  };
  hero: {
    title: string;
    content: string;
  };
  navigation: Array<{
    id: string;
    label: string;
    href: string;
    description: string;
  }>;
  team: Array<{
    id: string;
    name: string;
    title: string;
    description: string;
    image: string;
    social: Record<string, string>;
  }>;
  insights: Array<{
    id: string;
    title: string;
    category: string;
    date: string;
    excerpt: string;
    image: string;
    slug: string;
  }>;
  economicMetrics: Record<
    string,
    {
      value: number;
      unit: string;
      change: string;
      label: string;
    }
  >;
  pages: {
    home: any;
    about: any;
    analysis: any[];
    all: any[];
  };
}
