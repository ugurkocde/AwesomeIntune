/** Decorative fictional illustrations, not portraits of community members. */
export function CommunityAvatars() {
  const palettes = [
    {
      background: "#cceaff",
      skin: "#e8ad86",
      hair: "#25354b",
      shirt: "#1676ba",
    },
    {
      background: "#fce2bd",
      skin: "#9d6247",
      hair: "#302b34",
      shirt: "#b76232",
    },
    {
      background: "#d9ede1",
      skin: "#f2c8a6",
      hair: "#875337",
      shirt: "#28705d",
    },
    {
      background: "#e7e0f5",
      skin: "#c38c68",
      hair: "#292c43",
      shirt: "#76659c",
    },
  ];
  return (
    <div aria-hidden="true" className="flex shrink-0 -space-x-3">
      {palettes.map((palette, index) => (
        <svg
          key={palette.background}
          viewBox="0 0 48 48"
          fill="none"
          className="h-10 w-10 rounded-full border-[3px] border-[var(--bg-primary)]"
        >
          <circle cx="24" cy="24" r="24" fill={palette.background} />
          <path d="M8 48c0-12 6-18 16-18s16 6 16 18" fill={palette.shirt} />
          {index % 2 === 1 && (
            <path d="M12 30V20c0-17 24-17 24 0v14H12Z" fill={palette.hair} />
          )}
          <rect x="20" y="27" width="8" height="9" rx="4" fill={palette.skin} />
          <ellipse cx="24" cy="21" rx="10" ry="12" fill={palette.skin} />
          <path
            d={
              index % 2 === 0
                ? "M14 21c-5-17 23-20 21-1-3-1-5-5-5-8-4 6-10 7-16 5Z"
                : "M13 22C8 4 37 3 35 22l-5-9c-4 5-10 6-17 6Z"
            }
            fill={palette.hair}
          />
          <circle cx="20" cy="22" r="1" fill="#273142" />
          <circle cx="28" cy="22" r="1" fill="#273142" />
          <path
            d="M21 27q3 3 6 0"
            stroke="#713e34"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          {index === 0 && (
            <g stroke="#273142" strokeWidth="1.2">
              <rect x="16" y="19" width="7" height="6" rx="2" />
              <rect x="25" y="19" width="7" height="6" rx="2" />
              <path d="M23 21h2" />
            </g>
          )}
        </svg>
      ))}
    </div>
  );
}
