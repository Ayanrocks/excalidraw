import React, { useState, useMemo, useRef, useEffect } from "react";
import { useApp } from "./App";
import DropdownMenu from "./dropdownMenu/DropdownMenu";
import systemDesignLib from "./SystemDesignLibrary.json";
import { distributeLibraryItemsOnSquareGrid } from "../data/library";
import { deburr } from "../deburr";
import { TextField } from "./TextField";
import { exportToSvg } from "@excalidraw/utils/export";
import { COLOR_PALETTE } from "@excalidraw/common";
import clsx from "clsx";
import "./SystemDesignDropdown.scss";

// Toolbar trigger icon (database/cylinder)
const systemDesignIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="system-design-trigger-icon"
    style={{ width: "1.2rem", height: "1.2rem" }}
  >
    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
  </svg>
);

const clearIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

/**
 * Global SVG cache shared across all LibraryItemView instances.
 * Prevents redundant exportToSvg calls on re-render.
 */
const globalSvgCache = new Map<string, string>();

/**
 * Renders a single library item card with an async SVG preview
 * and a visible text label as fallback.
 */
const LibraryItemView = ({
  item,
  onClick,
}: {
  item: any;
  onClick: () => void;
}) => {
  const [svgLoaded, setSvgLoaded] = useState(
    () => globalSvgCache.has(item?.id),
  );

  useEffect(() => {
    if (!item?.elements?.length || !item?.id) {
      return;
    }

    if (globalSvgCache.has(item.id)) {
      setSvgLoaded(true);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const svg = await exportToSvg({
          elements: item.elements,
          appState: {
            exportBackground: false,
            viewBackgroundColor: COLOR_PALETTE.white,
          },
          files: null,
          renderEmbeddables: false,
          skipInliningFonts: true,
        });

        if (cancelled) {
          return;
        }

        svg.querySelector(".style-fonts")?.remove();
        const svgHtml = svg.outerHTML;
        globalSvgCache.set(item.id, svgHtml);

        if (!cancelled) {
          setSvgLoaded(true);
        }
      } catch {
        // Fallback
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [item?.id, item?.elements]);

  const itemName = item?.name || "Unknown Component";
  const cachedSvg = globalSvgCache.get(item?.id);

  return (
    <div
      className="system-design-dropdown-item"
      onClick={onClick}
      title={itemName}
    >
      <div
        className={clsx("system-design-dropdown-item-svg", {
          "system-design-dropdown-item-svg--loaded": svgLoaded && cachedSvg,
        })}
      >
        {(!svgLoaded || !cachedSvg) ? (
          <div className="system-design-svg-placeholder" />
        ) : (
          <div
            className="system-design-svg-inner"
            dangerouslySetInnerHTML={{ __html: cachedSvg }}
            style={{ width: "100%", height: "100%", minWidth: 0, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
          />
        )}
      </div>
      <div className="system-design-dropdown-item-name">
        {itemName}
      </div>
    </div>
  );
};

export const SystemDesignDropdown = () => {
  const app = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const items = Array.isArray(systemDesignLib?.library) 
    ? systemDesignLib.library 
    : (Array.isArray(systemDesignLib) ? systemDesignLib : []);

  const filteredItems = useMemo(() => {
    const query = deburr(search.trim().toLowerCase());
    if (!query) {
      return items;
    }
    return items.filter((item) =>
      deburr((item?.name || "").toLowerCase()).includes(query),
    );
  }, [items, search]);

  return (
    <DropdownMenu open={isOpen}>
      <DropdownMenu.Trigger
        className={clsx("App-toolbar__extra-tools-trigger", {
          "App-toolbar__extra-tools-trigger--selected": isOpen,
        })}
        onToggle={() => setIsOpen(!isOpen)}
        title="System Design Components"
      >
        {systemDesignIcon}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        onClickOutside={() => setIsOpen(false)}
        className="system-design-dropdown-content"
      >
        <div className="system-design-dropdown-header">
          <TextField
            value={search}
            onChange={(val) => setSearch(val)}
            placeholder="Search components..."
            className="system-design-search"
          />
          {search && (
            <button
              className="system-design-clear-search"
              onClick={() => setSearch("")}
              title="Clear Search"
            >
              {clearIcon}
            </button>
          )}
        </div>
        <div className="system-design-dropdown-list">
          {filteredItems.length > 0 ? filteredItems.map((item) => (
            <LibraryItemView
              key={item?.id || Math.random().toString()}
              item={item}
              onClick={() => {
                if (item?.elements) {
                  app.onInsertElements(
                    distributeLibraryItemsOnSquareGrid([
                      {
                        status: "published",
                        elements: item.elements as any,
                        id: item.id,
                        created: Date.now(),
                      },
                    ]),
                  );
                  setIsOpen(false);
                }
              }}
            />
          )) : (
            <div className="system-design-empty" style={{ gridColumn: "span 2", textAlign: "center", padding: "20px", color: "#e2e8f0" }}>No components found</div>
          )}
        </div>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
