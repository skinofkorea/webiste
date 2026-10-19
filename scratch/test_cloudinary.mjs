import crypto from 'crypto';

const CLOUD_NAME = 'rftuypfl';
const API_KEY = '783311347359328';
const API_SECRET = '0Ge1sHOAF3ZojG2O7oj8TFwWMMw';

async function testCloudinaryUpload() {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = 'miikorean/test';
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}${API_SECRET}`;
  const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

  console.log('Testing Cloudinary signed upload with credentials:');
  console.log({ CLOUD_NAME, API_KEY, timestamp, signature, folder });

  // 1x1 transparent PNG base64
  const tinyPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

  const formData = new FormData();
  formData.append('file', tinyPng);
  formData.append('api_key', API_KEY);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  formData.append('folder', folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  console.log('Cloudinary response status:', res.status);
  console.log('Cloudinary response data:', data);

  if (res.ok && data.secure_url) {
    console.log('SUCCESS! Secure URL:', data.secure_url);
  } else {
    console.error('FAILED!', data);
  }
}

testCloudinaryUpload().catch(console.error);
