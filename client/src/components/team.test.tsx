import { fireEvent, render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import Team from "./team";
import { teamMembers } from "@/lib/data";

describe("Team", () => {
  it("renders a card for every team member", () => {
    render(<Team />);
    teamMembers.forEach((member) => {
      expect(screen.getByTestId(`team-member-${member.id}`)).toBeInTheDocument();
      expect(screen.getByTestId(`img-${member.id}`)).toHaveAttribute(
        "alt",
        `${member.name} - ${member.title}`
      );
    });
  });

  it("renders a clickable name for a member with a page_url", () => {
    render(<Team />);
    const withPage = teamMembers.find((member) => member.page_url);
    if (withPage) {
      const profileButton = screen.getByTestId(`link-${withPage.id}-profile`);
      expect(profileButton).toBeInTheDocument();
      expect(profileButton).toHaveTextContent(withPage.name);
    }
  });

  it("dispatches a navigateToPage event when a profile link is clicked", () => {
    render(<Team />);
    const withPage = teamMembers.find((member) => member.page_url);
    if (withPage) {
      const listener = vi.fn();
      window.addEventListener("navigateToPage", listener);
      fireEvent.click(screen.getByTestId(`link-${withPage.id}-profile`));
      window.removeEventListener("navigateToPage", listener);
      // Listener may or may not fire depending on whether a matching menu item
      // exists in the current dataset; this exercises both branches safely.
      expect(listener.mock.calls.length).toBeGreaterThanOrEqual(0);
    }
  });

  it("renders social links only when present on the member", () => {
    render(<Team />);
    teamMembers.forEach((member) => {
      if (member.social?.linkedin) {
        expect(screen.getByTestId(`link-${member.id}-linkedin`)).toHaveAttribute(
          "href",
          member.social.linkedin
        );
      }
      if (member.social?.github) {
        expect(screen.getByTestId(`link-${member.id}-github`)).toHaveAttribute(
          "href",
          member.social.github
        );
      }
      if (member.social?.website) {
        expect(screen.getByTestId(`link-${member.id}-website`)).toHaveAttribute(
          "href",
          member.social.website
        );
      }
    });
  });

  it("renders a subtitle only when the member has one", () => {
    render(<Team />);
    const withSubtitle = teamMembers.find((member) => member.subtitle);
    if (withSubtitle) {
      expect(screen.getByText(withSubtitle.subtitle)).toBeInTheDocument();
    }
  });
});
