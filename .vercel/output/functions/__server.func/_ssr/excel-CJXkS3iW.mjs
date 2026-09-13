import { d as normalizeFa, f as statusFromCell, p as statusToCell, s as FIELD_LABELS } from "./fields-DbmUJ9eD.mjs";
import { r as uid } from "./utils-BVfzEMm6.mjs";
import { n as utils, r as writeFileSync, t as readSync } from "../_libs/xlsx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/excel-CJXkS3iW.js
var HEADER_ALIASES = {};
function addAlias(alias, key) {
	HEADER_ALIASES[normalizeFa(alias)] = key;
}
addAlias("طبقه", "floor");
addAlias("floor", "floor");
addAlias("شماره اتاق", "room");
addAlias("اتاق", "room");
addAlias("room", "room");
addAlias("نام کاربر", "userName");
addAlias("نام كاربر", "userName");
addAlias("کاربر", "userName");
addAlias("user", "userName");
addAlias("ردیف نود", "nodeRow");
addAlias("رديف نود", "nodeRow");
addAlias("شماره نود", "nodeNumber");
addAlias("نود", "nodeNumber");
addAlias("پچ پانل", "patchPanel");
addAlias("پچ پنل", "patchPanel");
addAlias("patchpanel", "patchPanel");
addAlias("پورت پچ پنل", "patchPort");
addAlias("پورت پچ پانل", "patchPort");
addAlias("موقعیت پچ پنل در رک", "patchRackPosition");
addAlias("موقعيت پچ پنل در رك", "patchRackPosition");
addAlias("موقعیت پچ پانل در رک", "patchRackPosition");
addAlias("سوئیچ", "switchName");
addAlias("سوئيچ", "switchName");
addAlias("switch", "switchName");
addAlias("اینترفیس سوئیچ", "switchInterface");
addAlias("اينترفيس سوئيچ", "switchInterface");
addAlias("اینترفیس", "switchInterface");
addAlias("شماره کابل", "cableNumber");
addAlias("شماره كابل", "cableNumber");
addAlias("کابل", "cableNumber");
addAlias("نام کامپیوتر", "computerName");
addAlias("نام كامپيوتر", "computerName");
addAlias("کامپیوتر", "computerName");
addAlias("نام کاربری ویندوز", "windowsUsername");
addAlias("نام كاربري ويندوز", "windowsUsername");
addAlias("ip", "ip");
addAlias("آی پی", "ip");
addAlias("vlan", "vlan");
addAlias("شبکه", "network");
addAlias("شبكه", "network");
addAlias("فغ", "status");
addAlias("ف غ", "status");
addAlias("وضعیت", "status");
addAlias("توضیحات", "notes");
addAlias("توضيحات", "notes");
addAlias("دسترسی های فایروال", "firewallAccess");
addAlias("دسترسیهای فایروال", "firewallAccess");
addAlias("فایروال", "firewallAccess");
addAlias("firewall", "firewallAccess");
var EXPORT_KEYS = [
	"floor",
	"room",
	"userName",
	"nodeRow",
	"nodeNumber",
	"patchPanel",
	"patchPort",
	"patchRackPosition",
	"switchName",
	"switchInterface",
	"cableNumber",
	"computerName",
	"windowsUsername",
	"ip",
	"vlan",
	"network",
	"status",
	"notes",
	"firewallAccess"
];
function serializeFirewall(list) {
	if (!list.length) return "";
	return list.map((f) => {
		const act = f.action === "deny" ? "deny" : "allow";
		const dest = f.destination ? `->${f.destination}` : "";
		const notes = f.notes ? `{${f.notes}}` : "";
		return `${f.service}:${f.protocol}/${f.port}${dest}(${act})${notes}`;
	}).join("; ");
}
function parseFirewall(raw) {
	if (!raw.trim()) return [];
	return raw.split(/[;\n]+/).map((part) => part.trim()).filter(Boolean).map((part) => {
		const notes = part.match(/\{([^}]*)\}/)?.[1] ?? "";
		const cleaned = part.replace(/\{[^}]*\}/, "").trim();
		const action = /deny/i.test(cleaned) ? "deny" : "allow";
		const destination = cleaned.match(/->([^(]+)/)?.[1]?.trim() ?? "";
		const protocol = cleaned.match(/\b(TCP|UDP|ICMP|ANY)\b/i)?.[1]?.toUpperCase() ?? "TCP";
		const port = cleaned.match(/\/(\d+(?:\s*-\s*\d+)?|any)/i)?.[1] ?? "";
		const service = cleaned.replace(/:.*$/, "").replace(/\(.*$/, "").trim() || "Service";
		return {
			id: uid("fw"),
			service,
			protocol,
			port,
			destination,
			action,
			notes
		};
	});
}
function cell(v) {
	if (v == null) return "";
	if (v instanceof Date) return v.toISOString();
	return String(v).trim();
}
function mapHeader(name) {
	const n = normalizeFa(name);
	if (!n) return null;
	if (n === "id" || n === "شناسه") return "id";
	return HEADER_ALIASES[n] ?? null;
}
function parseWorkbook(data) {
	const wb = readSync(data, {
		type: "array",
		cellDates: true
	});
	const sheetName = wb.SheetNames[0];
	if (!sheetName) return [];
	const sheet = wb.Sheets[sheetName];
	const rows = utils.sheet_to_json(sheet, {
		header: 1,
		defval: "",
		raw: false
	});
	if (!rows.length) return [];
	const headerRow = (rows[0] ?? []).map((h) => cell(h));
	const index = /* @__PURE__ */ new Map();
	headerRow.forEach((h, i) => {
		const key = mapHeader(h);
		if (key) index.set(i, key);
	});
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const records = [];
	for (const raw of rows.slice(1)) {
		const row = Array.isArray(raw) ? raw : [];
		const rec = {
			id: uid("rec"),
			floor: "",
			room: "",
			userName: "",
			nodeRow: "",
			nodeNumber: "",
			patchPanel: "",
			patchPort: "",
			patchRackPosition: "",
			switchName: "",
			switchInterface: "",
			cableNumber: "",
			computerName: "",
			windowsUsername: "",
			ip: "",
			vlan: "",
			network: "",
			status: "active",
			notes: "",
			firewallAccess: [],
			createdAt: now,
			updatedAt: now
		};
		let filled = false;
		for (const [i, key] of index.entries()) {
			const value = cell(row[i]);
			if (!value) continue;
			filled = true;
			if (key === "id") rec.id = value;
			else if (key === "status") rec.status = statusFromCell(value);
			else if (key === "firewallAccess") rec.firewallAccess = parseFirewall(value);
			else rec[key] = value;
		}
		if (filled) records.push(rec);
	}
	return records;
}
function buildWorkbook(records) {
	const headers = ["شناسه", ...EXPORT_KEYS.map((k) => FIELD_LABELS[k])];
	const data = records.map((r) => [r.id, ...EXPORT_KEYS.map((k) => {
		if (k === "status") return statusToCell(r.status);
		if (k === "firewallAccess") return serializeFirewall(r.firewallAccess);
		return r[k];
	})]);
	const ws = utils.aoa_to_sheet([headers, ...data]);
	ws["!cols"] = headers.map((h) => ({ wch: Math.min(28, Math.max(12, h.length + 4)) }));
	const wb = utils.book_new();
	utils.book_append_sheet(wb, ws, "Inventory");
	const fwRows = [[
		"شناسه رکورد",
		"کاربر",
		"IP",
		"سرویس",
		"پروتکل",
		"پورت",
		"مقصد",
		"عمل",
		"توضیح"
	]];
	for (const r of records) for (const f of r.firewallAccess) fwRows.push([
		r.id,
		r.userName,
		r.ip,
		f.service,
		f.protocol,
		f.port,
		f.destination,
		f.action,
		f.notes
	]);
	const fwSheet = utils.aoa_to_sheet(fwRows);
	utils.book_append_sheet(wb, fwSheet, "Firewall");
	return wb;
}
function downloadWorkbook(records, filename) {
	const wb = buildWorkbook(records);
	writeFileSync(wb, filename);
}
function mergeRecords(existing, incoming) {
	const keyOf = (r) => {
		const k = [
			r.ip,
			r.nodeNumber,
			r.switchInterface,
			r.computerName
		].map((s) => s.trim().toLowerCase()).join("|");
		if (k.replaceAll("|", "")) return `k:${k}`;
		return `id:${r.id}`;
	};
	const result = [...existing];
	const indexById = new Map(result.map((r, i) => [r.id, i]));
	const indexByKey = new Map(result.map((r, i) => [keyOf(r), i]));
	for (const rec of incoming) {
		const k = keyOf(rec);
		const idx = indexById.get(rec.id) ?? indexByKey.get(k);
		if (idx != null) {
			const prev = result[idx];
			result[idx] = {
				...prev,
				...rec,
				id: prev.id,
				createdAt: prev.createdAt,
				updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
				firewallAccess: rec.firewallAccess.length ? rec.firewallAccess : prev.firewallAccess
			};
		} else result.push({
			...rec,
			id: rec.id || uid("rec")
		});
	}
	return result;
}
//#endregion
export { downloadWorkbook, mergeRecords, parseWorkbook };
