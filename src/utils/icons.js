import { createElement } from "react";
import * as Icons from "lucide-react";

const ICON_THEMES = [
  {
    surface: "linear-gradient(180deg, rgba(45, 212, 191, 0.24), rgba(20, 184, 166, 0.12))",
    border: "rgba(45, 212, 191, 0.34)",
    iconColor: "#89f5e3",
    ring: "#14b8a6",
  },
  {
    surface: "linear-gradient(180deg, rgba(96, 165, 250, 0.24), rgba(59, 130, 246, 0.12))",
    border: "rgba(96, 165, 250, 0.34)",
    iconColor: "#bfdbfe",
    ring: "#60a5fa",
  },
  {
    surface: "linear-gradient(180deg, rgba(245, 158, 11, 0.24), rgba(217, 119, 6, 0.12))",
    border: "rgba(245, 158, 11, 0.34)",
    iconColor: "#fde68a",
    ring: "#f59e0b",
  },
  {
    surface: "linear-gradient(180deg, rgba(244, 114, 182, 0.24), rgba(219, 39, 119, 0.12))",
    border: "rgba(244, 114, 182, 0.34)",
    iconColor: "#fbcfe8",
    ring: "#ec4899",
  },
  {
    surface: "linear-gradient(180deg, rgba(167, 139, 250, 0.24), rgba(124, 58, 237, 0.12))",
    border: "rgba(167, 139, 250, 0.34)",
    iconColor: "#ddd6fe",
    ring: "#8b5cf6",
  },
];

export function normalizeIconName(iconName) {
  if (!iconName) {
    return "Circle";
  }

  if (Icons[iconName]) {
    return iconName;
  }

  const normalizedName = iconName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

  return Icons[normalizedName] ? normalizedName : "Circle";
}

export function getLucideIcon(iconName) {
  return Icons[normalizeIconName(iconName)] || Icons.Circle;
}

export function LucideIcon({ name, ...props }) {
  return createElement(getLucideIcon(name), props);
}

export function getIconTheme(iconName) {
  const normalized = normalizeIconName(iconName);
  const seed = normalized.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return ICON_THEMES[seed % ICON_THEMES.length];
}
