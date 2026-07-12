import db from '../lib/db.js';
import bcrypt from 'bcryptjs';

const hashPassword = async (doc) => {
  if (doc.isActive === undefined || doc.isActive === null) doc.isActive = true;
  if (doc.password && !String(doc.password).startsWith('$2')) {
    doc.password = await bcrypt.hash(doc.password, 12);
  }
};

const User = db.defineCollection('users', {
  hidden: ['password'],
  hooks: { beforeCreate: hashPassword, beforeSave: hashPassword },
});

export default User;
