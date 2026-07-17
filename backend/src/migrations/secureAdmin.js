import bcrypt from 'bcryptjs';

// One-time bootstrap: if the admin account still uses the weak default
// password, replace it with the value from ADMIN_BOOTSTRAP_PASSWORD.
// Runs once at startup inside the Render environment (which can reach Mongo).
// Remove this file + the env var after it has run.
export const secureAdminPassword = async (User) => {
  const bootstrap = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!bootstrap) return;
  try {
    const admin = await User.findOne({ email: 'admin@roseo.com' }).select('+password');
    if (!admin) return;
    const stillDefault = admin.password && (await bcrypt.compare('admin123', admin.password));
    if (stillDefault) {
      admin.password = bootstrap;
      await admin.save();
      console.log('[migration] admin password secured');
    }
  } catch (err) {
    console.error('[migration] admin password update failed:', err.message);
  }
};
