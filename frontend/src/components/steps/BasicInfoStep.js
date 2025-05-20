import React from 'react';

const categories = [
  { label: 'Electronics', value: 'electronics', subcategories: ['Cameras', 'Laptops', 'Mobiles'] },
  { label: 'Furniture', value: 'furniture', subcategories: ['Sofas', 'Beds', 'Tables'] },
  { label: 'Household', value: 'household', subcategories: ['Appliances', 'Tools'] },
  { label: 'Commercial', value: 'commercial', subcategories: ['Machinery', 'Office Equipment'] },
  { label: 'Personal', value: 'personal', subcategories: ['Clothing', 'Accessories'] },
];

const conditions = ['New', 'Like New', 'Good', 'Used', 'Needs Repair'];

const BasicInfoStep = ({ formData, onChange }) => {
  const selectedCat = categories.find(c => c.value === formData.category);
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-blue-700 mb-2 flex items-center gap-2">Basic Product Information
        <span className="text-blue-400" title="Start here!">ℹ️</span>
      </h2>
      <div>
        <label className="block text-sm font-medium text-blue-900 mb-1">Product Title <span className="text-red-500">*</span></label>
        <input
          type="text"
          className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          value={formData.title}
          onChange={e => onChange('title', e.target.value)}
          placeholder="e.g. Canon DSLR Camera"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-blue-900 mb-1">Category <span className="text-red-500">*</span></label>
        <select
          className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          value={formData.category}
          onChange={e => onChange('category', e.target.value)}
        >
          <option value="">Select category</option>
          {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
        </select>
      </div>
      {formData.category && (
        <div>
          <label className="block text-sm font-medium text-blue-900 mb-1">Subcategory <span className="text-gray-400">(optional)</span></label>
          <select
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={formData.subcategory}
            onChange={e => onChange('subcategory', e.target.value)}
          >
            <option value="">Select subcategory</option>
            {selectedCat?.subcategories.map(sc => <option key={sc} value={sc}>{sc}</option>)}
          </select>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-blue-900 mb-1">Brand</label>
        <input
          type="text"
          className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          value={formData.brand}
          onChange={e => onChange('brand', e.target.value)}
          placeholder="e.g. Samsung, IKEA"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-blue-900 mb-1">Condition <span className="text-red-500">*</span></label>
        <div className="flex flex-wrap gap-4 mt-1">
          {conditions.map(cond => (
            <label key={cond} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="condition"
                checked={formData.condition === cond}
                onChange={() => onChange('condition', cond)}
                className="accent-blue-600"
              />
              <span>{cond}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BasicInfoStep;
