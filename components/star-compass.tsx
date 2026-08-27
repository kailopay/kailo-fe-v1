type Tick = { x1: number; y1: number; x2: number; y2: number };

function buildTicks(cx: number, cy: number, rInner: number, rOuter: number): Tick[] {
  const ticks: Tick[] = [];
  for (let i = 0; i < 72; i++) {
    const angle = (i * 5 * Math.PI) / 180;
    const major = i % 3 === 0;
    const outer = major ? rOuter : rOuter - 6;
    ticks.push({
      x1: cx + Math.cos(angle) * rInner,
      y1: cy + Math.sin(angle) * rInner,
      x2: cx + Math.cos(angle) * outer,
      y2: cy + Math.sin(angle) * outer,
    });
  }
  return ticks;
}

function buildStarRays(cx: number, cy: number, long: number, short: number) {
  return Array.from({ length: 8 }, (_, i) => {
    const angle = (i * 45 * Math.PI) / 180 - Math.PI / 2;
    const r = i % 2 === 0 ? long : short;
    return {
      x1: cx,
      y1: cy,
      x2: cx + Math.cos(angle) * r,
      y2: cy + Math.sin(angle) * r,
    };
  });
}

const horizonStars = [
  { x: 140, label: "created", delay: "0.9s", mark: "var(--sky)", text: "var(--sky-deep)" },
  { x: 260, label: "payment_pending", delay: "1.1s", mark: "var(--sea)", text: "var(--sea-deep)" },
  { x: 380, label: "stellar_processing", delay: "1.3s", mark: "var(--orchid)", text: "var(--orchid-deep)" },
  { x: 500, label: "completed", delay: "1.5s", mark: "var(--gold)", text: "var(--brass-text)" },
] as const;

export function StarCompass() {
  const cx = 320;
  const cy = 290;
  const ticks = buildTicks(cx, cy, 250, 262);

  return (
    <svg
      aria-label="A star compass plotting the IDR to XLM corridor across Stellar testnet"
      role="img"
      viewBox="0 0 640 660"
      className="h-auto w-full"
    >
      {/* plate corner brackets */}
      {[
        "M12 44 V12 H44",
        "M596 12 H628 V44",
        "M628 548 V628 H552",
        "M88 628 H12 V548",
      ].map((d) => (
        <path d={d} key={d} stroke="var(--line-strong)" fill="none" strokeWidth="1" />
      ))}

      {/* rings */}
      <circle cx={cx} cy={cy} r={250} stroke="var(--ink-3)" strokeWidth="0.75" fill="none" />
      <circle cx={cx} cy={cy} r={236} stroke="var(--line)" strokeWidth="1" fill="none" />
      <circle cx={cx} cy={cy} r={178} stroke="var(--brass)" strokeWidth="0.75" fill="none" />

      {/* tick ring */}
      {ticks.map((t, i) => (
        <line
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          key={i}
          stroke={i % 9 === 0 ? "var(--ink-2)" : "var(--line-strong)"}
          strokeWidth={i % 9 === 0 ? 1 : 0.75}
        />
      ))}

      {/* degree labels */}
      {[
        { x: cx, y: cy - 284, label: "0" },
        { x: cx + 292, y: cy + 4, label: "90" },
        { x: cx, y: cy + 296, label: "180" },
        { x: cx - 296, y: cy + 4, label: "270" },
      ].map((d) => (
        <text
          key={d.label}
          x={d.x}
          y={d.y}
          fill="var(--ink-3)"
          fontSize="11"
          textAnchor="middle"
          fontFamily="var(--font-sans)"
        >
          {d.label}
        </text>
      ))}

      {/* compass rose: four cardinal points, ink half-filled */}
      {[
        { angle: -90, len: 96 },
        { angle: 0, len: 64 },
        { angle: 90, len: 64 },
        { angle: 180, len: 64 },
      ].map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const tipX = cx + Math.cos(rad) * p.len;
        const tipY = cy + Math.sin(rad) * p.len;
        const perpX = Math.cos(rad + Math.PI / 2) * 7;
        const perpY = Math.sin(rad + Math.PI / 2) * 7;
        const baseInner = 12;
        const baseX = cx + Math.cos(rad) * baseInner;
        const baseY = cy + Math.sin(rad) * baseInner;
        return (
          <g key={p.angle}>
            <path
              d={`M${tipX} ${tipY} L${baseX + perpX} ${baseY + perpY} L${cx} ${cy} Z`}
              fill="var(--ink)"
            />
            <path
              d={`M${tipX} ${tipY} L${baseX - perpX} ${baseY - perpY} L${cx} ${cy} Z`}
              fill="none"
              stroke="var(--ink)"
              strokeWidth="1"
            />
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={3} fill="var(--ink)" />

      {/* the plotted corridor: idr port to xlm star */}
      <circle cx={168} cy={432} r={4.5} fill="var(--ink)" />
      <text x={150} y={458} fill="var(--ink-2)" fontSize="12.5" fontFamily="var(--font-sans)">
        IDR port
      </text>

      {/* bearing line, drawn once */}
      <path
        d="M172 428 Q 330 300 458 186"
        stroke="var(--brass)"
        strokeWidth="1.5"
        fill="none"
        className="compass-draw"
        style={{ "--len": 420 } as React.CSSProperties}
      />
      <circle cx={296} cy={362} r={3} stroke="var(--brass)" strokeWidth="1.25" fill="var(--paper)" />
      <circle cx={402} cy={264} r={3} stroke="var(--brass)" strokeWidth="1.25" fill="var(--paper)" />
      <path d="M448 196 L462 182 M452 196 L464 186" stroke="var(--brass)" strokeWidth="1.5" fill="none" />

      {/* the xlm star, arriving */}
      <g className="compass-star" style={{ animationDelay: "1.7s" }}>
        {buildStarRays(478, 166, 17, 10).map((r, i) => (
          <line
            x1={r.x1}
            y1={r.y1}
            x2={r.x2}
            y2={r.y2}
            key={i}
            stroke="var(--gold)"
            strokeWidth={i % 2 === 0 ? 2 : 1.25}
          />
        ))}
        <circle cx={478} cy={166} r={2.75} fill="var(--gold)" />
      </g>
      <text x={500} y={150} fill="var(--brass-text)" fontSize="12.5" fontFamily="var(--font-sans)">
        XLM, Stellar testnet
      </text>

      {/* horizon of states */}
      <line x1={90} y1={528} x2={550} y2={528} stroke="var(--line-strong)" strokeWidth="1" />
      {horizonStars.map((s) => (
        <g className="compass-star" key={s.label} style={{ animationDelay: s.delay }}>
          <line x1={s.x} y1={521} x2={s.x} y2={528} stroke={s.mark} strokeWidth="1" />
          <line x1={s.x - 3.5} y1={524.5} x2={s.x + 3.5} y2={524.5} stroke={s.mark} strokeWidth="1" />
        </g>
      ))}
      {horizonStars.map((s) => (
        <text
          key={s.label}
          x={s.x}
          y={548}
          fill={s.text}
          fontSize="10.5"
          textAnchor="middle"
          fontFamily="var(--font-sans)"
        >
          {s.label}
        </text>
      ))}

      <text x={90} y={578} fill="var(--ink-3)" fontSize="10.5" fontFamily="var(--font-sans)">
        One-way states, no cancel, poll every 3 to 5 seconds
      </text>
    </svg>
  );
}
