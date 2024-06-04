import { defineConfig, loadEnv } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import vue from "@vitejs/plugin-vue";
import path from "path";

//api: https://console-docs.apipost.cn/preview/8562f238dbbadb76/a0f74af44ac1d5ba
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      createHtmlPlugin({
        inject: {
          data: {
            ...env,
          },
        },
      }),
      vue(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: "0.0.0.0",
      open: true,
      disableHostCheck: true,
      proxy: {
        "/api": {
          //请求称号
          // target: 'http://10.1.1.232:8000/api'
          target: "https://pi-ex-spot.pandora-demo.xyz/api", //请求的接口
          changeOrigin: true, //容许跨域
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
        "/static/upload": {
          //请求称号
          // target: 'http://10.1.1.232:8000/static/upload'
          target: "https://pi-ex-spot.pandora-demo.xyz/", //请求的接口
          changeOrigin: true, //容许跨域
        },
        "/socket": {
          //请求称号
          target: "https://pi-ex-spot.pandora-demo.xyz", //请求的接口
          changeOrigin: true, //容许跨域
          ws: true, // 开启websocket代理
        },
      },
    },
  };
});
