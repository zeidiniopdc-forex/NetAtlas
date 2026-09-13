import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { s as FIELD_LABELS } from "./fields-DbmUJ9eD.mjs";
import { n as faDate } from "./utils-BVfzEMm6.mjs";
import { f as FileSpreadsheet, n as Upload, p as Download } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as Button } from "./router-oIRBZTJ_.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-654-F7Ip.mjs";
import { n as useInventoryMutations, t as useInventory } from "./query-BMySnmUv.mjs";
import { downloadWorkbook, parseWorkbook } from "./excel-CJXkS3iW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/exchange-BLTFLxhm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ExchangePage() {
	const { data } = useInventory();
	const { ingest, seed } = useInventoryMutations();
	const [preview, setPreview] = (0, import_react.useState)(null);
	const [fileName, setFileName] = (0, import_react.useState)("");
	const onFile = async (file) => {
		const buf = await file.arrayBuffer();
		const rows = parseWorkbook(buf);
		setPreview(rows);
		setFileName(file.name);
		toast.message(`${rows.length.toLocaleString("fa-IR")} ردیف خوانده شد`);
	};
	const runImport = (mode) => {
		if (!preview) return;
		ingest.mutate({
			records: preview,
			mode
		}, {
			onSuccess: (res) => {
				toast.success(mode === "replace" ? `جایگزین شد — ${res.count.toLocaleString("fa-IR")} رکورد در JSON` : `ادغام شد — ${res.count.toLocaleString("fa-IR")} رکورد در JSON`);
				setPreview(null);
			},
			onError: () => toast.error("ورود اطلاعات انجام نشد")
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-medium tracking-tight",
				children: "ورود و خروجی اکسل"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "فایل اکسل موجود را وارد کنید، روی سرور در JSON ذخیره شود، و هر زمان خروجی اکسل بگیرید."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "rounded-lg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "ورود از Excel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "سرستون‌های فارسی با و بدون شماره‌گذاری پشتیبانی می‌شوند. ستون «دسترسی‌های فایروال» اختیاری است." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "flex flex-col gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border px-4 py-8 text-sm text-muted hover:border-accent/50 hover:text-fg",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-6 text-accent" }),
								"انتخاب فایل xlsx یا xls",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "file",
									accept: ".xlsx,.xls,.csv",
									className: "sr-only",
									onChange: (e) => {
										const f = e.target.files?.[0];
										if (f) onFile(f);
									}
								})
							]
						}), preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-md bg-surface-2 p-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
								fileName,
								" — ",
								preview.length.toLocaleString("fa-IR"),
								" ردیف آماده ورود"
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									onClick: () => runImport("merge"),
									disabled: ingest.isPending,
									children: "ادغام با داده فعلی"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "secondary",
									onClick: () => runImport("replace"),
									disabled: ingest.isPending,
									children: "جایگزینی کامل"
								})]
							})]
						}) : null]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "rounded-lg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "خروجی Excel و JSON" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, { children: [
						"آخرین ذخیره: ",
						faDate(data?.updatedAt),
						data?.storage.path ? ` · مسیر: ${data.storage.path}` : ""
					] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "flex flex-col gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "secondary",
								onClick: () => downloadWorkbook(data?.records ?? [], "netatlas-inventory.xlsx"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "size-4" }), "دانلود Excel"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								onClick: () => {
									const blob = new Blob([JSON.stringify({
										version: 1,
										updatedAt: data?.updatedAt,
										records: data?.records ?? []
									}, null, 2)], { type: "application/json" });
									const a = document.createElement("a");
									a.href = URL.createObjectURL(blob);
									a.download = "inventory.json";
									a.click();
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "دانلود JSON پشتیبان"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								onClick: () => {
									if (!confirm("داده‌ها به نمونه اولیه برگردد؟")) return;
									seed.mutate(void 0, { onSuccess: () => toast.success("داده نمونه بارگذاری شد") });
								},
								children: "بارگذاری داده نمونه"
							})
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "rounded-lg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "فیلدهای پشتیبانی‌شده" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "همان ساختار فایل اکسل شما به‌علاوه ستون دسترسی فایروال" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "flex flex-wrap gap-2",
					children: Object.values(FIELD_LABELS).map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-full bg-surface-2 px-3 py-1 text-sm",
						children: label
					}, label))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "rounded-lg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "استقرار روی IIS" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-2 text-sm leading-relaxed text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						"برنامه با Node روی ویندوز سرور اجرا می‌شود. فایل ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-fg",
							dir: "ltr",
							children: "iis/web.config"
						}),
						" را کنار خروجی سرور بگذارید و ماژول HttpPlatformHandler را روی IIS نصب کنید. متغیر",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-fg",
							dir: "ltr",
							children: "INVENTORY_DATA_DIR"
						}),
						" را روی پوشه قابل‌نوشتن مثل",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-fg",
							dir: "ltr",
							children: "D:\\NetAtlas\\data"
						}),
						" تنظیم کنید تا",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-fg",
							dir: "ltr",
							children: "inventory.json"
						}),
						" بین کاربران شبکه مشترک بماند."
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "برای همزمانی چند کاربر، ذخیره JSON پشت قفل صف و نوشتن اتمی (فایل موقت سپس rename) انجام می‌شود." })]
				})]
			})
		]
	});
}
//#endregion
export { ExchangePage as component };
