import type { SeatKind } from "@/lib/db/enums";

export type SeatVisualState = "available" | "selected" | "taken" | "inactive";

type Palette = { body: string; cushion: string; text: string; stroke?: string };

const DARK: Record<SeatVisualState, Palette> = {
  available: { body: "#a95c37", cushion: "#c98256", text: "#2b1810" },
  selected: { body: "#efe4d2", cushion: "#e2471f", text: "#efe4d2" },
  taken: { body: "#35271f", cushion: "#2a1f1a", text: "#6b584b" },
  inactive: { body: "transparent", cushion: "transparent", text: "#6b584b", stroke: "#6b584b" },
};

const LIGHT: Record<SeatVisualState, Palette> = {
  available: { body: "#b0623b", cushion: "#cf8a5c", text: "#3a1d0f" },
  selected: { body: "#1b1512", cushion: "#931a14", text: "#efe4d2" },
  taken: { body: "#cdbd9f", cushion: "#c2b090", text: "#8c7a63" },
  inactive: { body: "transparent", cushion: "transparent", text: "#9a8a76", stroke: "#9a8a76" },
};

/**
 * One chair seen from above, centred on (0,0), facing the screen (−y).
 * Armchair: club chair with back and arms. Lounge: the low shell chairs of the
 * front row. Saucer: the wide bowl chairs at the back.
 */
export function SeatGlyph({
  kind,
  state,
  tone = "dark",
  number,
  showNumber = true,
}: {
  kind: SeatKind;
  state: SeatVisualState;
  tone?: "dark" | "light";
  number?: number;
  showNumber?: boolean;
}) {
  const p = (tone === "dark" ? DARK : LIGHT)[state];
  const stroke = p.stroke ? { stroke: p.stroke, strokeWidth: 2, strokeDasharray: "5 5" } : {};

  let shape;
  let labelY = -4;
  switch (kind) {
    case "lounge":
      shape = (
        <>
          <path
            d="M0 -43 C 29 -43 44 -20 44 4 C 44 29 25 44 0 44 C -25 44 -44 29 -44 4 C -44 -20 -29 -43 0 -43 Z"
            fill={p.body}
            {...stroke}
          />
          <ellipse cx="0" cy="-7" rx="29" ry="28" fill={p.cushion} />
        </>
      );
      labelY = -2;
      break;
    case "saucer":
      shape = (
        <>
          <ellipse cx="0" cy="0" rx="60" ry="42" fill={p.body} {...stroke} />
          <ellipse cx="0" cy="-8" rx="45" ry="29" fill={p.cushion} />
        </>
      );
      labelY = -3;
      break;
    default:
      shape = (
        <>
          <rect x="-39" y="-34" width="78" height="69" rx="13" fill={p.body} {...stroke} />
          <rect x="-26" y="-32" width="52" height="46" rx="8" fill={p.cushion} />
        </>
      );
  }

  return (
    <>
      {shape}
      {state === "taken" ? (
        <path d="M-8 -12 L8 4 M8 -12 L-8 4" stroke={p.text} strokeWidth="3" strokeLinecap="round" />
      ) : (
        showNumber &&
        number != null && (
          <text
            x="0"
            y={labelY}
            textAnchor="middle"
            dominantBaseline="central"
            fill={p.text}
            className="font-label"
            style={{ fontSize: 22, letterSpacing: 0 }}
          >
            {number}
          </text>
        )
      )}
    </>
  );
}
