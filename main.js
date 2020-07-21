import { ToyReact, Component } from "./ToyReact";

class MyComponent extends Component {
  render() {
    return (
      <div>
        <span>Hello</span>
        <span>World</span>
        <div>{this.children}</div>
      </div>
    );
  }
}
const a = <MyComponent name="a">Hola</MyComponent>;

console.log(a);

ToyReact.render(a, document.body);
