import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React ecosystem
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // State management and data fetching
          'state-vendor': ['@tanstack/react-query', 'zustand'],
          // Animation library
          'animation-vendor': ['framer-motion'],
          // Gantt chart library (large)
          'gantt-vendor': ['gantt-task-react'],
          // Markdown processing
          'markdown-vendor': ['marked', 'turndown'],
          // AWS Amplify (large library)
          'aws-vendor': ['aws-amplify'],
          // Date utilities
          'date-vendor': ['date-fns'],
          // Rich text editor core
          'editor-core': ['@tiptap/react'],
          // Rich text editor extensions (heavy)
          'editor-extensions': ['@tiptap/starter-kit', '@tiptap/extension-code-block', '@tiptap/extension-code-block-lowlight', '@tiptap/extension-highlight', '@tiptap/extension-image', '@tiptap/extension-link', '@tiptap/extension-placeholder', '@tiptap/extension-strike', '@tiptap/extension-text-align', '@tiptap/extension-underline'],
          // HTTP client
          'http-vendor': ['axios'],
          // Real-time communication
          'socket-vendor': ['socket.io-client'],
          // Drag and drop
          'dnd-vendor': ['react-dnd', 'react-dnd-html5-backend'],
          // OIDC/OAuth
          'oidc-vendor': ['oidc-client-ts', 'react-oidc-context'],
          // UI Primitives (Radix) - common UI components
          'ui-primitives': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-popover', '@radix-ui/react-avatar', '@radix-ui/react-separator', '@radix-ui/react-select', '@radix-ui/react-tabs', '@radix-ui/react-scroll-area'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  define: {
    global: 'globalThis',
  },
})