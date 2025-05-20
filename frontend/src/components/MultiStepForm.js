import React, { useState } from 'react';
import ProgressBar from './ProgressBar';
import BasicInfoStep from './steps/BasicInfoStep';
import ProductDetailsStep from './steps/ProductDetailsStep';
import AvailabilityLocationStep from './steps/AvailabilityLocationStep';
import MediaUploadStep from './steps/MediaUploadStep';
import TermsPoliciesStep from './steps/TermsPoliciesStep';
import ReviewSubmitStep from './steps/ReviewSubmitStep';

const steps = [
  { label: 'Basic Info', icon: '📦' },
  { label: 'Details', icon: '📝' },
  { label: 'Availability', icon: '📅' },
  { label: 'Media', icon: '🖼️' },
  { label: 'Terms', icon: '📃' },
  { label: 'Review', icon: '✅' }
];

const initialFormData = {
  title: '',
  category: '',
  subcategory: '',
  brand: '',
  condition: '',
  description: '',
  specifications: [{ key: '', value: '' }],
  price: '',
  pricePeriod: 'day',
  deposit: '',
  minDuration: 1,
  availableFrom: '',
  availableTo: '',
  location: '',
  delivery: false,
  shipping: '',
  images: [],
  video: '',
  rentalTerms: '',
  acceptDeposit: false,
  cancellation: '',
  notes: ''
};

const MultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialFormData);

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
    } else {
      alert('Please fill all required fields');
    }
  };

  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));
  const goToStep = (idx) => {
    if (idx <= currentStep) {
      setCurrentStep(idx);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        return formData.title && formData.category && formData.subcategory && formData.brand && formData.condition;
      case 1:
        return formData.description && formData.specifications.every(spec => spec.key && spec.value);
      case 2:
        return formData.availableFrom && formData.availableTo && formData.location;
      case 3:
        return formData.images.length > 0;
      case 4:
        return formData.rentalTerms;
      default:
        return true;
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg px-6 py-8 mt-6 mb-12">
      <ProgressBar steps={steps} currentStep={currentStep} onStepClick={goToStep} />
      <div className="mt-8">
        {currentStep === 0 && (
          <BasicInfoStep formData={formData} onChange={handleChange} />
        )}
        {currentStep === 1 && (
          <ProductDetailsStep formData={formData} onChange={handleChange} />
        )}
        {currentStep === 2 && (
          <AvailabilityLocationStep formData={formData} onChange={handleChange} />
        )}
        {currentStep === 3 && (
          <MediaUploadStep formData={formData} onChange={handleChange} />
        )}
        {currentStep === 4 && (
          <TermsPoliciesStep formData={formData} onChange={handleChange} />
        )}
        {currentStep === 5 && (
          <ReviewSubmitStep formData={formData} goToStep={goToStep} />
        )}
      </div>
      <div className="flex justify-between mt-10">
        <button
          className="px-6 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition disabled:opacity-50"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          Back
        </button>
        {currentStep < steps.length - 1 ? (
          <button
            className="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            onClick={nextStep}
          >
            Next
          </button>
        ) : (
          <button
            className="px-6 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition"
            onClick={() => alert('Submitted! (UI only)')}
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
};

export default MultiStepForm;