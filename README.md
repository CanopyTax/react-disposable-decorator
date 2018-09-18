# react-disposable-decorator
Decorator for automatically canceling observable and other subscriptions when a React
component is unmounted.

A `cancelWhenUnmounted` function is passed to the decorated component as a prop,
which should be called with an observable subscription (a disposable). [Click here](https://github.com/Reactive-Extensions/RxJS/issues/817#issuecomment-122729155)
for more documentation on canceling observables.

Also, a `cancelAllSubscriptions` function is passed to the decorated component as a prop. This should be called with
no arguments, and will cancel all subscriptions that were registered via `cancelWhenUnmounted`. It will also reset the list of
subscriptions to be empty, so that future calls to `cancelWhenUnmounted` and `cancelAllSubscriptions` will start fresh.
Note that `cancelAllSubscriptions` is automatically called during componentWillUnmount.

Finally, react-disposable-decorator stores a react ref of the component that will be decorated as `this.el` so it is possible to access the original component.

## Installation
`npm install react-disposable-decorator`
or
`yarn add react-disposable-decorator`

## Usage
```js
import Cancelable from 'react-disposable-decorator';

@Cancelable //decorate the component
export default class SomeComponent extends React.Component {
  componentDidMount() {
    this.props.cancelWhenUnmounted(
      /* This will be automatically canceled if the observable does not
	   * onComplete or onError before the React component is unmounted.
	   */
      fetchSomeData.subscribe( data => this.setstate({data}) )
    );
  }
  componentDidUpdate(prevProps) {
    // Example usage of how you might use cancelAllSubscriptions
    if (this.props.needToMakeNewSubscriptions) {
      this.props.cancelAllSubscriptions();
      this.props.cancelWhenUnmounted(
        fetchSomeData.subscribe(data => this.setState({data}));
      );
    }
  }
}
...
```

## In tests

If you're using Enzyme shallow rendering, try doing [`shallow(<Foo />).dive()`](http://airbnb.io/enzyme/docs/api/ShallowWrapper/dive.html) on
components decorated with react-disposable-decorator to be able to test the wrapped component.

If you wish to disable the react-disposable-decorator in tests altogether (so you don't have to `.dive()`), you can
set a global variable `global.disableReactDisposableDecorator = true` in your test configuration before you import the
react-disposable-decorator javascript module into the test environment.

## Accessing Original component ref
react-disposable-decorator stores a react ref of the oriignal component as `this.el`.
Using refs to access components have good use cases listed [here](https://reactjs.org/docs/refs-and-the-dom.html#when-to-use-refs).
`react-disposable-decorator` does not prevent using refs.

```jsx
@Cancelable
class Hello extends React.Component {
  constructor(props) {
    super(props)
      this.logHello = this.logHello.bind(this)
  }
  logHello() {
    console.log('hello')
  }
  render () {
    <div>
      Hello
    </div>
  }
}

class wrappingComponent extends React.Component {
  componentDidMount() {
    this.hello.el.logHello()
    // calls logHello
  }
  render () {
    return (
      <div>
        <Hello ref={el => this.hello = el}>
      </div>
    )
  }
}

```
