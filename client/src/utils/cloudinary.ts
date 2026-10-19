/**
 * Cloudinary unsigned upload utility for frontend image uploads
 */
export const uploadToCloudinary = async (
  fileOrBase64: File | string,
  folder: string = 'miikorean/products'
): Promise<{ url: string; publicId: string }> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'rftuypfl';
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'miikorean_unsigned'; // Or direct unsigned upload

  const formData = new FormData();
  formData.append('file', fileOrBase64);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  try {
    // Attempt 1: Fast unsigned upload
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (res.ok && data.secure_url) {
      return {
        url: data.secure_url,
        publicId: data.public_id,
      };
    }

    // Attempt 2: If unsigned failed, fetch signature from backend and do signed upload
    console.warn('Unsigned upload returned, falling back to signed upload:', data.error?.message);
    const signRes = await fetch('/api/v1/cloudinary/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder }),
    });

    if (signRes.ok) {
      const signData = await signRes.json();
      if (signData.signature) {
        const signedFormData = new FormData();
        signedFormData.append('file', fileOrBase64);
        signedFormData.append('api_key', signData.apiKey);
        signedFormData.append('timestamp', signData.timestamp.toString());
        signedFormData.append('signature', signData.signature);
        signedFormData.append('folder', signData.folder);

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`, {
          method: 'POST',
          body: signedFormData,
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.secure_url) {
          return {
            url: uploadData.secure_url,
            publicId: uploadData.public_id,
          };
        }
      }
    }

    throw new Error(data.error?.message || 'Failed to upload image to Cloudinary');
  } catch (error: any) {
    console.error('Cloudinary Upload Error:', error);
    throw error;
  }
};
