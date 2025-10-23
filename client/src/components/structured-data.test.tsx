import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import StructuredData from "./structured-data";

describe("StructuredData", () => {
  it("renders organization schema by default", () => {
    render(<StructuredData />);

    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts.length).toBeGreaterThan(0);

    const orgScript = Array.from(scripts).find((script) => {
      const data = JSON.parse(script.textContent || "{}");
      return data["@type"] === "Organization";
    });

    expect(orgScript).toBeTruthy();
    const orgData = JSON.parse(orgScript!.textContent || "{}");
    expect(orgData.name).toBe("TexEcon");
    expect(orgData.url).toBe("https://texecon.com");
  });

  it("renders website schema by default", () => {
    render(<StructuredData />);

    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    const websiteScript = Array.from(scripts).find((script) => {
      const data = JSON.parse(script.textContent || "{}");
      return data["@type"] === "WebSite";
    });

    expect(websiteScript).toBeTruthy();
    const websiteData = JSON.parse(websiteScript!.textContent || "{}");
    expect(websiteData.name).toBe("TexEcon - Texas Economic Analysis");
    expect(websiteData.url).toBe("https://texecon.com");
  });

  it("renders person schemas when provided", () => {
    const people = [
      {
        name: "John Doe",
        jobTitle: "Economist",
        description: "Expert in Texas economy",
        image: "https://example.com/john.jpg",
        url: "https://texecon.com/team/john-doe",
      },
    ];

    render(<StructuredData people={people} />);

    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    const personScript = Array.from(scripts).find((script) => {
      const data = JSON.parse(script.textContent || "{}");
      return data["@type"] === "Person";
    });

    expect(personScript).toBeTruthy();
    const personData = JSON.parse(personScript!.textContent || "{}");
    expect(personData.name).toBe("John Doe");
    expect(personData.jobTitle).toBe("Economist");
    expect(personData.worksFor.name).toBe("TexEcon");
  });

  it("renders breadcrumb schema when provided", () => {
    const breadcrumbs = [
      { name: "Home", url: "https://texecon.com" },
      { name: "Team", url: "https://texecon.com/team" },
      { name: "John Doe", url: "https://texecon.com/team/john-doe" },
    ];

    render(<StructuredData breadcrumbs={breadcrumbs} />);

    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    const breadcrumbScript = Array.from(scripts).find((script) => {
      const data = JSON.parse(script.textContent || "{}");
      return data["@type"] === "BreadcrumbList";
    });

    expect(breadcrumbScript).toBeTruthy();
    const breadcrumbData = JSON.parse(breadcrumbScript!.textContent || "{}");
    expect(breadcrumbData.itemListElement).toHaveLength(3);
    expect(breadcrumbData.itemListElement[0].name).toBe("Home");
    expect(breadcrumbData.itemListElement[0].position).toBe(1);
  });

  it("renders custom organization data", () => {
    const customOrg = {
      name: "Custom Org",
      description: "Custom Description",
      url: "https://custom.com",
      logo: "https://custom.com/logo.png",
      email: "info@custom.com",
    };

    render(<StructuredData organization={customOrg} />);

    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    const orgScript = Array.from(scripts).find((script) => {
      const data = JSON.parse(script.textContent || "{}");
      return data["@type"] === "Organization";
    });

    const orgData = JSON.parse(orgScript!.textContent || "{}");
    expect(orgData.name).toBe("Custom Org");
    expect(orgData.email).toBe("info@custom.com");
  });

  it("includes SearchAction in website schema", () => {
    render(<StructuredData />);

    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    const websiteScript = Array.from(scripts).find((script) => {
      const data = JSON.parse(script.textContent || "{}");
      return data["@type"] === "WebSite";
    });

    const websiteData = JSON.parse(websiteScript!.textContent || "{}");
    expect(websiteData.potentialAction).toBeDefined();
    expect(websiteData.potentialAction["@type"]).toBe("SearchAction");
  });
});
