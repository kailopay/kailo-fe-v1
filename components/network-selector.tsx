"use client";

import { useState } from "react";

export function NetworkSelector(): React.ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <div className="kp-network-selector">
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        className="kp-network-trigger"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        Testnet
        <span aria-hidden className={open ? "kp-network-chevron is-open" : "kp-network-chevron"} />
      </button>
      {open && (
        <div className="kp-network-menu" role="listbox">
          <button
            aria-selected="true"
            className="kp-network-option"
            data-active="true"
            role="option"
            type="button"
          >
            <span aria-hidden className="kp-network-option-mark" />
            <span>
              <span className="block text-sm font-bold text-ink">Stellar Testnet</span>
              <span className="mt-1 block text-xs leading-5 text-ink-3">Sandbox network</span>
            </span>
          </button>
          <div
            aria-disabled="true"
            aria-selected="false"
            className="kp-network-option"
            data-disabled="true"
            role="option"
          >
            <span aria-hidden className="kp-network-option-mark" />
            <span>
              <span className="block text-sm font-bold text-ink-2">Mainnet</span>
              <span className="mt-1 block text-xs leading-5 text-ink-3">Available in a later release</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
