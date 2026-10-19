async function testApi() {
  const token = 'a'.repeat(128);

  console.log('--- 1. Testing Cloudinary Sign API ---');
  try {
    const signRes = await fetch('http://localhost:5173/api/v1/cloudinary/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder: 'miikorean/test' }),
    });
    console.log('Sign status:', signRes.status);
    const signData = await signRes.json();
    console.log('Sign response:', signData);
  } catch (err) {
    console.error('Sign error:', err);
  }

  console.log('\n--- 2. Testing Customer Directory (/api/v1/auth/all) ---');
  try {
    const userRes = await fetch('http://localhost:5173/api/v1/auth/all', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('User status:', userRes.status);
    const userData = await userRes.json();
    console.log('User count:', userData?.users?.length);
    console.log('First user:', userData?.users?.[0]);
  } catch (err) {
    console.error('User error:', err);
  }

  console.log('\n--- 3. Testing Products API (/api/v1/products/all) ---');
  try {
    const prodRes = await fetch('http://localhost:5173/api/v1/products/all');
    console.log('Product status:', prodRes.status);
    const prodData = await prodRes.json();
    console.log('Product count:', prodData?.products?.length);
  } catch (err) {
    console.error('Prod error:', err);
  }
}

testApi();
