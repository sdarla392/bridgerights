import { expoClient } from '@better-auth/expo/client';
import { anonymousClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const AUTH_URL: string = 'https://auth-466ec213-880a-4099-bb40-f0b2e4e706f8-dev.api.newlyapp.com';
export const API_URL: string = 'https://api-466ec213-880a-4099-bb40-f0b2e4e706f8-dev.api.newlyapp.com';

export const BEARER_TOKEN_KEY = 'expobase_bearer_token';

const memoryStore = new Map<string, string>();

const nativeStorage = {
  getItem: (key: string): string | null => {
    try {
      const value = SecureStore.getItem(key);
      if (value != null) return value;
    } catch {}
    return memoryStore.get(key) ?? null;
  },
  getItemAsync: async (key: string): Promise<string | null> => nativeStorage.getItem(key),
  setItem: (key: string, value: string): void => {
    try {
      SecureStore.setItem(key, value);
      memoryStore.delete(key);
    } catch {
      memoryStore.set(key, value);
    }
  },
  setItemAsync: async (key: string, value: string): Promise<void> => nativeStorage.setItem(key, value),
  deleteItem: async (key: string) => {
    memoryStore.delete(key);
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {}
  },
};

const webStorage = {
  getItem: (key: string): string | null => localStorage.getItem(key),
  getItemAsync: async (key: string): Promise<string | null> => localStorage.getItem(key),
  setItem: (key: string, value: string): void => localStorage.setItem(key, value),
  setItemAsync: async (key: string, value: string): Promise<void> => localStorage.setItem(key, value),
  deleteItem: async (key: string) => localStorage.removeItem(key),
};

export const tokenStorage = Platform.OS === 'web' ? webStorage : nativeStorage;

export const authClient = createAuthClient({
  baseURL: AUTH_URL,
  plugins: [
    expoClient({ scheme: 'expobase', storagePrefix: 'expobase', storage: tokenStorage }),
    anonymousClient(),
  ],
  fetchOptions: {
    onSuccess: async (ctx: { response: Response }) => {
      const jwt = ctx.response.headers.get('set-auth-jwt');
      if (jwt) tokenStorage.setItem(BEARER_TOKEN_KEY, jwt);
    },
    ...(Platform.OS === 'web' && {
      credentials: 'include',
      auth: { type: 'Bearer' as const, token: () => localStorage.getItem(BEARER_TOKEN_KEY) || '' },
    }),
  },
});
