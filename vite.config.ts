import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  server: {
    host: true,
    allowedHosts: [".ngrok-free.app", ".trycloudflare.com"]
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: { enabled: false },
      includeAssets: ["logo.svg", "precify-mark.svg", "precify-logo-white.svg", "precify-logo-green.svg", "precify-signature.png", "favicon.svg", "precify-icon-full.svg", "apple-touch-icon.png"],
      manifest: {
        name: "Precify",
        short_name: "Precify",
        description: "Busca de produtos por especificações técnicas.",
        theme_color: "#006b4f",
        background_color: "#f7faf9",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/precify-icon-full.svg?v=4", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }
        ]
      }
    })
  ]
});
