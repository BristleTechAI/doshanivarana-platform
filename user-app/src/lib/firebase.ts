import app from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// React Native Firebase uses native google-services.json / GoogleService-Info.plist for initialization.
// We just need to export the services.

export { app, auth, firestore };
