export type Pick = {
  month: string;
  winnerName: string;
  winnerLinkedIn: string;
  winnerImage: string;
  postUrl: string;
  contribution: string;
  postAvailable?: boolean;
};

/** Add one entry per announced Pick. Each month can have up to three entries. */
export const picks: readonly Pick[] = [
  {
    month: "2026-08",
    winnerName: "Daniel Rung",
    winnerLinkedIn: "https://www.linkedin.com/in/daniel-rung/",
    winnerImage: "/images/picks/daniel-rung.webp",
    postUrl:
      "https://www.linkedin.com/feed/update/urn:li:activity:7495933023100678147/",
    contribution:
      "A searchable, automatically updated catalog of Intune Enterprise App Management apps, including complete Microsoft Graph fields, raw exports, and package change tracking.",
  },
  {
    month: "2026-08",
    winnerName: "Haakon Wibe",
    winnerLinkedIn: "https://www.linkedin.com/in/haakonwibe/",
    winnerImage: "/images/picks/haakon-wibe.webp",
    postUrl:
      "https://www.linkedin.com/feed/update/urn:li:activity:7494844475454836736/",
    contribution:
      "Registry Configuration Engine, a PowerShell framework that turns JSON registry settings into matched Intune Remediations detection and remediation scripts, with local testing, rollback, offline-profile support, and logging.",
  },
  {
    month: "2026-08",
    winnerName: "Ricardo Barbosa",
    winnerLinkedIn: "https://www.linkedin.com/in/ricardo-barbosa-09745736/",
    winnerImage: "/images/picks/ricardo-barbosa.webp",
    postUrl:
      "https://www.linkedin.com/feed/update/urn:li:activity:7495821853916131329/",
    contribution:
      "A step-by-step guide to enabling automatic remediation for Windows Hotpatch devices with Intune, including the Settings Catalog and CSP path, drift behavior, and verification through event logs and Intune reports.",
  },
];
