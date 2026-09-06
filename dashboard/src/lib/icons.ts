// A couple of generic icon path sets not already covered by
// SHIFT_CATEGORY_ICON_PATHS / PROJECT_ICON_PATHS / INVESTMENT_TYPE_ICON_PATHS
// -- same 24x24 stroke-path convention as those. Kept separate rather than
// added to any one of those maps since these aren't tied to a specific
// category/type enum.
export const ICON_PATHS = {
  pulse: ["M3 12h4l2.5 7 4-14 2.5 7H21"],
  lightbulb: [
    "M9 18h6",
    "M10 21h4",
    "M12 3a6 6 0 0 0-3 11.2c.6.4 1 1.1 1 1.8h4c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3z",
  ],
  building: ["M4 21V9l8-6 8 6v12", "M9 21v-6h6v6"],
  dollar: ["M12 2v20", "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H7"],
  satellite: [
    "M13 7l4 4-1.5 1.5L11.5 8.5z",
    "M8.5 11.5L13 16l-1.5 1.5-4.5-4.5z",
    "M3 21l3.5-3.5",
    "M16 3l1.5 1.5a2.12 2.12 0 0 1 0 3L16 9",
  ],
  trendingUp: ["M23 6l-9.5 9.5-5-5L1 18", "M17 6h6v6"],
  mapPin: ["M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"],
  barChart: ["M18 20V10", "M12 20V4", "M6 20v-6"],
} as const;
