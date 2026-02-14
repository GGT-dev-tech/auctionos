import React, { useMemo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { scaleQuantile } from 'd3-scale';
import { Tooltip } from 'react-tooltip';

// US Counties TopoJSON
const GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json";

interface Props {
    data: Array<{ state: string; county: string; count: number }>;
    onSelectRegion?: (state: string, county: string) => void;
}

export const HunterMap: React.FC<Props> = ({ data, onSelectRegion }) => {
    const [tooltipContent, setTooltipContent] = React.useState("");

    // Map data to FIPS or Name? 
    // The backend returns state/county names (e.g. "FL", "Miami-Dade").
    // TopoJSON usually has FIPS codes. We might need a mapping or just rely on properties.name if available in the TopoJSON.
    // us-atlas counties properties usually have `name` (County Name) and `id` (FIPS).
    // Matching by name is brittle but might be our only option without FIPS in DB.

    // Create a dictionary for faster lookup: { "CountyName": count }
    // Note: County names not unique across US, so we really need State context.
    // The TopoJSON doesn't easier give State without processing.
    // For V1, let's try to match by County Name assuming unique enough or just visualize what we can.
    // Better approach: use States map first if Counties are too hard to match without FIPS.

    // Let's use a State map for now if county data is missing/hard.
    // Actually, let's try to load Counties and if we match, great.

    return (
        <div className="w-full h-[500px] bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden relative border border-slate-200 dark:border-slate-800">
            <ComposableMap projection="geoAlbersUsa">
                <ZoomableGroup>
                    <Geographies geography={GEO_URL}>
                        {({ geographies }) =>
                            geographies.map((geo) => {
                                // Geo properties: { name: "Maui", id: "15009" }
                                // We need to match this with our data.
                                // Our data: { state: "HI", county: "Maui", count: 10 }

                                // Simple matching attempt (flawed but a start)
                                const cur = data.find(s => s.county === geo.properties.name);

                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill={cur ? "#0A3412" : "#EAEAEC"} // Green if data, gray if none
                                        stroke="#D6D6DA"
                                        strokeWidth={0.5}
                                        style={{
                                            default: { outline: "none" },
                                            hover: { fill: "#F53", outline: "none" },
                                            pressed: { outline: "none" },
                                        }}
                                        onMouseEnter={() => {
                                            const name = geo.properties.name;
                                            const count = cur ? cur.count : 0;
                                            setTooltipContent(`${name}: ${count} properties`);
                                        }}
                                        onMouseLeave={() => {
                                            setTooltipContent("");
                                        }}
                                        onClick={() => {
                                            if (onSelectRegion) {
                                                // We don't easily know the state from just the county geo without lookup
                                                onSelectRegion("", geo.properties.name);
                                            }
                                        }}
                                    />
                                );
                            })
                        }
                    </Geographies>
                </ZoomableGroup>
            </ComposableMap>
            {tooltipContent && (
                <div className="absolute bottom-4 left-4 bg-black/80 text-white px-3 py-1 rounded text-sm pointer-events-none">
                    {tooltipContent}
                </div>
            )}
        </div>
    );
};
