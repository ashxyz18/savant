import Settings from '../models/Settings.js';

/**
 * Build post caption from product data
 */
export const buildPostCaption = (product, customTemplate = null) => {
  const priceFormatted = product.price ? `৳${product.price}` : '';
  const sku = product.sku ? `SKU: ${product.sku}` : '';
  const sizes = product.sizes && product.sizes.length > 0 ? `Sizes: ${product.sizes.join(', ')}` : '';
  const productUrl = process.env.FRONTEND_URL 
    ? `${process.env.FRONTEND_URL}/products/view?id=${product._id}`
    : `https://savant.com/products/view?id=${product._id}`;

  if (customTemplate) {
    return customTemplate
      .replace('{productName}', product.name || '')
      .replace('{price}', priceFormatted)
      .replace('{sku}', sku)
      .replace('{sizes}', sizes)
      .replace('{productUrl}', productUrl)
      .replace('{description}', product.shortDescription || product.description || '');
  }

  return `✨ NEW ARRIVAL AT SAVANT ✨

👜 ${product.name}
💰 Price: ${priceFormatted}
${sku ? `🏷️ ${sku}` : ''}
${sizes ? `📐 ${sizes}` : ''}

🛒 Order online now: ${productUrl}

#SAVANT #Leather #Luxury #NewArrival #Dhaka #Fashion`;
};

/**
 * Post photo + caption to Facebook Page via Meta Graph API
 */
export const postToFacebookPage = async (product, config) => {
  const { fbPageId, fbAccessToken } = config;
  if (!fbPageId || !fbAccessToken) {
    throw new Error('Facebook Page ID and Access Token are required');
  }

  const imageUrl = product.images && product.images[0] ? product.images[0] : null;
  const caption = buildPostCaption(product, config.captionTemplate);

  // If product image is relative, turn it into absolute URL
  const absoluteImageUrl = imageUrl && imageUrl.startsWith('http')
    ? imageUrl
    : (process.env.FRONTEND_URL || 'https://savant.com') + (imageUrl && imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl);

  let url;
  let bodyData;

  if (absoluteImageUrl) {
    url = `https://graph.facebook.com/v19.0/${fbPageId}/photos`;
    bodyData = new URLSearchParams({
      url: absoluteImageUrl,
      caption: caption,
      access_token: fbAccessToken,
    });
  } else {
    url = `https://graph.facebook.com/v19.0/${fbPageId}/feed`;
    bodyData = new URLSearchParams({
      message: caption,
      access_token: fbAccessToken,
    });
  }

  const response = await fetch(url, {
    method: 'POST',
    body: bodyData,
  });

  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error?.message || 'Facebook API error');
  }

  return { success: true, postId: data.id || data.post_id };
};

/**
 * Post photo + caption to Instagram Business Account via Meta Graph API
 */
export const postToInstagramBusiness = async (product, config) => {
  const { igAccountId, fbAccessToken } = config;
  if (!igAccountId || !fbAccessToken) {
    throw new Error('Instagram Account ID and Access Token are required');
  }

  const imageUrl = product.images && product.images[0] ? product.images[0] : null;
  if (!imageUrl) {
    throw new Error('An image is required for Instagram posts');
  }

  const absoluteImageUrl = imageUrl.startsWith('http')
    ? imageUrl
    : (process.env.FRONTEND_URL || 'https://savant.com') + (imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl);

  const caption = buildPostCaption(product, config.captionTemplate);

  // Step 1: Create Container
  const containerUrl = `https://graph.facebook.com/v19.0/${igAccountId}/media`;
  const containerRes = await fetch(containerUrl, {
    method: 'POST',
    body: new URLSearchParams({
      image_url: absoluteImageUrl,
      caption: caption,
      access_token: fbAccessToken,
    }),
  });

  const containerData = await containerRes.json();
  if (!containerRes.ok || containerData.error) {
    throw new Error(containerData.error?.message || 'Instagram Container Creation Failed');
  }

  const creationId = containerData.id;

  // Step 2: Publish Container
  const publishUrl = `https://graph.facebook.com/v19.0/${igAccountId}/media_publish`;
  const publishRes = await fetch(publishUrl, {
    method: 'POST',
    body: new URLSearchParams({
      creation_id: creationId,
      access_token: fbAccessToken,
    }),
  });

  const publishData = await publishRes.json();
  if (!publishRes.ok || publishData.error) {
    throw new Error(publishData.error?.message || 'Instagram Publish Failed');
  }

  return { success: true, mediaId: publishData.id };
};

/**
 * Main auto-post handler called after product creation
 */
export const autoPostProduct = async (product) => {
  try {
    const settings = await Settings.findOne();
    const socialConfig = settings?.socialAutoPost || {};

    if (!socialConfig.enabled) {
      console.log(`[Social Auto-Post] Auto-post is disabled for product: ${product.name}`);
      return;
    }

    const config = {
      fbPageId: socialConfig.fbPageId || process.env.FB_PAGE_ID,
      fbAccessToken: socialConfig.fbAccessToken || process.env.FB_PAGE_TOKEN,
      igAccountId: socialConfig.igAccountId || process.env.IG_ACCOUNT_ID,
      captionTemplate: socialConfig.captionTemplate,
    };

    if (socialConfig.postToFacebook && config.fbPageId && config.fbAccessToken) {
      try {
        const fbResult = await postToFacebookPage(product, config);
        console.log(`[Social Auto-Post] Successfully posted to Facebook Page! ID: ${fbResult.postId}`);
      } catch (fbErr) {
        console.error(`[Social Auto-Post] Facebook post failed:`, fbErr.message);
      }
    }

    if (socialConfig.postToInstagram && config.igAccountId && config.fbAccessToken) {
      try {
        const igResult = await postToInstagramBusiness(product, config);
        console.log(`[Social Auto-Post] Successfully posted to Instagram! ID: ${igResult.mediaId}`);
      } catch (igErr) {
        console.error(`[Social Auto-Post] Instagram post failed:`, igErr.message);
      }
    }
  } catch (error) {
    console.error('[Social Auto-Post] Unexpected error in auto-post pipeline:', error.message);
  }
};
