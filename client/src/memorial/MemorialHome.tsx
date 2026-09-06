import React from "react";
import SEOHead from "@/components/seo-head";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Hero from "./components/sections/Hero";
import VideoFeature from "./components/sections/VideoFeature";
import DeferredPhotoGallery from "./components/sections/DeferredPhotoGallery";
import Biography from "./components/sections/Biography";
import Legacy from "./components/sections/Legacy";
import Publications from "./components/sections/Publications";
import FamilyNote from "./components/sections/FamilyNote";
import "./memorial.css";

export default function MemorialHome() {
  const memorialUrl =
    typeof window !== "undefined" && window.location.pathname.includes("/memorial/")
      ? "https://texecon.com/memorial/jared-earl-hazleton/"
      : "https://texecon.com/";

  const memorialStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${memorialUrl}#profile`,
        url: memorialUrl,
        name: "In Memory of Dr. Jared Earl Hazleton",
        dateCreated: "2026-09-03",
        dateModified: "2026-09-06",
        mainEntity: { "@id": `${memorialUrl}#jared-hazleton` },
      },
      {
        "@type": "Person",
        "@id": `${memorialUrl}#jared-hazleton`,
        name: "Dr. Jared Earl Hazleton",
        birthDate: "1937-09-12",
        deathDate: "2026-09-03",
        description: "American economist, educator, public servant, and principal of TexEcon.",
        image: "https://texecon.com/jared-hazleton.png",
        jobTitle: ["Economist", "Educator", "Public Servant", "Principal"],
        worksFor: { "@type": "Organization", name: "TexEcon", url: "https://texecon.com/" },
        sameAs: [
          "https://fortworthreport.org/2026/09/04/jared-earl-hazleton-september-12-1937-september-3-2026/",
          "https://www.dignitymemorial.com/obituaries/arlington-tx/jared-hazleton-13026327",
        ],
      },
      {
        "@type": "WebPage",
        "@id": `${memorialUrl}#webpage`,
        url: memorialUrl,
        name: "Dr. Jared Earl Hazleton Obituary & Memorial",
        description:
          "Remembering Dr. Jared Earl Hazleton, Texas economist, educator, public servant, and principal of TexEcon.",
        about: { "@id": `${memorialUrl}#jared-hazleton` },
        isPartOf: { "@type": "WebSite", name: "TexEcon", url: "https://texecon.com/" },
        inLanguage: "en-US",
      },
      {
        "@type": "Event",
        "@id": `${memorialUrl}#celebration-of-life`,
        name: "Celebration of Life for Dr. Jared Earl Hazleton",
        description:
          "A gathering to remember Jared Hazleton, celebrate his life, share stories, and give thanks for the many years his family and friends were blessed to have him.",
        startDate: "2026-09-19T16:00:00-05:00",
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: {
          "@type": "Place",
          name: "Celebration Community Church",
          address: {
            "@type": "PostalAddress",
            streetAddress: "908 Pennsylvania Avenue",
            addressLocality: "Fort Worth",
            addressRegion: "TX",
            postalCode: "76104",
            addressCountry: "US",
          },
        },
      },
    ],
  };

  return (
    <div className="memorial-page min-h-screen flex flex-col bg-background">
      <SEOHead
        title="Dr. Jared Earl Hazleton Obituary & Memorial | TexEcon"
        description="Remembering Dr. Jared Earl Hazleton (September 12, 1937–September 3, 2026), Texas economist, educator, public servant, and principal of TexEcon. Read his biography, legacy, publications, and family tribute."
        keywords={[
          "Jared Hazleton",
          "memorial",
          "economist",
          "educator",
          "public service",
          "obituary",
          "Jared Hazleton biography",
          "TexEcon",
        ]}
        image="https://texecon.com/jared-hazleton.png"
        url={memorialUrl}
        type="profile"
        author="TexEcon"
      />
      <script type="application/ld+json">{JSON.stringify(memorialStructuredData)}</script>
      <div className="texture-overlay" aria-hidden="true" />
      <Navbar />

      <main className="flex-grow">
        <Hero />
        <VideoFeature />
        <DeferredPhotoGallery />
        <Biography />
        <Legacy />
        <Publications />
        <FamilyNote />
      </main>

      <Footer />
    </div>
  );
}
