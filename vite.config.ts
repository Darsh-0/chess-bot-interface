import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      external: ['/AppBundle/_framework/dotnet.js', '/AppBundle/_framework-v2/dotnet.js'],
    }
  },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp"
    },
    fs: {
      allow: ['..']
    }
  },
  optimizeDeps: {
    exclude: ['./src/api/AppBundle/_framework/dotnet.js', './src/api/AppBundle/_framework-v2/dotnet.js']
  },
  assetsInclude: ['**/*.wasm']
})