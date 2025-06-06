import {
  getEventCoordinates
} from "./chunk-4BNY744B.js";
import "./chunk-Q7JL3EJ6.js";
import "./chunk-624QZG55.js";

// node_modules/@dnd-kit/modifiers/dist/modifiers.esm.js
function createSnapModifier(gridSize) {
  return (_ref) => {
    let {
      transform
    } = _ref;
    return {
      ...transform,
      x: Math.ceil(transform.x / gridSize) * gridSize,
      y: Math.ceil(transform.y / gridSize) * gridSize
    };
  };
}
var restrictToHorizontalAxis = (_ref) => {
  let {
    transform
  } = _ref;
  return {
    ...transform,
    y: 0
  };
};
function restrictToBoundingRect(transform, rect, boundingRect) {
  const value = {
    ...transform
  };
  if (rect.top + transform.y <= boundingRect.top) {
    value.y = boundingRect.top - rect.top;
  } else if (rect.bottom + transform.y >= boundingRect.top + boundingRect.height) {
    value.y = boundingRect.top + boundingRect.height - rect.bottom;
  }
  if (rect.left + transform.x <= boundingRect.left) {
    value.x = boundingRect.left - rect.left;
  } else if (rect.right + transform.x >= boundingRect.left + boundingRect.width) {
    value.x = boundingRect.left + boundingRect.width - rect.right;
  }
  return value;
}
var restrictToParentElement = (_ref) => {
  let {
    containerNodeRect,
    draggingNodeRect,
    transform
  } = _ref;
  if (!draggingNodeRect || !containerNodeRect) {
    return transform;
  }
  return restrictToBoundingRect(transform, draggingNodeRect, containerNodeRect);
};
var restrictToFirstScrollableAncestor = (_ref) => {
  let {
    draggingNodeRect,
    transform,
    scrollableAncestorRects
  } = _ref;
  const firstScrollableAncestorRect = scrollableAncestorRects[0];
  if (!draggingNodeRect || !firstScrollableAncestorRect) {
    return transform;
  }
  return restrictToBoundingRect(transform, draggingNodeRect, firstScrollableAncestorRect);
};
var restrictToVerticalAxis = (_ref) => {
  let {
    transform
  } = _ref;
  return {
    ...transform,
    x: 0
  };
};
var restrictToWindowEdges = (_ref) => {
  let {
    transform,
    draggingNodeRect,
    windowRect
  } = _ref;
  if (!draggingNodeRect || !windowRect) {
    return transform;
  }
  return restrictToBoundingRect(transform, draggingNodeRect, windowRect);
};
var snapCenterToCursor = (_ref) => {
  let {
    activatorEvent,
    draggingNodeRect,
    transform
  } = _ref;
  if (draggingNodeRect && activatorEvent) {
    const activatorCoordinates = getEventCoordinates(activatorEvent);
    if (!activatorCoordinates) {
      return transform;
    }
    const offsetX = activatorCoordinates.x - draggingNodeRect.left;
    const offsetY = activatorCoordinates.y - draggingNodeRect.top;
    return {
      ...transform,
      x: transform.x + offsetX - draggingNodeRect.width / 2,
      y: transform.y + offsetY - draggingNodeRect.height / 2
    };
  }
  return transform;
};
export {
  createSnapModifier,
  restrictToFirstScrollableAncestor,
  restrictToHorizontalAxis,
  restrictToParentElement,
  restrictToVerticalAxis,
  restrictToWindowEdges,
  snapCenterToCursor
};
//# sourceMappingURL=@dnd-kit_modifiers.js.map
