import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/query-BMySnmUv.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getInventory = createServerFn({ method: "GET" }).handler(createSsrRpc("57948d313498545f3ee2a23248de965c8cf3cb59ec12c64a57711c89415b3176"));
var searchInventory = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("303d13ee602ac6302f26b896565d01afa3d91278470332aedd5117db71a0a901"));
var upsertRecord = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("0cc7481f89b721281d713aa5330c57818e68b63e533611a8fd38958747ada6ed"));
var removeRecord = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("5fc0256170e9c6e05fe56c6cb3e9af03ac19a51b0a7f5ee1edd532470c81bba5"));
var importRecords = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("29a4d0ccdc4e54a6b5fa85e10009f6a01d415714a8e41bce30ceb78da42ce8d3"));
var resetSeed = createServerFn({ method: "POST" }).handler(createSsrRpc("e95d6d47a020c6b60c01a3bd35402720a77411d3ddfabcb6a6896f8a25bb8ba7"));
var inventoryKey = ["inventory"];
function useInventory() {
	return useQuery({
		queryKey: inventoryKey,
		queryFn: () => getInventory(),
		staleTime: 8e3
	});
}
function useRelationSearch(q) {
	return useQuery({
		queryKey: ["search", q],
		queryFn: () => searchInventory({ data: { q } }),
		enabled: q.trim().length > 0
	});
}
function useInventoryMutations() {
	const qc = useQueryClient();
	const invalidate = () => qc.invalidateQueries({ queryKey: inventoryKey });
	return {
		upsert: useMutation({
			mutationFn: (record) => upsertRecord({ data: record }),
			onSuccess: invalidate
		}),
		remove: useMutation({
			mutationFn: (id) => removeRecord({ data: { id } }),
			onSuccess: invalidate
		}),
		ingest: useMutation({
			mutationFn: (payload) => importRecords({ data: payload }),
			onSuccess: invalidate
		}),
		seed: useMutation({
			mutationFn: () => resetSeed(),
			onSuccess: invalidate
		})
	};
}
//#endregion
export { useInventoryMutations as n, useRelationSearch as r, useInventory as t };
