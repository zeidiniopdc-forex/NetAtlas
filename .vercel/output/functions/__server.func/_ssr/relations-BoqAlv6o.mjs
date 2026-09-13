import { l as STATUS_LABEL, m as vlanNumber, o as ENTITY_LABELS, s as FIELD_LABELS } from "./fields-DbmUJ9eD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/relations-BoqAlv6o.js
var SEARCH_FIELDS = [
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
	"notes"
];
function recordMatches(rec, rawQuery) {
	const q = rawQuery.trim().toLowerCase();
	if (!q) return false;
	if (rec.id.toLowerCase() === q) return true;
	if (rawQuery.trim() === STATUS_LABEL.active) return rec.status === "active";
	if (rawQuery.trim() === STATUS_LABEL.inactive) return rec.status === "inactive";
	for (const key of SEARCH_FIELDS) {
		const val = String(rec[key] ?? "").toLowerCase();
		if (val && val.includes(q)) return true;
	}
	return rec.firewallAccess.some((fw) => [
		fw.service,
		fw.protocol,
		fw.port,
		fw.destination,
		fw.action,
		fw.notes
	].join(" ").toLowerCase().includes(q));
}
function nodeId(kind, label) {
	return `${kind}:${label}`;
}
function pushNode(map, kind, label) {
	const trimmed = label.trim();
	if (!trimmed) return;
	const id = nodeId(kind, trimmed);
	const existing = map.get(id);
	if (existing) existing.count += 1;
	else map.set(id, {
		id,
		kind,
		label: trimmed,
		count: 1
	});
}
function link(edges, set, a, b) {
	if (!a || !b || a === b) return;
	const key = `${a}|${b}`;
	if (set.has(key)) return;
	set.add(key);
	edges.push({
		from: a,
		to: b
	});
}
function buildRelations(records, query) {
	const matched = query.trim() ? records.filter((r) => recordMatches(r, query)) : [];
	const nodes = /* @__PURE__ */ new Map();
	const edges = [];
	const seen = /* @__PURE__ */ new Set();
	for (const r of matched) {
		const floor = r.floor ? nodeId("floor", r.floor) : "";
		const room = r.room ? nodeId("room", r.room) : "";
		const user = r.userName ? nodeId("user", r.userName) : "";
		const node = r.nodeNumber ? nodeId("node", [r.nodeRow, r.nodeNumber].filter(Boolean).join("-")) : "";
		const patch = r.patchPanel ? nodeId("patch", r.patchPanel) : "";
		const port = r.patchPort ? nodeId("port", `${r.patchPanel || "PP"}:${r.patchPort}`) : "";
		const sw = r.switchName ? nodeId("switch", r.switchName) : "";
		const iface = r.switchInterface ? nodeId("iface", `${r.switchName || "SW"}:${r.switchInterface}`) : "";
		const cable = r.cableNumber ? nodeId("cable", r.cableNumber) : "";
		const pc = r.computerName ? nodeId("computer", r.computerName) : "";
		const win = r.windowsUsername ? nodeId("windows", r.windowsUsername) : "";
		const ip = r.ip ? nodeId("ip", r.ip) : "";
		const vlan = r.vlan ? nodeId("vlan", r.vlan) : "";
		const net = r.network ? nodeId("network", r.network) : "";
		pushNode(nodes, "floor", r.floor);
		pushNode(nodes, "room", r.room);
		pushNode(nodes, "user", r.userName);
		pushNode(nodes, "node", [r.nodeRow, r.nodeNumber].filter(Boolean).join("-"));
		pushNode(nodes, "patch", r.patchPanel);
		pushNode(nodes, "port", r.patchPort ? `${r.patchPanel || "PP"} / ${r.patchPort}` : "");
		pushNode(nodes, "switch", r.switchName);
		pushNode(nodes, "iface", r.switchInterface ? `${r.switchName} ${r.switchInterface}` : "");
		pushNode(nodes, "cable", r.cableNumber);
		pushNode(nodes, "computer", r.computerName);
		pushNode(nodes, "windows", r.windowsUsername);
		pushNode(nodes, "ip", r.ip);
		pushNode(nodes, "vlan", r.vlan);
		pushNode(nodes, "network", r.network);
		link(edges, seen, floor, room);
		link(edges, seen, room, user);
		link(edges, seen, user, pc);
		link(edges, seen, pc, ip);
		link(edges, seen, ip, vlan);
		link(edges, seen, vlan, net);
		link(edges, seen, user, node);
		link(edges, seen, node, patch);
		link(edges, seen, patch, port);
		link(edges, seen, port, cable);
		link(edges, seen, cable, iface);
		link(edges, seen, iface, sw);
		link(edges, seen, pc, win);
		for (const fw of r.firewallAccess) {
			const label = `${fw.action === "deny" ? "Deny " : ""}${fw.service} ${fw.protocol}/${fw.port}`;
			pushNode(nodes, "firewall", label);
			link(edges, seen, ip, nodeId("firewall", label));
		}
	}
	return {
		query,
		records: matched,
		nodes: [...nodes.values()],
		edges
	};
}
function computeStats(records) {
	const count = (key) => {
		const s = /* @__PURE__ */ new Set();
		for (const r of records) {
			const v = String(r[key] ?? "").trim();
			if (v) s.add(v);
		}
		return s.size;
	};
	const group = (key) => {
		const map = /* @__PURE__ */ new Map();
		for (const r of records) {
			const v = String(r[key] ?? "").trim() || "نامشخص";
			map.set(v, (map.get(v) ?? 0) + 1);
		}
		return [...map.entries()].map(([name, value]) => ({
			name,
			value
		})).sort((a, b) => b.value - a.value);
	};
	const bySwitchMap = /* @__PURE__ */ new Map();
	for (const r of records) {
		const name = r.switchName.trim() || "نامشخص";
		const cur = bySwitchMap.get(name) ?? {
			value: 0,
			active: 0
		};
		cur.value += 1;
		if (r.status === "active") cur.active += 1;
		bySwitchMap.set(name, cur);
	}
	const services = /* @__PURE__ */ new Map();
	let firewallRules = 0;
	for (const r of records) for (const fw of r.firewallAccess) {
		firewallRules += 1;
		const name = fw.service.trim() || "سایر";
		services.set(name, (services.get(name) ?? 0) + 1);
	}
	return {
		total: records.length,
		active: records.filter((r) => r.status === "active").length,
		inactive: records.filter((r) => r.status === "inactive").length,
		floors: count("floor"),
		switches: count("switchName"),
		vlans: count("vlan"),
		users: count("userName"),
		ips: count("ip"),
		computers: count("computerName"),
		firewallRules,
		byFloor: group("floor"),
		byVlan: group("vlan"),
		bySwitch: [...bySwitchMap.entries()].map(([name, v]) => ({
			name,
			...v
		})).sort((a, b) => b.value - a.value),
		byNetwork: group("network"),
		topServices: [...services.entries()].map(([name, value]) => ({
			name,
			value
		})).sort((a, b) => b.value - a.value).slice(0, 8)
	};
}
function buildTrace(rec) {
	const steps = [];
	const add = (kind, label, hint = "") => {
		if (!label.trim()) return;
		steps.push({
			kind,
			label: label.trim(),
			hint
		});
	};
	add("floor", rec.floor, FIELD_LABELS.floor);
	add("room", rec.room, FIELD_LABELS.room);
	add("user", rec.userName, FIELD_LABELS.userName);
	add("computer", rec.computerName, FIELD_LABELS.computerName);
	add("windows", rec.windowsUsername, FIELD_LABELS.windowsUsername);
	add("ip", rec.ip, FIELD_LABELS.ip);
	add("vlan", rec.vlan, FIELD_LABELS.vlan);
	add("network", rec.network, FIELD_LABELS.network);
	add("node", [rec.nodeRow, rec.nodeNumber].filter(Boolean).join(" / "), "نود");
	add("patch", rec.patchPanel, FIELD_LABELS.patchPanel);
	add("port", rec.patchPort, FIELD_LABELS.patchPort);
	add("cable", rec.cableNumber, FIELD_LABELS.cableNumber);
	add("switch", rec.switchName, FIELD_LABELS.switchName);
	add("iface", rec.switchInterface, FIELD_LABELS.switchInterface);
	if (rec.firewallAccess.length) add("firewall", rec.firewallAccess.map((f) => f.service).filter(Boolean).join("، "), "دسترسی فایروال");
	return steps;
}
function generateSwitchportConfig(rec) {
	const vlan = vlanNumber(rec.vlan) || "1";
	const desc = [
		rec.floor && `F${rec.floor}`,
		rec.room,
		rec.userName || rec.computerName
	].filter(Boolean).join("-");
	const iface = rec.switchInterface || "GigabitEthernet1/0/1";
	const lines = [
		`! NetAtlas — ${rec.switchName || "switch"} / ${desc}`,
		`interface ${iface}`,
		` description ${desc || "endpoint"}`
	];
	if (rec.vlan.includes("VoIP") || rec.vlan.includes("۳۰") || rec.vlan.startsWith("30")) lines.push(` switchport mode access`, ` switchport access vlan ${vlan}`, ` switchport voice vlan ${vlan}`, ` spanning-tree portfast`);
	else lines.push(` switchport mode access`, ` switchport access vlan ${vlan}`, ` spanning-tree portfast`, ` spanning-tree bpduguard enable`);
	if (rec.status === "inactive") lines.push(" shutdown");
	else lines.push(" no shutdown");
	lines.push("exit");
	return lines.join("\n");
}
function entityKindLabel(kind) {
	return ENTITY_LABELS[kind];
}
//#endregion
export { generateSwitchportConfig as a, entityKindLabel as i, buildTrace as n, recordMatches as o, computeStats as r, buildRelations as t };
