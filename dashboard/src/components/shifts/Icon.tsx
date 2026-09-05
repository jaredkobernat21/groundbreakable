// Generic renderer for the hand-authored 24x24 stroke-path icon sets
// already scattered across this codebase (SHIFT_CATEGORY_ICON_PATHS,
// PROJECT_ICON_PATHS, INVESTMENT_TYPE_ICON_PATHS) plus a couple of new
// ones (see icons.ts) for the Market Pulse / metric-card row -- one
// component instead of a string-templated <svg> per usage, since these
// render as real JSX now (not injected into a Mapbox marker's raw DOM
// via dangerouslySetInnerHTML the way the map-pin versions do).
export default function Icon({
  paths,
  className,
  strokeWidth = 1.8,
}: {
  paths: readonly string[];
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
