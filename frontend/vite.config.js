import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const __dirname = path.resolve();

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Force a single instance of aws-amplify across the entire application.
      'aws-amplify': path.resolve(__dirname, 'node_modules/aws-amplify'),
      // Remove specific alias for @aws-amplify/ui-react if it causes issues.
      // We will handle it with optimizeDeps.exclude instead.
      // '@aws-amplify/ui-react': path.resolve(__dirname, 'node_modules/@aws-amplify/ui-react'),
    },
  },
  optimizeDeps: {
    entries: [
      './src/main.jsx',
      './src/App.jsx',
      './src/pages/Dashboard.jsx',
    ],
    // Explicitly include core aws-amplify for pre-bundling.
    // This is the key part that needs to be a single instance.
    include: [
      'aws-amplify',
      '@aws-amplify/api',
      '@aws-amplify/auth',
    ],
    // Explicitly exclude @aws-amplify/ui-react from pre-bundling.
    // This often resolves the "Cannot optimize dependency" error for certain libraries.
    // It means Vite will process this dependency during the main build, not pre-bundle it.
    exclude: ['@aws-amplify/ui-react'],
  },
  ssr: {
    // Keep core Amplify packages in noExternal.
    // Exclude @aws-amplify/ui-react from noExternal if it's already in optimizeDeps.exclude,
    // or keep it if issues persist. For now, let's keep it here for robustness.
    noExternal: ['aws-amplify', '@aws-amplify/api', '@aws-amplify/auth', '@aws-amplify/ui-react'],
  },
});