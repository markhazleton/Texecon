import React from "react";
import { FadeIn, FadeInStagger, FadeInItem } from "../animations";

export default function Legacy() {
  const institutions = [
    { name: "University of Texas", role: "Faculty & Leadership", period: "Academic Tenure" },
    { name: "University of Washington", role: "Faculty", period: "Academic Tenure" },
    { name: "Texas A&M", role: "Leadership", period: "Academic Tenure" },
    { name: "University of North Texas", role: "Leadership", period: "Academic Tenure" },
  ];

  const service = [
    {
      title: "Federal Reserve Bank of Boston",
      description:
        "Served as an Economist, applying rigorous analysis to macroeconomic policy and regional economic stability.",
    },
    {
      title: "Texas Research League",
      description:
        "Served as President, advancing independent, nonpartisan research to improve the efficiency and effectiveness of state and local government.",
    },
    {
      title: "Southwestern Economics Association",
      description:
        "Served as President, fostering collaboration and scholarship among economists across the region.",
    },
    {
      title: "Community Service",
      description:
        "Dedicated time and leadership to the Arthritis Foundation and United Way Texas, bringing his organizational expertise to vital public health and community causes.",
    },
  ];

  return (
    <section
      id="legacy"
      className="scroll-mt-20 py-16 sm:py-20 md:py-28 lg:py-32 px-5 sm:px-6 bg-card relative"
    >
      <div className="absolute inset-0 bg-primary/3 pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <FadeIn>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 lg:gap-16 mb-14 sm:mb-18 lg:mb-24 items-end">
            <div>
              <span className="text-secondary text-xs sm:text-sm font-sans tracking-widest uppercase mb-3 sm:mb-4 block">
                Academic & Public Service
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-primary leading-tight">
                A Career of Impact and Instruction
              </h2>
            </div>
            <div className="lg:pb-2">
              <p className="text-base sm:text-lg font-sans text-foreground/70 leading-relaxed">
                Dr. Hazleton believed deeply in the application of economic principles to improve
                public policy, education, and community welfare. He moved seamlessly between the
                classroom, the boardroom, and the public square.
              </p>
            </div>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-16">
          <div className="lg:col-span-5">
            <FadeIn>
              <h3 className="text-xl sm:text-2xl font-serif text-primary mb-7 sm:mb-8 flex items-center gap-3 sm:gap-4">
                Academic Appointments
                <span className="flex-grow h-px bg-border ml-4" />
              </h3>
            </FadeIn>
            <FadeInStagger className="space-y-6">
              {institutions.map((inst, i) => (
                <FadeInItem key={i}>
                  <div className="group relative pl-6 border-l border-secondary/30 hover:border-secondary transition-colors duration-300">
                    <div className="absolute w-2 h-2 rounded-full bg-secondary left-[-4.5px] top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <h4 className="text-lg font-serif text-foreground">{inst.name}</h4>
                    <p className="text-sm font-sans text-muted font-medium tracking-wide uppercase mt-1">
                      {inst.role}
                    </p>
                  </div>
                </FadeInItem>
              ))}
            </FadeInStagger>

            <FadeIn delay={0.4}>
              <div className="mt-12 sm:mt-16 p-5 sm:p-8 border border-primary/10 bg-background relative">
                <span className="absolute -top-3 left-8 bg-background px-2 text-xs font-sans tracking-widest uppercase text-primary font-semibold">
                  Current Era
                </span>
                <h4 className="text-xl font-serif text-primary mb-2">TexEcon</h4>
                <p className="text-sm font-sans text-muted uppercase tracking-widest mb-4">
                  Principal (2007—2026)
                </p>
                <p className="text-foreground/80 font-sans text-sm leading-relaxed">
                  As the principal and lead author at TexEcon.com, Dr. Hazleton dedicated his later
                  career to educating and informing the public about the Texas economy, providing
                  insightful analysis on its current state and future prospects.
                </p>
              </div>
            </FadeIn>
          </div>

          <div className="lg:col-span-7">
            <FadeIn>
              <h3 className="text-xl sm:text-2xl font-serif text-primary mb-7 sm:mb-8 flex items-center gap-3 sm:gap-4">
                Public & Professional Service
                <span className="flex-grow h-px bg-border ml-4" />
              </h3>
            </FadeIn>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FadeInStagger className="contents">
                {service.map((item, i) => (
                  <FadeInItem
                    key={i}
                    className="bg-background p-5 sm:p-6 md:p-8 border border-border/50 hover:border-primary/20 transition-colors shadow-sm"
                  >
                    <h4 className="text-lg font-serif text-primary mb-3 leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-sm font-sans text-foreground/70 leading-relaxed">
                      {item.description}
                    </p>
                  </FadeInItem>
                ))}
              </FadeInStagger>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
