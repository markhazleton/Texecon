import React from "react";
import SEOHead from "@/components/seo-head";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Hero from "./components/sections/Hero";
import VideoFeature from "./components/sections/VideoFeature";
import Biography from "./components/sections/Biography";
import Legacy from "./components/sections/Legacy";
import Publications from "./components/sections/Publications";
import FamilyNote from "./components/sections/FamilyNote";
import "./memorial.css";

export default function MemorialHome() {
  return (
    <div className="memorial-page min-h-screen flex flex-col bg-background">
      <SEOHead
        title="In Memory of Dr. Jared Earl Hazleton (1937–2026)"
        description="A memorial for Dr. Jared Earl Hazleton, September 12, 1937 – September 3, 2026: economist, educator, public servant, and principal of TexEcon."
        keywords={[
          "Jared Hazleton",
          "memorial",
          "economist",
          "educator",
          "public service",
          "TexEcon",
        ]}
        image="https://texecon.com/jared-hazleton.png"
        url="https://texecon.com"
        type="profile"
        author="TexEcon"
      />
      <div className="texture-overlay" aria-hidden="true" />
      <Navbar />

      <main className="flex-grow">
        <Hero />
        <VideoFeature />
        <Biography />
        <Legacy />
        <Publications />
        <FamilyNote />
      </main>

      <Footer />
    </div>
  );
}
