import { realContent } from "./data";

interface LinkValidationResult {
  link: string;
  isValid: boolean;
  type: "internal" | "external" | "section";
  status?: number;
  message: string;
}

export class FooterLinkValidator {
  private static instance: FooterLinkValidator;

  static getInstance(): FooterLinkValidator {
    if (!this.instance) {
      this.instance = new FooterLinkValidator();
    }
    return this.instance;
  }

  async validateAllFooterLinks(): Promise<LinkValidationResult[]> {
    const results: LinkValidationResult[] = [];

    // Internal page links to validate
    const internalLinks = [
      { link: "#texas", pageId: "texas", label: "Texas Economy" },
      { link: "#texecon", pageId: "texecon", label: "Economic Team" },
      {
        link: "#texecon/mark-hazleton",
        pageId: "texecon/mark-hazleton",
        label: "About Mark Hazleton",
      },
      {
        link: "#texecon/jared-hazleton",
        pageId: "texecon/jared-hazleton",
        label: "Dr. Jared Hazleton",
      },
      { link: "#kansas/wichita", pageId: "kansas/wichita", label: "Regional Analysis" },
    ];

    // External links to validate
    const externalLinks = [
      { link: "https://www.linkedin.com/in/markhazleton/", label: "Mark Hazleton LinkedIn" },
    ];

    // Section links to validate
    const sectionLinks = [{ link: "home", label: "Home", isSection: true }];

    // Validate internal page links
    for (const item of internalLinks) {
      const pageExists = realContent.navigation?.some((navItem) => navItem.id === item.pageId);
      results.push({
        link: item.link,
        isValid: pageExists || false,
        type: "internal",
        message: pageExists
          ? `${item.label} page exists`
          : `${item.label} page not found in navigation data`,
      });
    }

    // Validate external links
    for (const item of externalLinks) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(item.link, {
          method: "HEAD",
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        results.push({
          link: item.link,
          isValid: response.ok,
          type: "external",
          status: response.status,
          message: response.ok
            ? `${item.label} is accessible`
            : `${item.label} returned ${response.status}`,
        });
      } catch (error) {
        results.push({
          link: item.link,
          isValid: false,
          type: "external",
          message: `${item.label} failed to load: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }

    // Validate section links
    for (const item of sectionLinks) {
      const sectionExists = document.getElementById(item.link) !== null;
      results.push({
        link: item.link,
        isValid: sectionExists,
        type: "section",
        message: sectionExists
          ? `${item.label} section exists`
          : `${item.label} section not found in DOM`,
      });
    }

    return results;
  }

  getValidationSummary(results: LinkValidationResult[]) {
    const total = results.length;
    const valid = results.filter((r) => r.isValid).length;
    const invalid = total - valid;

    return {
      total,
      valid,
      invalid,
      validationRate: Math.round((valid / total) * 100),
      byType: {
        internal: results.filter((r) => r.type === "internal"),
        external: results.filter((r) => r.type === "external"),
        section: results.filter((r) => r.type === "section"),
      },
    };
  }
}

export default FooterLinkValidator;
