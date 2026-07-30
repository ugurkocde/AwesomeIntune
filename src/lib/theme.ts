export const THEME_STORAGE_KEY = "awesome-intune-theme";
export const THEME_CHANGE_EVENT = "awesomeintune:themechange";

export type ColorTheme = "light" | "dark";

export function isColorTheme(value: unknown): value is ColorTheme {
  return value === "light" || value === "dark";
}
