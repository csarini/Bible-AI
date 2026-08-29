import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.santuario.biblia',
  appName: 'Biblia Inteligente',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
