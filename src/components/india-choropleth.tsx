import { useState } from "react";
import { featureCentroid, featurePath, indiaStates, type StateFeature } from "@/lib/india-geo";
import { cn } from "@/lib/utils";

const WIDTH = 620;
const HEIGHT = 660;

export interface ChoroplethDatum {
  state: string;
  value: number;
  detail?: string;
}

/**
 * Static-GeoJSON choropleth of India — no tiles, no API key. `indiaStates` is a
 * placeholder outline set; drop in a real India TopoJSON/GeoJSON with the same
 * feature shape and this component renders it unchanged.
 */
export function IndiaChoropleth({
  data,
  metricLabel,
  selected,
  onSelect,
  formatValue,
}: {
  data: ChoroplethDatum[];
  metricLabel: string;
  selected?: string | undefined;
  onSelect?: (state: string) => void;
  formatValue?: (value: number) => string;
}) {
  const [hovered, setHovered] = useState<{
    state: StateFeature;
    value: number | undefined;
    detail?: string | undefined;
  } | null>(null);

  const lookup = new Map(data.map((entry) => [entry.state, entry]));
  const values = data.map((entry) => entry.value);
  const max = values.length ? Math.max(...values) : 0;
  const format = formatValue ?? ((value: number) => value.toLocaleString("en-IN"));

  const intensity = (value: number | undefined): number => {
    if (value === undefined || max === 0) return 0;
    return Math.max(0.12, value / max);
  };

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full max-h-[540px]"
        role="img"
        aria-label={`India choropleth of ${metricLabel} by state`}
      >
        <rect width={WIDTH} height={HEIGHT} fill="var(--color-muted)" opacity={0.35} rx={12} />
        {indiaStates.features.map((feature) => {
          const entry = lookup.get(feature.properties.name);
          const isSelected = selected === feature.properties.name;
          const hasData = entry !== undefined;
          return (
            <path
              key={feature.properties.code}
              d={featurePath(feature, WIDTH, HEIGHT)}
              fill={hasData ? "var(--color-primary)" : "var(--color-muted-foreground)"}
              fillOpacity={hasData ? intensity(entry.value) : 0.08}
              stroke={isSelected ? "var(--color-accent)" : "var(--color-card)"}
              strokeWidth={isSelected ? 2.5 : 1}
              className={cn(
                "transition-[fill-opacity,stroke] duration-150",
                hasData && onSelect && "cursor-pointer hover:fill-opacity-90",
              )}
              tabIndex={hasData ? 0 : -1}
              role={hasData ? "button" : undefined}
              aria-label={
                hasData
                  ? `${feature.properties.name}: ${format(entry.value)} ${metricLabel}`
                  : `${feature.properties.name}: no reported projects`
              }
              onMouseEnter={() =>
                setHovered({ state: feature, value: entry?.value, detail: entry?.detail })
              }
              onMouseLeave={() => setHovered(null)}
              onFocus={() =>
                setHovered({ state: feature, value: entry?.value, detail: entry?.detail })
              }
              onBlur={() => setHovered(null)}
              onClick={() => hasData && onSelect?.(feature.properties.name)}
              onKeyDown={(event) => {
                if (hasData && (event.key === "Enter" || event.key === " ")) {
                  event.preventDefault();
                  onSelect?.(feature.properties.name);
                }
              }}
            >
              <title>
                {hasData
                  ? `${feature.properties.name} — ${format(entry.value)} ${metricLabel}`
                  : `${feature.properties.name} — no data`}
              </title>
            </path>
          );
        })}
        {indiaStates.features
          .filter((feature) => lookup.has(feature.properties.name))
          .map((feature) => {
            const [cx, cy] = featureCentroid(feature, WIDTH, HEIGHT);
            return (
              <text
                key={`label-${feature.properties.code}`}
                x={cx}
                y={cy}
                textAnchor="middle"
                className="pointer-events-none fill-[var(--color-card)] text-[11px] font-bold"
              >
                {feature.properties.code}
              </text>
            );
          })}
      </svg>

      <div className="pointer-events-none absolute left-4 top-4 rounded-lg border border-border bg-card/95 px-3 py-2 shadow-sm">
        <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
          {metricLabel}
        </div>
        {hovered ? (
          <>
            <div className="text-xs font-bold text-primary">{hovered.state.properties.name}</div>
            <div className="text-[11px] tabular-nums text-foreground">
              {hovered.value === undefined ? "No reported projects" : format(hovered.value)}
            </div>
            {hovered.detail && (
              <div className="text-[10px] text-muted-foreground">{hovered.detail}</div>
            )}
          </>
        ) : (
          <div className="text-[11px] text-muted-foreground">Hover a state · click to drill in</div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2 px-1">
        <span className="text-[10px] text-muted-foreground">Low</span>
        <div className="h-2 flex-1 rounded-full bg-[linear-gradient(to_right,color-mix(in_oklab,var(--color-primary)_12%,transparent),var(--color-primary))]" />
        <span className="text-[10px] text-muted-foreground">High</span>
        <span className="ml-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="size-2.5 rounded-sm bg-muted-foreground/15" />
          No reported projects
        </span>
      </div>
    </div>
  );
}
