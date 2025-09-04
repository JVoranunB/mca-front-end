import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProduction = mode === 'production'
  const isUat = mode === 'uat'
  const isDevelopment = mode === 'development'

  return {
    plugins: [react()],
    
    // Base URL for assets - important for CloudFront deployment
    base: env.VITE_BASE_URL || '/',
    
    // Build configuration
    build: {
      outDir: 'dist',
      sourcemap: isProduction || isUat ? 'hidden' : true,
      minify: isProduction || isUat ? 'esbuild' : false,
      target: 'esnext',
      
      // Optimize chunk splitting for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks for better caching
            react: ['react', 'react-dom'],
            polaris: ['@shopify/polaris', '@shopify/polaris-icons'],
            reactflow: ['@xyflow/react', 'reactflow'],
            router: ['react-router-dom'],
            utils: ['zustand', 'clsx', 'lucide-react']
          },
          // Consistent file naming for CloudFront caching
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.')
            const ext = info[info.length - 1]
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `assets/images/[name]-[hash][extname]`
            } else if (/css/i.test(ext)) {
              return `assets/css/[name]-[hash][extname]`
            } else if (/woff2?|eot|ttf|otf/i.test(ext)) {
              return `assets/fonts/[name]-[hash][extname]`
            }
            return `assets/[ext]/[name]-[hash][extname]`
          }
        }
      },
      
      // Compression and optimization settings
      cssCodeSplit: true,
      assetsInlineLimit: 4096,
      
      // Report compressed file sizes
      reportCompressedSize: isProduction,
      
      // Chunk size warnings
      chunkSizeWarningLimit: 1000
    },
    
    // Server configuration for development
    server: {
      port: 5173,
      host: true,
      cors: true
    },
    
    // Preview server configuration
    preview: {
      port: 4173,
      host: true,
      cors: true
    },
    
    // Environment variables configuration
    envPrefix: 'VITE_',
    
    // Path resolution
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@components': resolve(__dirname, './src/components'),
        '@pages': resolve(__dirname, './src/pages'),
        '@types': resolve(__dirname, './src/types'),
        '@store': resolve(__dirname, './src/store'),
        '@data': resolve(__dirname, './src/data'),
        '@utils': resolve(__dirname, './src/utils')
      }
    },
    
    // Define global constants
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_MODE__: JSON.stringify(mode),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString())
    },
    
    // Optimization for different environments
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@shopify/polaris',
        '@xyflow/react',
        'zustand'
      ]
    },
    
    // CSS configuration
    css: {
      devSourcemap: isDevelopment,
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@shopify/polaris/build/esm/styles";`
        }
      }
    },
    
    // ESBuild configuration for faster builds
    esbuild: {
      drop: isProduction ? ['console', 'debugger'] : [],
      legalComments: 'none'
    }
  }
})
