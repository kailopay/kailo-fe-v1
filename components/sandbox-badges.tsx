export function SandboxBadges({ onPlate = false }: { onPlate?: boolean }) {
  if (onPlate) {
    return (
      <div aria-label="Sandbox environment notice" className="flex items-center gap-2">
        <span className="rounded-full bg-mango/20 px-2.5 py-0.5 text-xs font-medium text-mango">
          Sandbox
        </span>
        <span className="rounded-full bg-lilac/20 px-2.5 py-0.5 text-xs font-medium text-lilac">
          Stellar Testnet
        </span>
      </div>
    );
  }

  return (
    <div aria-label="Sandbox environment notice" className="flex items-center gap-2">
      <span className="rounded-full bg-mango-tint px-2.5 py-0.5 text-xs font-medium text-mango-deep">
        Sandbox
      </span>
      <span className="rounded-full bg-lilac-tint px-2.5 py-0.5 text-xs font-medium text-lilac-deep">
        Stellar Testnet
      </span>
    </div>
  );
}
