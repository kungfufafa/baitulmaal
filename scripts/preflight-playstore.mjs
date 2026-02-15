import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const EXPECTED_ALLOWED_PERMISSIONS = [
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

const POLICY_SENSITIVE_PERMISSIONS = new Set([
  'android.permission.ACCESS_COARSE_LOCATION',
  'android.permission.ACCESS_FINE_LOCATION',
  'android.permission.READ_EXTERNAL_STORAGE',
  'android.permission.WRITE_EXTERNAL_STORAGE',
  'android.permission.READ_MEDIA_IMAGES',
  'android.permission.READ_MEDIA_VISUAL_USER_SELECTED',
]);

const CODEBASE_SEARCH_PATHS = ['app', 'components', 'hooks', 'lib', 'contexts'];

const PERMISSION_USAGE_PATTERNS = {
  'android.permission.ACCESS_COARSE_LOCATION': [
    'expo-location',
    'Location.requestForegroundPermissionsAsync',
  ],
  'android.permission.ACCESS_FINE_LOCATION': [
    'expo-location',
    'Location.requestForegroundPermissionsAsync',
  ],
  'android.permission.POST_NOTIFICATIONS': [
    'expo-notifications',
    'Notifications.requestPermissionsAsync',
  ],
  'android.permission.READ_EXTERNAL_STORAGE': [
    'ImagePicker.requestMediaLibraryPermissionsAsync',
    'MediaLibrary.requestPermissionsAsync',
  ],
  'android.permission.WRITE_EXTERNAL_STORAGE': [
    'MediaLibrary.saveToLibraryAsync',
  ],
  'android.permission.READ_MEDIA_VISUAL_USER_SELECTED': [
    'ImagePicker.requestMediaLibraryPermissionsAsync',
    'MediaLibrary.requestPermissionsAsync',
  ],
  'android.permission.READ_MEDIA_IMAGES': [
    'mediaTypes: [\'images\']',
  ],
  'android.permission.INTERNET': [
    'axios.create(',
  ],
};

const FORBIDDEN_CODE_PATTERNS = [
  {
    label: 'camera API usage',
    patterns: ['launchCameraAsync', 'requestCameraPermissionsAsync', 'expo-camera'],
  },
  {
    label: 'microphone/audio recording API usage',
    patterns: ['requestRecordingPermissionsAsync', 'Audio.Recording', 'expo-audio', 'expo-av'],
  },
];

const AUTH_FLOW_FILES = [
  'app/(auth)/register.tsx',
  'app/(auth)/login.tsx',
];

function readJson(path) {
  const file = readFileSync(path, 'utf8');
  return JSON.parse(file);
}

function getPluginConfig(plugins, pluginName) {
  for (const plugin of plugins) {
    if (typeof plugin === 'string' && plugin === pluginName) {
      return {};
    }
    if (Array.isArray(plugin) && plugin[0] === pluginName) {
      return plugin[1] ?? {};
    }
  }
  return null;
}

function isHttpsUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function findPatternInCodebase(pattern) {
  try {
    const output = execSync(
      `rg -n -F -- "${pattern}" ${CODEBASE_SEARCH_PATHS.join(' ')}`,
      {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    );
    return output.trim();
  } catch {
    return '';
  }
}

function hasAnyPatternInCodebase(patterns) {
  for (const pattern of patterns) {
    if (findPatternInCodebase(pattern)) {
      return true;
    }
  }
  return false;
}

function main() {
  const errors = [];
  const warnings = [];

  const appConfigPath = resolve(process.cwd(), 'app.json');
  const easConfigPath = resolve(process.cwd(), 'eas.json');
  const appConfig = readJson(appConfigPath);
  const easConfig = readJson(easConfigPath);

  const expo = appConfig?.expo ?? {};
  const android = expo?.android ?? {};
  const plugins = Array.isArray(expo?.plugins) ? expo.plugins : [];
  const easProduction = easConfig?.build?.production ?? {};
  const easProductionAndroid = easProduction?.android ?? {};

  if (typeof android.package !== 'string' || android.package.trim().length === 0) {
    errors.push('`expo.android.package` wajib diisi di app.json.');
  }

  if (!Number.isInteger(android.versionCode) || android.versionCode <= 0) {
    errors.push('`expo.android.versionCode` harus integer > 0 di app.json.');
  }

  if (easProduction.distribution !== 'store') {
    errors.push('`build.production.distribution` di eas.json harus `store`.');
  }

  if (easProductionAndroid.buildType !== 'app-bundle') {
    errors.push('`build.production.android.buildType` di eas.json harus `app-bundle`.');
  }

  if (easProductionAndroid.autoIncrement !== true) {
    errors.push('`build.production.android.autoIncrement` di eas.json harus `true`.');
  }

  const imagePickerPlugin = getPluginConfig(plugins, 'expo-image-picker');
  if (imagePickerPlugin === null) {
    errors.push('Plugin `expo-image-picker` harus dikonfigurasi eksplisit di app.json.');
  } else {
    if (imagePickerPlugin.cameraPermission !== false) {
      errors.push('`expo-image-picker.cameraPermission` harus `false`.');
    }
    if (imagePickerPlugin.microphonePermission !== false) {
      errors.push('`expo-image-picker.microphonePermission` harus `false`.');
    }
  }

  const mediaLibraryPlugin = getPluginConfig(plugins, 'expo-media-library');
  if (mediaLibraryPlugin === null) {
    errors.push('Plugin `expo-media-library` harus dikonfigurasi eksplisit di app.json.');
  } else {
    const granularPermissions = Array.isArray(mediaLibraryPlugin.granularPermissions)
      ? mediaLibraryPlugin.granularPermissions
      : [];
    if (
      granularPermissions.length !== 1 ||
      granularPermissions[0] !== 'photo'
    ) {
      errors.push('`expo-media-library.granularPermissions` harus tepat `["photo"]`.');
    }
  }

  const rawIntrospect = execSync('npx expo config --type introspect --json', {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const introspect = JSON.parse(rawIntrospect);
  const finalPermissions = introspect?.android?.permissions ?? [];
  const finalBlockedPermissions = introspect?.android?.blockedPermissions ?? [];

  const unexpectedPermissions = finalPermissions.filter(
    (permission) => !EXPECTED_ALLOWED_PERMISSIONS.includes(permission)
  );
  if (unexpectedPermissions.length > 0) {
    errors.push(
      `Permission Android tidak di-allowlist: ${unexpectedPermissions.join(', ')}.`
    );
  }

  const missingAllowedPermissions = EXPECTED_ALLOWED_PERMISSIONS.filter(
    (permission) => !finalPermissions.includes(permission)
  );
  if (missingAllowedPermissions.length > 0) {
    errors.push(
      `Permission Android expected tidak ditemukan: ${missingAllowedPermissions.join(', ')}.`
    );
  }

  const missingBlockedPermissions = REQUIRED_BLOCKED_PERMISSIONS.filter(
    (permission) => !finalBlockedPermissions.includes(permission)
  );
  if (missingBlockedPermissions.length > 0) {
    errors.push(
      `blockedPermissions belum lengkap: ${missingBlockedPermissions.join(', ')}.`
    );
  }

  const sensitivePermissionsInUse = finalPermissions.filter((permission) =>
    POLICY_SENSITIVE_PERMISSIONS.has(permission)
  );

  for (const permission of finalPermissions) {
    const patterns = PERMISSION_USAGE_PATTERNS[permission];
    if (!patterns) continue;
    if (!hasAnyPatternInCodebase(patterns)) {
      errors.push(
        `Permission ${permission} tidak ditemukan jejak pemakaiannya di codebase.`
      );
    }
  }

  for (const forbidden of FORBIDDEN_CODE_PATTERNS) {
    if (hasAnyPatternInCodebase(forbidden.patterns)) {
      errors.push(`Terdeteksi ${forbidden.label} di codebase, padahal harus nonaktif.`);
    }
  }

  const privacyPolicyUrl =
    process.env.PLAYSTORE_PRIVACY_POLICY_URL ??
    process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL ??
    expo?.extra?.privacyPolicyUrl;

  if (sensitivePermissionsInUse.length > 0 && !isHttpsUrl(privacyPolicyUrl ?? '')) {
    errors.push(
      'URL privacy policy wajib tersedia (HTTPS). Set `PLAYSTORE_PRIVACY_POLICY_URL` saat build production.'
    );
  }

  if (!privacyPolicyUrl) {
    warnings.push(
      'URL privacy policy belum terdeteksi di env/config. Build production akan gagal jika permission sensitif aktif.'
    );
  }

  const hasAuthFlow = AUTH_FLOW_FILES.some((file) =>
    existsSync(resolve(process.cwd(), file))
  );
  const hasAccountDeletionFlow = hasAnyPatternInCodebase([
    'hapus akun',
    'delete account',
    'deleteAccount',
    'removeAccount',
    'request account deletion',
  ]);
  const accountDeletionUrl =
    process.env.PLAYSTORE_ACCOUNT_DELETION_URL ??
    expo?.extra?.accountDeletionUrl;

  if (hasAuthFlow && !hasAccountDeletionFlow) {
    warnings.push(
      'Flow login/register terdeteksi, tetapi belum ditemukan flow hapus akun di app.'
    );
  }

  if (hasAuthFlow && !isHttpsUrl(accountDeletionUrl ?? '')) {
    warnings.push(
      'Set `PLAYSTORE_ACCOUNT_DELETION_URL` (HTTPS) untuk kebutuhan Data deletion di Play Console.'
    );
  }

  if (warnings.length > 0) {
    for (const warning of warnings) {
      console.warn(`WARNING: ${warning}`);
    }
  }

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`ERROR: ${error}`);
    }
    process.exit(1);
  }

  console.log('Play Store preflight passed.');
  console.log(`Final Android permissions: ${finalPermissions.join(', ')}`);
}

main();
