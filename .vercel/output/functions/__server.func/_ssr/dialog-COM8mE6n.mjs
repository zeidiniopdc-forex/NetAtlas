import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as EMPTY_RECORD, c as PROTOCOL_OPTIONS, l as STATUS_LABEL, n as ACTION_OPTIONS, s as FIELD_LABELS, t as ACTION_LABEL } from "./fields-DbmUJ9eD.mjs";
import { r as uid, t as cn } from "./utils-BVfzEMm6.mjs";
import { _ as Check, c as Plus, g as ChevronDown, i as Trash2, t as X } from "../_libs/lucide-react.mjs";
import { a as DialogPortal, i as DialogOverlay, n as DialogClose, o as DialogTitle$1, r as DialogContent$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { a as SelectItemIndicator, c as SelectTrigger$1, i as SelectItem$1, l as SelectValue$1, n as SelectContent$1, o as SelectItemText, r as SelectIcon, s as SelectPortal, t as Select$1, u as SelectViewport } from "../_libs/@radix-ui/react-select+[...].mjs";
import { i as Button } from "./router-oIRBZTJ_.mjs";
import { t as Input } from "./input-QxljRgad.mjs";
import { t as Root } from "../_libs/radix-ui__react-label.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dialog-COM8mE6n.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
		className: cn("text-xs font-medium text-muted", className),
		...props
	});
}
var Select = Select$1;
var SelectValue = SelectValue$1;
function SelectTrigger({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger$1, {
		className: cn("flex h-10 w-full items-center justify-between rounded-md border border-border bg-surface px-3 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-50", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectIcon, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4 text-muted" }) })]
	});
}
function SelectContent({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent$1, {
		className: cn("relative z-50 min-w-32 overflow-hidden rounded-md border border-border bg-surface-2 text-fg shadow-lg", className),
		position: "popper",
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectViewport, {
			className: "p-1",
			children
		})
	}) });
}
function SelectItem({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem$1, {
		className: cn("relative flex cursor-pointer select-none items-center rounded-sm py-2 pe-8 ps-2 text-sm outline-none data-[highlighted]:bg-surface data-[highlighted]:text-fg", className),
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemText, { children }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemIndicator, {
			className: "absolute end-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4 text-accent" })
		})]
	});
}
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
	className: cn("flex min-h-24 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg placeholder:text-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50", className),
	ref,
	...props
}));
Textarea.displayName = "Textarea";
var GROUPS = [
	{
		title: "موقعیت",
		keys: [
			"floor",
			"room",
			"userName"
		]
	},
	{
		title: "نود و پچ‌پنل",
		keys: [
			"nodeRow",
			"nodeNumber",
			"patchPanel",
			"patchPort",
			"patchRackPosition"
		]
	},
	{
		title: "سوئیچ و کابل",
		keys: [
			"switchName",
			"switchInterface",
			"cableNumber"
		]
	},
	{
		title: "سیستم و شبکه",
		keys: [
			"computerName",
			"windowsUsername",
			"ip",
			"vlan",
			"network"
		]
	}
];
function RecordForm({ initial, onSubmit, onCancel, busy }) {
	const [form, setForm] = (0, import_react.useState)(() => initial ? {
		...initial,
		firewallAccess: initial.firewallAccess.map((f) => ({ ...f }))
	} : {
		...EMPTY_RECORD,
		id: uid("rec"),
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	});
	const set = (key, value) => setForm((f) => ({
		...f,
		[key]: value
	}));
	const updateFw = (id, patch) => setForm((f) => ({
		...f,
		firewallAccess: f.firewallAccess.map((row) => row.id === id ? {
			...row,
			...patch
		} : row)
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "flex flex-col gap-5",
		onSubmit: (e) => {
			e.preventDefault();
			onSubmit({
				...form,
				updatedAt: (/* @__PURE__ */ new Date()).toISOString()
			});
		},
		children: [
			GROUPS.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
				className: "mb-3 text-xs font-medium text-muted",
				children: g.title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-3 sm:grid-cols-2",
				children: g.keys.map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: FIELD_LABELS[key],
					value: String(form[key] ?? ""),
					mono: key === "ip" || key === "switchInterface" || key === "windowsUsername",
					onChange: (v) => set(key, v)
				}, key))
			})] }, g.title)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: FIELD_LABELS.status }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: form.status,
						onValueChange: (v) => set("status", v),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "active",
							children: STATUS_LABEL.active
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "inactive",
							children: STATUS_LABEL.inactive
						})] })]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: FIELD_LABELS.notes,
					value: form.notes,
					onChange: (v) => set("notes", v)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
					className: "text-xs font-medium text-muted",
					children: "دسترسی‌های فایروال برای این IP"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					size: "sm",
					variant: "secondary",
					onClick: () => setForm((f) => ({
						...f,
						firewallAccess: [...f.firewallAccess, {
							id: uid("fw"),
							service: "",
							protocol: "TCP",
							port: "",
							destination: "",
							action: "allow",
							notes: ""
						}]
					})),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "سرویس"]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col gap-3",
				children: form.firewallAccess.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-md border border-dashed border-border px-3 py-4 text-sm text-muted",
					children: "هنوز سرویسی ثبت نشده. با افزودن سرویس مشخص می‌شود این IP به چه مقصدهایی دسترسی دارد."
				}) : form.firewallAccess.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border border-border bg-surface-2 p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2 sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
								label: "سرویس",
								value: row.service,
								onChange: (v) => updateFw(row.id, { service: v })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "پروتکل" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: row.protocol,
									onValueChange: (v) => updateFw(row.id, { protocol: v }),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "h-9",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: PROTOCOL_OPTIONS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: p,
										children: p
									}, p)) })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
								label: "پورت",
								value: row.port,
								mono: true,
								onChange: (v) => updateFw(row.id, { port: v })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
								label: "مقصد",
								value: row.destination,
								onChange: (v) => updateFw(row.id, { destination: v })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "عمل" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: row.action,
									onValueChange: (v) => updateFw(row.id, { action: v }),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "h-9",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: ACTION_OPTIONS.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: a,
										children: ACTION_LABEL[a]
									}, a)) })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
								label: "توضیح",
								value: row.notes,
								onChange: (v) => updateFw(row.id, { notes: v })
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 flex justify-end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							size: "sm",
							variant: "ghost",
							onClick: () => setForm((f) => ({
								...f,
								firewallAccess: f.firewallAccess.filter((x) => x.id !== row.id)
							})),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), "حذف"]
						})
					})]
				}, row.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-end gap-2 pt-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					onClick: onCancel,
					children: "انصراف"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: busy,
					children: "ذخیره روی سرور"
				})]
			})
		]
	});
}
function Field({ label, value, onChange, mono }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), label === FIELD_LABELS.notes ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
			value,
			onChange: (e) => onChange(e.target.value)
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			value,
			dir: mono ? "ltr" : void 0,
			className: mono ? "font-mono" : void 0,
			onChange: (e) => onChange(e.target.value)
		})]
	});
}
function Mini({ label, value, onChange, mono }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			className: mono ? "h-9 font-mono" : "h-9",
			dir: mono ? "ltr" : void 0,
			value,
			onChange: (e) => onChange(e.target.value)
		})]
	});
}
var Dialog = Dialog$1;
function DialogContent({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-50 bg-bg/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
		className: cn("fixed left-1/2 top-1/2 z-50 grid w-[min(96vw,720px)] max-h-[90vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-surface p-5 shadow-xl", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
			className: "absolute end-3 top-3 rounded-sm p-1 text-muted hover:text-fg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "بستن"
			})]
		})]
	})] });
}
function DialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("mb-4 space-y-1", className),
		...props
	});
}
function DialogTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
		className: cn("text-lg font-medium", className),
		...props
	});
}
//#endregion
export { RecordForm as a, DialogTitle as i, DialogContent as n, DialogHeader as r, Dialog as t };
