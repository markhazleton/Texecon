import { act, renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { reducer, toast, useToast } from "./use-toast";

describe("use-toast reducer", () => {
  it("adds a toast to the front of the list", () => {
    const state = reducer({ toasts: [] }, { type: "ADD_TOAST", toast: { id: "1", open: true } });
    expect(state.toasts).toHaveLength(1);
    expect(state.toasts[0].id).toBe("1");
  });

  it("caps the toast list at the toast limit", () => {
    const first = reducer({ toasts: [] }, { type: "ADD_TOAST", toast: { id: "1", open: true } });
    const second = reducer(first, { type: "ADD_TOAST", toast: { id: "2", open: true } });
    expect(second.toasts).toHaveLength(1);
    expect(second.toasts[0].id).toBe("2");
  });

  it("updates a matching toast by id", () => {
    const initial = { toasts: [{ id: "1", open: true, title: "Old" }] };
    const state = reducer(initial, {
      type: "UPDATE_TOAST",
      toast: { id: "1", title: "New" },
    });
    expect(state.toasts[0].title).toBe("New");
  });

  it("leaves non-matching toasts untouched on update", () => {
    const initial = { toasts: [{ id: "1", open: true, title: "Old" }] };
    const state = reducer(initial, {
      type: "UPDATE_TOAST",
      toast: { id: "2", title: "New" },
    });
    expect(state.toasts[0].title).toBe("Old");
  });

  it("marks a specific toast closed on dismiss", () => {
    const initial = { toasts: [{ id: "1", open: true }] };
    const state = reducer(initial, { type: "DISMISS_TOAST", toastId: "1" });
    expect(state.toasts[0].open).toBe(false);
  });

  it("marks all toasts closed when dismissing without an id", () => {
    const initial = {
      toasts: [
        { id: "1", open: true },
        { id: "2", open: true },
      ],
    };
    const state = reducer(initial, { type: "DISMISS_TOAST" });
    expect(state.toasts.every((t) => t.open === false)).toBe(true);
  });

  it("removes a specific toast", () => {
    const initial = {
      toasts: [
        { id: "1", open: true },
        { id: "2", open: true },
      ],
    };
    const state = reducer(initial, { type: "REMOVE_TOAST", toastId: "1" });
    expect(state.toasts).toHaveLength(1);
    expect(state.toasts[0].id).toBe("2");
  });

  it("clears all toasts when removing without an id", () => {
    const initial = {
      toasts: [
        { id: "1", open: true },
        { id: "2", open: true },
      ],
    };
    const state = reducer(initial, { type: "REMOVE_TOAST" });
    expect(state.toasts).toEqual([]);
  });
});

describe("toast() and useToast()", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    const { result, unmount } = renderHook(() => useToast());
    act(() => {
      result.current.dismiss();
    });
    unmount();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("adds a toast that the hook can observe", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      toast({ title: "Hello" });
    });

    expect(result.current.toasts[0].title).toBe("Hello");
  });

  it("dismisses a specific toast by id via the hook", () => {
    const { result } = renderHook(() => useToast());
    let created: ReturnType<typeof toast> | undefined;

    act(() => {
      created = toast({ title: "Dismiss me" });
    });

    act(() => {
      result.current.dismiss(created!.id);
    });

    expect(result.current.toasts[0].open).toBe(false);
  });

  it("dismisses every toast when called without an id", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      toast({ title: "One" });
    });

    act(() => {
      result.current.dismiss();
    });

    expect(result.current.toasts.every((t) => t.open === false)).toBe(true);
  });

  it("closes the toast when onOpenChange receives false", () => {
    const { result } = renderHook(() => useToast());
    let created: ReturnType<typeof toast> | undefined;

    act(() => {
      created = toast({ title: "Auto close" });
    });

    act(() => {
      result.current.toasts[0].onOpenChange?.(false);
    });

    expect(created).toBeDefined();
    expect(result.current.toasts[0].open).toBe(false);
  });

  it("updates a toast via the returned update function", () => {
    const { result } = renderHook(() => useToast());
    let created: ReturnType<typeof toast> | undefined;

    act(() => {
      created = toast({ title: "Before" });
    });

    act(() => {
      created!.update({ id: created!.id, title: "After" } as never);
    });

    expect(result.current.toasts[0].title).toBe("After");
  });
});
