"use client";

import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type SelectGroup = {
  label: string;
  options: readonly string[];
};

type AdminSelectProps = {
  name: string;
  label: string;
  value: string;
  options?: readonly string[];
  groups?: readonly SelectGroup[];
};

export function AdminSelect({ name, label, value, options, groups }: AdminSelectProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(value);
  const [panelStyle, setPanelStyle] = useState<{ left: number; top: number; width: number } | null>(
    null,
  );

  useEffect(() => {
    setSelected(value);
  }, [value]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const updatePanelPosition = () => {
      if (!triggerRef.current) {
        return;
      }

      const rect = triggerRef.current.getBoundingClientRect();
      const margin = 16;
      const width = Math.min(rect.width, window.innerWidth - margin * 2);
      const left = Math.min(
        Math.max(margin, rect.left),
        Math.max(margin, window.innerWidth - width - margin),
      );

      setPanelStyle({
        left,
        top: rect.bottom + 10,
        width,
      });
    };

    updatePanelPosition();

    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);

    return () => {
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
    };
  }, [open]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }

      if (!rootRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const flattenedOptions = useMemo(() => {
    if (groups) {
      return groups.flatMap((group) => group.options);
    }

    return options ? [...options] : [];
  }, [groups, options]);

  const dropdownPanel =
    open && panelStyle
      ? createPortal(
          <div
            ref={panelRef}
            className="fixed z-[100] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_24px_48px_rgba(15,23,42,0.18)]"
            style={{
              left: panelStyle.left,
              top: panelStyle.top,
              width: panelStyle.width,
            }}
          >
            <div className="max-h-[50vh] overflow-y-auto p-3 sm:max-h-[320px]">
              {groups ? (
                <div className="space-y-4">
                  {groups.map((group) => (
                    <div key={group.label} className="space-y-2">
                      <p className="px-2 text-xs font-bold uppercase tracking-[0.18em] text-stone">
                        {group.label}
                      </p>
                      <div className="space-y-1">
                        {group.options.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              setSelected(option);
                              setOpen(false);
                            }}
                            className={cn(
                              "flex w-full items-center rounded-[1rem] px-4 py-3 text-left text-sm text-ink transition",
                              selected === option ? "bg-slate-100 font-semibold" : "hover:bg-slate-50",
                            )}
                          >
                            <span className="line-clamp-2">{option}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {flattenedOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setSelected(option);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center rounded-[1rem] px-4 py-3 text-left text-sm text-ink transition",
                        selected === option ? "bg-slate-100 font-semibold" : "hover:bg-slate-50",
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className={cn("relative", open && "z-40")}>
      <label className="mb-2 block text-sm font-medium text-stone">{label}</label>
      <input type="hidden" name={name} value={selected} />
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "field flex min-h-[56px] items-center justify-between rounded-[1.25rem] px-4 text-left",
          open && "border-white/70 shadow-[0_0_0_4px_rgba(255,255,255,0.12)]",
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate text-base text-ink">{selected}</span>
        <span className={cn("ml-3 text-slate-400 transition-transform", open && "rotate-180")}>
          <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5 stroke-current" aria-hidden="true">
            <path d="M4 7.5L10 13.5L16 7.5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      {dropdownPanel}
    </div>
  );
}
