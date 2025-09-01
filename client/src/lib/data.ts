// Real data from WebSpark CMS cached at build time
// This data is fetched from the live API and cached for static site generation
import cachedContent from '../data/texecon-content.json';
import teamData from '../data/team-data.json';

const content = cachedContent;

export const siteMetadata = {
  title: content.metadata.title + " - Texas Economic Analysis & Commentary",
  description: content.metadata.description + " - Expert analysis and commentary on the Texas economy.",
  url: "https://texecon.com",
  lastUpdated: content.metadata.lastUpdated,
};

export const teamMembers = teamData.teamMembers;

export const insights = content.insights;

export const economicMetrics = {
  gdpGrowth: {
    ...content.economicMetrics.gdpGrowth,
    icon: "chart-line",
  },
  unemployment: {
    ...content.economicMetrics.unemployment,
    icon: "briefcase",
  },
  housingIndex: {
    ...content.economicMetrics.housingIndex,
    icon: "home",
  },
  industrialProduction: {
    ...content.economicMetrics.industrialProduction,
    icon: "industry",
  },
};

export const missionAudiences = [
  {
    icon: "users",
    title: "Investors",
    description: "Strategic market insights",
    color: "primary",
  },
  {
    icon: "building",
    title: "Business Owners",
    description: "Economic trends analysis",
    color: "secondary",
  },
  {
    icon: "landmark",
    title: "Policymakers",
    description: "Data-driven recommendations",
    color: "accent",
  },
  {
    icon: "graduation-cap",
    title: "Students & Academics",
    description: "Educational resources",
    color: "primary",
  },
];

// Export additional real content for components to use
export const heroContent = {
  title: content.hero.title,
  description: content.hero.content,
};

export const navigationItems = content.navigation.slice(0, 5).map(item => ({
  id: item.id,
  label: item.label.includes('/') ? item.label.split('/')[1] || item.label : item.label,
}));

export const realContent = content;
