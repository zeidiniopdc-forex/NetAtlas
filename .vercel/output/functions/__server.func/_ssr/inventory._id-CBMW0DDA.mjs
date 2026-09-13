import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { l as STATUS_LABEL, s as FIELD_LABELS, t as ACTION_LABEL } from "./fields-DbmUJ9eD.mjs";
import { a as generateSwitchportConfig, n as buildTrace } from "./relations-BoqAlv6o.mjs";
import { _ as Check, i as Trash2, l as Pencil, m as Copy, y as ArrowRight } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as Button, n as Route } from "./router-oIRBZTJ_.mjs";
import { t as Badge } from "./badge-Daqw7ud3.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./card-654-F7Ip.mjs";
import { n as useInventoryMutations, t as useInventory } from "./query-BMySnmUv.mjs";
import { a as RecordForm, i as DialogTitle, n as DialogContent, r as DialogHeader, t as Dialog } from "./dialog-COM8mE6n.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/inventory._id-CBMW0DDA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PathTrace({ record }) {
	const steps = buildTrace(record);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
		className: "flex flex-col gap-0",
		children: steps.map((step, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex w-6 flex-col items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-1 size-2.5 rounded-full bg-accent" }), i < steps.length - 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-px flex-1 bg-border" }) : null]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] text-faint",
					children: step.hint || step.kind
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-fg",
					dir: step.kind === "ip" || step.kind === "iface" || step.kind === "windows" ? "ltr" : void 0,
					children: step.label
				})]
			})]
		}, `${step.kind}-${step.label}`))
	});
}
function RecordFacts({ record }) {
	const pairs = [
		[FIELD_LABELS.floor, record.floor],
		[FIELD_LABELS.room, record.room],
		[FIELD_LABELS.userName, record.userName],
		[FIELD_LABELS.nodeRow, record.nodeRow],
		[FIELD_LABELS.nodeNumber, record.nodeNumber],
		[FIELD_LABELS.patchPanel, record.patchPanel],
		[FIELD_LABELS.patchPort, record.patchPort],
		[FIELD_LABELS.patchRackPosition, record.patchRackPosition],
		[FIELD_LABELS.switchName, record.switchName],
		[FIELD_LABELS.switchInterface, record.switchInterface],
		[FIELD_LABELS.cableNumber, record.cableNumber],
		[FIELD_LABELS.computerName, record.computerName],
		[FIELD_LABELS.windowsUsername, record.windowsUsername],
		[FIELD_LABELS.ip, record.ip],
		[FIELD_LABELS.vlan, record.vlan],
		[FIELD_LABELS.network, record.network],
		[FIELD_LABELS.status, STATUS_LABEL[record.status]],
		[FIELD_LABELS.notes, record.notes]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
		className: "grid grid-cols-1 gap-3 sm:grid-cols-2",
		children: pairs.map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-md bg-surface-2 px-3 py-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
				className: "text-[11px] text-faint",
				children: k
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
				className: "mt-0.5 text-sm",
				children: v || "—"
			})]
		}, k))
	});
}
function FirewallPanel({ record }) {
	if (!record.firewallAccess.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "برای این IP هنوز دسترسی فایروال ثبت نشده است. از ویرایش رکورد سرویس‌ها را اضافه کنید."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full min-w-[520px] text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "text-xs text-faint",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border text-start",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-2 pe-3 font-medium",
							children: "سرویس"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-2 pe-3 font-medium",
							children: "پروتکل"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-2 pe-3 font-medium",
							children: "پورت"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-2 pe-3 font-medium",
							children: "مقصد"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-2 pe-3 font-medium",
							children: "عمل"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-2 font-medium",
							children: "توضیح"
						})
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: record.firewallAccess.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-b border-border/70",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-2 pe-3",
						children: f.service
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-2 pe-3 font-mono",
						dir: "ltr",
						children: f.protocol
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-2 pe-3 font-mono",
						dir: "ltr",
						children: f.port
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-2 pe-3",
						children: f.destination
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-2 pe-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: f.action === "allow" ? "text-ok" : "text-danger",
							children: ACTION_LABEL[f.action]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-2 text-muted",
						children: f.notes || "—"
					})
				]
			}, f.id)) })]
		})
	});
}
function ConfigSnippet({ record }) {
	const [copied, setCopied] = (0, import_react.useState)(false);
	const text = generateSwitchportConfig(record);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			size: "sm",
			variant: "secondary",
			className: "absolute end-2 top-2",
			onClick: async () => {
				await navigator.clipboard.writeText(text);
				setCopied(true);
				setTimeout(() => setCopied(false), 1200);
			},
			children: [copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }), copied ? "کپی شد" : "کپی"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
			dir: "ltr",
			className: "overflow-x-auto rounded-lg bg-bg p-4 font-mono text-xs leading-relaxed text-fg",
			children: text
		})]
	});
}
function RecordPage() {
	const { id } = Route.useParams();
	const { data, isLoading } = useInventory();
	const { upsert, remove } = useInventoryMutations();
	const navigate = useNavigate();
	const [edit, setEdit] = (0, import_react.useState)(false);
	const record = data?.records.find((r) => r.id === id);
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "در حال بارگذاری…"
	});
	if (!record) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "text-sm text-muted",
		children: ["رکورد پیدا نشد. ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/inventory",
			children: "بازگشت به موجودی"
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/inventory",
						className: "inline-flex items-center gap-1 text-sm text-muted hover:text-fg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" }), "موجودی"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 text-2xl font-medium tracking-tight",
						children: record.userName || record.computerName || "رکورد"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-mono text-accent",
						dir: "ltr",
						children: record.ip || "بدون IP"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: record.status === "active" ? "ok" : "danger",
								children: STATUS_LABEL[record.status]
							}),
							record.vlan ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "accent",
								children: record.vlan
							}) : null,
							record.switchName ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: record.switchName }) : null
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						onClick: () => setEdit(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" }), "ویرایش"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						onClick: () => {
							if (!confirm("این رکورد از فایل JSON سرور حذف شود؟")) return;
							remove.mutate(record.id, { onSuccess: () => {
								toast.success("حذف شد");
								navigate({ to: "/inventory" });
							} });
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), "حذف"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-[280px_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "rounded-lg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "مسیر ارتباطات" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PathTrace, { record }) })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "rounded-lg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "جزئیات" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordFacts, { record }) })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "rounded-lg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, { children: [
					"دسترسی فایروال برای ",
					record.ip || "این نود",
					" — کاربر ",
					record.userName || "نامشخص"
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FirewallPanel, { record }) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "rounded-lg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "کانفیگ پیشنهادی پورت سوئیچ" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfigSnippet, { record }) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: edit,
				onOpenChange: setEdit,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "ویرایش رکورد" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordForm, {
					initial: record,
					busy: upsert.isPending,
					onCancel: () => setEdit(false),
					onSubmit: (next) => {
						upsert.mutate(next, {
							onSuccess: () => {
								toast.success("تغییرات روی JSON سرور ذخیره شد");
								setEdit(false);
							},
							onError: () => toast.error("ذخیره انجام نشد")
						});
					}
				})] })
			})
		]
	});
}
//#endregion
export { RecordPage as component };
