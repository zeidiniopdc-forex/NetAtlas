import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as ACTION_LABEL } from "./fields-DbmUJ9eD.mjs";
import { t as Badge } from "./badge-Daqw7ud3.mjs";
import { t as Input } from "./input-QxljRgad.mjs";
import { t as useInventory } from "./query-BMySnmUv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/firewall-CxaJ4aqT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function FirewallPage() {
	const { data } = useInventory();
	const [q, setQ] = (0, import_react.useState)("");
	const rows = (0, import_react.useMemo)(() => {
		const list = data?.records.flatMap((r) => r.firewallAccess.map((f) => ({
			recId: r.id,
			user: r.userName,
			ip: r.ip,
			computer: r.computerName,
			vlan: r.vlan,
			...f
		}))) ?? [];
		if (!q.trim()) return list;
		const n = q.toLowerCase();
		return list.filter((r) => [
			r.user,
			r.ip,
			r.computer,
			r.vlan,
			r.service,
			r.destination,
			r.port,
			r.protocol
		].join(" ").toLowerCase().includes(n));
	}, [data, q]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-medium tracking-tight",
				children: "ماتریس دسترسی فایروال"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "مشخص می‌شود هر IP متعلق به کدام کاربر است و به چه سرویس‌هایی اجازه یا منع دارد."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				className: "sm:max-w-80",
				value: q,
				onChange: (e) => setQ(e.target.value),
				placeholder: "فیلتر کاربر، IP یا سرویس"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto rounded-xl border border-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[860px] text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "bg-surface-2 text-xs text-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: [
						"کاربر",
						"IP",
						"کامپیوتر",
						"VLAN",
						"سرویس",
						"پروتکل/پورت",
						"مقصد",
						"عمل"
					].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-3 text-start font-medium",
						children: h
					}, h)) })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					colSpan: 8,
					className: "px-3 py-10 text-center text-muted",
					children: "دسترسی‌ای مطابق فیلتر نیست."
				}) }) : rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/inventory/$id",
								params: { id: r.recId },
								className: "hover:text-accent",
								children: r.user || "—"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2.5 font-mono text-accent",
							dir: "ltr",
							children: r.ip || "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2.5",
							children: r.computer || "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2.5",
							children: r.vlan || "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2.5",
							children: r.service
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-3 py-2.5 font-mono",
							dir: "ltr",
							children: [
								r.protocol,
								"/",
								r.port || "*"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2.5",
							children: r.destination || "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: r.action === "allow" ? "ok" : "danger",
								children: ACTION_LABEL[r.action]
							})
						})
					]
				}, `${r.recId}-${r.id}`)) })]
			})
		})]
	});
}
//#endregion
export { FirewallPage as component };
