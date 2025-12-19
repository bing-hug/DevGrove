import { defineConfig, loadEnv, type ConfigEnv, type UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd())
  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    plugins: [
      vue(),
      UnoCSS(),
      Components({
        resolvers: [IconsResolver()]
      }),
      Icons(),
      AutoImport({
        imports: ['vue', 'vue-router', 'vue-i18n', '@vueuse/core', 'pinia'],
        dts: 'types/auto-imports.d.ts',
        dirs: ['src/stores', 'src/composables', 'src/hooks'],
        eslintrc: {
          enabled: false,
          filepath: './.eslintrc-auto-import.json', // 明确指定文件路径
          globalsPropValue: true
        }
      })
    ],
    server: {
      port: 5173,
      host: env.VITE_HOST || 'localhost',
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    build: {
      sourcemap: env.VITE_SOURCEMAP === 'true',
      minify: mode === 'production' ? 'terser' : false
    },
    define: {
      __WEB_VERSION__: JSON.stringify(env.VITE_APP_ENV)
    }
  }
})
