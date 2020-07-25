class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type);
  }

  setAttribute(name, value) {
    if (name.match(/^on([\s\S]+)$/)) {
      console.log(RegExp.$1);
      const eventName = RegExp.$1.replace(/^[\s\S]/, (s) => s.toLowerCase()); // Click -> click
      this.root.addEventListener(eventName, value);
    }
    if (name === "className") {
      name = "class";
    }
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
  constructor() {
    this.children = [];
    this.props = Object.create(null); // this doesn't contain default function such as toString()
  }

  appendChild(vchild) {
    // vchild is virtual node/component
    this.children.push(vchild);
  }

  setAttribute(name, value) {
    if (name.match(/^on([\s\S]+)$/)) {
      console.log(RegExp.$1);
    }
    this[name] = value;
    this.props[name] = value;
  }

  mountTo(parent) {
    const vdom = this.render();
    vdom.mountTo(parent);
  }

  setState(state) {
    let merge = (oldState, newState) => {
      for (const p in newState) {
        if (typeof newState[p] === "object") {
          if (typeof oldState[p] !== "object") {
            oldState[p] = {};
          }
          merge(oldState[p], newState[p]);
        } else {
          oldState[p] = newState[p];
        }
      }
    };
    if (!this.state && state) {
      this.state = {};
    }
    merge(this.state, state);
    console.log(this.state);
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

    // {this.children} in JSX will be treated as a single child
    // element.append(child: Array) -> (child: Array).mountTo cannot work
    const insertChildren = (children) => {
      for (let child of children) {
        if (typeof child === "object" && child instanceof Array) {
          insertChildren(child);
        } else {
          if (
            !(child instanceof Component) &&
            !(child instanceof ElementWrapper) &&
            !(child instanceof TextWrapper)
          ) {
            child = String(child);
          }
          if (typeof child === "string") {
            child = new TextWrapper(child);
          }
          element.appendChild(child);
        }
      }
    };
    insertChildren(children);
    return element;
  },

  render(vdom, element) {
    // vdom is either a dom element or a component here
    vdom.mountTo(element);
  },
};
