const UPLOAD_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');

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
