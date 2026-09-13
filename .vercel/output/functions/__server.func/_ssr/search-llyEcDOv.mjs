import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as entityKindLabel } from "./relations-BoqAlv6o.mjs";
import { t as cn } from "./utils-BVfzEMm6.mjs";
import { s as Search } from "../_libs/lucide-react.mjs";
import { i as Button, r as Route$1 } from "./router-oIRBZTJ_.mjs";
import { t as Input } from "./input-QxljRgad.mjs";
import { r as useRelationSearch } from "./query-BMySnmUv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/search-llyEcDOv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KIND_TONE = {
	floor: "bg-surface-2 text-muted",
	room: "bg-surface-2 text-muted",
	user: "bg-accent/15 text-accent",
	node: "bg-surface-2 text-fg",
	patch: "bg-surface-2 text-fg",
	port: "bg-surface-2 text-fg",
	switch: "bg-ok/15 text-ok",
	iface: "bg-ok/10 text-ok",
	cable: "bg-surface-2 text-muted",
	computer: "bg-warn/15 text-warn",
	windows: "bg-warn/10 text-warn",
	ip: "bg-accent/20 text-accent",
	vlan: "bg-ok/15 text-ok",
	network: "bg-ok/10 text-ok",
	firewall: "bg-danger/15 text-danger",
	status: "bg-surface-2 text-muted"
};
var ORDER = [
	"floor",
	"room",
	"user",
	"computer",
	"windows",
	"ip",
	"vlan",
	"network",
	"node",
	"patch",
	"port",
	"cable",
	"switch",
	"iface",
	"firewall"
];
function RelationGraph({ nodes, edges, onPick }) {
	if (!nodes.length) return null;
	const grouped = ORDER.map((kind) => ({
		kind,
		items: nodes.filter((n) => n.kind === kind)
	})).filter((g) => g.items.length);
	const width = 920;
	const colW = width / Math.max(grouped.length, 1);
	const height = Math.max(220, ...grouped.map((g) => 48 + g.items.length * 36));
	const pos = /* @__PURE__ */ new Map();
	grouped.forEach((g, gi) => {
		g.items.forEach((n, ni) => {
			pos.set(n.id, {
				x: colW * gi + colW / 2,
				y: 40 + ni * 36
			});
		});
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "overflow-x-auto rounded-xl border border-border bg-surface",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: `0 0 ${width} ${height}`,
			className: "h-auto min-w-[640px] w-full",
			role: "img",
			"aria-label": "گراف ارتباطات",
			children: [edges.map((e) => {
				const a = pos.get(e.from);
				const b = pos.get(e.to);
				if (!a || !b) return null;
				const mid = (a.x + b.x) / 2;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: `M ${a.x} ${a.y} C ${mid} ${a.y}, ${mid} ${b.y}, ${b.x} ${b.y}`,
					fill: "none",
					stroke: "currentColor",
					className: "text-border",
					strokeWidth: "1.2"
				}, `${e.from}-${e.to}`);
			}), grouped.map((g, gi) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: colW * gi + colW / 2,
				y: 16,
				textAnchor: "middle",
				className: "fill-faint",
				fontSize: "11",
				children: entityKindLabel(g.kind)
			}, g.kind))]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3 border-t border-border p-4 sm:grid-cols-2 lg:grid-cols-3",
			children: grouped.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-2 text-[11px] font-medium text-faint",
				children: entityKindLabel(g.kind)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-1.5",
				children: g.items.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => onPick?.(n.label),
					className: cn("rounded-full px-2.5 py-1 text-xs", KIND_TONE[n.kind]),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						dir: n.kind === "ip" || n.kind === "iface" ? "ltr" : void 0,
						children: n.label
					}), n.count > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ms-1 tabular-nums opacity-70",
						children: n.count
					}) : null]
				}, n.id))
			})] }, g.kind))
		})]
	});
}
function RecordList({ records }) {
	if (!records.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted",
		children: "موردی پیدا نشد. IP، نام کاربر، سوئیچ، پچ‌پنل، VLAN یا هر فیلد دیگری را جستجو کنید."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-col gap-2",
		children: records.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/inventory/$id",
			params: { id: r.id },
			className: "grid gap-2 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent/40 sm:grid-cols-[1fr_auto]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-medium",
					children: [r.userName || "بدون کاربر", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ms-2 font-mono text-sm text-accent",
						dir: "ltr",
						children: r.ip || "—"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted",
					children: [
						"طبقه ",
						r.floor || "—",
						" · اتاق ",
						r.room || "—",
						" · ",
						r.computerName || "بدون کامپیوتر",
						" ·",
						" ",
						r.switchName,
						" ",
						r.switchInterface
					]
				}),
				r.firewallAccess.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-xs text-muted",
					children: ["فایروال: ", r.firewallAccess.map((f) => f.service).join("، ")]
				}) : null
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("h-fit self-start rounded-full px-2.5 py-1 text-xs", r.status === "active" ? "bg-ok/15 text-ok" : "bg-danger/15 text-danger"),
				children: r.status === "active" ? "فعال" : "غیرفعال"
			})]
		}, r.id))
	});
}
function SearchPage() {
	const { q = "" } = Route$1.useSearch();
	const navigate = useNavigate({ from: "/search" });
	const [draft, setDraft] = (0, import_react.useState)(q);
	const { data, isFetching } = useRelationSearch(q);
	(0, import_react.useEffect)(() => setDraft(q), [q]);
	const submit = (value) => {
		navigate({ search: { q: value.trim() } });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-medium tracking-tight",
				children: "جستجوی ارتباطات"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "هر آیتم را جستجو کنید — کاربر، IP، سوئیچ، اینترفیس، پچ‌پنل، نود، کابل، VLAN، کامپیوتر یا سرویس فایروال. تمام مسیرهای مرتبط نمایش داده می‌شود."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex gap-2",
				onSubmit: (e) => {
					e.preventDefault();
					submit(draft);
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: draft,
					onChange: (e) => setDraft(e.target.value),
					placeholder: "مثلاً 10.10.20.34 یا SW-IDF-F2 یا مریم",
					autoFocus: true
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "submit",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4" }), "بگرد"]
				})]
			}),
			!q ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted",
				children: "یک مقدار وارد کنید تا گراف ارتباطات و رکوردهای مرتبط ساخته شود."
			}) : isFetching && !data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "در حال جستجو…"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted",
					children: [
						data?.records.length.toLocaleString("fa-IR") ?? "۰",
						" رکورد مرتبط با «",
						q,
						"»"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RelationGraph, {
					nodes: data?.nodes ?? [],
					edges: data?.edges ?? [],
					onPick: (label) => {
						setDraft(label);
						submit(label);
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordList, { records: data?.records ?? [] })
			] })
		]
	});
}
//#endregion
export { SearchPage as component };
