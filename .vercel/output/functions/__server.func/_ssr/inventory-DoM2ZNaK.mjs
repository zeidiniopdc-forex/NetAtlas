import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { l as STATUS_LABEL, s as FIELD_LABELS, u as TABLE_COLUMNS } from "./fields-DbmUJ9eD.mjs";
import { o as recordMatches } from "./relations-BoqAlv6o.mjs";
import { t as cn } from "./utils-BVfzEMm6.mjs";
import { c as Plus, s as Search } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as Button } from "./router-oIRBZTJ_.mjs";
import { t as Badge } from "./badge-Daqw7ud3.mjs";
import { t as Input } from "./input-QxljRgad.mjs";
import { n as useInventoryMutations, t as useInventory } from "./query-BMySnmUv.mjs";
import { a as RecordForm, i as DialogTitle, n as DialogContent, r as DialogHeader, t as Dialog } from "./dialog-COM8mE6n.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/inventory-DoM2ZNaK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function InventoryPage() {
	const { data, isLoading } = useInventory();
	const { upsert } = useInventoryMutations();
	const [q, setQ] = (0, import_react.useState)("");
	const [open, setOpen] = (0, import_react.useState)(false);
	const rows = (0, import_react.useMemo)(() => {
		const list = data?.records ?? [];
		if (!q.trim()) return list;
		return list.filter((r) => recordMatches(r, q));
	}, [data, q]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-medium tracking-tight",
					children: "موجودی زیرساخت"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted",
					children: [rows.length.toLocaleString("fa-IR"), " رکورد · همه فیلدهای اکسل به‌علاوه دسترسی فایروال"]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex w-full flex-col gap-2 sm:w-auto sm:flex-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative sm:w-72",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-faint" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "ps-9",
							value: q,
							onChange: (e) => setQ(e.target.value),
							placeholder: "فیلتر جدول"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => setOpen(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "رکورد جدید"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto rounded-xl border border-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[980px] text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "bg-surface-2 text-xs text-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [TABLE_COLUMNS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-3 py-3 text-start font-medium",
							children: FIELD_LABELS[c]
						}, c)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-3 py-3 text-start font-medium",
							children: "فایروال"
						})] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						colSpan: TABLE_COLUMNS.length + 1,
						className: "px-3 py-10 text-center text-muted",
						children: "در حال بارگذاری…"
					}) }) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						colSpan: TABLE_COLUMNS.length + 1,
						className: "px-3 py-10 text-center text-muted",
						children: "رکوردی نیست. از ورود اکسل استفاده کنید یا رکورد جدید بسازید."
					}) }) : rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { record: r }, r.id)) })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "رکورد جدید" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordForm, {
					busy: upsert.isPending,
					onCancel: () => setOpen(false),
					onSubmit: (record) => {
						upsert.mutate(record, {
							onSuccess: () => {
								toast.success("روی فایل JSON سرور ذخیره شد");
								setOpen(false);
							},
							onError: () => toast.error("ذخیره انجام نشد")
						});
					}
				})] })
			})
		]
	});
}
function Row({ record }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
		className: "border-t border-border hover:bg-surface-2/60",
		children: [TABLE_COLUMNS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
			className: "px-3 py-2.5",
			children: c === "status" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: record.status === "active" ? "ok" : "danger",
				children: STATUS_LABEL[record.status]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/inventory/$id",
				params: { id: record.id },
				className: cn("hover:text-accent", c === "ip" || c === "switchInterface" ? "font-mono" : void 0),
				dir: c === "ip" || c === "switchInterface" ? "ltr" : void 0,
				children: String(record[c] || "—")
			})
		}, c)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
			className: "px-3 py-2.5 text-xs text-muted",
			children: record.firewallAccess.length ? record.firewallAccess.map((f) => f.service).join("، ") : "—"
		})]
	});
}
//#endregion
export { InventoryPage as component };
