import { fireEvent, render, screen } from "@testing-library/react";
import galleryPhotos from "@/data/memorial-gallery.json";
import { MemorialGallery } from "./PhotoGallery";

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

describe("MemorialGallery", () => {
  it("supports button and keyboard navigation with an announced position", () => {
    render(<MemorialGallery />);

    expect(screen.getByText(`1 / ${galleryPhotos.length}`)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Show next photograph" }));
    expect(screen.getByText(`2 / ${galleryPhotos.length}`)).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole("group", { name: "Hazleton family memorial photographs" }), {
      key: "ArrowLeft",
    });
    expect(screen.getByText(`1 / ${galleryPhotos.length}`)).toBeInTheDocument();
  });

  it("opens and closes the enlarged view", () => {
    render(<MemorialGallery />);

    fireEvent.click(screen.getByRole("button", { name: "Enlarge current photograph" }));
    expect(
      screen.getByRole("dialog", { name: `Photograph 1 of ${galleryPhotos.length}` })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close enlarged photograph" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
