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
      includeAssets: ["logo.svg", "precify-mark.svg", "precify-logo-white.svg", "precify-signature.png", "favicon.svg", "precify-icon-192.png", "precify-icon-512.png", "apple-touch-icon.png"],
      manifest: {
        name: "Precify",
        short_name: "Precify",
        description: "Busca de produtos por especificações técnicas.",
        theme_color: "#006b4f",
        background_color: "#006b4f",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/precify-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/precify-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }
        ]
      }
    })
  ]
});
