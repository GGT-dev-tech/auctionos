import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Property, PropertyStatus } from '../types';
import { AuctionService, API_BASE_URL } from '../services/api';
import { PropertyDetailsModal } from '../components/PropertyDetailsModal';
import { ExportModal } from '../components/ExportModal';
import { PropertyCard } from '../components/PropertyCard';
import CountySelector from '../components/CountySelector';
import { LayoutGrid, List } from 'lucide-react';

interface Location {
  fips: string;
  name: string;
  state: string;
}

export const Inventory: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [locationQuery, setLocationQuery] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Map Selector Modal
  const [showCountySelector, setShowCountySelector] = useState(false);

  // Property Modal State
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [propertyToExport, setPropertyToExport] = useState<Property | null>(null);

  // Debounce filter text
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProps();
    }, 400); // Debounce fetch
    return () => clearTimeout(timer);
  }, [filterText, statusFilter, selectedLocation, minPrice, maxPrice, startDate, endDate]);

  const fetchProps = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (statusFilter !== 'All') filters.status = [statusFilter];
      if (filterText) filters.city = filterText;

      if (selectedLocation) {
        filters.county = selectedLocation.name.replace(' County', '');
        filters.state = selectedLocation.state;
      }

      if (minPrice) filters.min_price = Number(minPrice);
      if (maxPrice) filters.max_price = Number(maxPrice);
      if (startDate) filters.min_date = startDate;
      if (endDate) filters.max_date = endDate;

      const data = await AuctionService.getProperties(filters);
      setProperties(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Location Autocomplete
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

  // Bulk Actions
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(properties.map(p => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) newSelected.add(id);
    else newSelected.delete(id);
    setSelectedIds(newSelected);
  };

  const handleBulkAction = async (action: 'update_status' | 'delete', status?: string) => {
    if (!confirm(`Are you sure you want to ${action === 'delete' ? 'delete' : 'update'} ${selectedIds.size} properties?`)) return;

    try {
      await AuctionService.bulkUpdate(Array.from(selectedIds), action, status);
      setSelectedIds(new Set());
      fetchProps(); // Refresh
    } catch (e) {
      console.error(e);
      alert('Bulk action failed');
    }
  };

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

  const openModal = (property: Property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
  };

  // View Mode
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const openExportModal = (property: Property) => {
    setPropertyToExport(property);
    setIsExportModalOpen(true);
  };

  const handleDeleteProperty = async (property: Property) => {
    if (confirm(`Are you sure you want to delete ${property.address || property.title}?`)) {
      const originalProps = [...properties];
      setProperties(properties.filter(prop => prop.id !== property.id));

      try {
        await AuctionService.deleteProperty(property.id);
      } catch (e) {
        console.error(e);
        alert('Failed to delete property');
        setProperties(originalProps);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <PropertyDetailsModal
        property={selectedProperty}
        isOpen={isModalOpen}
        onClose={closeModal}
      />

      {propertyToExport && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          propertyId={propertyToExport.id}
          propertyName={propertyToExport.address || propertyToExport.title}
        />
      )}

      {showCountySelector && (
        <CountySelector
          mode="filter"
          onClose={() => setShowCountySelector(false)}
          onSelect={(state, county) => {
            setSelectedLocation({
              fips: 'map-selection',
              name: `${county} County`,
              state: state
            });
            setShowCountySelector(false);
          }}
        />
      )}

      {/* Floating Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-full px-6 py-3 z-50 flex items-center gap-4 animate-slideUp">
          <span className="font-semibold text-slate-700 dark:text-white">{selectedIds.size} Selected</span>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-600"></div>
          <div className="flex gap-2">
            <button onClick={() => handleBulkAction('update_status', 'active')} className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-md text-sm font-medium transition-colors">Mark Active</button>
            <button onClick={() => handleBulkAction('update_status', 'pending')} className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 px-3 py-1 rounded-md text-sm font-medium transition-colors">Mark Pending</button>
            <button onClick={() => handleBulkAction('update_status', 'sold')} className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-3 py-1 rounded-md text-sm font-medium transition-colors">Mark Sold</button>
            <button onClick={() => handleBulkAction('delete')} className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">delete</span> Delete
            </button>
          </div>
          <button onClick={() => setSelectedIds(new Set())} className="ml-2 text-slate-400 hover:text-slate-600">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
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
      <div className="flex flex-col gap-4 bg-white dark:bg-[#1a2634] p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
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

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`p-2 rounded-lg border flex items-center gap-1 text-sm font-medium transition-colors ${showAdvancedFilters ? 'bg-slate-100 border-slate-300 text-slate-900' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            >
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filters
            </button>
          </div>

          <div className="relative w-full md:w-64">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-slate-400 text-[18px]">search</span>
            </span>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary placeholder-slate-400"
              placeholder="Find by City..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>

          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg ml-0 md:ml-2">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              title="Table View"
            >
              <List size={20} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              title="Grid View"
            >
              <LayoutGrid size={20} />
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4 animate-slideUp">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Min Price</label>
              <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Max Price</label>
              <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" placeholder="Any" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Auction Date From</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Auction Date To</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="bg-white dark:bg-[#1a2634] rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center text-slate-500">
            Loading properties...
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white dark:bg-[#1a2634] rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center text-slate-500">
            No properties found.
          </div>
        ) : viewMode === 'table' ? (
          <div className="bg-white dark:bg-[#1a2634] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                    <th className="py-4 px-4 w-[40px]">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-primary focus:ring-primary"
                        checked={properties.length > 0 && selectedIds.size === properties.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </th>
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
                  {properties.map((p) => (
                    <tr key={p.id} className={`group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${selectedIds.has(p.id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                      <td className="py-4 px-4 align-middle">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-primary focus:ring-primary"
                          checked={selectedIds.has(p.id)}
                          onChange={(e) => handleSelectOne(p.id, e.target.checked)}
                        />
                      </td>
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
                            onClick={() => openExportModal(p)}
                            className="text-slate-400 hover:text-green-600 dark:hover:text-green-400 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
                            title="Export to Inventory"
                          >
                            <span className="material-symbols-outlined text-[20px]">ios_share</span>
                          </button>

                          <button
                            onClick={() => navigate(`/properties/${p.id}/edit`)}
                            className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteProperty(p)}
                            className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                const { url } = await AuctionService.generateReport(p.id);
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {properties.map((p) => (
              <PropertyCard
                key={p.id}
                property={p}
                onView={openModal}
                onEdit={(prop) => navigate(`/properties/${prop.id}/edit`)}
                onExport={openExportModal}
                onDelete={handleDeleteProperty}
                isSelected={selectedIds.has(p.id)}
                onSelect={handleSelectOne}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};