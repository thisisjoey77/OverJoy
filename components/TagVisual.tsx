"use client";

import type { Tag } from "@/lib/store";

export type TagAppearance = "markers" | "amount";

function outline(background: string, textColor: string) {
  return background.toLowerCase() === "#ffffff" || textColor.toLowerCase() === "#ffffff"
    ? "#000000"
    : textColor;
}

function relativeLuminance(hex: string) {
  const rgb = hex.replace("#", "").match(/.{2}/g)?.map((part) => parseInt(part, 16) / 255) ?? [0, 0, 0];
  const linear = rgb.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
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
    const bgId = `tag-gradient-${general?.id ?? "none"}-${specific?.id ?? "none"}`;
    const first = general ?? specific;
    const white = [general, specific].some(
      (tag) => tag && (tag.bg.toLowerCase() === "#ffffff" || tag.color.toLowerCase() === "#ffffff"),
    );
    const stroke = white ? "#000000" : first?.color ?? "#787774";
    const combinedFill = general && specific;
    const averageLuminance = combinedFill
      ? (relativeLuminance(general.bg) + relativeLuminance(specific.bg)) / 2
      : relativeLuminance(first?.bg ?? "#ececea");
    const text = averageLuminance > 0.42 ? "#111111" : "#ffffff";
    return (
      <svg className="integrated-tag" width="96" height="24" viewBox="0 0 96 24" role="img">
        {combinedFill && (
          <defs>
            <linearGradient id={bgId} x1="0" x2="1" y1="0" y2="0" gradientUnits="objectBoundingBox">
              <stop offset="0%" stopColor={general.bg} />
              <stop offset="50%" stopColor={general.bg} />
              <stop offset="50%" stopColor={specific.bg} />
              <stop offset="100%" stopColor={specific.bg} />
            </linearGradient>
          </defs>
        )}
        <path
          d="M1 2H95V7L83 12 95 17V22H1Z"
          fill={combinedFill ? `url(#${bgId})` : first?.bg ?? "#ececea"}
          stroke={stroke}
          strokeWidth="1.4"
          strokeLinejoin="miter"
          vectorEffect="non-scaling-stroke"
        />
        <text x="48" y="16" textAnchor="middle" fill={text} className="integrated-tag-text">
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
