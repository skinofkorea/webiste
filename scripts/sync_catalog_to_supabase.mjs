import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://wwdkdaeeoyjwvaslcwgv.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3ZGtkYWVlb3lqd3Zhc2xjd2d2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjQwODY2OCwiZXhwIjoyMTA3OTg0NjY4fQ.xPvcoG_dQ0NevQ9svxxbsDxyeC5IiWiNEy26qVgZ0DQ';

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
}

async function run() {
  console.log('--- Mii Korean Supabase Catalog Sync ---');
  console.log('Connecting to:', SUPABASE_URL);

  // 1. Check if products table exists
  const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id&limit=1`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`
    }
  });

  if (!checkRes.ok) {
    console.error('ERROR: Could not access "products" table in Supabase.');
    console.error('Please run "schema.sql" in your Supabase SQL Editor first (https://supabase.com/dashboard/project/wwdkdaeeoyjwvaslcwgv/sql/new).');
    process.exit(1);
  }

  console.log('Products table exists! Reading local catalog...');
  const catalogPath = path.resolve(__dirname, '../api/data/miikorean-storefront.json');
  if (!fs.existsSync(catalogPath)) {
    console.error('Cannot find catalog file:', catalogPath);
    process.exit(1);
  }

  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const products = catalog.products || [];
  console.log(`Found ${products.length} products to sync.`);

  const batchSize = 50;
  let synced = 0;

  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const rows = batch.map(p => {
      const primaryVariant = Array.isArray(p.variants) && p.variants.length > 0 ? p.variants[0] : {};
      const primaryImage = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : {};

      return {
        name: p.title || 'Untitled Product',
        category: p.product_type || 'Skincare',
        description: stripHtml(p.body_html || '') || p.title,
        price: Number(primaryVariant.price || 0),
        stock: p.stock !== undefined ? Number(p.stock) : (primaryVariant.available !== false ? 100 : 0),
        photo: primaryImage.src || '',
        featured: Boolean(p.featured),
        is_active: p.isActive !== false,
        variants: p.variants || [],
      };
    });

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(rows)
    });

    if (!insertRes.ok) {
      const errText = await insertRes.text();
      console.error(`Batch ${Math.floor(i / batchSize) + 1} insert error:`, errText);
    } else {
      synced += batch.length;
      console.log(`Synced ${synced} / ${products.length} products...`);
    }
  }

  console.log(`--- Sync Complete! Successfully inserted ${synced} products to Supabase. ---`);
}

run().catch(console.error);
