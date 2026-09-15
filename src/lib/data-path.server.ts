import { access, mkdir, constants as fsConstants } from "node:fs/promises";
import { isAbsolute, join, normalize, resolve } from "node:path";

const globalRef = globalThis as typeof globalThis & {
  __netatlasDataRoot__?: string;
};

/**
 * Resolve INVENTORY_DATA_DIR for Windows IIS.
 * Prefer forward slashes in web.config: D:/NetAtlas/data
 */
export function dataRoot(): string {
  if (globalRef.__netatlasDataRoot__) return globalRef.__netatlasDataRoot__;

  let env = process.env.INVENTORY_DATA_DIR?.trim() ?? "";
  if (
    (env.startsWith('"') && env.endsWith('"')) ||
    (env.startsWith("'") && env.endsWith("'"))
  ) {
    env = env.slice(1, -1).trim();
  }
  env = env.replace(/\\/g, "/");

  let root: string;
  if (env) {
    root = isAbsolute(env) ? normalize(env) : resolve(process.cwd(), env);
  } else {
    root = resolve(process.cwd(), "data");
  }
  globalRef.__netatlasDataRoot__ = root;
  return root;
}

export function dataFile(name: string): string {
  return join(dataRoot(), name);
}

export async function ensureDataDir(): Promise<string> {
  const root = dataRoot();
  try {
    await mkdir(root, { recursive: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(
      `نمی‌توان پوشه داده را ساخت: ${root}\n` +
        `در web.config مقدار INVENTORY_DATA_DIR را مثل D:/NetAtlas/data بگذارید ` +
        `و به IIS AppPool حق Modify بدهید.\n(${msg})`,
    );
  }
  try {
    await access(root, fsConstants.R_OK | fsConstants.W_OK);
  } catch {
    throw new Error(
      `پوشه داده قابل‌نوشتن نیست: ${root}\n` +
        `به هویت App Pool (IIS AppPool\\نام‌سایت) دسترسی Modify بدهید.`,
    );
  }
  return root;
}
