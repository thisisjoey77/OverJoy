"use client";

import type { Tag } from "@/lib/store";

export type TagAppearance = "markers" | "amount";

function outline(background: string, textColor: string) {
  return background.toLowerCase() === "#ffffff" || textColor.toLowerCase() === "#ffffff"
    ? "#000000"
    : textColor;
}

export function TagVisual({
  general,
  specific,
  amount,
  appearance,
}: {
  general?: Tag;
  specific?: Tag;
  amount: string;
  appearance: TagAppearance;
}) {
  if (appearance === "amount") {
    const first = general ?? specific;
    const primaryFill = first?.bg ?? "#ececea";
    const primaryColor = first?.color ?? "#111111";
    return (
      <svg className="integrated-tag" width="128" height="24" viewBox="0 0 128 24" role="img">
        <path d="M1 2H127V22H1Z" fill={primaryFill} />
        {general && specific && (
          <path d="M96 2H127V22H96L78 12Z" fill={specific.bg} />
        )}
        <path
          d="M1 2H127V22H1Z"
          fill="none"
          stroke={outline(primaryFill, primaryColor)}
          strokeWidth="1.4"
          strokeLinejoin="miter"
          vectorEffect="non-scaling-stroke"
        />
        {general && specific && (
          <path
            d="M96 2 78 12 96 22"
            fill="none"
            stroke={outline(specific.bg, specific.color)}
            strokeWidth="1.4"
            strokeLinejoin="miter"
            vectorEffect="non-scaling-stroke"
          />
        )}
        <text x="38" y="16" textAnchor="middle" fill={primaryColor} className="integrated-tag-text">
          {amount}
        </text>
      </svg>
    );
  }

  const strokeWidth = 1.4;
  return (
    <svg className="mini-mark" width="42" height="20" viewBox="0 0 42 20" role="img">
      {general && specific ? (
        <>
          <path
            d="M1 10 9 2h15l-6 8 6 8H9z"
            fill={general.bg}
            stroke={outline(general.bg, general.color)}
            strokeWidth={strokeWidth}
            strokeLinejoin="miter"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M18 10 24 2h17v16H24z"
            fill={specific.bg}
            stroke={outline(specific.bg, specific.color)}
            strokeWidth={strokeWidth}
            strokeLinejoin="miter"
            vectorEffect="non-scaling-stroke"
          />
        </>
      ) : general ? (
        <path
          d="M1 10 9 2h25l-7 8 7 8H9z"
          fill={general.bg}
          stroke={outline(general.bg, general.color)}
          strokeWidth={strokeWidth}
          strokeLinejoin="miter"
          vectorEffect="non-scaling-stroke"
        />
      ) : specific ? (
        <path
          d="M1 10 9 2h32v16H9z"
          fill={specific.bg}
          stroke={outline(specific.bg, specific.color)}
          strokeWidth={strokeWidth}
          strokeLinejoin="miter"
          vectorEffect="non-scaling-stroke"
        />
      ) : (
        <path d="M1 10 9 2h32v16H9z" fill="#ececea" stroke="#787774" strokeWidth={strokeWidth} />
      )}
    </svg>
  );
}
