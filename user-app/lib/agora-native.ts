import { Platform } from 'react-native';
import Constants from 'expo-constants';

const isExpoGo = Constants?.appOwnership === 'expo' || Constants?.executionEnvironment === 'storeClient';
const isWeb = Platform.OS === 'web';

let createAgoraRtcEngine: any = null;
let ChannelProfileType: any = null;
let RtcSurfaceView: any = null;

if (!isExpoGo && !isWeb) {
  try {
    const agora = require('react-native-agora');
    createAgoraRtcEngine = agora.createAgoraRtcEngine;
    ChannelProfileType = agora.ChannelProfileType;
    RtcSurfaceView = agora.RtcSurfaceView;
  } catch (e) {
    console.warn('[Agora Native] Failed to load react-native-agora:', e);
  }
}

export { createAgoraRtcEngine, ChannelProfileType, RtcSurfaceView };
