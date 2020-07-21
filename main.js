import { ToyReact } from "./ToyReact";

const a = (
  <div name="a">
    <span>Hello</span>
    <span>World</span>
    <span>!!!!!</span>
  </div>
);

// every tag will be translated to createElement(...), so we need to make createElement return something

console.log(a);
document.body.appendChild(a);

// // import { ToyReact } from "./ToyReact";
// var a = ToyReact.createElement(
//   "div",
//   {
//     name: "a",
//   },
//   ToyReact.createElement("span", null, "Hello"),
//   ToyReact.createElement("span", null, "World"),
//   ToyReact.createElement("span", null, "!!!!!")
// );

// console.log(a);
// document.body.appendChild(a);
