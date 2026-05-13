import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["src/index.ts"],
	outDir: "build",
	format: ["esm", "cjs"],
	dts: true,
	sourcemap: false,
	clean: true,
	outputOptions: { exports: "named" },
});
