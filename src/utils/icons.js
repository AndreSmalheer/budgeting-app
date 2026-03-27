import { createElement } from "react";
import * as Icons from "lucide-react";

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
