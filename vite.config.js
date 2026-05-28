import { defineConfig } from "vite";
import { resolve } from "path";
import { cpSync, existsSync } from "fs";

const legacyStaticDirs = ["js", "images", "videos"];

function copyLegacyStaticAssets() {
  return {
    name: "copy-legacy-static-assets",
    closeBundle() {
      legacyStaticDirs.forEach((dir) => {
        if (existsSync(resolve(__dirname, dir))) {
          cpSync(resolve(__dirname, dir), resolve(__dirname, "dist", dir), {
            recursive: true
          });
        }
      });
    }
  };
}

export default defineConfig({
  root: "./",
  plugins: [copyLegacyStaticAssets()],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        collections: resolve(__dirname, "collections.html"),
        product: resolve(__dirname, "product.html"),
        bespoke: resolve(__dirname, "bespoke.html"),
        heritage: resolve(__dirname, "heritage.html"),
        contact: resolve(__dirname, "contact.html"),
        admin: resolve(__dirname, "admin", "index.html"),
        signature: resolve(__dirname, "signature-collection.html"),
        housePiece: resolve(__dirname, "house-piece.html"),
      }
    }
  }
});
