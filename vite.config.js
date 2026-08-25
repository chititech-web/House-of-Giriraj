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
        worlds: resolve(__dirname, "worlds-of-giriraj.html"),
        crown: resolve(__dirname, "crown-collection.html"),
        emerald: resolve(__dirname, "emerald-court.html"),
        diamonds: resolve(__dirname, "house-of-diamonds.html"),
        ruby: resolve(__dirname, "ruby-salon.html"),
        heritageAtelier: resolve(__dirname, "heritage-atelier.html"),
        jasmine: resolve(__dirname, "jasmine-atelier.html"),
        product: resolve(__dirname, "product.html"),
        bespoke: resolve(__dirname, "bespoke.html"),
        heritage: resolve(__dirname, "heritage.html"),
        contact: resolve(__dirname, "contact.html"),
        admin: resolve(__dirname, "admin", "index.html"),
        housePiece: resolve(__dirname, "house-piece.html"),
        // 8 Hero Masterpiece Static Entry Points
        hero_maharaniCascade: resolve(__dirname, "house-of-diamonds/maharani-cascade/index.html"),
        hero_emeraldReverie: resolve(__dirname, "emerald-court/emerald-reverie/index.html"),
        hero_imperialDominion: resolve(__dirname, "crown-collection/imperial-dominion/index.html"),
        hero_royalEdict: resolve(__dirname, "crown-collection/royal-edict/index.html"),
        hero_regaliaCanopy: resolve(__dirname, "crown-collection/regalia-canopy/index.html"),
        hero_rubyAurora: resolve(__dirname, "ruby-salon/ruby-aurora/index.html"),
        hero_ceremonialBloom: resolve(__dirname, "heritage-atelier/ceremonial-bloom/index.html"),
        hero_morningDew: resolve(__dirname, "jasmine-atelier/morning-dew/index.html"),
      }
    }
  }
});
