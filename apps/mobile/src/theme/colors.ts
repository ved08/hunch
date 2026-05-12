export const colors = {
  bg: "#0A0A0B",
  surface: "#131317",
  surfaceElevated: "#1A1A1F",
  border: "#1F1F24",
  borderStrong: "#2A2A32",
  fg: "#F5F5F7",
  fgMuted: "#8A8A94",
  fgFaint: "#54545C",
  yes: "#E5B660",
  yesSoft: "rgba(229, 180, 96, 0.14)",
  no: "#D94B5C",
  noSoft: "rgba(217, 75, 92, 0.14)",
  accent: "#C9F05E",
  accentSoft: "rgba(201, 240, 94, 0.14)",
  danger: "#D94B5C",
  scrim: "rgba(0, 0, 0, 0.6)",
  brand: "#CA2D3D",
  brandDeep: "#9B1E2B",
  brandInk: "#1A0508",
} as const;

export type ColorToken = keyof typeof colors;
