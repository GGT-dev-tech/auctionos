import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminService } from '../services/admin.service';
import { ChevronLeft } from 'lucide-react';

import { PropertyBasicInfo } from '../components/property/PropertyBasicInfo';
import { PropertyPurchaseOptions } from '../components/property/PropertyPurchaseOptions';
import { PropertyEstimatesComps } from '../components/property/PropertyEstimatesComps';
import { PropertyResearchLinks } from '../components/property/PropertyResearchLinks';
import { PropertyUserActions } from '../components/property/PropertyUserActions';
import { PropertyFinancialsModal } from '../components/property/PropertyFinancialsModal';
import { PropertyMetadataModal } from '../components/property/PropertyMetadataModal';
import PropertyMap from '../components/PropertyMap';
import { PropertyExtendedTabs } from '../components/property/PropertyExtendedTabs';
import { PropertyOwnerCard } from '../components/property/PropertyOwnerCard';

const PropertyDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [property, setProperty] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [isFinOpen, setIsFinOpen] = useState(false);
    const [isMetaOpen, setIsMetaOpen] = useState(false);

    useEffect(() => {
        const fetchProperty = async () => {
            if (!id) return;
            try {
                const data = await AdminService.getProperty(id);
                setProperty(data);
                
                // Background Check: Auto-Enrich via ATTOM if crucial details are missing.
                const checkMissing = !data.year_built || !data.bedrooms || !data.owner_name || !data.assessed_value;
                if (checkMissing && data.property_id) {
                    AdminService.enrichProperty(data.property_id)
                        .then(res => {
                            if (res?.enriched_fields && Object.keys(res.enriched_fields).length > 0) {
                                // Update React state locally with new fields so UI refreshes organically
                                setProperty((prev: any) => ({ ...prev, ...res.enriched_fields }));
                                console.log("ATTOM Auto-Enriched Property:", res.enriched_fields);
                            }
                        })
                        .catch(err => console.debug("ATTOM Enrichment skipped or failed:", err));
                }
            } catch (error) {
                console.error('Failed to fetch property details', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProperty();
    }, [id]);


    if (loading) return <div className="p-8 text-center text-slate-500">Loading details...</div>;
    if (!property) return <div className="p-8 text-center text-red-500">Property not found.</div>;

    return (
        <div className="w-full px-4 sm:px-8 lg:px-12 py-6 space-y-6">
            <button
                onClick={() => navigate('/inventory')}
                className="flex items-center text-slate-500 hover:text-slate-700 mb-2 transition-colors"
            >
                <ChevronLeft size={20} />
                <span>Back to Inventory</span>
            </button>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                
                {/* Main Content Column (Left) */}
                <div className="xl:col-span-2 space-y-6">
                    <PropertyBasicInfo 
                        property={property} 
                        onOpenFinancials={() => setIsFinOpen(true)}
                        onOpenMetadata={() => setIsMetaOpen(true)}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <PropertyPurchaseOptions property={property} />
                        <PropertyEstimatesComps property={property} />
                    </div>

                    <PropertyExtendedTabs property={property} />

                    <div className="bg-white dark:bg-slate-800 rounded-xl p-1 shadow-sm border border-slate-200 dark:border-slate-700 h-[400px] overflow-hidden mt-6">
                        <PropertyMap parcelId={property.parcel_id || null} />
                    </div>
                </div>

                {/* Sidebar Column (Right) */}
                <div className="space-y-6">
                    <PropertyOwnerCard property={property} />
                    <PropertyResearchLinks property={property} />
                    <PropertyUserActions property={property} />

                    {/* Admin Actions - Preserved from original */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Admin Actions</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate(`/properties/${property.parcel_id}/edit`)}
                                className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
                            >
                                Edit Property Data
                            </button>
                            <button
                                onClick={() => alert('Validation feature coming soon')}
                                className="w-full py-2.5 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors"
                            >
                                Run GSI Validation
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <PropertyFinancialsModal 
                isOpen={isFinOpen} 
                onClose={() => setIsFinOpen(false)} 
                property={property} 
            />
            
            <PropertyMetadataModal 
                isOpen={isMetaOpen} 
                onClose={() => setIsMetaOpen(false)} 
                property={property} 
            />
        </div>
    );
};

export default PropertyDetails;
