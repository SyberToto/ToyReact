export const ToyReact = {
  // the paramenters sent to createElement
  // 1. the element/tag/component
  // 2. the attributes of the element
  // 3. various children
  createElement(type, attributes, ...children) {
    const element = document.createElement(type);
    for (const name in attributes) {
      element.setAttribute(name, attributes[name]);
    }
    for (let child of children) {
      if (typeof child === "string") {
        child = document.createTextNode(child);
      }
      element.appendChild(child);
    }
    return element;
  },
};
