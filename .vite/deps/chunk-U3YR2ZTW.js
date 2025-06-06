import {
  exactProp,
  useEnhancedEffect_default
} from "./chunk-Z2T75EYT.js";
import {
  require_prop_types
} from "./chunk-VR6MCXO7.js";
import {
  require_react
} from "./chunk-Q7JL3EJ6.js";
import {
  __toESM
} from "./chunk-624QZG55.js";

// node_modules/@mui/material/NoSsr/NoSsr.js
var React = __toESM(require_react());
var import_prop_types = __toESM(require_prop_types());
function NoSsr(props) {
  const {
    children,
    defer = false,
    fallback = null
  } = props;
  const [mountedState, setMountedState] = React.useState(false);
  useEnhancedEffect_default(() => {
    if (!defer) {
      setMountedState(true);
    }
  }, [defer]);
  React.useEffect(() => {
    if (defer) {
      setMountedState(true);
    }
  }, [defer]);
  return mountedState ? children : fallback;
}
true ? NoSsr.propTypes = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * You can wrap a node.
   */
  children: import_prop_types.default.node,
  /**
   * If `true`, the component will not only prevent server-side rendering.
   * It will also defer the rendering of the children into a different screen frame.
   * @default false
   */
  defer: import_prop_types.default.bool,
  /**
   * The fallback content to display.
   * @default null
   */
  fallback: import_prop_types.default.node
} : void 0;
if (true) {
  NoSsr["propTypes"] = exactProp(NoSsr.propTypes);
}
var NoSsr_default = NoSsr;

export {
  NoSsr_default
};
//# sourceMappingURL=chunk-U3YR2ZTW.js.map
