import { cp, mkdir, access } from "node:fs/promises";
import { constants } from "node:fs";
import { resolve } from "node:path";

const source = resolve("node_modules/@mediapipe/tasks-vision/wasm");
const target = resolve("public/mediapipe/wasm");
await access(source, constants.R_OK);
await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true, force: true });
console.log("MediaPipe WASM assets copied to public/mediapipe/wasm");
