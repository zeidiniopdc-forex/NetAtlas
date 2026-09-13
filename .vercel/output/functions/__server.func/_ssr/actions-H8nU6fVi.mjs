import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { r as computeStats, t as buildRelations } from "./relations-BoqAlv6o.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/actions-H8nU6fVi.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getInventory_createServerFn_handler = createServerRpc({
	id: "57948d313498545f3ee2a23248de965c8cf3cb59ec12c64a57711c89415b3176",
	name: "getInventory",
	filename: "src/lib/inventory/actions.ts"
}, (opts) => getInventory.__executeServer(opts));
var getInventory = createServerFn({ method: "GET" }).handler(getInventory_createServerFn_handler, async () => {
	const { listRecords, readStore, storageInfo } = await import("./store.server-TxU_Tm6u.mjs");
	const store = await readStore();
	const records = await listRecords();
	return {
		records,
		updatedAt: store.updatedAt,
		storage: storageInfo(),
		stats: computeStats(records)
	};
});
var searchInventory_createServerFn_handler = createServerRpc({
	id: "303d13ee602ac6302f26b896565d01afa3d91278470332aedd5117db71a0a901",
	name: "searchInventory",
	filename: "src/lib/inventory/actions.ts"
}, (opts) => searchInventory.__executeServer(opts));
var searchInventory = createServerFn({ method: "POST" }).validator((data) => data).handler(searchInventory_createServerFn_handler, async ({ data }) => {
	const { listRecords } = await import("./store.server-TxU_Tm6u.mjs");
	const records = await listRecords();
	return buildRelations(records, data.q ?? "");
});
var upsertRecord_createServerFn_handler = createServerRpc({
	id: "0cc7481f89b721281d713aa5330c57818e68b63e533611a8fd38958747ada6ed",
	name: "upsertRecord",
	filename: "src/lib/inventory/actions.ts"
}, (opts) => upsertRecord.__executeServer(opts));
var upsertRecord = createServerFn({ method: "POST" }).validator((data) => data).handler(upsertRecord_createServerFn_handler, async ({ data }) => {
	const { writeStore } = await import("./store.server-TxU_Tm6u.mjs");
	const now = (/* @__PURE__ */ new Date()).toISOString();
	return (await writeStore((s) => {
		const idx = s.records.findIndex((r) => r.id === data.id);
		const rec = {
			...data,
			updatedAt: now,
			createdAt: idx >= 0 ? s.records[idx].createdAt : data.createdAt || now
		};
		const records = [...s.records];
		if (idx >= 0) records[idx] = rec;
		else records.unshift(rec);
		return {
			...s,
			records
		};
	})).records;
});
var removeRecord_createServerFn_handler = createServerRpc({
	id: "5fc0256170e9c6e05fe56c6cb3e9af03ac19a51b0a7f5ee1edd532470c81bba5",
	name: "removeRecord",
	filename: "src/lib/inventory/actions.ts"
}, (opts) => removeRecord.__executeServer(opts));
var removeRecord = createServerFn({ method: "POST" }).validator((data) => data).handler(removeRecord_createServerFn_handler, async ({ data }) => {
	const { writeStore } = await import("./store.server-TxU_Tm6u.mjs");
	return (await writeStore((s) => ({
		...s,
		records: s.records.filter((r) => r.id !== data.id)
	}))).records;
});
var importRecords_createServerFn_handler = createServerRpc({
	id: "29a4d0ccdc4e54a6b5fa85e10009f6a01d415714a8e41bce30ceb78da42ce8d3",
	name: "importRecords",
	filename: "src/lib/inventory/actions.ts"
}, (opts) => importRecords.__executeServer(opts));
var importRecords = createServerFn({ method: "POST" }).validator((data) => data).handler(importRecords_createServerFn_handler, async ({ data }) => {
	const { writeStore } = await import("./store.server-TxU_Tm6u.mjs");
	const { mergeRecords } = await import("./excel-CJXkS3iW.mjs");
	const store = await writeStore((s) => {
		const records = data.mode === "replace" ? data.records : mergeRecords(s.records, data.records);
		return {
			...s,
			records
		};
	});
	return {
		count: store.records.length,
		updatedAt: store.updatedAt
	};
});
var resetSeed_createServerFn_handler = createServerRpc({
	id: "e95d6d47a020c6b60c01a3bd35402720a77411d3ddfabcb6a6896f8a25bb8ba7",
	name: "resetSeed",
	filename: "src/lib/inventory/actions.ts"
}, (opts) => resetSeed.__executeServer(opts));
var resetSeed = createServerFn({ method: "POST" }).handler(resetSeed_createServerFn_handler, async () => {
	const { writeStore } = await import("./store.server-TxU_Tm6u.mjs");
	const { createSeedStore } = await import("./seed-Bnv_Vk7Z.mjs");
	const seed = createSeedStore();
	await writeStore(() => seed);
	return seed;
});
//#endregion
export { getInventory_createServerFn_handler, importRecords_createServerFn_handler, removeRecord_createServerFn_handler, resetSeed_createServerFn_handler, searchInventory_createServerFn_handler, upsertRecord_createServerFn_handler };
