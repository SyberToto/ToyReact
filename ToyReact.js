class ElementWrapper {
  constructor(type) {
    this.type = type;
    this.props = Object.create(null);
    this.children = [];
  }

  setAttribute(name, value) {
    // if (name.match(/^on([\s\S]+)$/)) {
    //   console.log(RegExp.$1);
    //   const eventName = RegExp.$1.replace(/^[\s\S]/, (s) => s.toLowerCase()); // Click -> click
    //   this.root.addEventListener(eventName, value);
    // }
    // if (name === "className") {
    //   name = "class";
    // }
    // this.root.setAttribute(name, value);
    this.props[name] = value;
  }

  appendChild(vchild) {
    // // vchild is virtual node/component
    // let range = document.createRange();
    // if (this.root.children.length) {
    //   range.setStartAfter(this.root.lastChild);
    //   range.setEndAfter(this.root.lastChild);
    // } else {
    //   range.setStart(this.root, 0);
    //   range.setEnd(this.root, 0);
    // }
    // vchild.mountTo(range);
    this.children.push(vchild);
  }

  mountTo(range) {
    // parent is true dom element
    this.range = range;
    range.deleteContents();
    const element = document.createElement(this.type);

    for (const name in this.props) {
      const value = this.props[name];
      if (name.match(/^on([\s\S]+)$/)) {
        const eventName = RegExp.$1.replace(/^[\s\S]/, (s) => s.toLowerCase()); // Click -> click
        element.addEventListener(eventName, value);
      }
      if (name === "className") {
        element.setAttribute("class", value);
      }
      element.setAttribute(name, value);
    }

    for (const child of this.children) {
      let range = document.createRange();
      if (element.children.length) {
        range.setStartAfter(element.lastChild);
        range.setEndAfter(element.lastChild);
      } else {
        range.setStart(element, 0);
        range.setEnd(element, 0);
      }
      child.mountTo(range);
    }

    range.insertNode(element);
  }
}

class TextWrapper {
  constructor(type) {
    this.root = document.createTextNode(type);
    this.type = "#text";
    this.children = [];
    this.props = Object.create(null);
  }

  mountTo(range) {
    this.range = range;
    range.deleteContents();
    range.insertNode(this.root);
  }
}

export class Component {
  // we need the component to have same dom element API
  // to set attribute and
  constructor() {
    this.children = [];
    this.props = Object.create(null); // this doesn't contain default function such as toString()
  }
  get type() {
    return this.constructor.name;
  }
  appendChild(vchild) {
    // vchild is virtual node/component
    this.children.push(vchild);
  }

  setAttribute(name, value) {
    if (name.match(/^on([\s\S]+)$/)) {
      console.log(RegExp.$1);
    }
    this.props[name] = value;
    this[name] = value;
  }

  mountTo(range) {
    this.range = range;
    this.update();
  }

  update() {
    // hack for range
    const placeHolder = document.createComment("placeHolder");
    let range = document.createRange();
    range.setStart(this.range.endContainer, this.range.endOffset);
    range.setEnd(this.range.endContainer, this.range.endOffset);
    range.insertNode(placeHolder);
    // hack for range

    this.range.deleteContents();

    const vdom = this.render();
    if (this.vdom) {
      const isSameNode = (node1, node2) => {
        if (node1.type !== node2.type) {
          return false;
        }
        for (const name in node1.props) {
          if (node1.props[name] !== node2.props[name]) {
            if (
              typeof node1.props[name] === "function" &&
              typeof node2.props[name] === "function" &&
              node1.props[name].toString() === node2.props[name].toString()
            ) {
              continue;
            }
            if (
              typeof node1.props[name] === "object" &&
              typeof node2.props[name] === "object" &&
              JSON.stringify(node1.props[name]) ===
                JSON.stringify(node2.props[name])
            ) {
              continue;
            }
            return false;
          }
        }
        if (
          Object.keys(node1.props).length !== Object.keys(node2.props).length
        ) {
          return false;
        }
        return true;
      };

      const isSameTree = (node1, node2) => {
        if (!isSameNode(node1, node2)) {
          return false;
        }
        if (node1.children.length !== node2.children.length) {
          return false;
        }
        for (let i = 0; i < node1.children.length; i++) {
          if (!isSameTree(node1.children[i], node2.children[i])) {
            return false;
          }
        }
        return true;
      };

      const replace = (newTree, oldTree) => {
        if (isSameTree(newTree, oldTree)) {
          return;
        }
        if (!isSameNode(newTree, oldTree)) {
          newTree.mountTo(oldTree.range);
        } else {
          for (let i = 0; i < newTree.children.length; i++) {
            replace(newTree.children[i], oldTree.children[i]);
          }
        }
      };

      replace(vdom, this.vdom);
    } else {
      vdom.mountTo(this.range);
    }
    this.vdom = vdom;
  }

  setState(state) {
    let merge = (oldState, newState) => {
      for (const p in newState) {
        if (typeof newState[p] === "object" && newState[p] !== null) {
          //typeof null === 'object'
          if (typeof oldState[p] !== "object") {
            if (newState[p] instanceof Array) {
              oldState[p] = [];
            } else {
              oldState[p] = {};
            }
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
    this.update();
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
          if (child === null || child === undefined) {
            // undefined could be re-defined to other value, void 0 is always undefined
            child = "";
          }
          if (
            !(child instanceof Component) &&
            !(child instanceof ElementWrapper) &&
            !(child instanceof TextWrapper) // always true?
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
    let range = document.createRange();
    if (element.children.length) {
      range.setStartAfter(element.lastChild);
      range.setEndAfter(element.lastChild);
    } else {
      range.setStart(element, 0);
      range.setEnd(element, 0);
    }
    vdom.mountTo(range);
  },
};
