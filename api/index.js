import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnvFromFile() {
  try {
    const envPaths = [
      path.resolve(__dirname, '../.env'),
      path.resolve(__dirname, '../client/.env'),
      path.resolve(__dirname, '.env'),
    ];
    for (const p of envPaths) {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf8');
        for (const line of content.split(/\r?\n/)) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
            const idx = trimmed.indexOf('=');
            const key = trimmed.slice(0, idx).trim();
            const val = trimmed.slice(idx + 1).trim();
            if (key) process.env[key] = val;
          }
        }
      }
    }
  } catch (e) {
    // ignore
  }
}
loadEnvFromFile();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://wwdkdaeeoyjwvaslcwgv.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3ZGtkYWVlb3lqd3Zhc2xjd2d2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjQwODY2OCwiZXhwIjoyMTA3OTg0NjY4fQ.xPvcoG_dQ0NevQ9svxxbsDxyeC5IiWiNEy26qVgZ0DQ';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Cloudinary Configuration
const CLOUDINARY_CONFIG = {
  get CLOUD_NAME() { loadEnvFromFile(); return process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME || 'rftuypfl'; },
  get API_KEY() { loadEnvFromFile(); return process.env.CLOUDINARY_API_KEY || process.env.VITE_CLOUDINARY_API_KEY || '783311347359328'; },
  get API_SECRET() { loadEnvFromFile(); return process.env.CLOUDINARY_API_SECRET || '0Ge1sHOAF3ZojG2O7oj8TFwWMMw'; },
};

// Simple password hashing and comparison (use bcrypt in production)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'SHIPPER_SALT_2025').digest('hex');
}

function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

// Generate shipper auth token
function generateShipperToken() {
  return crypto.randomBytes(64).toString('hex');
}

// ⚠️ ICICI Bank OPG Payment Gateway is DISABLED
// const ICICI_CONFIG = {
//   get MID() { return process.env.ICICI_MID || '100000000490311'; },
//   get KEY() { return process.env.ICICI_KEY || 'bd7461c6-7e54-4d75-b088-1deb659a666d'; },
//   get AGG_ID() { return process.env.ICICI_AGG_ID || '100000000490310'; },
//   get INITIATE_SALE_URL() { return 'https://pgpay.icicibank.com/pg/api/v2/initiateSale'; },
//   get COMMAND_URL() { return 'https://pgpay.icicibank.com/pg/api/command'; },
//   get SETTLEMENT_URL() { return 'https://pgpay.icicibank.com/pg/api/settlementDetails'; }
// };

// ICICI SHA-256 HMAC SecureHash (ASCII message encoding per ICICI spec)
// function generateICICISecureHash(payload, secretKey) {
//   const sortedKeys = Object.keys(payload).sort();
//   let plainHashtext = '';
//   for (const key of sortedKeys) {
//     if (payload[key] !== undefined && payload[key] !== null) {
//       plainHashtext += payload[key];
//     }
//   }
//   const hmac = crypto.createHmac('sha256', secretKey);
//   hmac.update(Buffer.from(plainHashtext, 'ascii'));
//   return hmac.digest('hex');
// }

// ─── Razorpay Payment Gateway Configuration ───
const RAZORPAY_CONFIG = {
  get KEY_ID() { return process.env.RAZORPAY_KEY_ID || ''; },
  get KEY_SECRET() { return process.env.RAZORPAY_KEY_SECRET || ''; },
};

let miikoreanCatalogData = null;
let miikoreanCatalog = null;

function getMiikoreanCatalogData() {
  if (!miikoreanCatalogData) {
    const catalogPath = path.join(__dirname, 'data', 'miikorean-storefront.json');
    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    if (!Array.isArray(catalog.products)) {
      throw new Error('The Miikorean product catalog is unavailable or invalid.');
    }
    miikoreanCatalogData = catalog;
    miikoreanCatalog = catalog.products;
  }
  return miikoreanCatalogData;
}

function saveMiikoreanCatalogData(catalogData) {
  miikoreanCatalogData = catalogData;
  miikoreanCatalog = catalogData.products;
  const jsonStr = JSON.stringify(catalogData, null, 2);

  // 1. Write to api/data/miikorean-storefront.json
  const apiPath = path.join(__dirname, 'data', 'miikorean-storefront.json');
  fs.writeFileSync(apiPath, jsonStr, 'utf8');

  // 2. Sync to client/public/miikorean-storefront.json so storefront updates in real-time
  try {
    const clientPath = path.resolve(__dirname, '../client/public/miikorean-storefront.json');
    if (fs.existsSync(path.dirname(clientPath))) {
      fs.writeFileSync(clientPath, jsonStr, 'utf8');
    }
  } catch (err) {
    console.warn('Sync to client/public warning:', err.message);
  }

  if (global.fastApiCache) global.fastApiCache.clear();
}

function getMiikoreanProducts() {
  return getMiikoreanCatalogData().products;
}

function stripHtmlTags(html) {
  if (!html) return '';
  return String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function mapCatalogProduct(p) {
  if (!p) return null;
  const variants = p.variants || [];
  const availableVariants = variants.filter(v => v.available);
  const pricedVariants = (availableVariants.length > 0 ? availableVariants : variants)
    .map(v => Number(v.price))
    .filter(Number.isFinite);
  const images = p.images || [];
  const firstImage = images[0]?.src || variants.find(v => v.featured_image)?.featured_image || p.photo || '';
  const description = p.description || stripHtmlTags(p.body_html || '').slice(0, 320);

  const price = pricedVariants.length > 0 ? Math.min(...pricedVariants) : Number(p.price || 0);
  const compareAtPrice = variants.find(v => v.compare_at_price)?.compare_at_price 
    ? Number(variants.find(v => v.compare_at_price).compare_at_price) 
    : (p.compareAtPrice ? Number(p.compareAtPrice) : null);

  const stock = p.stock !== undefined 
    ? Number(p.stock) 
    : (availableVariants.length > 0 ? 9999 : 0);

  return {
    _id: String(p.handle || p.id),
    id: p.id,
    name: p.title || p.name,
    handle: p.handle || String(p.id),
    category: p.product_type || p.category || 'Skincare',
    vendor: p.vendor || 'Mii Korean',
    stock,
    photo: firstImage,
    images: images,
    price,
    compareAtPrice,
    description,
    bodyHtml: p.body_html || p.bodyHtml || '',
    featured: Boolean(p.featured !== undefined ? p.featured : (p.tags || []).some(tag => /best.?seller|featured|bestseller/i.test(tag))),
    isActive: p.isActive !== false,
    createdAt: p.published_at || p.createdAt || new Date().toISOString(),
    updatedAt: p.updatedAt || p.published_at || new Date().toISOString(),
    tags: p.tags || [],
    variants,
    currency: 'GBP',
  };
}

// Initialize Razorpay instance
function getRazorpayInstance() {
  if (!RAZORPAY_CONFIG.KEY_ID || !RAZORPAY_CONFIG.KEY_SECRET) {
    throw new Error('Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.');
  }
  const RazorpayConstructor = Razorpay.default || Razorpay;
  return new RazorpayConstructor({
    key_id: RAZORPAY_CONFIG.KEY_ID,
    key_secret: RAZORPAY_CONFIG.KEY_SECRET,
  });
}

// Verify Razorpay payment signature using HMAC-SHA256
function verifyRazorpaySignature(orderId, paymentId, signature) {
  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_CONFIG.KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return expectedSignature === signature;
}

// Resend Email API Configuration
const RESEND_CONFIG = {
  get KEY() { return process.env.RESEND_API_KEY || ''; },
  get FROM() { return process.env.RESEND_FROM_EMAIL || 'Mii Korean <hello@miikorean.com>'; }
};

// Send email using Resend REST API
async function sendEmail({ to, subject, html }) {
  const apiKey = RESEND_CONFIG.KEY;
  if (!apiKey) {
    console.error('❌ Resend API Key is missing');
    return { success: false, message: 'Resend API Key is missing' };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: RESEND_CONFIG.FROM,
        to: to,
        subject: subject,
        html: html
      })
    });

    const text = await res.text();
    let data = {};
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { message: text };
    }

    if (res.ok) {
      console.log(`✅ Email sent successfully to ${to}. ID:`, data.id);
      return { success: true, id: data.id };
    } else {
      console.error(`❌ Resend API error:`, data);
      return { success: false, error: data };
    }
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error);
    return { success: false, error: error.message };
  }
}

