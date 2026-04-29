import React from "react";
import { Excalidraw } from "../index";
import { render, fireEvent, waitFor } from "../tests/test-utils";

describe("SystemDesignDropdown", () => {
  beforeEach(async () => {
    await render(<Excalidraw handleKeyboardGlobally />);
  });

  it("should open dropdown and show components on click", async () => {
    // Find the trigger
    const trigger = document.querySelector(".App-toolbar__extra-tools-trigger[title='System Design Components']");
    expect(trigger).not.toBeNull();

    // Click trigger
    fireEvent.click(trigger!);

    // Should open dropdown content
    const dropdown = document.querySelector(".system-design-dropdown-content");
    expect(dropdown).not.toBeNull();

    // Should contain "Client" component from our library (first item usually)
    await waitFor(() => {
      const items = document.querySelectorAll(".system-design-dropdown-item-name");
      expect(items.length).toBeGreaterThan(0);
      expect(items[0].textContent).toBe("Client");
    });
  });

  it("should filter components via fuzzy search and clear search", async () => {
    const trigger = document.querySelector(".App-toolbar__extra-tools-trigger[title='System Design Components']");
    fireEvent.click(trigger!);

    const searchInput = document.querySelector(".system-design-search input") as HTMLInputElement;
    expect(searchInput).not.toBeNull();

    // Initially we have many items
    let items = document.querySelectorAll(".system-design-dropdown-item-name");
    expect(items.length).toBeGreaterThan(5);

    // Type into search
    fireEvent.change(searchInput, { target: { value: "relational" } });
    
    // Check if the clear button appears and items are filtered
    await waitFor(() => {
      expect(document.querySelector(".system-design-clear-search")).not.toBeNull();
      const filteredItems = document.querySelectorAll(".system-design-dropdown-item-name");
      expect(filteredItems.length).toBeGreaterThan(0);
      expect(filteredItems.length).toBeLessThan(items.length);
    });

    // Clear search
    const clearButton = document.querySelector(".system-design-clear-search");
    fireEvent.click(clearButton!);

    // Should clear the input and restore items
    await waitFor(() => {
      expect(searchInput.value).toBe("");
      expect(document.querySelector(".system-design-clear-search")).toBeNull();
      const restoredItems = document.querySelectorAll(".system-design-dropdown-item-name");
      expect(restoredItems.length).toBe(items.length);
    });
  });
});
