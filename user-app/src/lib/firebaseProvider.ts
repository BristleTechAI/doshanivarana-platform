import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { AUTH_MODE } from '../config/authConfig';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';

// Centralized Firebase provider helper for Auth and Firestore.
// authProvider → always DEMO (mock login, any 10-digit + 4-digit OTP)
// firestoreProvider → Real Firestore via compat Web SDK on Web, native SDK on Native

export const authProvider: () => FirebaseAuthTypes.Module = (() => {
  const fn = () => {
    // Keep Demo Login exactly as-is for all platforms
    return require('./firebase').auth();
  };
  return fn;
})();

export const firestoreProvider: any = (() => {
  let useNative = false;
  const isExpoGo = Constants.appOwnership === 'expo';

  if (Platform.OS !== 'web' && !isExpoGo) {
    try {
      require('@react-native-firebase/app');
      require('@react-native-firebase/firestore');
      useNative = true;
    } catch (e) {
      console.warn('[Firebase Provider] Native Firebase modules not available, falling back to Web SDK.');
    }
  }

  const fn = () => {
    if (useNative) {
      return require('@react-native-firebase/firestore').default();
    } else {
      // Use Firebase compat layer - same .collection().get() API as native SDK
      const { webFirestore } = require('../config/firebaseWebConfig');
      return webFirestore();
    }
  };

  Object.defineProperty(fn, 'FieldValue', {
    get() {
      if (useNative) {
        return require('@react-native-firebase/firestore').default.FieldValue;
      } else {
        const firebase = require('firebase/compat/app').default;
        return firebase.firestore.FieldValue;
      }
    },
    configurable: true,
    enumerable: true,
  });

  Object.defineProperty(fn, 'Timestamp', {
    get() {
      if (useNative) {
        return require('@react-native-firebase/firestore').default.Timestamp;
      } else {
        const firebase = require('firebase/compat/app').default;
        return firebase.firestore.Timestamp;
      }
    },
    configurable: true,
    enumerable: true,
  });

  return fn as any;
})();
