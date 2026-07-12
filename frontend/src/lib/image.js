const UPLOAD_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api.savantbd.com/api').replace('/api', '');

export const getImageUrl = (img) => {
  if (!img) return '';
  if (img.startsWith('http')) return img;
  return `${UPLOAD_URL}${img}`;
};

export const getLogoUrl = (logo) => {
  if (!logo) return '';
  if (logo.startsWith('http')) return logo;
  return `${UPLOAD_URL}${logo}`;
};
