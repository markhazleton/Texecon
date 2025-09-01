// Static data for the Texas Economic Analysis site
// In a real implementation, this would be fetched from WebSpark CMS at build time

export const siteMetadata = {
  title: "TexEcon.com - Texas Economic Analysis & Commentary",
  description: "Expert analysis and commentary on the Texas economy. Educational insights on current state and future prospects of Texas economic growth.",
  url: "https://texecon.com",
};

export const teamMembers = [
  {
    id: "jared-hazleton",
    name: "Dr. Jared Hazleton",
    title: "Lead Economist",
    description: "A renowned economist with years of experience in economic analysis and commentary. Dr. Hazleton brings deep expertise in Texas economic trends and provides strategic insights for informed decision-making.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400",
    social: {
      linkedin: "#",
      twitter: "#",
    },
  },
  {
    id: "mark-hazleton",
    name: "Mark Hazleton",
    title: "Technology Director",
    description: "Co-founder of Control Origins, providing cutting-edge technology solutions for economic analysis. Mark bridges the gap between economic insights and technological innovation.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400",
    social: {
      linkedin: "#",
      github: "#",
    },
  },
];

export const insights = [
  {
    id: "gdp-growth-analysis",
    title: "Texas GDP Growth Outpaces National Average",
    category: "ANALYSIS",
    date: "3 days ago",
    excerpt: "Recent data shows Texas maintaining strong economic momentum with 4.2% growth, significantly ahead of the national average.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
    slug: "/insights/gdp-growth-analysis",
  },
  {
    id: "energy-sector-expansion",
    title: "Energy Sector Drives Economic Expansion",
    category: "ENERGY",
    date: "1 week ago",
    excerpt: "Oil and renewable energy investments continue to bolster Texas economic growth and job creation across multiple sectors.",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
    slug: "/insights/energy-sector-expansion",
  },
  {
    id: "technology-hub-growth",
    title: "Technology Hub Status Strengthens",
    category: "TECH",
    date: "2 weeks ago",
    excerpt: "Major tech companies continue relocating to Texas, creating a robust ecosystem for innovation and entrepreneurship.",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
    slug: "/insights/technology-hub-growth",
  },
];

export const economicMetrics = {
  gdpGrowth: {
    value: 4.2,
    unit: "%",
    change: "+0.3% vs Q3",
    label: "GDP Growth Rate",
    icon: "chart-line",
  },
  unemployment: {
    value: 3.1,
    unit: "%",
    change: "-0.2% vs Last Month",
    label: "Unemployment Rate",
    icon: "briefcase",
  },
  housingIndex: {
    value: 145.2,
    unit: "",
    change: "+2.1% YoY",
    label: "Housing Price Index",
    icon: "home",
  },
  industrialProduction: {
    value: 108.7,
    unit: "",
    change: "+1.8% vs Q3",
    label: "Industrial Production",
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
