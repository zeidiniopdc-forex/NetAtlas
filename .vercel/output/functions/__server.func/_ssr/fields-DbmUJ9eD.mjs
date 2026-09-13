//#region node_modules/.nitro/vite/services/ssr/assets/fields-DbmUJ9eD.js
var APP_NAME = "NetAtlas";
var APP_TAGLINE = "سامانه مدیریت زیرساخت شبکه";
var FIELD_LABELS = {
	floor: "طبقه",
	room: "شماره اتاق",
	userName: "نام کاربر",
	nodeRow: "ردیف نود",
	nodeNumber: "شماره نود",
	patchPanel: "پچ پانل",
	patchPort: "پورت پچ پنل",
	patchRackPosition: "موقعیت پچ پنل در رک",
	switchName: "سوئیچ",
	switchInterface: "اینترفیس سوئیچ",
	cableNumber: "شماره کابل",
	computerName: "نام کامپیوتر",
	windowsUsername: "نام کاربری ویندوز",
	ip: "IP",
	vlan: "VLAN",
	network: "شبکه",
	status: "ف / غ",
	notes: "توضیحات",
	firewallAccess: "دسترسی‌های فایروال"
};
var ENTITY_LABELS = {
	floor: "طبقه",
	room: "اتاق",
	user: "کاربر",
	node: "نود",
	patch: "پچ پنل",
	port: "پورت",
	switch: "سوئیچ",
	iface: "اینترفیس",
	cable: "کابل",
	computer: "کامپیوتر",
	windows: "ویندوز",
	ip: "IP",
	vlan: "VLAN",
	network: "شبکه",
	firewall: "فایروال",
	status: "وضعیت"
};
var STATUS_LABEL = {
	active: "فعال",
	inactive: "غیرفعال"
};
var PROTOCOL_OPTIONS = [
	"TCP",
	"UDP",
	"ICMP",
	"ANY"
];
var ACTION_OPTIONS = ["allow", "deny"];
var ACTION_LABEL = {
	allow: "اجازه",
	deny: "مسدود"
};
var EMPTY_RECORD = {
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
	firewallAccess: []
};
var TABLE_COLUMNS = [
	"floor",
	"room",
	"userName",
	"computerName",
	"ip",
	"vlan",
	"switchName",
	"switchInterface",
	"patchPanel",
	"patchPort",
	"status"
];
function statusFromCell(raw) {
	const n = normalizeFa(raw);
	if (!n) return "active";
	if (n === "غ" || n.includes("غیرفعال") || n.includes("غيرفعال") || n === "inactive" || n === "no" || n === "0" || n === "off" || n === "down") return "inactive";
	return "active";
}
function statusToCell(status) {
	return status === "active" ? "ف" : "غ";
}
function normalizeFa(input) {
	return input.replace(/[يى]/g, "ی").replace(/ك/g, "ک").replace(/ة/g, "ه").replace(/ؤ/g, "و").replace(/[أإآ]/g, "ا").replace(/[\u064B-\u065F]/g, "").replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[0-9]+\s*[\.\-:]?\s*/g, "").replace(/[^\p{L}\p{N}]+/gu, "").toLowerCase().trim();
}
function vlanNumber(vlan) {
	const m = vlan.match(/\d+/);
	return m ? m[0] : vlan;
}
//#endregion
export { EMPTY_RECORD as a, PROTOCOL_OPTIONS as c, normalizeFa as d, statusFromCell as f, APP_TAGLINE as i, STATUS_LABEL as l, vlanNumber as m, ACTION_OPTIONS as n, ENTITY_LABELS as o, statusToCell as p, APP_NAME as r, FIELD_LABELS as s, ACTION_LABEL as t, TABLE_COLUMNS as u };