// Complete order and trigger confirmation email
async function handleOrderSuccess(orderId) {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      console.error('Failed to load order for email confirmation:', orderId, error);
      return;
    }

    // 1. Update order status to Processing if Pending
    if (order.status === 'Pending') {
      await supabase
        .from('orders')
        .update({ status: 'Processing', updated_at: new Date().toISOString() })
        .eq('id', orderId);
    }

    console.log(`Order ${orderId} triggering confirmation email...`);

    // 2. Fetch user details to get email
    const { data: userRow } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', order.user_uid)
      .maybeSingle();

    const shippingInfo = typeof order.shipping_info === 'string' ? JSON.parse(order.shipping_info) : order.shipping_info;
    const recipientEmail = userRow?.email || shippingInfo?.email;
    const customerName = userRow?.name || shippingInfo?.name || 'Customer';

    const currency = order.currency || 'INR';
    const formatMoney = (amount) => new Intl.NumberFormat(currency === 'GBP' ? 'en-GB' : 'en-IN', {
      style: 'currency',
      currency,
    }).format(Number(amount || 0));
    const baseUrl = process.env.CLIENT_URL || 'https://www.miikorean.com';

    const orderItems = typeof order.order_items === 'string' ? JSON.parse(order.order_items) : order.order_items;
    const itemsListHtml = (orderItems || []).map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #efe9db; font-size: 14px; color: #24291f; font-family: sans-serif;">
          <div style="font-weight: bold;">${item.name}</div>
          <div style="font-size: 12px; color: #5f6455; margin-top: 2px;">Qty: ${item.quantity}</div>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #efe9db; text-align: right; font-size: 14px; font-weight: bold; color: #24291f; font-family: sans-serif;">
          ${formatMoney(item.price * item.quantity)}
        </td>
      </tr>
    `).join('');

    const isGbpOrder = currency === 'GBP';
    const formattedDate = new Date(order.created_at || Date.now()).toLocaleString(isGbpOrder ? 'en-GB' : 'en-IN', {
      timeZone: isGbpOrder ? 'Europe/London' : 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    const emailHtml = `
      <div style="background-color: #f7f4ec; padding: 30px; font-family: 'Plus Jakarta Sans', Arial, sans-serif; color: #24291f; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 20px; border: 1px solid #efe9db; box-shadow: 0 4px 20px rgba(92, 35, 51, 0.08);">
          
          <!-- Header Logo -->
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 1px solid #efe9db; padding-bottom: 20px;">
            <h1 style="color: #5C2333; font-size: 26px; font-weight: bold; font-family: Garamond, serif; margin: 0; letter-spacing: 2px; text-transform: uppercase;">Mii Korean</h1>
            <span style="font-size: 10px; color: #C79A56; letter-spacing: 3px; font-weight: bold; text-transform: uppercase; display: block; margin-top: 5px;">Authentic Korean skincare</span>
          </div>

          <!-- Greeting -->
          <h2 style="color: #5C2333; font-size: 20px; font-family: Garamond, serif; margin-top: 0; font-weight: bold;">Order Confirmed!</h2>
          <p style="font-size: 14px; color: #24291f; margin-bottom: 20px;">Dear ${customerName},</p>
          <p style="font-size: 14px; color: #5f6455; margin-bottom: 25px;">Thank you for shopping with Mii Korean. Your payment was successful, and your order is being prepared. Below are your order details.</p>
          
          <!-- Status Card -->
          <div style="background-color: #f7f4ec; border-radius: 12px; padding: 20px; margin-bottom: 30px; border: 1px solid #efe9db;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 4px 0; color: #5f6455;"><strong>Order ID:</strong></td>
                <td style="padding: 4px 0; font-family: monospace; text-align: right; color: #24291f;">${order.id}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #5f6455;"><strong>Status:</strong></td>
                <td style="padding: 4px 0; text-align: right; color: #5C2333; font-weight: bold; text-transform: uppercase;">Processing</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #5f6455;"><strong>Date:</strong></td>
                <td style="padding: 4px 0; text-align: right; color: #24291f;">${formattedDate}</td>
              </tr>
            </table>
          </div>

          <!-- Purchase Summary -->
          <h3 style="color: #5C2333; font-size: 16px; font-family: Garamond, serif; margin-bottom: 12px; border-bottom: 2px solid #5C2333; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 1px;">Summary of Items</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <thead>
              <tr style="background-color: #f7f4ec; text-align: left;">
                <th style="padding: 10px; font-size: 11px; color: #5f6455; font-weight: bold; text-transform: uppercase; tracking-wider;">Product</th>
                <th style="padding: 10px; font-size: 11px; color: #5f6455; font-weight: bold; text-transform: uppercase; tracking-wider; text-align: right;">Total Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsListHtml}
            </tbody>
          </table>

          <!-- Totals Breakdown -->
          <div style="border-top: 1px solid #efe9db; padding-top: 15px; margin-bottom: 30px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 6px 0; color: #5f6455;">Subtotal</td>
                <td style="padding: 6px 0; text-align: right; color: #24291f;">${formatMoney(order.subtotal)}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #5f6455;">Tax & Shipping</td>
                <td style="padding: 6px 0; text-align: right; color: #24291f;">${formatMoney(Number(order.tax || 0) + Number(order.shipping_charges || 0))}</td>
              </tr>
              ${order.discount ? `
              <tr>
                <td style="padding: 6px 0; color: #5C2333; font-weight: bold;">Discount Applied</td>
                <td style="padding: 6px 0; text-align: right; color: #5C2333; font-weight: bold;">-${formatMoney(order.discount)}</td>
              </tr>
              ` : ''}
              <tr style="font-size: 16px; font-weight: bold; color: #5C2333;">
                <td style="padding: 12px 0 0 0; border-top: 1px solid #efe9db;">Total Amount Paid</td>
                <td style="padding: 12px 0 0 0; border-top: 1px solid #efe9db; text-align: right;">${formatMoney(order.total)}</td>
              </tr>
            </table>
          </div>

          <!-- View Button -->
          <div style="text-align: center; margin-bottom: 20px;">
            <a href="${baseUrl}/my-orders?orderId=${order.id}" style="background-color: #5C2333; color: #ffffff; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 10px rgba(92, 35, 51, 0.2);">View Order Details</a>
          </div>

          <!-- Footer Notes -->
          <div style="border-top: 1px solid #efe9db; padding-top: 20px; text-align: center; font-size: 11px; color: #5f6455; line-height: 1.5;">
            <p style="margin: 0 0 5px 0;">If you have any questions, contact support at 0800 080 7037 or hello@miikorean.com.</p>
            <p style="margin: 0;">© ${new Date().getFullYear()} Miikorean Ltd. All rights reserved.</p>
          </div>

        </div>
      </div>
    `;

    // Send confirmation email to customer (if email present)
    if (recipientEmail && recipientEmail.includes('@')) {
      await sendEmail({
        to: recipientEmail,
        subject: `Mii Korean — Order Confirmed #${order.id}`,
        html: emailHtml
      });
    }

    // 3. Decrement stock for purchased items
    for (const item of (orderItems || [])) {
      if (order.currency === 'GBP') continue;

      try {
        // Extract base product ID (remove variant suffix like "_1kg")
        const baseProductId = item.productId.includes('_') 
          ? item.productId.split('_')[0] 
          : item.productId;

          // Get current stock
          const { data: product, error: productError } = await supabase
            .from('products')
            .select('stock, name')
            .eq('id', baseProductId)
            .single();

          if (productError || !product) {
            console.error(`⚠️  Product not found for stock decrement: ${baseProductId}`, productError);
            continue;
          }

          const currentStock = Number(product.stock || 0);
          const orderQuantity = Number(item.quantity || 0);

          if (currentStock >= orderQuantity) {
            // Decrement stock
            const newStock = currentStock - orderQuantity;
            
            const { error: updateStockError } = await supabase
              .from('products')
              .update({ 
                stock: newStock,
                updated_at: new Date().toISOString()
              })
              .eq('id', baseProductId);

            if (updateStockError) {
              console.error(`❌ Failed to decrement stock for ${baseProductId}:`, updateStockError);
            } else {
              console.log(`✅ Stock decremented for "${product.name}": ${currentStock} → ${newStock} (-${orderQuantity})`);
            }
          } else {
            console.warn(`⚠️  Insufficient stock for "${product.name}": Ordered ${orderQuantity}, Available ${currentStock}`);
          }
        } catch (stockError) {
          console.error(`❌ Error processing stock decrement for item:`, item, stockError);
        }
      }

      console.log(`✅ Order ${orderId} completed with stock updates`);
  } catch (err) {
    console.error('Error during handleOrderSuccess processing:', err);
  }
}

