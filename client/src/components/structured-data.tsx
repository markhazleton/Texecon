interface OrganizationData {
  name: string;
  description: string;
  url: string;
  logo: string;
  email?: string;
  phone?: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  sameAs?: string[];
}

interface WebsiteData {
  name: string;
  url: string;
  description: string;
  inLanguage: string;
  copyrightYear: number;
  copyrightHolder: string;
}

interface PersonData {
  name: string;
  jobTitle: string;
  description: string;
  image: string;
  url?: string;
  sameAs?: string[];
}

interface StructuredDataProps {
  organization?: OrganizationData;
  website?: WebsiteData;
  people?: PersonData[];
  breadcrumbs?: Array<{
    name: string;
    url: string;
  }>;
}

export default function StructuredData({
  organization,
  website,
  people = [],
  breadcrumbs = [],
}: StructuredDataProps) {
  const defaultOrganization: OrganizationData = {
    name: "TexEcon",
    description:
      "Leading Texas economic analysis and commentary providing expert insights on Texas economy trends, data analysis, and economic forecasting.",
    url: "https://texecon.com",
    logo: "https://texecon.com/assets/texecon-logo.png",
    email: "contact@texecon.com",
    sameAs: ["https://twitter.com/texecon", "https://linkedin.com/company/texecon"],
  };

  const defaultWebsite: WebsiteData = {
    name: "TexEcon - Texas Economic Analysis",
    url: "https://texecon.com",
    description:
      "Expert Texas economic analysis, trends, and forecasting from experienced economists and data analysts.",
    inLanguage: "en-US",
    copyrightYear: new Date().getFullYear(),
    copyrightHolder: "TexEcon",
  };

  const orgData = organization || defaultOrganization;
  const webData = website || defaultWebsite;

  // Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: orgData.name,
    description: orgData.description,
    url: orgData.url,
    logo: orgData.logo,
    email: orgData.email,
    telephone: orgData.phone,
    address: orgData.address
      ? {
          "@type": "PostalAddress",
          streetAddress: orgData.address.streetAddress,
          addressLocality: orgData.address.addressLocality,
          addressRegion: orgData.address.addressRegion,
          postalCode: orgData.address.postalCode,
          addressCountry: orgData.address.addressCountry,
        }
      : undefined,
    sameAs: orgData.sameAs,
  };

  // Website Schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: webData.name,
    url: webData.url,
    description: webData.description,
    inLanguage: webData.inLanguage,
    copyrightYear: webData.copyrightYear,
    copyrightHolder: {
      "@type": "Organization",
      name: webData.copyrightHolder,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${webData.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  // Person Schemas
  const personSchemas = people.map((person) => ({
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.name,
    jobTitle: person.jobTitle,
    description: person.description,
    image: person.image,
    url: person.url,
    sameAs: person.sameAs,
    worksFor: {
      "@type": "Organization",
      name: orgData.name,
      url: orgData.url,
    },
  }));

  // Breadcrumb Schema
  const breadcrumbSchema =
    breadcrumbs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: breadcrumbs.map((crumb, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: crumb.name,
            item: crumb.url,
          })),
        }
      : null;

  const allSchemas = [
    organizationSchema,
    websiteSchema,
    ...personSchemas,
    ...(breadcrumbSchema ? [breadcrumbSchema] : []),
  ].filter(Boolean);

  return (
    <>
      {allSchemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema, null, 2),
          }}
        />
      ))}
    </>
  );
}
