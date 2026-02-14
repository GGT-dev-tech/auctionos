import React, { useState, useEffect, useRef } from 'react';
import { Property, PropertyType, PropertyStatus } from '../../types';
import { LocationPickerMap } from '../../components/LocationPickerMap';
import CountySelector from '../../components/CountySelector';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

interface Props {
  data: Partial<Property>;
  update: (data: Partial<Property>) => void;
}

export const Step1BasicInfo: React.FC<Props> = ({ data, update }) => {
  const [geocoding, setGeocoding] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMapSelector, setShowMapSelector] = useState(false);
  const [inputValue, setInputValue] = useState(data.address || '');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Initial sync only
  useEffect(() => {
    if (data.address && data.address !== inputValue) {
      setInputValue(data.address);
    }
  }, [data.address]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  // Mapbox Autocomplete Search
  useEffect(() => {
    // Basic Token Check
    if (!MAPBOX_TOKEN) {
      console.error("VITE_MAPBOX_TOKEN is missing! Geocoding will fail.");
    }

    const timer = setTimeout(async () => {
      // Allow search with 3+ chars
      if (inputValue && inputValue.length > 2 && showSuggestions) {
        setGeocoding(true);
        console.log(`Searching Mapbox for: ${inputValue}`);

        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(inputValue)}.json?access_token=${MAPBOX_TOKEN}&limit=5`
          );

          if (!response.ok) {
            console.error("Mapbox API Error:", response.status, response.statusText);
            throw new Error("Geocoding failed");
          }

          const results = await response.json();
          console.log("Mapbox Results:", results.features?.length);

          if (results.features) {
            setSuggestions(results.features);
          } else {
            setSuggestions([]);
          }
        } catch (e) {
          console.error("Geocoding Exception:", e);
          setSuggestions([]);
        } finally {
          setGeocoding(false);
        }
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [inputValue, showSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // If suggestions exist, pick first
      if (suggestions.length > 0) {
        handleSelectAddress(suggestions[0]);
      } else {
        // Trigger immediate search if not already searching?
        // For now, let the effect handle it, but maybe force show?
        setShowSuggestions(true);
      }
    }
  };

  const handleSelectAddress = (feature: any) => {
    if (!feature || !feature.center) return;

    const [lng, lat] = feature.center;

    // Parse context
    let city = data.city;
    let state = data.state;
    let zip = data.zip_code;
    let county = data.county;

    if (feature.context) {
      feature.context.forEach((ctx: any) => {
        if (ctx.id.startsWith('place')) city = ctx.text;
        if (ctx.id.startsWith('region')) state = ctx.text; // Mapbox state code usually? No, Mapbox returns full name often. 
        // We might need mapping but for now let's use what they give or keep existing if not found.
        // Actually Mapbox returns "Florida" but usually we want "FL". 
        // For now, let's use the text.
        if (ctx.id.startsWith('postcode')) zip = ctx.text;
        if (ctx.id.startsWith('district')) county = ctx.text;
      });
    }

    const smartTag = [state, county, data.parcel_id].filter(Boolean).join('-').toUpperCase();
    const formattedAddress = feature.place_name;

    console.log("Selected Address:", formattedAddress, lat, lng);

    update({
      address: formattedAddress,
      latitude: lat,
      longitude: lng,
      state: state || data.state,
      county: county || data.county,
      city: city || data.city,
      zip_code: zip || data.zip_code,
      title: data.title || formattedAddress,
      smart_tag: smartTag
    });

    setInputValue(formattedAddress);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-primary">
          <span className="material-symbols-outlined">domain</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Property Details</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">

          {/* Address Section - Primary Input */}
          <div ref={wrapperRef} className="relative z-[1000]">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Property Address (GPS Search)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
              </span>
              <input
                className="pl-10 w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-primary shadow-sm"
                placeholder="Search address using GPS..."
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(true)}
              />
              {geocoding && (
                <div className="absolute inset-y-0 right-0 px-3 flex items-center">
                  <span className="material-symbols-outlined animate-spin text-primary text-sm">refresh</span>
                </div>
              )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto z-[1001]">
                {suggestions.map((s, i) => (
                  <li
                    key={s.id || i}
                    className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-0"
                    onClick={() => handleSelectAddress(s)}
                  >
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{s.text}</p>
                    <p className="text-xs text-slate-500 truncate">{s.place_name}</p>
                  </li>
                ))}
              </ul>
            )}

            <p className="text-xs text-slate-500 mt-2">
              Start typing to search locations provided by Mapbox GPS service.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Title (Optional)</label>
              <input
                className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                placeholder="Auto-generated if empty"
                value={data.title}
                onChange={(e) => update({ title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Property Type</label>
              <select
                className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-primary shadow-sm"
                value={data.property_type}
                onChange={(e) => update({ property_type: e.target.value as PropertyType })}
              >
                {Object.values(PropertyType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Location Details (Auto-filled) */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Location Details</h3>
              <button
                type="button"
                onClick={() => setShowMapSelector(true)}
                className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
              >
                <span className="material-symbols-outlined text-[16px]">map</span>
                Select from Map
              </button>
            </div>

            {showMapSelector && (
              <CountySelector
                mode="select"
                onClose={() => setShowMapSelector(false)}
                onSelect={(state, county) => {
                  // Smart Tag Logic
                  const smartTag = [state, county, data.parcel_id].filter(Boolean).join('-').toUpperCase();
                  update({
                    state,
                    county,
                    smart_tag: smartTag
                  });
                  setShowMapSelector(false);
                }}
              />
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500">City</label>
                <input
                  className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  value={data.city || ''}
                  onChange={(e) => update({ city: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">State</label>
                <input
                  className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  value={data.state || ''}
                  onChange={(e) => update({ state: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">County</label>
                <input
                  className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  value={data.county || ''}
                  onChange={(e) => update({ county: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Zip Code</label>
                <input
                  className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  value={data.zip_code || ''}
                  onChange={(e) => update({ zip_code: e.target.value })}
                />
              </div>
            </div>

            {/* Hidden Latitude/Longitude Logic - Processed in background */}
            <input type="hidden" value={data.latitude || ''} />
            <input type="hidden" value={data.longitude || ''} />
          </div>

          {/* Identification Section */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Identification</label>
            <div className="grid grid-cols-1 gap-4">
              <input
                className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                placeholder="Parcel ID (APN) - Required for Smart Tag"
                value={data.parcel_id || ''}
                onChange={(e) => {
                  const newParcelId = e.target.value;
                  const smartTag = [data.state, data.county, newParcelId].filter(Boolean).join('-');
                  update({
                    parcel_id: newParcelId,
                    smart_tag: smartTag.toUpperCase()
                  });
                }}
              />
            </div>
            {data.smart_tag && (
              <div className="mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded flex items-center gap-2">
                <span className="text-xs text-slate-500">Smart Tag:</span>
                <span className="text-sm font-mono font-bold text-primary">{data.smart_tag}</span>
              </div>
            )}
            <p className="text-xs text-slate-500 mt-2">
              Parcel ID is used to generate the unique Smart Tag (State-County-ParcelID).
            </p>
          </div>

        </div>

        {/* Map Preview & Selector */}
        <div className="col-span-1">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Location Map</label>
          <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 group">
            <LocationPickerMap
              initialLatitude={data.latitude}
              initialLongitude={data.longitude}
              initialAddress={data.address}
              onLocationSelect={(locData) => {
                // Update form with data from map drag
                const newState = locData.state || data.state;
                const newCounty = locData.county || data.county;
                const newParcelId = data.parcel_id;
                const smartTag = [newState, newCounty, newParcelId].filter(Boolean).join('-').toUpperCase();

                update({
                  latitude: locData.lat,
                  longitude: locData.lng,
                  address: locData.address || data.address,
                  city: locData.city || data.city,
                  state: newState,
                  zip_code: locData.zip || data.zip_code,
                  smart_tag: smartTag
                });
                // Ensure input sync
                if (locData.address) setInputValue(locData.address);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};