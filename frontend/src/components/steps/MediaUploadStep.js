import React, { useRef } from 'react';

const MediaUploadStep = ({ formData, onChange }) => {
  const fileInput = useRef();
  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    const urls = files.map(f => URL.createObjectURL(f));
    onChange('images', [...formData.images, ...urls]);
  };
  const removeImage = (idx) => {
    onChange('images', formData.images.filter((_, i) => i !== idx));
  };
  const moveImage = (from, to) => {
    if (to < 0 || to >= formData.images.length) return;
    const newArr = [...formData.images];
    const [moved] = newArr.splice(from, 1);
    newArr.splice(to, 0, moved);
    onChange('images', newArr);
  };
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-blue-700 mb-2 flex items-center gap-2">Upload Photos & Videos <span className="text-blue-400" title="Add visuals">🖼️</span></h2>
      <div>
        <label className="block text-sm font-medium text-blue-900 mb-1">Product Images <span className="text-red-500">*</span></label>
        <div className="border-2 border-dashed border-blue-200 rounded-lg p-6 text-center bg-blue-50 cursor-pointer hover:bg-blue-100 transition" onClick={() => fileInput.current.click()}>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            ref={fileInput}
            onChange={handleFiles}
          />
          <div className="text-blue-400 text-3xl mb-2">📤</div>
          <div className="text-gray-500">Drag & drop or click to upload images (max 10)</div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
          {formData.images.map((img, idx) => (
            <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200">
              <img src={img} alt={`Product ${idx+1}`} className="h-28 w-full object-cover" />
              <button type="button" className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 text-red-500 hover:bg-red-100" onClick={() => removeImage(idx)} title="Remove">×</button>
              <div className="absolute bottom-1 left-1 flex gap-1">
                <button type="button" className="text-xs bg-white bg-opacity-70 rounded px-1" onClick={() => moveImage(idx, idx-1)} title="Move Left">◀️</button>
                <button type="button" className="text-xs bg-white bg-opacity-70 rounded px-1" onClick={() => moveImage(idx, idx+1)} title="Move Right">▶️</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6">
        <label className="block text-sm font-medium text-blue-900 mb-1">Video URL <span className="text-gray-400">(optional)</span></label>
        <input
          type="text"
          className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          value={formData.video}
          onChange={e => onChange('video', e.target.value)}
          placeholder="e.g. https://www.youtube.com/watch?v=..."
        />
      </div>
    </div>
  );
};

export default MediaUploadStep;
