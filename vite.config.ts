import { defineConfig, loadEnv, type ConfigEnv, type UserConfig  } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode } : ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd())
  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    },
    plugins: [
      vue(),
      UnoCSS()
    ],
    server: {
      port: 5173,
      host: env.VITE_HOST || 'localhost',
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        }
      }
    },
    build: {
      sourcemap: env.VITE_SOURCEMAP === 'true',
      minify: mode === 'production' ? 'terser' : false,
    },
    define: {
      __WEB_VERSION__: JSON.stringify(env.VITE_APP_ENV),
    }
  }
})
