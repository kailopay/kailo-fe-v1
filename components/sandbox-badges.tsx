export function SandboxBadges({ onPlate = false }: { onPlate?: boolean }): React.ReactElement {
  return (
    <div aria-label="Sandbox environment notice" className="kp-environment-badges" data-on-plate={onPlate}>
      <span className="kp-environment-badge" data-tone="sandbox">Sandbox</span>
      <span className="kp-environment-badge" data-tone="testnet">Stellar Testnet</span>
    </div>
  );
}
