"use client";

// ═══════════════════════════════════════════════════════════
//  GEAR TOOTH SECTION DIVIDER
//  An SVG divider that looks like interlocking gear teeth
// ═══════════════════════════════════════════════════════════

interface Props {
  color?: string;
  flip?: boolean;
}

export default function GearDivider({ color = "#e62e2d", flip = false }: Props) {
  const teeth = 24;
  const toothW = 100 / teeth;
  const toothH = 12;

  // Generate gear tooth pattern
  let d = `M 0 ${flip ? 0 : toothH}`;
  for (let i = 0; i < teeth; i++) {
    const x = i * toothW;
    if (flip) {
      d += ` L ${x + toothW * 0.15} 0 L ${x + toothW * 0.15} ${toothH} L ${x + toothW * 0.85} ${toothH} L ${x + toothW * 0.85} 0`;
    } else {
      d += ` L ${x + toothW * 0.15} ${toothH} L ${x + toothW * 0.15} 0 L ${x + toothW * 0.85} 0 L ${x + toothW * 0.85} ${toothH}`;
    }
  }
  d += ` L 100 ${flip ? 0 : toothH}`;

  return (
    <div className="w-full overflow-hidden" style={{ height: toothH + 2, marginTop: flip ? 0 : -1, marginBottom: flip ? -1 : 0 }}>
      <svg
        viewBox={`0 0 100 ${toothH + 2}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height: toothH + 2 }}
      >
        <path d={d} fill="none" stroke={color} strokeWidth="0.3" opacity={0.25} />
        <path d={d} fill={`${color}08`} />
      </svg>
    </div>
  );
}
