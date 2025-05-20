const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

/**
 * Uploads multiple image files to the server
 * @param {File[]} files - Array of File objects to upload
 * @param {string} listingId - ID of the listing to associate with the images
 * @returns {Promise<{success: boolean, urls: string[]}>} - Result with image URLs
 */
export const uploadImages = async (files, listingId = 'temp') => {
  if (!files || files.length === 0) {
    throw new Error('No files selected');
  }

  const formData = new FormData();
  
  // Add each file to the form data
  Array.from(files).forEach((file) => {
    formData.append('images', file);
    console.log(`Adding file to upload: ${file.name} (${file.type}, ${file.size} bytes)`);
  });

  try {
    const uploadUrl = `${API_URL}/api/upload/${listingId}`;
    console.log('Uploading files to:', uploadUrl);
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header, let the browser set it with the correct boundary
    });

    const data = await response.json();
    console.log('Upload response:', data);
    
    if (!response.ok) {
      console.error('Upload failed:', data);
      throw new Error(data.message || 'Failed to upload images');
    }

    // Ensure returned URLs are properly formatted for frontend use
    if (data.urls && Array.isArray(data.urls)) {
      // Process the URLs if needed here
      console.log('Received image URLs:', data.urls);
    }

    return data;
  } catch (error) {
    console.error('Error uploading images:', error);
    throw new Error(error.message || 'Failed to upload images');
  }
};
