class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type);
  }

  setAttribute(name, value) {
    this.root.setAttribute(name, value);
  }

  appendChild(vchild) {
    // vchild is virtual node/component
    vchild.mountTo(this.root);
  }

  mountTo(parent) {
    // parent is true dom element
    parent.appendChild(this.root);
  }
}

class TextWrapper {
  constructor(type) {
    this.root = document.createTextNode(type);
  }

  mountTo(parent) {
    parent.appendChild(this.root);
  }
}

export class Component {
  // we need the component to have same dom element API
  // to set attribute and
  setAttribute(name, value) {
    this[name] = value;
  }

  mountTo(parent) {
    const vdom = this.render();
    vdom.mountTo(parent);
  }
}

export const ToyReact = {
  // the paramenters sent to createElement
  // 1. the element/tag/component
  // 2. the attributes of the element
  // 3. various children
  createElement(type, attributes, ...children) {
    let element;
    // to wrap a dom element or create a component
    if (typeof type === "string") {
      element = new ElementWrapper(type);
    } else {
      element = new type();
    }
    for (const name in attributes) {
      element.setAttribute(name, attributes[name]);
    }
    for (let child of children) {
      if (typeof child === "string") {
        child = new TextWrapper(child);
      }
      element.appendChild(child);
    }
    return element;
  },

  render(vdom, element) {
    // vdom is either a dom element or a component here
    vdom.mountTo(element);
  },
};
