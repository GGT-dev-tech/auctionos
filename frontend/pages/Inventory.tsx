import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Property, PropertyStatus, FloodZone } from '../types';
import { AuctionService, API_BASE_URL } from '../services/api';
import { PropertyDetailsModal } from '../components/PropertyDetailsModal';

import CountySelector from '../components/CountySelector';

interface Location {
  fips: string;
  name: string;
  state: string;
}

export const Inventory: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Location Filter State
  const [locationQuery, setLocationQuery] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  // Map Selector Modal
  const [showCountySelector, setShowCountySelector] = useState(false);

  useEffect(() => {
    fetchProps();
  }, []);

  const fetchProps = async () => {
    setLoading(true);
    try {
      const data = await AuctionService.getProperties();
      setProperties(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (locationQuery.length > 2) {
      const fetchLocs = async () => {
        try {
          const locs = await AuctionService.getLocations(locationQuery);
          setLocations(locs);
        } catch (e) {
          console.error(e);
        }
      };
      const timeoutId = setTimeout(fetchLocs, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setLocations([]);
    }
  }, [locationQuery]);

  const filteredProperties = properties.filter(p => {
    const matchesText = p.title.toLowerCase().includes(filterText.toLowerCase()) ||
      (p.address && p.address.toLowerCase().includes(filterText.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;

    // Check location
    let matchesLocation = true;
    if (selectedLocation) {
      // Very basic matching for now: check if county name is in address or title or county field
      // ideally we have p.county populated. If not, fallback to string match.
      const locName = selectedLocation.name.toLowerCase(); // e.g. "adams county"
      const simpleName = locName.replace(' county', '');

      const countyMatch = p.county ? p.county.toLowerCase().includes(simpleName) : false;
      const addressMatch = p.address ? p.address.toLowerCase().includes(simpleName) : false;
      const cityMatch = p.city ? p.city.toLowerCase().includes(simpleName) : false;

      matchesLocation = countyMatch || addressMatch || cityMatch;
    }

    return matchesText && matchesStatus && matchesLocation;
  });

  const getStatusBadge = (status: PropertyStatus) => {
    switch (status) {
      case PropertyStatus.Active:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"><span className="size-1.5 rounded-full bg-green-500"></span>Active</span>;
      case PropertyStatus.Pending:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"><span className="size-1.5 rounded-full bg-yellow-500"></span>Pending</span>;
      case PropertyStatus.Sold:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300"><span className="size-1.5 rounded-full bg-slate-500"></span>Sold</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">Draft</span>;
    }
  };

  // Modal State
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (property: Property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PropertyDetailsModal
        property={selectedProperty}
        isOpen={isModalOpen}
        onClose={closeModal}
      />

      {showCountySelector && (
        <CountySelector
          mode="filter"
          onClose={() => setShowCountySelector(false)}
          onSelect={(state, county) => {
            // Determine FIPS logic? Netronline doesn't provide FIPS.
            // We construct a mock Location object to set selectedLocation
            setSelectedLocation({
              fips: 'map-selection', // Placeholder
              name: `${county} County`,
              state: state
            });
            // Also update query text to show user what they selected
            // But selectedLocation takes precedence in display
            setShowCountySelector(false);
          }}
        />
      )}

      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Property Inventory</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage active listings, pending auctions, and sold properties.</p>
        </div>
        <button
          onClick={() => navigate('/properties/new')}
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-200"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>Add New Property</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white dark:bg-[#1a2634] p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
          {/* Tabs */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {['All', 'Active', 'Draft', 'Sold'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab === 'All' ? 'All' : tab as PropertyStatus)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${(statusFilter === tab || (statusFilter === 'All' && tab === 'All'))
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Location Filter */}
          <div className="relative flex items-center gap-2">
            <input
              type="text"
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-primary outline-none w-64"
              placeholder="Filter by County/State..."
              value={selectedLocation ? `${selectedLocation.name}, ${selectedLocation.state}` : locationQuery}
              onChange={(e) => {
                setLocationQuery(e.target.value);
                setSelectedLocation(null);
              }}
            />

            <button
              onClick={() => setShowCountySelector(true)}
              className="p-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Select from Map"
            >
              <span className="material-symbols-outlined">map</span>
            </button>

            {selectedLocation && (
              <button
                onClick={() => { setSelectedLocation(null); setLocationQuery(''); }}
                className="absolute right-12 top-2 text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            )}
            {locations.length > 0 && !selectedLocation && (
              <div className="absolute top-full left-0 z-10 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                {locations.map(loc => (
                  <div
                    key={loc.fips}
                    className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-sm"
                    onClick={() => {
                      setSelectedLocation(loc);
                      setLocations([]);
                    }}
                  >
                    {loc.name}, {loc.state}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="relative w-full md:w-64">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-slate-400 text-[18px]">search</span>
          </span>
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary placeholder-slate-400"
            placeholder="Quick find..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1a2634] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider w-20">Property</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Address details</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Smart Tag</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Market Value</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Flood Zone</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500">Loading properties...</td></tr>
              ) : filteredProperties.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500">No properties found.</td></tr>
              ) : (
                filteredProperties.map((p) => (
                  <tr key={p.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-6 align-middle">
                      <div className="h-12 w-16 rounded-md overflow-hidden bg-slate-200 relative shadow-sm">
                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${p.imageUrl || '/placeholder.png'}')` }}></div>
                        {p.status === 'Draft' && (
                          <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 p-0.5 rounded-bl-md shadow-sm" title="Draft / In Construction">
                            <span className="material-symbols-outlined text-[10px] font-bold block">construction</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 align-middle">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{p.address || p.title}</span>
                        <span className="text-xs text-slate-500">{p.city}, {p.state} {p.zip_code}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 align-middle">
                      <span className="font-mono text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                        {p.smart_tag || '-'}
                      </span>
                    </td>
                    <td className="py-4 px-6 align-middle">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {p.price ? `$${p.price.toLocaleString()}` : '-'}
                      </span>
                    </td>
                    <td className="py-4 px-6 align-middle">
                      {/* Real flood zone display */}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${p.details?.flood_zone_code
                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                        {p.details?.flood_zone_code || '-'}
                      </span>
                    </td>
                    <td className="py-4 px-6 align-middle">
                      {getStatusBadge(p.status)}
                    </td>
                    <td className="py-4 px-6 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(p)}
                          className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                          title="View Details"
                        >
                          <span className="material-symbols-outlined text-[20px]">visibility</span>
                        </button>
                        <button
                          onClick={() => navigate(`/properties/${p.id}/edit`)}
                          className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('Are you sure you want to delete this property?')) {
                              // Optimistic UI Update
                              const originalProps = [...properties];
                              setProperties(properties.filter(prop => prop.id !== p.id));

                              try {
                                await AuctionService.deleteProperty(p.id);
                                // Success - no need to do anything, state is already updated
                              } catch (e) {
                                console.error(e);
                                alert('Failed to delete property');
                                // Revert on failure
                                setProperties(originalProps);
                              }
                            }
                          }}
                          className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              const { url } = await AuctionService.generateReport(p.id);
                              // The URL is relative /static/reports/..., prepend API base if needed, 
                              // but if it's served by same backend, we can just use the path or full URL.
                              // Assuming backend and frontend integration:
                              const fullUrl = `${API_BASE_URL}${url}`;
                              window.open(fullUrl, '_blank');
                            } catch (e) {
                              console.error(e);
                              alert('Failed to generate report');
                            }
                          }}
                          className="text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 p-1 rounded hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
                          title="Download Report"
                        >
                          <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};