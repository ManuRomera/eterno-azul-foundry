/** Supports native elements and legacy jQuery wrappers without importing jQuery. */
export function normalizeHookElement(html) {
  const element = html?.nodeType === 1 ? html : html?.[0];
  return element?.nodeType === 1 && typeof element.querySelector === "function"
    ? element
    : null;
}
export function onChatRender(handler) {
  return Hooks.on("renderChatMessageHTML", (message, html, ...args) => {
    const element = normalizeHookElement(html);
    if (element) handler(message, element, ...args);
  });
}
