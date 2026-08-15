/**
 * Route metadata used for layout chrome: sidebar nav, breadcrumbs, page titles,
 * and the browser document title. Kept separate from router.jsx so sitemap
 * navigation and breadcrumb/title resolution can share the same definitions.
 */
import Dashboard from "@mui/icons-material/Dashboard";
import Folder from "@mui/icons-material/Folder";
import GppMaybe from "@mui/icons-material/GppMaybe";
import MenuBook from "@mui/icons-material/MenuBook";
import Group from "@mui/icons-material/Group";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import EmojiEvents from "@mui/icons-material/EmojiEvents";
import Lightbulb from "@mui/icons-material/Lightbulb";
import Settings from "@mui/icons-material/Settings";

/** Icon lookup shared by the sidebar and the command palette. */
export const iconMap = {
  "layout-dashboard": Dashboard,
  "folder-git-2": Folder,
  "shield-alert": GppMaybe,
  "book-open": MenuBook,
  "users-round": Group,
  "wand-sparkles": AutoAwesome,
  award: EmojiEvents,
  lightbulb: Lightbulb,
  settings: Settings,
};

export const pageTitles = {
  "/": "Engineering Overview",
  "/projects": "Projects",
  "/risks": "Risks",
  "/knowledge": "Knowledge",
  "/teams": "Teams",
  "/composer": "AI Composer",
  "/recognition": "Recognition",
  "/insights": "Insights",
  "/settings": "Settings",
};

export const sidebarLinks = [
  { name: "Overview", to: "/", icon: "layout-dashboard", exact: true },
  { name: "Projects", to: "/projects", icon: "folder-git-2" },
  { name: "Risks", to: "/risks", icon: "shield-alert", badge: 3 },
  { name: "Knowledge", to: "/knowledge", icon: "book-open" },
  { name: "Teams", to: "/teams", icon: "users-round" },
  { name: "AI Composer", to: "/composer", icon: "wand-sparkles" },
  { name: "Recognition", to: "/recognition", icon: "award" },
  { name: "Insights", to: "/insights", icon: "lightbulb", badge: 5 },
  { name: "Settings", to: "/settings", icon: "settings" },
];

/** Workspace context (footer of the sidebar). */
export const workspace = {
  name: "Hitachi Services",
  initials: "HS",
};

/** Navigation-groups config for the sidebar subheaders. */
export const navGroups = {
  primary: [
    "Overview",
    "Projects",
    "Risks",
    "Knowledge",
    "Teams",
    "AI Composer",
    "Recognition",
  ],
  engineering: ["Insights"],
  workspace: ["Settings"],
};
