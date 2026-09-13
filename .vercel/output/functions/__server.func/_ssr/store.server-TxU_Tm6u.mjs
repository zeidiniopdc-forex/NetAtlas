import { createSeedStore } from "./seed-Bnv_Vk7Z.mjs";
import { dirname, join } from "node:path";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
//#region node_modules/.nitro/vite/services/ssr/assets/store.server-TxU_Tm6u.js
var FILE_NAME = "inventory.json";
var memory = null;
var persistPath = null;
var writable = true;
var chain = Promise.resolve();
function withLock(fn) {
	const run = chain.then(fn, fn);
	chain = run.then(() => void 0, () => void 0);
	return run;
}
function candidateDirs() {
	const list = [
		process.env.INVENTORY_DATA_DIR?.trim(),
		join(process.cwd(), "data"),
		"/tmp/netatlas-data"
	].filter((d) => Boolean(d));
	return [...new Set(list)];
}
async function atomicWrite(path, json) {
	const tmp = `${path}.${process.pid}.tmp`;
	await mkdir(dirname(path), { recursive: true });
	await writeFile(tmp, json, "utf8");
	await rename(tmp, path);
}
async function tryLoad(path) {
	try {
		const raw = await readFile(path, "utf8");
		const parsed = JSON.parse(raw);
		if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.records)) return null;
		return parsed;
	} catch {
		return null;
	}
}
async function resolveStore() {
	if (memory) return memory;
	for (const dir of candidateDirs()) {
		const path = join(dir, FILE_NAME);
		const loaded = await tryLoad(path);
		if (loaded) {
			persistPath = path;
			memory = loaded;
			return loaded;
		}
	}
	const seed = createSeedStore();
	memory = seed;
	await persist(seed);
	return seed;
}
async function persist(store) {
	const payload = JSON.stringify(store, null, 2);
	const dirs = persistPath ? [dirname(persistPath), ...candidateDirs()] : candidateDirs();
	for (const dir of dirs) {
		const path = join(dir, FILE_NAME);
		try {
			await atomicWrite(path, payload);
			persistPath = path;
			writable = true;
			return;
		} catch {
			continue;
		}
	}
	writable = false;
}
async function readStore() {
	return withLock(resolveStore);
}
async function writeStore(mutator) {
	return withLock(async () => {
		const next = mutator(await resolveStore());
		next.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
		next.version = 1;
		memory = next;
		await persist(next);
		return next;
	});
}
async function listRecords() {
	return (await readStore()).records;
}
function storageInfo() {
	return {
		path: persistPath,
		writable
	};
}
//#endregion
export { listRecords, readStore, storageInfo, writeStore };
