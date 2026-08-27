"use client";

import { useState } from "react";

export function NetworkSelector(): React.ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        className="inline-flex h-9 items-center gap-2 rounded-full border border-lilac/40 bg-lilac-tint px-3.5 text-sm font-semibold text-lilac-deep transition-colors hover:border-lilac"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span aria-hidden className="h-2 w-2 rounded-full bg-lilac" />
        Testnet
        <span aria-hidden className="text-xs">⌄</span>
      </button>
      {open && (
        <div
          className="absolute right-0 z-20 mt-2 w-56 rounded-2xl border border-line bg-white p-2 shadow-lg"
          role="listbox"
        >
          <button
            aria-selected="true"
            className="flex w-full items-start gap-3 rounded-xl bg-lilac-tint px-3 py-2.5 text-left"
            role="option"
            type="button"
          >
            <span aria-hidden className="mt-1.5 h-2 w-2 rounded-full bg-lilac" />
            <span>
              <span className="block text-sm font-semibold text-ink">Stellar Testnet</span>
              <span className="mt-0.5 block text-xs leading-5 text-ink-3">Sandbox network</span>
            </span>
          </button>
          <div aria-disabled="true" aria-selected="false" className="mt-1 flex items-start gap-3 rounded-xl px-3 py-2.5 opacity-55" role="option">
            <span aria-hidden className="mt-1.5 h-2 w-2 rounded-full bg-line-strong" />
            <span>
              <span className="block text-sm font-semibold text-ink-2">Mainnet</span>
              <span className="mt-0.5 block text-xs leading-5 text-ink-3">Available in a later release</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
