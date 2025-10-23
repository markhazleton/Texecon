import { Card, CardContent } from "@/components/ui/card";
import { Users, Building, Landmark, GraduationCap } from "lucide-react";
import { missionAudiences } from "@/lib/data";
import content from "@/data/texecon-content.json";

const iconMap = {
  users: Users,
  building: Building,
  landmark: Landmark,
  "graduation-cap": GraduationCap,
};

const colorMap = {
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  accent: "bg-accent text-accent-foreground",
};

export default function TexeconAbout() {
  // Get the content from the TexEcon page
  const texeconPageContent = content.pages.home.content;

  // Convert HTML content to paragraphs
  const contentParagraphs = texeconPageContent
    .split("</p>")
    .map((p) => p.replace(/<\/?p>/g, "").trim())
    .filter((p) => p.length > 0);

  return (
    <section className="py-16 bg-card" data-testid="texecon-about-section">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-card-foreground mb-8">
              About TexEcon
            </h2>
          </div>

          {/* Content from TexEcon page */}
          <Card className="mb-12">
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none">
                {contentParagraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-lg text-muted-foreground leading-relaxed mb-6 last:mb-0"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Audience Grid */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-card-foreground mb-4">Who We Serve</h3>
            <p className="text-lg text-muted-foreground mb-8">
              Our content is designed to appeal to a wide range of audiences interested in the Texas
              economy.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {missionAudiences.map((audience, index) => {
              const Icon = iconMap[audience.icon as keyof typeof iconMap];
              const colorClass = colorMap[audience.color as keyof typeof colorMap];

              return (
                <div
                  key={index}
                  className="text-center"
                  data-testid={`audience-${audience.title.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div
                    className={`w-16 h-16 ${colorClass} rounded-full flex items-center justify-center mx-auto mb-4`}
                  >
                    <Icon className="text-2xl" />
                  </div>
                  <h3 className="font-semibold text-card-foreground mb-2">{audience.title}</h3>
                  <p className="text-sm text-muted-foreground">{audience.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
