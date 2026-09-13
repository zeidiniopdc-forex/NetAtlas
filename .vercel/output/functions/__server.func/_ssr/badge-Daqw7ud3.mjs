import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as cn } from "./utils-BVfzEMm6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/badge-Daqw7ud3.js
var import_jsx_runtime = require_jsx_runtime();
var badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", {
	variants: { variant: {
		default: "border-transparent bg-surface-2 text-fg",
		accent: "border-transparent bg-accent/15 text-accent",
		ok: "border-transparent bg-ok/15 text-ok",
		warn: "border-transparent bg-warn/15 text-warn",
		danger: "border-transparent bg-danger/15 text-danger",
		outline: "border-border text-muted"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
//#endregion
export { Badge as t };
