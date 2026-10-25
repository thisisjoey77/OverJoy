"use client";

import type { Tag } from "@/lib/store";

export type TagAppearance = "markers" | "amount" | "squares";

function outline(background: string, textColor: string, otherBackground?: string) {
  const fill = background.toLowerCase();
  const text = textColor.toLowerCase();
  return fill === "#ffffff" || text === "#ffffff" || fill === text || fill === otherBackground?.toLowerCase()
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
      <svg className="integrated-tag" width="128" height="28" viewBox="0 0 128 28" preserveAspectRatio="none" role="img">
        <path d="M1 2H127V26H1Z" fill={primaryFill} />
        {general && specific && (
          <path d="M107 2H127V26H107L93 14Z" fill={specific.bg} />
        )}
        <path
          d={general && specific ? "M107 2H1V26H107" : "M1 2H127V26H1Z"}
          fill="none"
          stroke={outline(primaryFill, primaryColor)}
          strokeWidth="1.4"
          strokeLinejoin="miter"
          vectorEffect="non-scaling-stroke"
        />
        {general && specific && (
          <path
            d="M107 2H127V26H107L93 14Z"
            fill="none"
            stroke={outline(specific.bg, specific.color)}
            strokeWidth="1.4"
            strokeLinejoin="miter"
            vectorEffect="non-scaling-stroke"
          />
        )}
        <text x="50" y="14" dy=".35em" textAnchor="middle" fill={primaryColor} className="integrated-tag-text">
          {amount}
        </text>
      </svg>
    );
  }

  const strokeWidth = 1.4;
  if (appearance === "squares") {
    const tags = [general, specific].filter((tag): tag is Tag => Boolean(tag));
    if (tags.length === 2) {
      return (
        <svg className="mini-mark square-tags" width="42" height="20" viewBox="0 0 42 20" role="img">
          <rect x="3" y="3" width="14" height="14" fill={tags[0].bg} stroke={outline(tags[0].bg, tags[0].color, tags[1].bg)} strokeWidth={strokeWidth} />
          <rect x="23" y="3" width="14" height="14" fill={tags[1].bg} stroke={outline(tags[1].bg, tags[1].color, tags[0].bg)} strokeWidth={strokeWidth} />
        </svg>
      );
    }
    const tag = tags[0];
    return (
      <svg className="mini-mark square-tags" width="42" height="20" viewBox="0 0 42 20" role="img">
        <rect
          x="23"
          y="3"
          width="14"
          height="14"
          fill={tag?.bg ?? "#ececea"}
          stroke={tag ? outline(tag.bg, tag.color) : "#787774"}
          strokeWidth={strokeWidth}
        />
      </svg>
    );
  }

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
