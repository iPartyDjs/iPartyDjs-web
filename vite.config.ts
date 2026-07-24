import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import babel from "@rolldown/plugin-babel";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tsconfigPaths(),
        babel({ presets: [reactCompilerPreset()] }),
    ],
    resolve: {
        alias: {
            // Esto le dice a Vite que "@" apunta a la carpeta "src" de tu proyecto
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