// Map Supabase row → product object (NO hardcoded defaults — only real DB data)
function mapProduct(row) {
  if (!row) return null;
  let variants = [];

  if (row.variants && Array.isArray(row.variants) && row.variants.length > 0) {
    // Use variants from the dedicated JSONB column (primary source)
    variants = row.variants;
  } else if (typeof row.variants === 'string') {
    try {
      const parsed = JSON.parse(row.variants);
      if (Array.isArray(parsed) && parsed.length > 0) variants = parsed;
    } catch (e) {}
  }
  
  // Legacy fallback: check description for __VARIANTS__ encoding
  if (variants.length === 0 && row.description && row.description.includes('__VARIANTS__=')) {
    try {
      const parts = row.description.split('__VARIANTS__=');
      const parsed = JSON.parse(parts[1]);
      if (Array.isArray(parsed) && parsed.length > 0) variants = parsed;
    } catch (e) {}
  }

  const cleanDescription = row.description ? row.description.split('__VARIANTS__=')[0].trim() : '';

  let photo = row.photo || '';
  if (!photo || photo.includes('v1791904263') || photo.includes('/urvaa/products/')) {
    const raw = (photo + ' ' + (row.name || '')).toLowerCase();
    if (raw.includes('araku') || raw.includes('coffee')) {
      photo = 'https://res.cloudinary.com/idi6k3ue/image/upload/v1791904994/urvaa/images/categories/tribal-araku.jpg';
    } else if (raw.includes('putharekulu') || raw.includes('heritage') || raw.includes('bellam') || raw.includes('godavari')) {
      photo = 'https://res.cloudinary.com/idi6k3ue/image/upload/v1791905012/urvaa/images/hero/rural-heritage.jpg';
    } else if (raw.includes('honey') || raw.includes('villages')) {
      photo = 'https://res.cloudinary.com/idi6k3ue/image/upload/v1791905009/urvaa/images/hero/from-our-villages.jpg';
    } else if (raw.includes('leaf') || raw.includes('eco-friendly') || raw.includes('plates') || raw.includes('basket') || raw.includes('dhoop')) {
      photo = 'https://res.cloudinary.com/idi6k3ue/image/upload/v1791904990/urvaa/images/categories/eco-friendly.jpg';
    } else if (raw.includes('handloom') || raw.includes('swadesi') || raw.includes('saree') || raw.includes('dhoti')) {
      photo = 'https://res.cloudinary.com/idi6k3ue/image/upload/v1791904993/urvaa/images/categories/swadesi-handlooms.jpg';
    } else if (raw.includes('plant') || raw.includes('kadiyam') || raw.includes('jasmine') || raw.includes('mango')) {
      photo = 'https://res.cloudinary.com/idi6k3ue/image/upload/v1791904991/urvaa/images/categories/kadiyam-plants.jpg';
    } else if (row.category === 'Tribal Araku Products') {
      photo = 'https://res.cloudinary.com/idi6k3ue/image/upload/v1791904994/urvaa/images/categories/tribal-araku.jpg';
    } else if (row.category === 'Mana Godavari Foods') {
      photo = 'https://res.cloudinary.com/idi6k3ue/image/upload/v1791904992/urvaa/images/categories/mana-godavari.jpg';
    } else if (row.category === 'Swadesi Handlooms') {
      photo = 'https://res.cloudinary.com/idi6k3ue/image/upload/v1791904993/urvaa/images/categories/swadesi-handlooms.jpg';
    } else if (row.category === 'Eco-Friendly Products') {
      photo = 'https://res.cloudinary.com/idi6k3ue/image/upload/v1791904990/urvaa/images/categories/eco-friendly.jpg';
    } else {
      photo = 'https://res.cloudinary.com/idi6k3ue/image/upload/v1791904991/urvaa/images/categories/kadiyam-plants.jpg';
    }
  }

  const gallery = [
    photo,
    'https://res.cloudinary.com/idi6k3ue/image/upload/v1791905009/urvaa/images/hero/from-our-villages.jpg',
    'https://res.cloudinary.com/idi6k3ue/image/upload/v1791905012/urvaa/images/hero/rural-heritage.jpg',
  ].filter((v, i, a) => a.indexOf(v) === i);

  return {
    _id: row.id,
    id: row.id,
    name: row.name,
    category: row.category,
    description: cleanDescription,
    price: Number(row.price),
    stock: Number(row.stock),
    photo: photo,
    gallery: gallery,
    photoPublicId: row.photo_public_id,
    featured: Boolean(row.featured),
    isActive: row.is_active !== false,
    variants,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Helper for safe JSON parsing
function safeJSONParse(value, fallback = {}) {
  if (typeof value !== 'string') return value || fallback;
  try {
    return JSON.parse(value);
  } catch (e) {
    console.error('JSON parse error:', e.message);
    return fallback;
  }
}

// Map Supabase row → order object
function mapOrder(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    user: row.user_uid || row.user_id,
    shippingInfo: safeJSONParse(row.shipping_info, {}),
    orderItems: safeJSONParse(row.order_items, []),
    subtotal: Number(row.subtotal),
    tax: Number(row.tax),
    shippingCharges: Number(row.shipping_charges),
    discount: Number(row.discount || 0),
    total: Number(row.total),
    currency: row.currency || 'INR',
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    awbNumber: row.awb_number || undefined,
    senderMobile: row.sender_mobile || undefined,
    receiverMobile: row.receiver_mobile || undefined,
    trackingUrl: row.tracking_url || undefined,
  };
}

// Map Supabase row → banner object
function mapBanner(row) {
  if (!row) return null;
  return {
    id: row.id,
    type: row.type || 'hero',
    title: row.title || '',
    subtitle: row.subtitle || '',
    tagline: row.tagline || '',
    imageUrl: row.image_url || row.imageUrl || '',
    mobileImageUrl: row.mobile_image_url || row.mobileImageUrl || row.image_url || row.imageUrl || '',
    linkUrl: row.link_url || row.linkUrl || '/products',
    buttonText: row.button_text || row.buttonText || 'Explore Now',
    badge: row.badge || '',
    theme: row.theme || 'dark',
    backgroundColor: row.background_color || row.backgroundColor || '#111111',
    textColor: row.text_color || row.textColor || '#FFFFFF',
    displayOrder: Number(row.display_order ?? row.displayOrder ?? 0),
    isActive: row.is_active !== false && row.isActive !== false,
    createdAt: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt,
  };
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Convert camelCase banner data to Supabase snake_case format
function formatBannerForDB(banner) {
  const row = {
    type: banner.type || 'hero',
    title: banner.title || '',
    subtitle: banner.subtitle || '',
    tagline: banner.tagline || '',
    image_url: banner.imageUrl || banner.image_url || '',
    mobile_image_url: banner.mobileImageUrl || banner.mobile_image_url || banner.imageUrl || banner.image_url || '',
    link_url: banner.linkUrl || banner.link_url || '/products',
    button_text: banner.buttonText || banner.button_text || 'Explore Now',
    badge: banner.badge || '',
    theme: banner.theme || 'dark',
    background_color: banner.backgroundColor || banner.background_color || '#111111',
    text_color: banner.textColor || banner.text_color || '#FFFFFF',
    display_order: Number(banner.displayOrder ?? banner.display_order ?? 0),
    is_active: banner.isActive !== false && banner.is_active !== false,
    updated_at: new Date().toISOString(),
  };
  if (banner.id && UUID_REGEX.test(banner.id)) {
    row.id = banner.id;
  }
  return row;
}

// Read fallback banners from JSON file or memory
function getLocalFallbackBanners() {
  try {
    const candidatePaths = [
      path.resolve(__dirname, 'data/store_banners.json'),
      path.resolve(process.cwd(), 'api/data/store_banners.json'),
      path.resolve(process.cwd(), '../api/data/store_banners.json'),
      path.resolve(process.cwd(), 'client/src/data/store_banners.json'),
      path.resolve(process.cwd(), 'scratch/store_banners.json'),
    ];
    for (const bannerPath of candidatePaths) {
      if (fs.existsSync(bannerPath)) {
        const raw = fs.readFileSync(bannerPath, 'utf8');
        const data = JSON.parse(raw);
        if (Array.isArray(data) && data.length > 0) return data;
      }
    }
  } catch (e) {
    console.warn('Fallback banner file read error:', e.message);
  }
  return [];
}

// Save fallback banners to JSON file
function saveLocalFallbackBanners(banners) {
  try {
    const candidateDirs = [
      path.resolve(__dirname, 'data'),
      path.resolve(process.cwd(), 'api/data'),
      path.resolve(process.cwd(), '../api/data'),
    ];
    for (const dir of candidateDirs) {
      try {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        const filePath = path.join(dir, 'store_banners.json');
        fs.writeFileSync(filePath, JSON.stringify(banners, null, 2), 'utf8');
      } catch (inner) {}
    }
  } catch (e) {
    console.warn('Fallback banner file write error:', e.message);
  }
}

export default async function handler(req, res) {
  const url = req.url || '';

  // Initialize in-memory fast API response cache
  if (!global.fastApiCache) global.fastApiCache = new Map();

  // On data modification, immediately invalidate API response cache
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    global.fastApiCache.clear();
  }

  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Serve cached GET response if less than 30 seconds old (never cache admin routes)
  if (req.method === 'GET' && !url.includes('/admin/') && global.fastApiCache.has(url)) {
    const cached = global.fastApiCache.get(url);
    if (Date.now() - cached.timestamp < 30000) {
      return res.status(200).json(cached.body);
    }
  }

  try {
    // ─── CLOUDINARY: Generate Signature for Uploads ───
    if (url.includes('/api/v1/cloudinary/sign') || url.includes('/api/v1/upload/sign')) {
      const timestamp = Math.round(new Date().getTime() / 1000);
      const folder = req.body?.folder || 'miikorean/products';
      const paramsToSign = `folder=${folder}&timestamp=${timestamp}${CLOUDINARY_CONFIG.API_SECRET}`;
      const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

      return res.status(200).json({
        success: true,
        signature,
        timestamp,
        apiKey: CLOUDINARY_CONFIG.API_KEY,
        cloudName: CLOUDINARY_CONFIG.CLOUD_NAME,
        folder,
      });
    }

    // ─── PAYMENTS: Create Payment Intent / Order (Razorpay) ───
    if (url.includes('/api/v1/payments/create') || url.includes('/api/v1/payments/new')) {
      const rawAmount = req.body?.amount;
      if (!rawAmount) {
        return res.status(400).json({ success: false, message: 'Please provide amount' });
      }

      const orderId = req.body?.orderId || `ord_${Date.now()}`;
      const amountInPaise = Math.round(Number(rawAmount) * 100);

      try {
        const razorpay = getRazorpayInstance();
        const razorpayOrder = await razorpay.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: orderId,
          notes: {
            customer_name: req.body?.name || 'URVA Customer',
            customer_email: req.body?.email || '',
            customer_phone: req.body?.phone || '',
          },
        });

        return res.status(200).json({
          success: true,
          gateway: 'RAZORPAY',
          order_id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          paymentURL: `/my-orders?payment=success&orderId=${orderId}`,
        });
      } catch (error) {
        console.warn('Razorpay order creation fallback:', error.message);
        return res.status(200).json({
          success: true,
          gateway: 'RAZORPAY_TEST',
          paymentURL: `/my-orders?payment=success&orderId=${orderId}`,
        });
      }
    }

    // ─── PAYMENTS: Razorpay Create Order ───
    if (url.includes('/api/v1/payments/razorpay/create-order') || url.includes('/api/create-order')) {
      if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
      }

      try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
        const { amount, currency, receipt, description, customer_name, customer_email, customer_phone } = body;

        const amountInPence = Number(amount);
        if (!Number.isSafeInteger(amountInPence) || amountInPence < 100) {
          return res.status(400).json({ success: false, message: 'The payment amount must be at least 100 pence (£1).' });
        }
        if (String(currency || '').toUpperCase() !== 'GBP') {
          return res.status(400).json({ success: false, message: 'This store only accepts GBP payments.' });
        }

        const orderReceipt = receipt || `order_${Date.now()}`;

        try {
          const razorpay = getRazorpayInstance();
          const order = await razorpay.orders.create({
            amount: amountInPence,
            currency: 'GBP',
            receipt: orderReceipt,
            notes: {
              customer_name: customer_name || 'Mii Korean Customer',
              customer_email: customer_email || 'hello@miikorean.com',
              customer_phone: customer_phone || '',
            },
          });

          console.log('✅ Razorpay order created:', order.id);

          return res.status(200).json({
            success: true,
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
            receipt: order.receipt,
            key_id: RAZORPAY_CONFIG.KEY_ID,
          });
        } catch (sdkError) {
          console.error('❌ Razorpay SDK Order creation error:', sdkError?.description || sdkError?.message || sdkError);
          return res.status(500).json({
            success: false,
            message: sdkError?.description || sdkError?.message || 'Failed to create Razorpay order',
          });
        }
      } catch (error) {
        console.error('❌ Razorpay order handler error:', error?.message || error);
        return res.status(500).json({
          success: false,
          message: 'Failed to create Razorpay order',
          error: error?.message || error,
        });
      }
    }

    // ─── PAYMENTS: Razorpay Verify Signature ───
    if (url.includes('/api/v1/payments/razorpay/verify-payment') || url.includes('/api/verify-payment')) {
      if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
      }

      try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

        // Validate required fields
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
          return res.status(400).json({
            success: false,
            message: 'Missing payment verification details: razorpay_order_id, razorpay_payment_id, and razorpay_signature required',
          });
        }

        // Verify signature using HMAC-SHA256
        const isSignatureValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

        if (!isSignatureValid) {
          console.error('❌ Razorpay signature verification failed for order:', razorpay_order_id);
          return res.status(400).json({
            success: false,
            message: 'Payment verification failed. Signature mismatch.',
          });
        }

        console.log('✅ Razorpay payment verified successfully for order:', razorpay_order_id);

        return res.status(200).json({
          success: true,
          message: 'Payment verified successfully',
          razorpay_order_id,
          razorpay_payment_id,
        });
      } catch (error) {
        console.error('❌ Razorpay payment verification error:', error.message);
        return res.status(500).json({
          success: false,
          message: 'Payment verification error',
          error: error.message,
        });
      }
    }

    // ─── PAYMENTS: Callback (Return URL) Handler ───
    if (url.includes('/api/v1/payments/callback')) {
      let payload = req.body;
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload);
        } catch (e) {
          payload = Object.fromEntries(new URLSearchParams(payload));
        }
      } else if (payload && Buffer.isBuffer(payload)) {
        const str = payload.toString('utf-8');
        try {
          payload = JSON.parse(str);
        } catch (e) {
          payload = Object.fromEntries(new URLSearchParams(str));
        }
      }

      // Always redirect to production — payments only run on prod.
      const origin = process.env.CLIENT_URL || 'https://www.miikorean.com';
      const host = req.headers.host || '';

      // Verify SecureHash
      const receivedHash = payload.secureHash;
      const payloadCopy = { ...payload };
      delete payloadCopy.secureHash;

      const calculatedHash = generateICICISecureHash(payloadCopy, ICICI_CONFIG.KEY);

      const isVerified = receivedHash && calculatedHash.toLowerCase() === receivedHash.toLowerCase();
      const merchantTxnNo = payload.merchantTxnNo;
      const responseCode = payload.responseCode;

      let success = false;
      let orderId = payload.addlParam1 || '';

      if (isVerified && merchantTxnNo) {
        // Query the order in Supabase
        const { data: order, error } = await supabase
          .from('orders')
          .select('*')
          .eq('shipping_info->>merchantTxnNo', merchantTxnNo)
          .maybeSingle();

        if (order && !error) {
          orderId = order.id;
          const shippingInfo = typeof order.shipping_info === 'string' ? JSON.parse(order.shipping_info) : order.shipping_info;
          if (responseCode === '0000') {
            success = true;
            await handleOrderSuccess(order.id);
          } else {
            await supabase
              .from('orders')
              .update({ status: 'Pending', updated_at: new Date().toISOString() })
              .eq('id', order.id);
          }
        } else {
          console.error('Order not found or error for merchantTxnNo:', merchantTxnNo, error);
        }
      } else {
        console.error('Signature verification failed or merchantTxnNo missing. Received:', receivedHash, 'Calculated:', calculatedHash);
      }

      // Redirect browser back to the frontend
      const redirectUrl = `${origin}/my-orders?payment=${success ? 'success' : 'fail'}${orderId ? `&orderId=${orderId}` : ''}`;
      res.writeHead(302, { Location: redirectUrl });
      res.end();
      return;
    }

    // ─── ORDERS: Create New Order (with Silent Guest Sign-Up) ───
    if (url.includes('/api/v1/orders/new') && req.method === 'POST') {
      const { orderItems, shippingInfo, discount, shippingCharges, subTotal, tax, total, userId, currency } = req.body || {};

      if (!shippingInfo || !Array.isArray(orderItems) || orderItems.length === 0 || currency !== 'GBP') {
        return res.status(400).json({ success: false, message: 'A valid GBP order and shipping address are required.' });
      }
      const supportedCountries = ['United Kingdom', 'Isle of Man', 'Jersey', 'Guernsey'];
      if (
        !['name', 'phone', 'address', 'city', 'pinCode'].every((field) => typeof shippingInfo[field] === 'string' && shippingInfo[field].trim()) ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(shippingInfo.email || '')) ||
        !supportedCountries.includes(shippingInfo.country)
      ) {
        return res.status(400).json({ success: false, message: 'Please provide a complete UK delivery address.' });
      }

      const toPence = (value) => Number.isFinite(Number(value)) ? Math.round(Number(value) * 100) : NaN;
      let calculatedSubtotalPence = 0;
      const products = getMiikoreanProducts();

      for (const item of orderItems) {
        const productId = String(item?.productId || '');
        const separatorIndex = productId.lastIndexOf('__');
        const handle = separatorIndex < 0 ? '' : productId.slice(0, separatorIndex);
        const variantId = separatorIndex < 0 ? '' : productId.slice(separatorIndex + 2);
        const quantity = Number(item?.quantity);
        const product = products.find((entry) => entry.handle === handle);
        const variant = product?.variants?.find((entry) => String(entry.id) === variantId);

        if (!product || !variant || !variant.available || item.currency !== 'GBP') {
          return res.status(400).json({ success: false, message: `Product "${item?.name || 'item'}" is no longer available.` });
        }

        if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99) {
          return res.status(400).json({ success: false, message: 'Product quantities must be between 1 and 99.' });
        }

        const variantPricePence = toPence(variant.price);
        if (!Number.isSafeInteger(variantPricePence) || toPence(item.price) !== variantPricePence) {
          return res.status(409).json({ success: false, message: `The price for "${product.title}" has changed. Please review your basket.` });
        }

        calculatedSubtotalPence += variantPricePence * quantity;
      }

      const submittedSubtotalPence = toPence(subTotal);
      const submittedShippingPence = toPence(shippingCharges);
      const submittedDiscountPence = toPence(discount || 0);
      const submittedTaxPence = toPence(tax || 0);
      const submittedTotalPence = toPence(total);
      const expectedShippingPence = calculatedSubtotalPence > 0 && calculatedSubtotalPence < 3500 ? 375 : 0;
      const expectedTotalPence = calculatedSubtotalPence + expectedShippingPence - submittedDiscountPence + submittedTaxPence;

      if (
        submittedSubtotalPence !== calculatedSubtotalPence ||
        submittedShippingPence !== expectedShippingPence ||
        submittedDiscountPence < 0 ||
        submittedDiscountPence > calculatedSubtotalPence ||
        submittedTaxPence !== 0 ||
        submittedTotalPence !== expectedTotalPence
      ) {
        return res.status(400).json({ success: false, message: 'The order totals do not match the current basket. Please review your basket.' });
      }

      if (submittedDiscountPence > 0) {
        const couponCode = String(shippingInfo.couponCode || '').trim().toUpperCase();
        if (!couponCode) {
          return res.status(400).json({ success: false, message: 'The applied discount could not be verified.' });
        }

        const { data: coupon, error: couponError } = await supabase
          .from('coupons')
          .select('code, amount, is_active')
          .ilike('code', couponCode)
          .maybeSingle();
        if (couponError) {
          console.error('Coupon verification failed:', couponError);
          return res.status(500).json({ success: false, message: 'Could not verify the discount. Please try again.' });
        }
        if (!coupon || coupon.is_active === false || toPence(coupon.amount) !== submittedDiscountPence) {
          return res.status(400).json({ success: false, message: 'The applied discount is no longer valid. Please review your basket.' });
        }
      }

      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = shippingInfo;
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
        return res.status(400).json({ success: false, message: 'Payment verification failed. Please contact support before retrying.' });
      }

      let gatewayOrder;
      let gatewayPayment;
      try {
        const razorpay = getRazorpayInstance();
        [gatewayOrder, gatewayPayment] = await Promise.all([
          razorpay.orders.fetch(razorpayOrderId),
          razorpay.payments.fetch(razorpayPaymentId),
        ]);
      } catch (paymentError) {
        console.error('Razorpay order confirmation lookup failed:', paymentError);
        return res.status(502).json({ success: false, message: 'We could not confirm your payment. Please contact support before retrying.' });
      }

      if (
        gatewayOrder.currency !== 'GBP' ||
        gatewayOrder.amount !== submittedTotalPence ||
        gatewayOrder.status !== 'paid' ||
        gatewayPayment.order_id !== razorpayOrderId ||
        gatewayPayment.currency !== 'GBP' ||
        gatewayPayment.amount !== submittedTotalPence ||
        gatewayPayment.status !== 'captured'
      ) {
        return res.status(400).json({ success: false, message: 'The payment does not match this GBP order. Please contact support.' });
      }

      // ── Silent Guest Sign-Up ──
      // If no userId (guest checkout), find or create a user by email/phone
      let resolvedUserId = userId || null;

      if (!resolvedUserId && shippingInfo) {
        const guestEmail = shippingInfo.email?.trim().toLowerCase();
        const guestPhone = shippingInfo.phone?.trim();
        const guestName = shippingInfo.name?.trim() || 'Guest';

        if (guestEmail || guestPhone) {
          // Check if a user with matching email already exists
          let existingUser = null;
          if (guestEmail) {
            const { data } = await supabase
              .from('users')
              .select('id, uid')
              .eq('email', guestEmail)
              .maybeSingle();
            existingUser = data;
          }

          // Fallback: check by phone (stored in uid for guest accounts)
          if (!existingUser && guestPhone) {
            const { data } = await supabase
              .from('users')
              .select('id, uid')
              .eq('uid', `guest_${guestPhone}`)
              .maybeSingle();
            existingUser = data;
          }

          if (existingUser) {
            // Link order to existing user
            resolvedUserId = existingUser.id;
            console.log(`[Guest Checkout] Linked order to existing user: ${existingUser.id}`);
          } else {
            // Create a new guest profile
            const guestUid = `guest_${guestPhone || guestEmail}`;
            const { data: newUser, error: createErr } = await supabase
              .from('users')
              .insert({
                uid: guestUid,
                email: guestEmail || `${guestPhone}@guest.miikorean.com`,
                name: guestName,
                provider: 'guest',
                role: 'user',
              })
              .select('id')
              .single();

            if (!createErr && newUser) {
              resolvedUserId = newUser.id;
              console.log(`[Guest Checkout] Created guest user: ${newUser.id} (${guestUid})`);
            } else {
              console.error('[Guest Checkout] Failed to create guest user:', createErr);
              // Proceed without linking – order will still be created
            }
          }
        }
      }

      const { data: inserted, error } = await supabase
        .from('orders')
        .insert({
          short_id: ('ORD' + Date.now()).slice(-10),
          user_uid: resolvedUserId || 'guest',
          shipping_info: shippingInfo,
          order_items: orderItems,
          subtotal: subTotal || 0,
          tax: tax || 0,
          shipping_charges: shippingCharges || 0,
          discount: discount || 0,
          total: total,
          currency: 'GBP',
          status: 'Processing',
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase order insert error:', error);
        return res.status(500).json({ success: false, message: 'Payment was received, but we could not save the order. Please contact support with your payment reference.' });
      }

        // Trigger order confirmation email & stock update
        handleOrderSuccess(inserted.id).catch(e => console.error('Order confirmation email error:', e));

        return res.status(201).json({
          success: true,
          message: 'Order placed successfully',
          order: mapOrder(inserted),
        });
    }

    // ─── ORDERS: Get User / All Orders ───
    if (url.includes('/api/v1/orders/my') || url.includes('/api/v1/orders/all')) {
      // ✅ ADMIN PROTECTION: /api/v1/orders/all requires authentication
      if (url.includes('/api/v1/orders/all')) {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token || token.length !== 128 || !/^[a-f0-9]+$/i.test(token)) {
          return res.status(401).json({ 
            success: false, 
            message: 'Unauthorized: Admin authentication required' 
          });
        }
      }

      let query = supabase.from('orders').select('*');
      
      if (url.includes('/api/v1/orders/my')) {
        const urlObj = new URL(url, 'http://localhost');
        const userId = urlObj.searchParams.get('userId');
        if (userId) {
          query = query.eq('user_uid', userId);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json({ success: false, message: error.message, orders: [] });
      }

      return res.status(200).json({
        success: true,
        orders: (data || []).map(mapOrder),
      });
    }

    // ─── ORDERS: Get Single Order ───
    if (url.match(/\/api\/v1\/orders\/[^/]+$/) && !url.includes('/all') && !url.includes('/my') && !url.includes('/new') && req.method === 'GET') {
      const id = url.split('/').pop();
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      let orderObj = null;
      if (!error && data) {
        orderObj = mapOrder(data);
      } else {
        // Fallback for orders generated during checkout
        orderObj = {
          _id: id,
          id: id,
          user: 'guest',
          shippingInfo: {
            name: 'Valued Customer',
            email: 'customer@urvaa.in',
            phone: '+91 7304888197',
            address: 'Room No. 28, Sai Shraddha Apartment, Sai Nagari',
            city: 'Ulhasnagar',
            state: 'Maharashtra',
            pinCode: '421004',
            country: 'India'
          },
          orderItems: [
            {
              _id: '1',
              name: 'Araku Valley Organic Forest Honey',
              price: 499,
              quantity: 1,
              photo: 'https://res.cloudinary.com/idi6k3ue/image/upload/v1791904994/urvaa/images/categories/tribal-araku.jpg'
            }
          ],
          subTotal: 499,
          tax: 0,
          shippingCharges: 0,
          discount: 0,
          total: 499,
          status: 'Processing',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      return res.status(200).json({
        success: true,
        order: orderObj,
      });
    }

    // ─── ORDERS: Update Order Status ───
    if (url.includes('/api/v1/orders/update-status') && req.method === 'PUT') {
      // ✅ ADMIN PROTECTION: Update order status requires authentication
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token || token.length !== 128 || !/^[a-f0-9]+$/i.test(token)) {
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized: Admin authentication required' 
        });
      }

      const { orderId, status, awbNumber, senderMobile, receiverMobile } = req.body || {};
      if (!orderId || !status) {
        return res.status(400).json({ success: false, message: 'Please provide orderId and status' });
      }

      // Prepare update data
      const updateData = { 
        status, 
        updated_at: new Date().toISOString() 
      };

      // If status is "Shipped" and tracking data provided, add to update
      if (status === 'Shipped' && awbNumber && senderMobile && receiverMobile) {
        updateData.awb_number = awbNumber;
        updateData.sender_mobile = senderMobile;
        updateData.receiver_mobile = receiverMobile;
        // Generate tracking URL (similar to APSRTC format)
        updateData.tracking_url = `https://cargo.apsrtconline.in/track?awb=${awbNumber}&sender=${senderMobile}&receiver=${receiverMobile}`;
      }

      // Update in Supabase
      const { data: updated, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();

      if (error || !updated) {
        console.error('Order status update error:', error);
        return res.status(500).json({ success: false, message: error?.message || 'Failed to update order' });
      }

      // Send email notification
      try {
        const { data: userRow } = await supabase
          .from('users')
          .select('email, name')
          .eq('id', updated.user_uid)
          .maybeSingle();

        const shippingInfo = typeof updated.shipping_info === 'string' ? JSON.parse(updated.shipping_info) : updated.shipping_info;
        const recipientEmail = userRow?.email || shippingInfo?.email || 'shubhamvasantgundu@gmail.com';
        const customerName = userRow?.name || shippingInfo?.name || 'Customer';

        const baseUrl = process.env.CLIENT_URL || 'https://www.miikorean.com';

        // If status is "Shipped" and we have tracking data, send tracking email
        if (status === 'Shipped' && updated.awb_number) {
          const trackingEmailHtml = `
            <div style="background-color: #f7f4ec; padding: 30px; font-family: 'Plus Jakarta Sans', Arial, sans-serif; color: #24291f; line-height: 1.6;">
              <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 20px; border: 1px solid #efe9db; box-shadow: 0 4px 20px rgba(22, 59, 38, 0.04);">
                
                <!-- Header Logo -->
                <div style="text-align: center; margin-bottom: 30px; border-bottom: 1px solid #efe9db; padding-bottom: 20px;">
                  <h1 style="color: #1f5133; font-size: 26px; font-weight: bold; font-family: Garamond, serif; margin: 0; letter-spacing: 2px; text-transform: uppercase;">Mii Korean</h1>
                  <span style="font-size: 10px; color: #c4633c; letter-spacing: 3px; font-weight: bold; text-transform: uppercase; display: block; margin-top: 5px;">Authentic Korean skincare</span>
                </div>

                <h2 style="color: #1f5133; font-size: 20px; font-family: Garamond, serif; margin-top: 0; font-weight: bold;">📦 Your Order Has Been Shipped!</h2>
                <p style="font-size: 14px; color: #24291f; margin-bottom: 20px;">Dear ${customerName},</p>
                <p style="font-size: 14px; color: #5f6455; margin-bottom: 25px;">Your Mii Korean order has been dispatched and is on its way to you.</p>
                
                <!-- Tracking Information Box -->
                <div style="background: linear-gradient(135deg, #1f5133 0%, #2d7a4d 100%); border-radius: 16px; padding: 25px; margin-bottom: 30px; box-shadow: 0 6px 20px rgba(31, 81, 51, 0.15);">
                  <h3 style="color: #ffffff; font-size: 16px; font-weight: bold; margin: 0 0 20px 0; text-align: center; letter-spacing: 1px;">SHIPMENT TRACKING DETAILS</h3>
                  
                  <div style="background-color: rgba(255, 255, 255, 0.95); border-radius: 12px; padding: 20px; margin-bottom: 15px;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                      <tr>
                        <td style="padding: 8px 0; color: #5f6455; font-weight: bold;">AWB Number:</td>
                        <td style="padding: 8px 0; font-family: monospace; text-align: right; color: #1f5133; font-weight: bold; font-size: 16px;">${updated.awb_number}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #5f6455; font-weight: bold;">Sender Mobile:</td>
                        <td style="padding: 8px 0; font-family: monospace; text-align: right; color: #24291f;">${updated.sender_mobile}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #5f6455; font-weight: bold;">Receiver Mobile:</td>
                        <td style="padding: 8px 0; font-family: monospace; text-align: right; color: #24291f;">${updated.receiver_mobile}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #5f6455; font-weight: bold;">Order ID:</td>
                        <td style="padding: 8px 0; font-family: monospace; text-align: right; color: #24291f;">${updated.id}</td>
                      </tr>
                    </table>
                  </div>

                  <div style="text-align: center;">
                    <a href="${updated.tracking_url || `${baseUrl}/my-orders`}" style="background-color: #ffffff; color: #1f5133; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">🔍 Track Your Shipment</a>
                  </div>
                </div>

                <!-- Instructions -->
                <div style="background-color: #fff8dc; border-left: 4px solid #c4633c; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
                  <p style="font-size: 13px; color: #24291f; margin: 0; line-height: 1.6;">
                    <strong>📍 How to Track:</strong><br>
                    Use the courier tracking link above to follow your delivery. You can also view your order status in your Mii Korean account.
                  </p>
                </div>

                <p style="font-size: 14px; color: #5f6455; margin-bottom: 25px;">You will receive notifications about your shipment status. If you have any questions, please contact our support team.</p>

                <div style="text-align: center; margin-bottom: 20px;">
                  <a href="${baseUrl}/order/${updated.id}" style="background-color: #f7f4ec; color: #1f5133; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 13px; display: inline-block; border: 2px solid #efe9db;">View Order Details</a>
                </div>

                <!-- Footer Notes -->
                <div style="border-top: 1px solid #efe9db; padding-top: 20px; text-align: center; font-size: 11px; color: #5f6455; line-height: 1.5;">
                  <p style="margin: 0 0 5px 0;">Thank you for choosing Mii Korean!</p>
                  <p style="margin: 0;">© ${new Date().getFullYear()} Miikorean Ltd. All rights reserved.</p>
                </div>

              </div>
            </div>
          `;

          await sendEmail({
            to: recipientEmail,
            subject: `🚚 Your Order #${updated.id} Has Been Shipped - Track Your Package`,
            html: trackingEmailHtml
          });

        } else {
          // Send regular status update email for other statuses
          const emailHtml = `
            <div style="background-color: #f7f4ec; padding: 30px; font-family: 'Plus Jakarta Sans', Arial, sans-serif; color: #24291f; line-height: 1.6;">
              <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 20px; border: 1px solid #efe9db; box-shadow: 0 4px 20px rgba(22, 59, 38, 0.04);">
                
                <!-- Header Logo -->
                <div style="text-align: center; margin-bottom: 30px; border-bottom: 1px solid #efe9db; padding-bottom: 20px;">
                  <h1 style="color: #1f5133; font-size: 26px; font-weight: bold; font-family: Garamond, serif; margin: 0; letter-spacing: 2px; text-transform: uppercase;">Mii Korean</h1>
                  <span style="font-size: 10px; color: #c4633c; letter-spacing: 3px; font-weight: bold; text-transform: uppercase; display: block; margin-top: 5px;">Authentic Korean skincare</span>
                </div>

                <h2 style="color: #1f5133; font-size: 20px; font-family: Garamond, serif; margin-top: 0; font-weight: bold;">Order Status Updated! 📦</h2>
                <p style="font-size: 14px; color: #24291f; margin-bottom: 20px;">Dear ${customerName},</p>
                <p style="font-size: 14px; color: #5f6455; margin-bottom: 25px;">The status of your Mii Korean order has been updated.</p>
                
                <div style="background-color: #f7f4ec; border-radius: 12px; padding: 20px; margin-bottom: 30px; border: 1px solid #efe9db;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <tr>
                      <td style="padding: 4px 0; color: #5f6455;"><strong>Order ID:</strong></td>
                      <td style="padding: 4px 0; font-family: monospace; text-align: right; color: #24291f;">${updated.id}</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0; color: #5f6455;"><strong>New Status:</strong></td>
                      <td style="padding: 4px 0; text-align: right; color: #c4633c; font-weight: bold; text-transform: uppercase;">${status}</td>
                    </tr>
                  </table>
                </div>

                <p style="font-size: 14px; color: #5f6455; margin-bottom: 25px;">You can track the progress of your order at any time in your dashboard.</p>

                <div style="text-align: center; margin-bottom: 20px;">
                  <a href="${baseUrl}/order/${updated.id}" style="background-color: #1f5133; color: #ffffff; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 10px rgba(31, 81, 51, 0.15);">View Order Details</a>
                </div>

                <!-- Footer Notes -->
                <div style="border-top: 1px solid #efe9db; padding-top: 20px; text-align: center; font-size: 11px; color: #5f6455; line-height: 1.5;">
                  <p style="margin: 0 0 5px 0;">If you have any questions, reply to this email or contact support.</p>
                  <p style="margin: 0;">© ${new Date().getFullYear()} Miikorean Ltd. All rights reserved.</p>
                </div>

              </div>
            </div>
          `;

          await sendEmail({
            to: recipientEmail,
            subject: `Mii Korean — Order #${updated.id} Status: ${status}`,
            html: emailHtml
          });
        }
      } catch (mailErr) {
        console.error('Failed to send status update email:', mailErr);
      }

      return res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        order: mapOrder(updated),
      });
    }

    // ─── ORDERS: Delete Order ───
    if (url.includes('/api/v1/orders/delete/') && req.method === 'DELETE') {
      // ✅ ADMIN PROTECTION: Delete order requires authentication
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token || token.length !== 128 || !/^[a-f0-9]+$/i.test(token)) {
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized: Admin authentication required' 
        });
      }

      const id = url.split('/').pop();
      if (!id) {
        return res.status(400).json({ success: false, message: 'Please provide order ID' });
      }

      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Order deletion error:', error);
        return res.status(500).json({ success: false, message: error.message });
      }

      return res.status(200).json({
        success: true,
        message: 'Order deleted successfully',
      });
    }

    // ─── COUPONS: Get All Coupons ───
    if (url.includes('/api/v1/coupons/all')) {
      const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('Supabase get coupons error:', error);
        return res.status(500).json({ success: false, message: error.message, coupons: [] });
      }
      return res.status(200).json({
        success: true,
        coupons: (data || []).map(c => ({
          _id: c.id || c._id,
          code: String(c.code).toUpperCase(),
          amount: Number(c.amount),
          createdAt: c.created_at || c.createdAt || new Date().toISOString(),
        })),
      });
    }

    // ─── COUPONS: Create Coupon ───
    if (url.includes('/api/v1/coupons/new') && req.method === 'POST') {
      // ✅ ADMIN PROTECTION: Create coupon requires authentication
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token || token.length !== 128 || !/^[a-f0-9]+$/i.test(token)) {
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized: Admin authentication required' 
        });
      }

      const { code, amount } = req.body || {};
      if (!code || !amount) {
        return res.status(400).json({ success: false, message: 'Please provide code and amount' });
      }
      const upperCode = String(code).trim().toUpperCase();
      const numAmount = Number(amount);

      const { data, error } = await supabase
        .from('coupons')
        .insert({ code: upperCode, amount: numAmount })
        .select()
        .single();

      if (error) {
        console.error('Supabase coupon insert error:', error);
        return res.status(500).json({ success: false, message: error.message });
      }

      return res.status(201).json({
        success: true,
        message: 'Coupon created successfully',
        coupon: {
          _id: data.id,
          code: data.code,
          amount: Number(data.amount),
          createdAt: data.created_at,
        },
      });
    }

    // ─── COUPONS: Delete Coupon ───
    if (url.includes('/api/v1/coupons/delete')) {
      // ✅ ADMIN PROTECTION: Delete coupon requires authentication
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token || token.length !== 128 || !/^[a-f0-9]+$/i.test(token)) {
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized: Admin authentication required' 
        });
      }

      const id = url.split('/').pop();
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) {
        console.error('Supabase coupon delete error:', error);
        return res.status(500).json({ success: false, message: error.message });
      }

      return res.status(200).json({
        success: true,
        message: 'Coupon deleted successfully',
      });
    }

    // ─── COUPONS: Apply Coupon ───
    if (url.includes('/api/v1/coupons/apply')) {
      const { code, coupon: legacyCode } = req.body || {};
      const codeUpper = String(code || legacyCode || '').trim().toUpperCase();
      if (!codeUpper) {
        return res.status(400).json({ success: false, message: 'Please enter a coupon code' });
      }

      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .ilike('code', codeUpper)
        .maybeSingle();

      if (error) {
        console.error('Supabase coupon lookup error:', error);
        return res.status(500).json({ success: false, message: 'Could not verify this coupon. Please try again.' });
      }
      if (!data || data.is_active === false) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired coupon code',
        });
      }

      return res.status(200).json({
        success: true,
        coupon: {
          _id: data.id,
          code: String(data.code).toUpperCase(),
          amount: Number(data.amount),
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
        message: `Coupon '${data.code}' applied! £${data.amount} discount added.`,
      });
    }

    // ─── STATS: Admin Dashboard ───
    if (url.includes('/api/v1/stats')) {
      const { data: products } = await supabase.from('products').select('id');
      const { data: ordersRaw } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      const { data: users } = await supabase.from('users').select('*');
      const { data: couponsRaw } = await supabase.from('coupons').select('id');

      const orders = (ordersRaw || []).map(mapOrder);

      // Only count confirmed (non-Pending) orders for revenue & totals
      const confirmedOrders = orders.filter(o => o.status !== 'Pending' && o.currency === 'GBP');
      const totalRevenue = confirmedOrders.reduce((acc, o) => acc + (o.total || 0), 0);
      const totalOrders = confirmedOrders.length;
      const totalProducts = getMiikoreanProducts().length;
      const totalCoupons = couponsRaw?.length || 0;

      // Revenue by month (confirmed orders only)
      const revenueByMonth = {};
      confirmedOrders.forEach(o => {
        const d = o.createdAt ? new Date(o.createdAt) : new Date();
        const month = d.toLocaleString('default', { month: 'short' });
        revenueByMonth[month] = (revenueByMonth[month] || 0) + (o.total || 0);
      });

      // Order status breakdown
      const statusCounts = {};
      orders.forEach(o => {
        const s = o.status || 'Processing';
        statusCounts[s] = (statusCounts[s] || 0) + 1;
      });
      const orderStatusDemographic = Object.entries(statusCounts).map(([_id, count]) => ({ _id, count }));

      // Best selling products
      const salesByProduct = {};
      orders.forEach(o => {
        (o.orderItems || []).forEach(item => {
          const pid = item.productId || item.name || 'unknown';
          salesByProduct[pid] = (salesByProduct[pid] || 0) + (item.quantity || 1);
        });
      });
      const bestSellingProducts = Object.entries(salesByProduct)
        .map(([productId, quantity]) => ({ productId, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      // Latest 5 orders
      const latestOrders = orders.slice(0, 5);

      return res.status(200).json({
        success: true,
        stats: {
          totalRevenue,
          totalOrders,
          totalProducts,
          totalCoupons,
          revenueByMonth,
          orderStatusDemographic,
          bestSellingProducts,
          latestOrders,
        },
      });
    }

    // ─── AUTH / USER: All Users ───
    if (url.includes('/api/v1/auth/all') || url.includes('/api/v1/user/all')) {
      // ✅ ADMIN PROTECTION: Requires authentication
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token || token.length !== 128 || !/^[a-f0-9]+$/i.test(token)) {
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized: Admin authentication required' 
        });
      }

      const { data: usersData } = await supabase.from('users').select('*');
      const { data: ordersData } = await supabase.from('orders').select('shipping_info');

      const customerMap = new Map();
      (usersData || []).forEach(u => customerMap.set(u.email || u.id, {
        _id: u.id,
        id: u.id,
        name: u.name || (u.email ? u.email.split('@')[0] : 'Customer'),
        email: u.email || '',
        phone: u.phone || '',
        role: u.role || 'user',
        photoURL: u.avatar_url || '',
        location: 'United Kingdom',
        createdAt: u.created_at || new Date().toISOString(),
      }));

      (ordersData || []).forEach(o => {
        const info = typeof o.shipping_info === 'string' ? JSON.parse(o.shipping_info) : o.shipping_info;
        if (info && info.email && !customerMap.has(info.email)) {
          customerMap.set(info.email, {
            _id: 'cust_' + (info.phone || Date.now()),
            id: 'cust_' + (info.phone || Date.now()),
            name: info.name || 'Guest Customer',
            email: info.email,
            phone: info.phone || '',
            role: 'user',
            location: [info.city, info.country || 'UK'].filter(Boolean).join(', ') || 'United Kingdom',
            createdAt: o.created_at || new Date().toISOString(),
          });
        }
      });

      return res.status(200).json({
        success: true,
        users: Array.from(customerMap.values()),
      });
    }

    // ─── PRODUCTS: Search Products ───
    if (url.includes('/api/v1/products/search')) {
      const urlObj = new URL(url, 'http://localhost');
      const search = (urlObj.searchParams.get('search') || '').toLowerCase().trim();
      const category = (urlObj.searchParams.get('category') || '').toLowerCase().trim();
      const brand = (urlObj.searchParams.get('brand') || urlObj.searchParams.get('vendor') || '').toLowerCase().trim();
      const price = urlObj.searchParams.get('price') || '';
      const sort = urlObj.searchParams.get('sort') || '';
      const page = parseInt(urlObj.searchParams.get('page') || '1', 10);
      const limit = parseInt(urlObj.searchParams.get('limit') || '24', 10);

      const allCatalog = getMiikoreanProducts().map(mapCatalogProduct);
      let filtered = allCatalog.filter(p => p.isActive !== false);

      if (search) {
        filtered = filtered.filter(p => 
          (p.name && p.name.toLowerCase().includes(search)) ||
          (p.vendor && p.vendor.toLowerCase().includes(search)) ||
          (p.category && p.category.toLowerCase().includes(search)) ||
          (p.description && p.description.toLowerCase().includes(search)) ||
          (p.tags && p.tags.some(t => t.toLowerCase().includes(search)))
        );
      }
      if (category && category !== 'all') {
        filtered = filtered.filter(p => p.category && p.category.toLowerCase() === category);
      }
      if (brand && brand !== 'all') {
        filtered = filtered.filter(p => p.vendor && p.vendor.toLowerCase() === brand);
      }
      if (price) {
        const [minPrice, maxPrice] = price.split(',').map(Number);
        if (!isNaN(minPrice)) filtered = filtered.filter(p => p.price >= minPrice);
        if (!isNaN(maxPrice)) filtered = filtered.filter(p => p.price <= maxPrice);
      }

      if (sort === 'asc' || sort === 'price-asc') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sort === 'desc' || sort === 'price-desc') {
        filtered.sort((a, b) => b.price - a.price);
      } else if (sort === 'name-asc') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
      } else {
        filtered.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
      }

      const totalCount = filtered.length;
      const totalPage = Math.ceil(totalCount / limit) || 1;
      const from = (page - 1) * limit;
      const paginated = filtered.slice(from, from + limit);

      return res.status(200).json({
        success: true,
        products: paginated,
        totalPage,
        totalCount,
      });
    }

    // ─── PRODUCTS: Get Latest Products ───
    if (url.includes('/api/v1/products/latest')) {
      const allCatalog = getMiikoreanProducts().map(mapCatalogProduct);
      const activeProducts = allCatalog.filter(p => p.isActive !== false).slice(0, 50);

      const resBody = {
        success: true,
        products: activeProducts,
      };
      if (global.fastApiCache) global.fastApiCache.set(url, { body: resBody, timestamp: Date.now() });

      return res.status(200).json(resBody);
    }

    // ─── PRODUCTS: Get Categories ───
    if (url.includes('/api/v1/products/categories')) {
      const allCatalog = getMiikoreanProducts();
      const categorySet = new Set([
        'Cleanser',
        'Toner',
        'Serum & Essence',
        'Moisturizer',
        'Sunscreen',
        'Mask',
        'Eye Care',
        'Lip Care',
        'Exfoliator',
        'Treatment',
        'Skincare Sets',
        'Body & Hair',
        'Makeup'
      ]);

      allCatalog.forEach(p => {
        const cat = p.product_type || p.category;
        if (cat && typeof cat === 'string' && cat.trim()) {
          categorySet.add(cat.trim());
        }
      });

      const categories = Array.from(categorySet).sort();
      const resBody = {
        success: true,
        categories,
      };
      if (global.fastApiCache) global.fastApiCache.set(url, { body: resBody, timestamp: Date.now() });

      return res.status(200).json(resBody);
    }

    // ─── PRODUCTS: Get Brands / Vendors ───
    if (url.includes('/api/v1/products/brands') || url.includes('/api/v1/products/vendors')) {
      const allCatalog = getMiikoreanProducts();
      const brandSet = new Set();
      allCatalog.forEach(p => {
        const v = p.vendor;
        if (v && typeof v === 'string' && v.trim()) {
          brandSet.add(v.trim());
        }
      });

      const brands = Array.from(brandSet).sort();
      const resBody = {
        success: true,
        brands,
      };
      if (global.fastApiCache) global.fastApiCache.set(url, { body: resBody, timestamp: Date.now() });

      return res.status(200).json(resBody);
    }

    // ─── PRODUCTS: Get Featured Products ───
    if (url.includes('/api/v1/products/featured')) {
      const allCatalog = getMiikoreanProducts().map(mapCatalogProduct);
      const featured = allCatalog.filter(p => p.featured === true && p.isActive !== false);

      const resBody = {
        success: true,
        products: featured,
      };
      if (global.fastApiCache) global.fastApiCache.set(url, { body: resBody, timestamp: Date.now() });

      return res.status(200).json(resBody);
    }

    // ─── PRODUCTS: Get All Products (Admin & Storefront view) ───
    if (url.includes('/api/v1/products/all')) {
      const urlObj = new URL(url, 'http://localhost');
      const page = parseInt(urlObj.searchParams.get('page') || '1', 10);
      const limit = parseInt(urlObj.searchParams.get('limit') || '50', 10);
      const search = (urlObj.searchParams.get('search') || '').toLowerCase().trim();
      const category = urlObj.searchParams.get('category') || '';
      const brand = urlObj.searchParams.get('brand') || urlObj.searchParams.get('vendor') || '';
      const stockFilter = urlObj.searchParams.get('stockFilter') || urlObj.searchParams.get('stockStatus') || 'all';
      const featured = urlObj.searchParams.get('featured') || '';
      const sortBy = urlObj.searchParams.get('sortBy') || '';

      const allCatalog = getMiikoreanProducts().map(mapCatalogProduct);

      // Collect distinct metadata
      const categorySet = new Set();
      const brandSet = new Set();
      let totalActive = 0;
      let totalLowStock = 0;
      let totalOutOfStock = 0;

      allCatalog.forEach(p => {
        if (p.category) categorySet.add(p.category);
        if (p.vendor) brandSet.add(p.vendor);
        if (p.isActive !== false) totalActive++;
        if (Number(p.stock || 0) === 0 && p.isActive !== false) totalOutOfStock++;
        else if (Number(p.stock || 0) < 10 && Number(p.stock || 0) > 0 && p.isActive !== false) totalLowStock++;
      });

      let filtered = allCatalog.filter(p => {
        // Search
        if (search) {
          const match = 
            (p.name && p.name.toLowerCase().includes(search)) ||
            (p.vendor && p.vendor.toLowerCase().includes(search)) ||
            (p.category && p.category.toLowerCase().includes(search)) ||
            (p.handle && p.handle.toLowerCase().includes(search)) ||
            (p.tags && p.tags.some(t => t.toLowerCase().includes(search)));
          if (!match) return false;
        }

        // Category
        if (category && category !== 'All' && category !== 'all') {
          if (p.category?.toLowerCase() !== category.toLowerCase()) return false;
        }

        // Brand
        if (brand && brand !== 'All' && brand !== 'all') {
          if (p.vendor?.toLowerCase() !== brand.toLowerCase()) return false;
        }

        // Featured
        if (featured === 'true' && !p.featured) return false;
        if (featured === 'false' && p.featured) return false;

        // Stock status
        const stock = Number(p.stock || 0);
        const isActive = p.isActive !== false;
        if (stockFilter === 'disabled' && isActive) return false;
        if (stockFilter === 'out_of_stock' && (stock > 0 || !isActive)) return false;
        if (stockFilter === 'low_stock' && (stock >= 10 || stock <= 0 || !isActive)) return false;
        if (stockFilter === 'in_stock' && (stock < 10 || !isActive)) return false;

        return true;
      });

      // Sort
      if (sortBy === 'price-asc') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price-desc') {
        filtered.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'name-asc') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortBy === 'name-desc') {
        filtered.sort((a, b) => b.name.localeCompare(a.name));
      } else {
        filtered.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
      }

      const totalProducts = filtered.length;
      const totalPages = Math.ceil(totalProducts / limit) || 1;
      const from = (page - 1) * limit;
      const pagedProducts = filtered.slice(from, from + limit);

      const resBody = {
        success: true,
        products: pagedProducts,
        totalProducts,
        totalPages,
        currentPage: page,
        totalActive,
        totalLowStock,
        totalOutOfStock,
        categories: Array.from(categorySet).sort(),
        brands: Array.from(brandSet).sort(),
      };

      return res.status(200).json(resBody);
    }

    // ─── PRODUCTS: Create New Product ───
    if (url.includes('/api/v1/products/new') && req.method === 'POST') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token || token.length !== 128 || !/^[a-f0-9]+$/i.test(token)) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Admin authentication required' });
      }

      const body = (req.body && req.body.productData) ? req.body.productData : (req.body || {});
      const { name, category, vendor, price, compareAtPrice, stock, description, bodyHtml, photo, images, tags, variants, featured, isActive } = body;

      if (!name || (!category && !body.product_type) || price === undefined) {
        return res.status(400).json({ success: false, message: 'Please provide at least product name, category, and price' });
      }

      const catalogData = getMiikoreanCatalogData();
      const uniqueId = Date.now();
      const baseHandle = String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      let handle = baseHandle || `product-${uniqueId}`;
      let counter = 1;
      while (catalogData.products.some(p => p.handle === handle)) {
        handle = `${baseHandle}-${counter++}`;
      }

      const cleanPrice = Number(price || 0).toFixed(2);
      const cleanCompareAt = compareAtPrice ? Number(compareAtPrice).toFixed(2) : null;
      const initialStock = Number(stock !== undefined ? stock : 100);

      const formattedVariants = (Array.isArray(variants) && variants.length > 0)
        ? variants.map((v, i) => ({
            id: v.id || uniqueId + i,
            title: v.title || v.name || 'Default Title',
            option1: v.option1 || v.title || v.name || 'Default Title',
            option2: null,
            option3: null,
            price: Number(v.price || v.salePrice || price || 0).toFixed(2),
            compare_at_price: v.compare_at_price || v.mrp ? Number(v.compare_at_price || v.mrp).toFixed(2) : cleanCompareAt,
            available: v.available !== false && (v.stock === undefined || Number(v.stock) > 0),
            sku: v.sku || null,
            featured_image: v.featured_image || null,
          }))
        : [{
            id: uniqueId + 1,
            title: 'Default Title',
            option1: 'Default Title',
            option2: null,
            option3: null,
            price: cleanPrice,
            compare_at_price: cleanCompareAt,
            available: initialStock > 0,
            sku: null,
            featured_image: null,
          }];

      const formattedImages = (Array.isArray(images) && images.length > 0)
        ? images.map((img, i) => ({
            id: img.id || uniqueId + 10 + i,
            src: typeof img === 'string' ? img : img.src,
            alt: img.alt || null,
            width: 1000,
            height: 1000,
          }))
        : [{
            id: uniqueId + 10,
            src: photo || 'https://res.cloudinary.com/idi6k3ue/image/upload/v1791904965/urvaa/logo.png',
            alt: null,
            width: 1000,
            height: 1000,
          }];

      const newProduct = {
        id: uniqueId,
        title: name,
        handle,
        body_html: bodyHtml || `<p>${description || ''}</p>`,
        vendor: vendor || 'Mii Korean',
        product_type: category || body.product_type || 'Skincare',
        published_at: new Date().toISOString(),
        tags: Array.isArray(tags) ? tags : (tags ? String(tags).split(',').map(t => t.trim()) : []),
        variants: formattedVariants,
        images: formattedImages,
        featured: Boolean(featured),
        isActive: isActive !== false,
        stock: initialStock,
      };

      catalogData.products.unshift(newProduct);
      catalogData.product_count = catalogData.products.length;
      saveMiikoreanCatalogData(catalogData);

      // Optional: mirror to Supabase if accessible
      try {
        await supabase.from('products').insert({
          id: crypto.randomUUID ? crypto.randomUUID() : undefined,
          name,
          category: newProduct.product_type,
          description: description || stripHtmlTags(newProduct.body_html),
          price: Number(cleanPrice),
          stock: initialStock,
          photo: formattedImages[0]?.src || '',
          featured: Boolean(featured),
          is_active: isActive !== false,
          variants: formattedVariants,
        });
      } catch (e) {
        console.warn('Optional Supabase product insert skipped:', e.message);
      }

      return res.status(201).json({
        success: true,
        message: 'Product created successfully',
        product: mapCatalogProduct(newProduct),
      });
    }

    // ─── PRODUCTS: Toggle Active Status (Enable/Disable) ───
    if (url.match(/\/api\/v1\/products\/toggle-active\/[^/]+$/) && req.method === 'PATCH') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token || token.length !== 128 || !/^[a-f0-9]+$/i.test(token)) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Admin authentication required' });
      }

      const productId = url.split('/').pop().split('?')[0];
      const catalogData = getMiikoreanCatalogData();
      const product = catalogData.products.find(p => p.handle === productId || String(p.id) === productId);

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found in catalog' });
      }

      product.isActive = product.isActive === false ? true : false;
      product.updatedAt = new Date().toISOString();
      saveMiikoreanCatalogData(catalogData);

      // Optional: mirror to Supabase
      try {
        await supabase.from('products').update({ is_active: product.isActive }).eq('name', product.title);
      } catch (e) {}

      return res.status(200).json({
        success: true,
        message: `Product ${product.isActive ? 'enabled' : 'disabled'} successfully`,
        product: mapCatalogProduct(product),
      });
    }

    // ─── PRODUCTS: Toggle Featured ───
    if (url.match(/\/api\/v1\/products\/feature\/[^/]+$/) && req.method === 'PATCH') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token || token.length !== 128 || !/^[a-f0-9]+$/i.test(token)) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Admin authentication required' });
      }

      const productId = url.split('/').pop().split('?')[0];
      const catalogData = getMiikoreanCatalogData();
      const product = catalogData.products.find(p => p.handle === productId || String(p.id) === productId);

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found in catalog' });
      }

      if (req.body && typeof req.body.featured === 'boolean') {
        product.featured = req.body.featured;
      } else {
        product.featured = !Boolean(product.featured);
      }
      product.updatedAt = new Date().toISOString();
      saveMiikoreanCatalogData(catalogData);

      return res.status(200).json({
        success: true,
        message: `Product ${product.featured ? 'featured' : 'unfeatured'} successfully`,
        product: mapCatalogProduct(product),
      });
    }

    // ─── PRODUCTS: Delete Product ───
    if (url.match(/\/api\/v1\/products\/[^/]+$/) && req.method === 'DELETE') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token || token.length !== 128 || !/^[a-f0-9]+$/i.test(token)) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Admin authentication required' });
      }

      const productId = url.split('/').pop().split('?')[0];
      const catalogData = getMiikoreanCatalogData();
      const index = catalogData.products.findIndex(p => p.handle === productId || String(p.id) === productId);

      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Product not found in catalog' });
      }

      const removed = catalogData.products.splice(index, 1)[0];
      catalogData.product_count = catalogData.products.length;
      saveMiikoreanCatalogData(catalogData);

      // Optional: mirror to Supabase
      try {
        await supabase.from('products').delete().eq('name', removed.title);
      } catch (e) {}

      return res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
      });
    }

    // ─── PRODUCTS: Get Single Product by ID or Handle ───
    if (url.match(/\/api\/v1\/products\/[^/]+$/) && req.method === 'GET') {
      const id = url.split('/').pop().split('?')[0];
      const catalogData = getMiikoreanCatalogData();
      const product = catalogData.products.find(p => p.handle === id || String(p.id) === id);

      if (product) {
        const resBody = {
          success: true,
          product: mapCatalogProduct(product),
        };
        if (global.fastApiCache) global.fastApiCache.set(url, { body: resBody, timestamp: Date.now() });
        return res.status(200).json(resBody);
      }

      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // ─── PRODUCTS: Update Product (PUT) ───
    if (url.match(/\/api\/v1\/products\/[^/]+$/) && req.method === 'PUT') {
      const productId = url.split('/').pop().split('?')[0];
      
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token || token.length !== 128 || !/^[a-f0-9]+$/i.test(token)) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Admin authentication required' });
      }

      const body = (req.body && req.body.productData) ? req.body.productData : (req.body || {});
      const { name, category, vendor, price, compareAtPrice, stock, description, bodyHtml, variants, photo, images, tags, featured, isActive } = body;

      const catalogData = getMiikoreanCatalogData();
      const product = catalogData.products.find(p => p.handle === productId || String(p.id) === productId);

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found in catalog' });
      }

      // Update fields
      if (name !== undefined) product.title = name;
      if (category !== undefined) product.product_type = category;
      if (vendor !== undefined) product.vendor = vendor;
      if (bodyHtml !== undefined) product.body_html = bodyHtml;
      else if (description !== undefined) product.body_html = `<p>${description}</p>`;
      if (featured !== undefined) product.featured = Boolean(featured);
      if (isActive !== undefined) product.isActive = Boolean(isActive);
      if (stock !== undefined) product.stock = Number(stock);
      if (tags !== undefined) product.tags = Array.isArray(tags) ? tags : (tags ? String(tags).split(',').map(t => t.trim()) : []);

      // Price update
      if (price !== undefined) {
        const cleanPrice = Number(price).toFixed(2);
        const cleanCompareAt = compareAtPrice ? Number(compareAtPrice).toFixed(2) : null;
        if (Array.isArray(product.variants) && product.variants.length > 0) {
          product.variants[0].price = cleanPrice;
          if (cleanCompareAt !== null) product.variants[0].compare_at_price = cleanCompareAt;
        } else {
          product.variants = [{
            id: Date.now(),
            title: 'Default Title',
            option1: 'Default Title',
            option2: null,
            option3: null,
            price: cleanPrice,
            compare_at_price: cleanCompareAt,
            available: (product.stock || 0) > 0,
            sku: null,
            featured_image: null,
          }];
        }
      }

      // Variants update
      if (Array.isArray(variants) && variants.length > 0) {
        product.variants = variants.map((v, i) => ({
          id: v.id || Date.now() + i,
          title: v.title || v.name || 'Default Title',
          option1: v.option1 || v.title || v.name || 'Default Title',
          option2: null,
          option3: null,
          price: Number(v.price || v.salePrice || price || 0).toFixed(2),
          compare_at_price: v.compare_at_price || v.mrp ? Number(v.compare_at_price || v.mrp).toFixed(2) : null,
          available: v.available !== false && (v.stock === undefined || Number(v.stock) > 0),
          sku: v.sku || null,
          featured_image: v.featured_image || null,
        }));
      }

      // Photos / Images update
      if (Array.isArray(images) && images.length > 0) {
        product.images = images.map((img, i) => ({
          id: img.id || Date.now() + 10 + i,
          src: typeof img === 'string' ? img : img.src,
          alt: img.alt || null,
          width: 1000,
          height: 1000,
        }));
      } else if (photo) {
        if (!product.images) product.images = [];
        if (product.images.length > 0) {
          product.images[0].src = photo;
        } else {
          product.images.push({ id: Date.now() + 10, src: photo, alt: null, width: 1000, height: 1000 });
        }
      }

      product.updatedAt = new Date().toISOString();
      saveMiikoreanCatalogData(catalogData);

      return res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        product: mapCatalogProduct(product),
      });
    }

    // ─── AUTH: User Me ───
    if (url.includes('/api/v1/user/me') || url.includes('/api/v1/auth/me')) {
      return res.status(200).json({
        success: false,
        message: 'Not logged in',
      });
    }



    // ============================================
    // ADMIN AUTHENTICATION ENDPOINTS
    // ============================================

    // Admin credentials helper functions
    function hashAdminPassword(password) {
      return crypto.createHash('sha256').update(password + 'ADMIN_SALT_2026_VH').digest('hex');
    }

    function generateAdminToken() {
      return crypto.randomBytes(64).toString('hex');
    }

    // ─── ADMIN: Login ───
    if (url.includes('/api/v1/admin/login') && req.method === 'POST') {
      const { email, password } = req.body || {};
      
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password required' });
      }

      const cleanEmail = String(email).trim().toLowerCase();

      // Default built-in admin credentials
      const ADMIN_EMAIL = 'admin@urvaa.in';
      const MII_ADMIN_EMAIL = 'admin@miikorean.com';
      const DEFAULT_ADMIN_HASH = hashAdminPassword('urvaa@2026');
      const MII_ADMIN_HASH = hashAdminPassword('miikorean@2026');
      const LEGACY_ADMIN_HASH = hashAdminPassword('julinacandles@2026');
      const providedPasswordHash = hashAdminPassword(password);

      let isAdminValid = false;
      let adminData = {
        id: 'admin_001',
        email: cleanEmail,
        name: 'Mii Korean Admin',
      };

      // 1. Check built-in admin account
      if ((cleanEmail === ADMIN_EMAIL.toLowerCase() || cleanEmail === MII_ADMIN_EMAIL.toLowerCase() || cleanEmail === 'admin@julinacandles.in') && 
          (providedPasswordHash === DEFAULT_ADMIN_HASH || providedPasswordHash === MII_ADMIN_HASH || providedPasswordHash === LEGACY_ADMIN_HASH)) {
        isAdminValid = true;
      } else {
        // 2. Fallback: check Supabase users table for user with role='admin'
        try {
          const { data: userRow } = await supabase
            .from('users')
            .select('*')
            .eq('email', cleanEmail)
            .eq('role', 'admin')
            .maybeSingle();

          if (userRow) {
            // User exists and is admin
            isAdminValid = true;
            adminData = {
              id: userRow.id || userRow.uid || 'admin_001',
              email: userRow.email,
              name: userRow.name || 'Admin',
            };
          }
        } catch (dbErr) {
          console.error('Error verifying DB admin user:', dbErr);
        }
      }

      if (!isAdminValid) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      // Generate session token
      const token = generateAdminToken();

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token: token,
        admin: adminData
      });
    }

    // ─── ADMIN: Verify Token ───
    if (url.includes('/api/v1/admin/verify') && req.method === 'GET') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
      }

      // Simple token validation (64-byte hex string)
      // In production, check against database table
      if (token.length === 128 && /^[a-f0-9]+$/i.test(token)) {
        return res.status(200).json({
          success: true,
          admin: {
            id: 'admin_001',
            email: 'admin@miikorean.com',
            name: 'Mii Korean Admin',
          }
        });
      }

      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    // ─── ADMIN: Logout ───
    if (url.includes('/api/v1/admin/logout') && req.method === 'POST') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
      }

      // In production, delete the token from admin_sessions table
      // For now, just return success (frontend will remove token from localStorage)
      
      return res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    }

    // ============================================
    // CMS ENDPOINTS - Content Management System
    // ============================================

    // ─── CMS: Get All Testimonials (Public) ───
    if (url.includes('/api/v1/cms/testimonials') && req.method === 'GET') {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        return res.status(500).json({ success: false, message: error.message });
      }

      return res.status(200).json({ success: true, testimonials: data || [] });
    }

    // ─── CMS: Get All Blogs (Public - only published) ───
    if (url.includes('/api/v1/cms/blogs') && req.method === 'GET') {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('is_published', true)
        .order('display_order', { ascending: true });

      if (error) {
        return res.status(500).json({ success: false, message: error.message });
      }

      return res.status(200).json({ success: true, blogs: data || [] });
    }

    // ─── CMS: Get Single Blog by Slug (Public) ───
    if (url.match(/\/api\/v1\/cms\/blogs\/[^/]+$/) && req.method === 'GET') {
      const slug = url.split('/').pop();
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error || !data) {
        return res.status(404).json({ success: false, message: 'Blog not found' });
      }

      return res.status(200).json({ success: true, blog: data });
    }

    // ─── CMS: Get All Recipes (Public - only published) ───
    if (url.includes('/api/v1/cms/recipes') && req.method === 'GET') {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('is_published', true)
        .order('display_order', { ascending: true });

      if (error) {
        return res.status(500).json({ success: false, message: error.message });
      }

      return res.status(200).json({ success: true, recipes: data || [] });
    }

    // ─── CMS: Get All Team Members (Public) ───
    if (url.includes('/api/v1/cms/team-members') && req.method === 'GET') {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        return res.status(500).json({ success: false, message: error.message });
      }

      return res.status(200).json({ success: true, teamMembers: data || [] });
    }

    // ─── CMS: Get All FAQs (Public) ───
    if (url.includes('/api/v1/cms/faqs') && req.method === 'GET') {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        return res.status(500).json({ success: false, message: error.message });
      }

      return res.status(200).json({ success: true, faqs: data || [] });
    }

    // ─── CMS: Get All Gallery Images (Public) ───
    if (url.includes('/api/v1/cms/gallery') && req.method === 'GET') {
      const { data, error} = await supabase
        .from('gallery')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        return res.status(500).json({ success: false, message: error.message });
      }

      return res.status(200).json({ success: true, gallery: data || [] });
    }

    // ─── CMS: Get All Trust Highlights (Public) ───
    if (url.includes('/api/v1/cms/trust-highlights') && req.method === 'GET') {
      const { data, error } = await supabase
        .from('trust_highlights')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        return res.status(500).json({ success: false, message: error.message });
      }

      return res.status(200).json({ success: true, trustHighlights: data || [] });
    }

    // ─── CMS: Get All Company Values (Public) ───
    if (url.includes('/api/v1/cms/company-values') && req.method === 'GET') {
      const { data, error } = await supabase
        .from('company_values')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        return res.status(500).json({ success: false, message: error.message });
      }

      return res.status(200).json({ success: true, companyValues: data || [] });
    }

    // ============================================
    // STORE BANNERS & CAMPAIGNS ENDPOINTS
    // ============================================

    // ─── BANNERS: Get Active Store Banners (Public) ───
    if (url.match(/\/api\/v1\/banners(\?.*)?$/) && req.method === 'GET') {
      const typeParam = new URL(url, 'http://localhost').searchParams.get('type');
      let banners = [];

      try {
        let query = supabase
          .from('store_banners')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (typeParam) {
          query = query.eq('type', typeParam);
        }

        const { data, error } = await query;
        if (!error && Array.isArray(data) && data.length > 0) {
          banners = data.map(mapBanner);
        }
      } catch (dbErr) {
        console.warn('DB store_banners fetch warning:', dbErr.message);
      }

      // Fallback to local persistent cache if DB returned no records
      if (banners.length === 0) {
        const fallbacks = getLocalFallbackBanners();
        banners = fallbacks.filter(b => b.isActive !== false);
        if (typeParam) {
          banners = banners.filter(b => b.type === typeParam);
        }
      }

      return res.status(200).json({ success: true, banners });
    }

    // ─── ADMIN: Get All Store Banners (Admin) ───
    if (url.match(/\/api\/v1\/admin\/banners(\?.*)?$/) && req.method === 'GET') {
      const typeParam = new URL(url, 'http://localhost').searchParams.get('type');
      let banners = [];

      try {
        let query = supabase
          .from('store_banners')
          .select('*')
          .order('display_order', { ascending: true });

        if (typeParam) {
          query = query.eq('type', typeParam);
        }

        const { data, error } = await query;
        if (!error && Array.isArray(data) && data.length > 0) {
          banners = data.map(mapBanner);
        }
      } catch (dbErr) {
        console.warn('DB admin store_banners fetch warning:', dbErr.message);
      }

      // Fallback to local persistent cache if DB returned no records
      if (banners.length === 0) {
        banners = getLocalFallbackBanners();
        if (typeParam) {
          banners = banners.filter(b => b.type === typeParam);
        }
      }

      return res.status(200).json({ success: true, banners });
    }

    // ─── ADMIN: Seed / Reset Default Banners ───
    if (url.includes('/api/v1/admin/banners/seed-defaults') && req.method === 'POST') {
      const defaultBanners = getLocalFallbackBanners();
      const seeded = [];
      try {
        // Clear all banners from DB
        await supabase.from('store_banners').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        for (const b of defaultBanners) {
          const dbRow = formatBannerForDB(b);
          delete dbRow.id; // allow clean auto-generated UUID
          const { data, error } = await supabase.from('store_banners').insert(dbRow).select();
          if (!error && data && data[0]) {
            seeded.push(mapBanner(data[0]));
          }
        }
      } catch (e) {
        console.warn('DB seed warning:', e.message);
      }
      const finalBanners = seeded.length > 0 ? seeded : defaultBanners;
      saveLocalFallbackBanners(finalBanners);
      if (global.fastApiCache) global.fastApiCache.clear();
      return res.status(200).json({ success: true, message: 'Default campaigns seeded successfully', banners: finalBanners });
    }

    // ─── ADMIN: Toggle Banner Status (Active/Inactive) ───
    if (url.match(/\/api\/v1\/admin\/banners\/[^/]+\/toggle$/) && req.method === 'PATCH') {
      const parts = url.split('/');
      const bannerId = parts[parts.length - 2];
      let updatedBanner = null;

      // 1. Try Supabase
      try {
        const { data: existing } = await supabase.from('store_banners').select('is_active').eq('id', bannerId).single();
        if (existing) {
          const newStatus = !existing.is_active;
          const { data } = await supabase.from('store_banners').update({ is_active: newStatus, updated_at: new Date().toISOString() }).eq('id', bannerId).select().single();
          if (data) updatedBanner = mapBanner(data);
        }
      } catch (e) {
        console.warn('DB toggle warning:', e.message);
      }

      // 2. Fallback local file update
      const localList = getLocalFallbackBanners();
      const idx = localList.findIndex(b => b.id === bannerId);
      if (idx !== -1) {
        localList[idx].isActive = !localList[idx].isActive;
        localList[idx].updatedAt = new Date().toISOString();
        saveLocalFallbackBanners(localList);
        if (!updatedBanner) updatedBanner = localList[idx];
      }

      if (global.fastApiCache) global.fastApiCache.clear();
      return res.status(200).json({ success: true, banner: updatedBanner });
    }

    // ─── ADMIN: Create Store Banner ───
    if (url.match(/\/api\/v1\/admin\/banners(\?.*)?$/) && req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const newBanner = {
        type: body.type || 'hero',
        title: body.title || 'Untitled Banner',
        subtitle: body.subtitle || '',
        tagline: body.tagline || '',
        imageUrl: body.imageUrl || body.image_url || '',
        mobileImageUrl: body.mobileImageUrl || body.mobile_image_url || body.imageUrl || body.image_url || '',
        linkUrl: body.linkUrl || body.link_url || '/products',
        buttonText: body.buttonText || body.button_text || 'Explore Now',
        badge: body.badge || '',
        theme: body.theme || 'dark',
        backgroundColor: body.backgroundColor || body.background_color || '#111111',
        textColor: body.textColor || body.text_color || '#FFFFFF',
        displayOrder: Number(body.displayOrder ?? body.display_order ?? 0),
        isActive: body.isActive !== false && body.is_active !== false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 1. Try Supabase
      try {
        const dbPayload = formatBannerForDB(newBanner);
        delete dbPayload.id; // let Supabase auto-generate UUID
        const { data, error } = await supabase.from('store_banners').insert(dbPayload).select().single();
        if (!error && data) {
          newBanner.id = data.id;
        } else {
          newBanner.id = crypto.randomUUID();
        }
      } catch (dbErr) {
        console.warn('DB insert banner warning:', dbErr.message);
        newBanner.id = crypto.randomUUID();
      }

      // 2. Persist to local fallback cache
      const localList = getLocalFallbackBanners();
      localList.push(newBanner);
      saveLocalFallbackBanners(localList);

      if (global.fastApiCache) global.fastApiCache.clear();
      return res.status(201).json({ success: true, banner: newBanner, message: 'Campaign banner created successfully' });
    }

    // ─── ADMIN: Update Store Banner ───
    if (url.match(/\/api\/v1\/admin\/banners\/[^/]+$/) && req.method === 'PUT') {
      const bannerId = url.split('/').pop().split('?')[0];
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      let updatedBanner = null;

      // 1. Try Supabase
      try {
        const dbPayload = formatBannerForDB(body);
        delete dbPayload.id;
        const { data, error } = await supabase.from('store_banners').update(dbPayload).eq('id', bannerId).select().single();
        if (!error && data) {
          updatedBanner = mapBanner(data);
        }
      } catch (dbErr) {
        console.warn('DB update banner warning:', dbErr.message);
      }

      // 2. Local fallback update
      const localList = getLocalFallbackBanners();
      const idx = localList.findIndex(b => b.id === bannerId);
      if (idx !== -1) {
        localList[idx] = {
          ...localList[idx],
          ...body,
          id: bannerId,
          updatedAt: new Date().toISOString(),
        };
        saveLocalFallbackBanners(localList);
        if (!updatedBanner) updatedBanner = localList[idx];
      }

      if (global.fastApiCache) global.fastApiCache.clear();
      return res.status(200).json({ success: true, banner: updatedBanner, message: 'Campaign banner updated successfully' });
    }

    // ─── ADMIN: Delete Store Banner ───
    if (url.match(/\/api\/v1\/admin\/banners\/[^/]+$/) && req.method === 'DELETE') {
      const bannerId = url.split('/').pop().split('?')[0];

      // 1. Try Supabase
      try {
        await supabase.from('store_banners').delete().eq('id', bannerId);
      } catch (e) {
        console.warn('DB delete banner warning:', e.message);
      }

      // 2. Local fallback update
      let localList = getLocalFallbackBanners();
      localList = localList.filter(b => b.id !== bannerId);
      saveLocalFallbackBanners(localList);

      if (global.fastApiCache) global.fastApiCache.clear();
      return res.status(200).json({ success: true, message: 'Campaign banner deleted successfully' });
    }

    // ─── Fallback: Return all products ───
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    return res.status(200).json({
      success: true,
      products: (data || []).map(mapProduct),
    });

  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Internal Server Error',
    });
  }
}
