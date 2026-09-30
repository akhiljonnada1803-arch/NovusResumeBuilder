"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, ArrowRight, Keyboard } from "lucide-react";

interface NavLink {
  readonly href: string;
  readonly label: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly badge?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (href: string) => void;
  links: readonly NavLink[];
}

export function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  links,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter links by fuzzy query
  const filtered = query.trim()
    ? links.filter((l) =>
        l.label.toLowerCase().includes(query.toLowerCase().trim())
      )
    : [...links];

  // Keyboard shortcut: Cmd+K / Ctrl+K to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!isOpen) onClose(); // handled externally — re-fire open via layout
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Focus input when opened; reset state
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      // Defer to let the portal render first
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        const item = filtered[selectedIndex];
        if (item) onNavigate(item.href);
      }
    },
    [filtered, selectedIndex, onClose, onNavigate]
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Palette Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 pointer-events-none"
      >
        <div className="pointer-events-auto w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl shadow-black/40 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search pages..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground text-foreground outline-none"
            />
            <kbd className="text-[10px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded border border-border/80 flex-shrink-0">
              Esc
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[340px] overflow-y-auto py-2">
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No results for &ldquo;{query}&rdquo;
              </div>
            ) : (
              <>
                <div className="px-3 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Navigation
                </div>
                {filtered.map((link, idx) => {
                  const Icon = link.icon;
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={link.href}
                      onClick={() => onNavigate(link.href)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 mx-1 rounded-lg text-sm transition-colors ${
                        isSelected
                          ? "bg-primary/10 text-foreground"
                          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 ${isSelected ? "text-primary" : ""}`}
                      />
                      <span className="flex-1 text-left">{link.label}</span>
                      {link.badge && (
                        <span className="text-[9px] font-bold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-full">
                          {link.badge}
                        </span>
                      )}
                      {isSelected && (
                        <ArrowRight className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </>
            )}
          </div>

          {/* Footer hints */}
          <div className="border-t border-border px-4 py-2.5 flex items-center gap-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Keyboard className="w-3 h-3" /> Navigate
            </span>
            <span>↑↓ to move</span>
            <span>↵ to open</span>
            <span>Esc to close</span>
          </div>
        </div>
      </div>
    </>
  );
}
