import { ToyReact, Component } from "./ToyReact";

class MyComponent extends Component {
  render() {
    return (
      <div>
        <span>Hello</span>
        <span>World</span>
      </div>
    );
  }
}
const a = <MyComponent name="a"></MyComponent>;

console.log(a);

ToyReact.render(a, document.body);
