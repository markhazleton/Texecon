import SEOHead from "@/components/seo-head";
import Footer from "./components/layout/Footer";
import Navbar from "./components/layout/Navbar";
import PhotoGallery from "./components/sections/PhotoGallery";
import "./memorial.css";

export default function PhotoGalleryPage() {
  const galleryUrl = "https://texecon.com/jared-hazleton/gallery/";

  return (
    <div className="memorial-page min-h-screen flex flex-col bg-background">
      <SEOHead
        title="Jared Hazleton Family Photo Gallery | TexEcon"
        description="A full collection of family photographs preserved in memory of Dr. Jared Earl Hazleton."
        image="https://texecon.com/jared-hazleton.png"
        url={galleryUrl}
        type="website"
        author="TexEcon"
      />
      <Navbar />
      <main className="flex-grow pt-20">
        <PhotoGallery />
      </main>
      <Footer />
    </div>
  );
}
