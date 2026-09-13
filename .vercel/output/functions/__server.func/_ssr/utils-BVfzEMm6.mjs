import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/utils-BVfzEMm6.js
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function faDate(iso) {
	if (!iso) return "—";
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "—";
	return d.toLocaleString("fa-IR", {
		dateStyle: "medium",
		timeStyle: "short"
	});
}
function uid(prefix = "id") {
	if (typeof crypto !== "undefined" && crypto.randomUUID) return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
	return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
//#endregion
export { faDate as n, uid as r, cn as t };
