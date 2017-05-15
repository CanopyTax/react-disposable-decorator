# react-disposable-decorator
Decorator for automatically canceling observable subscriptions when a React
component is unmounted.

A `cancelWhenUnmounted` function is passed to the decorated component as a prop,
which should be called with an observable subscription (a disposable). [Click here](https://github.com/Reactive-Extensions/RxJS/issues/817#issuecomment-122729155)
for more documentation on canceling observables.

Also, a `cancelAllSubscriptions` function is passed to the decorated component as a prop. This should be called with
no arguments, and will cancel all subscriptions that were registered via `cancelWhenUnmounted`. It will also reset the list of
subscriptions to be empty, so that future calls to `cancelWhenUnmounted` and `cancelAllSubscriptions` will start fresh.

# Installation
`npm install react-disposable-decorator`

# Usage
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
  componentWillReceiveProps(nextProps) {
    // Example usage of how you might use cancelAllSubscriptions
    if (nextProps.needToMakeNewSubscriptions) {
      this.props.cancelAllSubscriptions();
      this.props.cancelWhenUnmounted(
        fetchSomeData.subscribe(data => this.setState({data}));
      );
    }
  }
}
...
```
