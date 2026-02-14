import React, { useState, useEffect, useRef } from 'react';
import { Property, PropertyType, PropertyStatus } from '../../types';
import { MapCmp } from '../../components/MapCmp';
import { AuctionService } from '../../services/api';
import CountySelector from '../../components/CountySelector';

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

  useEffect(() => {
    setInputValue(data.address || '');
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

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (inputValue && inputValue.length > 3 && showSuggestions) {
        setGeocoding(true);
        try {
          // Call API with autocomplete=true
          const results = await AuctionService.geocodeAddress(inputValue, true);
          if (Array.isArray(results)) {
            setSuggestions(results);
          } else if (results) {
            setSuggestions([results]);
          } else {
            setSuggestions([]);
          }
        } catch (e) {
          console.error(e);
          setSuggestions([]);
        } finally {
          setGeocoding(false);
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [inputValue, showSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    // Only update parent data address on manual change? 
    // Or keep it sync? Let's keep sync but also trigger suggestions
    update({ address: e.target.value });
    setShowSuggestions(true);
  };

  const handleSelectAddress = (result: any) => {
    const newState = result.state || data.state;
    const newCounty = result.county || data.county;
    const smartTag = [newState, newCounty, data.parcel_id].filter(Boolean).join('-').toUpperCase();
    const newCity = result.city || data.city;
    const newZip = result.zip_code || data.zip_code;
    const formattedAddress = result.display_name || inputValue;

    update({
      address: formattedAddress,
      latitude: result.latitude,
      longitude: result.longitude,
      state: newState,
      county: newCounty,
      city: newCity,
      zip_code: newZip,
      // Auto-generate title if empty
      title: data.title || `${formattedAddress}`,
      smart_tag: smartTag
    });

    setInputValue(formattedAddress);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Construct a temporary property object for display in MapCmp
  const mapProperties = [{
    id: 'current',
    ...data,
    latitude: data.latitude || 25.7617,
    longitude: data.longitude || -80.1918,
    title: data.title || 'New Property',
    address: data.address || '',
    status: data.status,
    city: data.city || 'Miami',
    state: data.state || 'FL'
  } as Property];

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
          <div ref={wrapperRef} className="relative">
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
              <ul className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {suggestions.map((s, i) => (
                  <li
                    key={i}
                    className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-0"
                    onClick={() => handleSelectAddress(s)}
                  >
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{s.display_name}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {s.city}, {s.state} {s.zip_code}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            <p className="text-xs text-slate-500 mt-2">
              Start typing to search locations provided by GPS/Map service.
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
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-xs text-slate-500">Latitude</label>
                <input
                  className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  type="number"
                  value={data.latitude || ''}
                  onChange={(e) => update({ latitude: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Longitude</label>
                <input
                  className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  type="number"
                  value={data.longitude || ''}
                  onChange={(e) => update({ longitude: parseFloat(e.target.value) })}
                />
              </div>
            </div>
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

        {/* Map Preview */}
        <div className="relative h-[500px] w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 group">
          <MapCmp properties={mapProperties} />
          <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold shadow-sm z-[400]">
            {data.latitude && data.longitude ? 'Location Set' : 'No Location'}
          </div>
        </div>
      </div>
    </div>
  );
};