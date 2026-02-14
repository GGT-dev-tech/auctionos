import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Property, PropertyStatus, PropertyType, FloodZone } from '../../types';
import { AuctionService } from '../../services/api';
import { Step1BasicInfo } from './Step1BasicInfo';
import { Step2Financials } from './Step2Financials';
import { Step3Media } from './Step3Media';
import { Step4Auction } from './Step4Auction';
import { Step5Notes } from './Step5Notes';

const STEPS = [
  { id: 1, label: 'Basic Info' },
  { id: 2, label: 'Financials & Legal' },
  { id: 3, label: 'Media' },
  { id: 4, label: 'Settings' },
  { id: 5, label: 'Notes' }
];

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
    setFormData(prev => ({ ...prev, ...data }));
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
    if (currentStep === 2 && !id) {
      // Create property if on step 2 and no ID, before moving to Media
      try {
        const newProp = await AuctionService.createProperty(formData);
        navigate(`/properties/${newProp.id}/edit`, { replace: true });
        setCurrentStep(3);
        return;
      } catch (e) {
        alert("Failed to create property. Cannot proceed.");
        return;
      }
    }

    if (currentStep < 5) {
      setCurrentStep(c => c + 1);
    } else {
      // Finish on Step 5
      try {
        if (isEditMode && id) {
          await AuctionService.updateProperty(id, formData);
        } else {
          await AuctionService.createProperty(formData);
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
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isEditMode ? 'Edit Property' : 'Register New Property'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {isEditMode ? 'Update property details below.' : 'Fill in the details below to list a new property for auction.'}
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200/60 dark:border-slate-800">
        <div className="relative flex items-center justify-between w-full">
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full -z-0"></div>
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-primary rounded-full -z-0 transition-all duration-500" style={{ width: `${((currentStep - 1) / 4) * 100}%` }}></div>

          {STEPS.map((step) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                <div
                  className={`size-10 rounded-full flex items-center justify-center font-bold shadow-sm ring-4 ring-white dark:ring-slate-900 transition-colors
                    ${isActive || isCompleted ? 'bg-primary text-white' : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400'}
                  `}
                >
                  {isCompleted ? <span className="material-symbols-outlined text-[20px]">check</span> : step.id}
                </div>
                <span className={`text-xs md:text-sm font-bold ${isActive ? 'text-primary' : 'text-slate-400'}`}>{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Form Step */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 overflow-hidden min-h-[400px]">
        {currentStep === 1 && <Step1BasicInfo data={formData} update={updateFormData} />}
        {currentStep === 2 && <Step2Financials data={formData} update={updateFormData} />}
        {currentStep === 3 && <Step3Media propertyId={id} />}
        {currentStep === 4 && <Step4Auction data={formData} update={updateFormData} />}
        {currentStep === 5 && <Step5Notes data={formData} />}
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
            {currentStep === 5 ? (isEditMode ? 'Update' : 'Publish') : 'Next Step'}
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};