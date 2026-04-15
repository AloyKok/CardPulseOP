"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import {
  executeAdminCommandAction,
  type AdminCommandActionState,
} from "@/app/admin/actions";

type ConsoleEntry = {
  id: number;
  command: string;
  ok: boolean;
  lines: string[];
};

const initialState: AdminCommandActionState = {
  nonce: 0,
  command: "",
  ok: true,
  lines: [],
};

const commandExamples = [
  "EB01-051",
  "EB01-051 24",
  "OP05-060 3",
  "ST01-001 12",
  "check updates",
];

export function AdminCommandConsole() {
  const [state, formAction, isPending] = useActionState(executeAdminCommandAction, initialState);
  const [history, setHistory] = useState<ConsoleEntry[]>([
    {
      id: 1,
      command: "System",
      ok: true,
      lines: [
        "Inventory console ready.",
        "Use a card code to check stock or set the quantity directly.",
      ],
    },
  ]);
  const [commandInput, setCommandInput] = useState("");
  const nextEntryIdRef = useRef(2);
  const historyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!state.nonce || !state.command) {
      return;
    }

    setHistory((current) => [
      ...current,
      {
        id: nextEntryIdRef.current++,
        command: state.command,
        ok: state.ok,
        lines: state.lines,
      },
    ]);
    setCommandInput("");
  }, [state]);

  useEffect(() => {
    if (!historyRef.current) {
      return;
    }

    historyRef.current.scrollTop = historyRef.current.scrollHeight;
  }, [history]);

  return (
    <section className="card-shell rounded-[2rem] p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-ink">Command console</h2>
          <p className="mt-2 max-w-2xl text-sm text-stone">
            Update stock from the keyboard using card codes. Quantity commands also refresh the card
            last-updated timestamp automatically.
          </p>
        </div>
        <div className="rounded-[1.2rem] bg-slate-50 px-4 py-3 text-sm text-stone">
          <p className="font-medium text-ink">Command examples</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {commandExamples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setCommandInput(example)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-ink transition hover:border-slate-300"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={historyRef}
        className="mt-5 max-h-[360px] space-y-3 overflow-y-auto rounded-[1.4rem] bg-[#08090b] p-3 sm:p-4"
      >
        {history.map((entry) => (
          <div
            key={entry.id}
            className={`rounded-[1.25rem] px-4 py-3 ${
              entry.command === "System"
                ? "bg-white/8 text-slate-200"
                : entry.ok
                  ? "bg-emerald-500/12 text-slate-100 ring-1 ring-emerald-400/18"
                  : "bg-red-500/12 text-slate-100 ring-1 ring-red-400/18"
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              {entry.command === "System" ? "System" : `Command · ${entry.command}`}
            </p>
            <div className="mt-2 space-y-1.5 text-sm leading-6">
              {entry.lines.map((line, index) => (
                <p key={`${entry.id}-${index}`}>{line}</p>
              ))}
            </div>
          </div>
        ))}
        {isPending ? (
          <div className="rounded-[1.25rem] bg-white/8 px-4 py-3 text-sm text-slate-200">
            Running command...
          </div>
        ) : null}
      </div>

      <form action={formAction} className="mt-4 space-y-3">
        <label htmlFor="command" className="block text-sm font-medium text-stone">
          Type a command
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="command"
            name="command"
            value={commandInput}
            onChange={(event) => setCommandInput(event.target.value)}
            placeholder="Example: EB01-051 24"
            className="field min-h-[52px] flex-1"
            autoComplete="off"
          />
          <button type="submit" className="btn-primary min-h-[52px] shrink-0" disabled={isPending}>
            {isPending ? "Running..." : "Run command"}
          </button>
        </div>
        <p className="text-xs text-stone">
          Supported: <span className="font-medium text-ink">CODE</span>,{" "}
          <span className="font-medium text-ink">CODE 24</span>, and{" "}
          <span className="font-medium text-ink">check updates</span>.
        </p>
      </form>
    </section>
  );
}
