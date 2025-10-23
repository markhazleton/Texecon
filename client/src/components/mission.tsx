import { Users, Building, Landmark, GraduationCap } from "lucide-react";
import { missionAudiences } from "@/lib/data";

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

export default function Mission() {
  return (
    <section className="py-16 bg-card" data-testid="mission-section">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-card-foreground mb-8">Our Mission</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            We believe that a strong and thriving Texas economy benefits everyone, and we are
            dedicated to promoting economic growth and prosperity in the state. Whether you are a
            seasoned professional or just starting to explore the world of economics, TexEcon.com is
            the perfect resource for you.
          </p>
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
