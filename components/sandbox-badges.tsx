export function SandboxBadges({ onPlate = false }: { onPlate?: boolean }) {
  if (onPlate) {
    return (
      <div aria-label="Sandbox environment notice" className="flex items-center gap-2">
        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-sun">
          Sandbox
        </span>
        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-sky">
          Stellar Testnet
        </span>
      </div>
    );
  }

  return (
    <div aria-label="Sandbox environment notice" className="flex items-center gap-2">
      <span className="rounded-full bg-sun-tint px-2.5 py-0.5 text-xs font-medium text-sun-deep">
        Sandbox
      </span>
      <span className="rounded-full bg-sky-tint px-2.5 py-0.5 text-xs font-medium text-sky-deep">
        Stellar Testnet
      </span>
    </div>
  );
}
