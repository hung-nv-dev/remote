import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'remote',
      filename: 'remoteEntry.js',
      exposes: {
        './RemoteButton': './src/components/RemoteButton.tsx',
        './FlowDiagram': './src/components/FlowDiagram.tsx',
        './App': './src/App.tsx',
      },
      shared: ['react', 'react-dom', 'antd', '@xyflow/react']
    })
  ],
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  },
  server: {
    port: 5001
  },
  preview: {
    port: 5001
  }
})
