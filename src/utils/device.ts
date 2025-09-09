// src/utils/device.ts
import * as Application from 'expo-application';
import * as Crypto from 'expo-crypto';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';

const DEVICE_UUID_KEY = 'device_uuid';

function bytesToUuidV4(bytes: Uint8Array): string {
  const b = Uint8Array.from(bytes);
  b[6] = (b[6] & 0x0f) | 0x40; // version 4
  b[8] = (b[8] & 0x3f) | 0x80; // variant
  const hex = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

async function generateUuid(): Promise<string> {
  const maybeRandomUUID = (Crypto as any)?.randomUUID;
  if (typeof maybeRandomUUID === 'function') {
    return maybeRandomUUID() as string;
  }
  const bytes = await Crypto.getRandomBytesAsync(16);
  return bytesToUuidV4(bytes);
}

export async function getOrCreateDeviceUuid(): Promise<string> {
  const existing = await SecureStore.getItemAsync(DEVICE_UUID_KEY);
  if (existing) return existing;
  const uuid = await generateUuid();
  await SecureStore.setItemAsync(DEVICE_UUID_KEY, uuid);
  return uuid;
}

export async function buildDevicePayload(): Promise<{
  name?: string | null;
  platform: string;
  operating_system: string;
  os_version: string;
  manufacturer: string;
  model: string;
  web_view_version?: string | null;
  app_version?: string | null; // Application.nativeApplicationVersion
  is_virtual: boolean;
  push_token?: string | null;
}> {
  const platform =
    (Device.osName?.toLowerCase() as 'ios' | 'android' | string) ??
    (Device.platformApiLevel ? 'android' : 'unknown');

  const appVersion = Application.nativeApplicationVersion ?? null; // iOS: CFBundleShortVersionString, Android: versionName

  return {
    name: Device.deviceName ?? null,
    platform,
    operating_system: platform,
    os_version: Device.osVersion ?? 'unknown',
    manufacturer: Device.manufacturer ?? 'unknown',
    model: Device.modelName ?? 'unknown',
    web_view_version: null,
    app_version: appVersion,
    is_virtual: !Device.isDevice,
    push_token: null, // wire expo-notifications later
  };
}
