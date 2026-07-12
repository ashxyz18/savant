import db from '../lib/db.js';

const SiteSettings = db.defineCollection('settings');

SiteSettings.getSingleton = async function () {
  const list = db.COLLECTIONS['settings'];
  let settings = (await list.find())[0];
  if (!settings) {
    settings = await list.create({});
  }
  return settings;
};

export default SiteSettings;
