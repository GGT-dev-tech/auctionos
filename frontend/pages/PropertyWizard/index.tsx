import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Property, PropertyStatus, PropertyType, FloodZone } from '../../types';
import { AuctionService } from '../../services/api';

import { Step1Parcel } from './Step1Parcel';
import { Step2Appraisal } from './Step2Appraisal';
import { Step3Regrid } from './Step3Regrid';
import { Step4Validation } from './Step4Validation';
import { Step5FEMA } from './Step5FEMA';
import { Step6Zillow } from './Step6Zillow';

// We might want to keep the original Auction/Media steps?
// User asked for "Linear: Parcel -> Appraisal -> Regrid -> Validation -> FEMA -> Zillow" 
// This covers the data collection. We probably still need "Media" and "Auction" settings eventually.
// But let's strictly follow the linear flow requested for now, 
// and maybe append Media/Finalize at the end or assume this IS the flow for data entry.
// Let's add Media and Review/Auction at the end to be practical.
// Updated Flow: 1.Parcel -> 2.Appraisal -> 3.Regrid -> 4.Validation -> 5.FEMA -> 6.Zillow -> [7.Media -> 8.Review/Auction]?
// Let's implement the 6 requested ones + keep Media/Auction as final steps to ensure usability.

const STEPS = [
  { id: 1, label: 'Parcel' },
  { id: 2, label: 'Appraisal' },
  { id: 3, label: 'Regrid' },
  { id: 4, label: 'Validation' },
  { id: 5, label: 'FEMA' },
  { id: 6, label: 'Zillow' },
  // Keeping essential steps for functionality
  { id: 7, label: 'Media' },
  { id: 8, label: 'Finalize' }
];

// Import original steps for fallback
import { Step3Media } from './Step3Media';
import { Step4Auction } from './Step4Auction';

export const PropertyWizard: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Property>>({
    title: '',
    address: '',
    city: 'Miami',
    state: 'FL',
    zip_code: '33139',
    property_type: PropertyType.Residential,
    status: PropertyStatus.Draft,
    price: 0,
    details: {}
  });

  useEffect(() => {
    if (isEditMode && id) {
      const loadProperty = async () => {
        setLoading(true);
        try {
          const data = await AuctionService.getProperty(id);
          setFormData(data);
        } catch (error) {
          console.error("Failed to load property", error);
        } finally {
          setLoading(false);
        }
      };
      loadProperty();
    }
  }, [id, isEditMode]);

  const updateFormData = (data: Partial<Property>) => {
    // Deep merge details if present
    if (data.details) {
      setFormData(prev => ({
        ...prev,
        ...data,
        details: { ...prev.details, ...data.details }
      }));
    } else {
      setFormData(prev => ({ ...prev, ...data }));
    }
  };

  const saveDraft = async () => {
    try {
      if (isEditMode && id) {
        await AuctionService.updateProperty(id, formData);
        alert("Draft updated!");
      } else {
        const newProp = await AuctionService.createProperty(formData);
        navigate(`/properties/${newProp.id}/edit`, { replace: true });
      }
    } catch (error) {
      console.error("Failed to save draft", error);
      alert("Failed to save draft.");
    }
  };

  const nextStep = async () => {
    // If on Step 1 and not saved yet, save it to get ID
    if (currentStep === 1 && !id) {
      try {
        const newProp = await AuctionService.createProperty(formData);
        navigate(`/properties/${newProp.id}/edit`, { replace: true });
        setCurrentStep(2);
        return;
      } catch (e) {
        alert("Failed to create property. Cannot proceed.");
        return;
      }
    }

    if (currentStep < 8) {
      setCurrentStep(c => c + 1);
    } else {
      // Finish
      try {
        if (isEditMode && id) {
          await AuctionService.updateProperty(id, formData);
        }
        navigate('/inventory');
      } catch (error) {
        console.error("Failed to save property", error);
        alert("Failed to save property.");
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(c => c - 1);
    else navigate('/inventory');
  };

  if (loading) {
    return <div className="p-10 text-center text-slate-500">Loading property...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isEditMode ? 'Edit Property' : 'New Property Wizard'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Follow the steps to input property data.
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200/60 dark:border-slate-800 overflow-x-auto">
        <div className="relative flex items-center justify-between min-w-[600px]">
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full -z-0"></div>
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-primary rounded-full -z-0 transition-all duration-500" style={{ width: `${((currentStep - 1) / 7) * 100}%` }}></div>

          {STEPS.map((step) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center gap-2 cursor-pointer" onClick={() => id && setCurrentStep(step.id)}>
                <div
                  className={`size-8 md:size-10 rounded-full flex items-center justify-center font-bold shadow-sm ring-4 ring-white dark:ring-slate-900 transition-colors
                    ${isActive || isCompleted ? 'bg-primary text-white' : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400'}
                  `}
                >
                  {isCompleted ? <span className="material-symbols-outlined text-[16px] md:text-[20px]">check</span> : step.id}
                </div>
                <span className={`text-[10px] md:text-xs font-bold ${isActive ? 'text-primary' : 'text-slate-400'}`}>{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Form Step */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 overflow-hidden min-h-[400px]">
        {currentStep === 1 && <Step1Parcel data={formData} update={updateFormData} />}
        {currentStep === 2 && <Step2Appraisal data={formData} update={updateFormData} />}
        {currentStep === 3 && <Step3Regrid data={formData} update={updateFormData} />}
        {currentStep === 4 && <Step4Validation data={formData} update={updateFormData} />}
        {currentStep === 5 && <Step5FEMA data={formData} update={updateFormData} />}
        {currentStep === 6 && <Step6Zillow data={formData} update={updateFormData} />}
        {currentStep === 7 && <Step3Media propertyId={id} />}
        {currentStep === 8 && <Step4Auction data={formData} update={updateFormData} />}
      </div>

      {/* Footer Controls */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-72 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 px-8 flex items-center justify-between z-20">
        <button onClick={prevStep} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-medium px-4 py-2 rounded-lg transition-colors">
          {currentStep === 1 ? 'Cancel' : 'Back'}
        </button>
        <div className="flex items-center gap-3">
          <button onClick={saveDraft} className="px-6 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Save Draft
          </button>
          <button onClick={nextStep} className="px-6 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2">
            {currentStep === 8 ? (isEditMode ? 'Update' : 'Publish') : 'Next Step'}
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};