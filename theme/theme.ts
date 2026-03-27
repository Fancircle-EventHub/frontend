import { colors } from "./colors";

export const createTheme = (themeMode = "dark") => {
  const mode = themeMode === "dark" ? "dark" : "light";

  const light = {
    text: {
      primary: colors.black,
      secondary: colors.grey[700],
      tertiary: colors.grey[500],
      url: colors.blue[600],
    },
    background: {
      default: colors.grey[100],
      surface: colors.white,
    },
    logo: colors.secondary[700],
    accent: colors.primary[500],
    tags: {
      fill: colors.grey[900],
      label: colors.white,
    },
    borders: colors.grey[200],
    dividers: colors.grey[200],
    ...colors,
  };

  const dark = {
    text: {
      primary: colors.white,
      secondary: colors.secondary[400],
      tertiary: colors.secondary[500],
      url: colors.blue[400],
    },
    background: {
      default: "#23272f",
      surface: "#2e323a",
    },
    logo: colors.primary[500],
    accent: colors.primary[500],
    tags: {
      fill: colors.secondary[700],
      label: colors.white,
    },
    borders: colors.secondary[700],
    dividers: colors.secondary[700],
    ...colors,
  };

  return mode === "dark" ? dark : light;
};

export type AppTheme = ReturnType<typeof createTheme>;
