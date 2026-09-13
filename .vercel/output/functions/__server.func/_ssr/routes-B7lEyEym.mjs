import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as faDate, t as cn } from "./utils-BVfzEMm6.mjs";
import { s as Search } from "../_libs/lucide-react.mjs";
import { i as Button } from "./router-oIRBZTJ_.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./card-654-F7Ip.mjs";
import { t as Input } from "./input-QxljRgad.mjs";
import { t as useInventory } from "./query-BMySnmUv.mjs";
import { a as Bar, i as CartesianGrid, n as YAxis, o as ResponsiveContainer, r as XAxis, s as Tooltip, t as BarChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-B7lEyEym.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function KpiGrid({ stats }) {
	const items = [
		{
			label: "کل نودها",
			value: stats.total
		},
		{
			label: "فعال",
			value: stats.active,
			tone: "ok"
		},
		{
			label: "غیرفعال",
			value: stats.inactive,
			tone: "danger"
		},
		{
			label: "سوئیچ",
			value: stats.switches
		},
		{
			label: "VLAN",
			value: stats.vlans
		},
		{
			label: "IP",
			value: stats.ips
		},
		{
			label: "کاربر",
			value: stats.users
		},
		{
			label: "قواعد فایروال",
			value: stats.firewallRules
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-3 md:grid-cols-4",
		children: items.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "rounded-lg",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: it.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: cn("mt-2 font-mono text-2xl tabular-nums tracking-tight", it.tone === "ok" && "text-ok", it.tone === "danger" && "text-danger"),
					children: it.value.toLocaleString("fa-IR")
				})]
			})
		}, it.label))
	});
}
function InfraCharts({ stats }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "rounded-lg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "توزیع طبقه‌ها" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "h-64",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chart, {
					data: stats.byFloor,
					color: "var(--color-accent)"
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "rounded-lg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "توزیع VLAN" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "h-64",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chart, {
					data: stats.byVlan,
					color: "var(--color-ok)"
				})
			})]
		})]
	});
}
function Chart({ data, color }) {
	if (!data.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "داده‌ای نیست"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
		width: "100%",
		height: "100%",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
			data,
			margin: {
				top: 8,
				right: 8,
				left: 0,
				bottom: 8
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
					stroke: "var(--color-border)",
					vertical: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
					dataKey: "name",
					tick: {
						fill: "var(--color-muted)",
						fontSize: 11
					},
					axisLine: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
					allowDecimals: false,
					tick: {
						fill: "var(--color-muted)",
						fontSize: 11
					},
					axisLine: false,
					width: 28
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
					background: "var(--color-surface-2)",
					border: "1px solid var(--color-border)",
					borderRadius: 8,
					color: "var(--color-fg)"
				} }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
					dataKey: "value",
					fill: color,
					radius: [
						6,
						6,
						0,
						0
					],
					maxBarSize: 36
				})
			]
		})
	});
}
function SwitchRack({ stats }) {
	const max = Math.max(1, ...stats.bySwitch.map((s) => s.value));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "rounded-lg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "بار سوئیچ‌ها" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "flex flex-col gap-3",
			children: stats.bySwitch.map((sw) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-1 flex items-center justify-between text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono",
					dir: "ltr",
					children: sw.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "tabular-nums text-muted",
					children: [
						sw.active.toLocaleString("fa-IR"),
						" فعال از ",
						sw.value.toLocaleString("fa-IR")
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-2 overflow-hidden rounded-full bg-surface-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full rounded-full bg-accent",
					style: { width: `${sw.value / max * 100}%` }
				})
			})] }, sw.name))
		})]
	});
}
function ServiceMix({ stats }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "rounded-lg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "سرویس‌های فایروال" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "flex flex-wrap gap-2",
			children: stats.topServices.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "هنوز دسترسی فایروال ثبت نشده است."
			}) : stats.topServices.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "rounded-full bg-surface-2 px-3 py-1.5 text-sm text-fg",
				children: [s.name, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "ms-2 font-mono text-muted tabular-nums",
					children: s.value
				})]
			}, s.name))
		})]
	});
}
function PathStrip({ records }) {
	const sample = records.filter((r) => r.status === "active").slice(0, 6);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "rounded-lg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "نمونه مسیر فیزیکی" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "flex flex-col gap-2",
			children: sample.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/inventory/$id",
				params: { id: r.id },
				className: "flex flex-wrap items-center gap-2 rounded-md bg-surface-2 px-3 py-2 text-xs text-muted hover:text-fg",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: r.userName }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-faint",
						children: "←"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["اتاق ", r.room] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-faint",
						children: "←"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						r.patchPanel,
						":",
						r.patchPort
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-faint",
						children: "←"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-mono",
						dir: "ltr",
						children: [
							r.switchName,
							" ",
							r.switchInterface
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-faint",
						children: "←"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-accent",
						dir: "ltr",
						children: r.ip
					})
				]
			}, r.id))
		})]
	});
}
function Dashboard() {
	const { data, isLoading, error } = useInventory();
	const [q, setQ] = (0, import_react.useState)("");
	const navigate = useNavigate();
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeleton, {});
	if (error || !data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-danger",
		children: "خواندن داده از سرور ممکن نشد."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "نمای کلی زیرساخت"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-1 text-2xl font-medium tracking-tight md:text-3xl",
						children: "داشبورد شبکه"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-muted",
						children: [
							"آخرین ذخیره: ",
							faDate(data.updatedAt),
							data.storage.path ? " · فایل JSON روی سرور" : " · ذخیره در حافظه موقت سرور"
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "flex w-full max-w-lg gap-2",
					onSubmit: (e) => {
						e.preventDefault();
						if (q.trim()) navigate({
							to: "/search",
							search: { q: q.trim() }
						});
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: q,
						onChange: (e) => setQ(e.target.value),
						placeholder: "جستجوی IP، کاربر، سوئیچ، پچ‌پنل، VLAN…"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "submit",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4" }), "جستجو"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiGrid, { stats: data.stats }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfraCharts, { stats: data.stats }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchRack, { stats: data.stats }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServiceMix, { stats: data.stats })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PathStrip, { records: data.records }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "secondary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/inventory",
							children: "مشاهده موجودی"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "secondary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/exchange",
							children: "ورود از اکسل"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "secondary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/cisco",
							children: "دستورات Cisco"
						})
					})
				]
			})
		]
	});
}
function PageSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-3 md:grid-cols-4",
		children: Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-24 animate-pulse rounded-lg bg-surface" }, i))
	});
}
//#endregion
export { Dashboard as component };
