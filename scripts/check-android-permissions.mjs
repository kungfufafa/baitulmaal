import { execSync } from 'node:child_process';

const ALLOWED_PERMISSIONS = [
  'android.permission.ACCESS_COARSE_LOCATION',
  'android.permission.ACCESS_FINE_LOCATION',
  'android.permission.POST_NOTIFICATIONS',
  'android.permission.READ_EXTERNAL_STORAGE',
  'android.permission.WRITE_EXTERNAL_STORAGE',
  'android.permission.READ_MEDIA_VISUAL_USER_SELECTED',
  'android.permission.READ_MEDIA_IMAGES',
  'android.permission.INTERNET',
];

const REQUIRED_BLOCKED_PERMISSIONS = [
  'android.permission.CAMERA',
  'android.permission.RECORD_AUDIO',
  'android.permission.READ_MEDIA_VIDEO',
  'android.permission.READ_MEDIA_AUDIO',
];

function main() {
  const raw = execSync('npx expo config --type introspect --json', {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const config = JSON.parse(raw);
  const androidPermissions = config?.android?.permissions ?? [];
  const blockedPermissions = config?.android?.blockedPermissions ?? [];

  const unexpectedPermissions = androidPermissions.filter(
    (permission) => !ALLOWED_PERMISSIONS.includes(permission)
  );

  const missingPermissions = ALLOWED_PERMISSIONS.filter(
    (permission) => !androidPermissions.includes(permission)
  );

  const missingBlocked = REQUIRED_BLOCKED_PERMISSIONS.filter(
    (permission) => !blockedPermissions.includes(permission)
  );

  if (
    unexpectedPermissions.length > 0 ||
    missingPermissions.length > 0 ||
    missingBlocked.length > 0
  ) {
    if (unexpectedPermissions.length > 0) {
      console.error(
        'Unexpected Android permissions detected:',
        unexpectedPermissions.join(', ')
      );
    }

    if (missingPermissions.length > 0) {
      console.error(
        'Expected Android permissions missing:',
        missingPermissions.join(', ')
      );
    }

    if (missingBlocked.length > 0) {
      console.error('Blocked permission missing in app config:', missingBlocked.join(', '));
    }

    process.exit(1);
  }

  console.log('Android permissions check passed.');
}

main();
