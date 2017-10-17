# react-cancelable
Primitives for automatically canceling observable subscriptions when a React
component is unmounted.

[![npm version](https://img.shields.io/npm/v/react-disposable-decorator.svg?style=flat-square)](https://www.npmjs.org/package/react-disposable-decorator)
[![Build Status](https://img.shields.io/travis/CanopyTax/react-disposable-decorator.svg?style=flat-square)](https://travis-ci.org/CanopyTax/react-disposable-decorator)
[![Code Coverage](https://img.shields.io/codecov/c/github/CanopyTax/react-disposable-decorator.svg?style=flat-square)](https://codecov.io/github/CanopyTax/react-disposable-decorator)

# Installation
`npm install react-cancelable`


# API
## `Cancelable` - A that provides your component with methods for auto-unsubscribing from an observable subscription
The decorator provides the following props:

A `cancelWhenUnmounted` function is passed to the decorated component as a prop,
which should be called with an observable subscription (a disposable). [Click here](https://github.com/Reactive-Extensions/RxJS/issues/817#issuecomment-122729155)
for more documentation on canceling observables.

Also, a `cancelAllSubscriptions` function is passed to the decorated component as a prop. This should be called with
no arguments, and will cancel all subscriptions that were registered via `cancelWhenUnmounted`. It will also reset the list of
subscriptions to be empty, so that future calls to `cancelWhenUnmounted` and `cancelAllSubscriptions` will start fresh.

## `CancelableElement` - Similar to the decorator, but renders children passing both `cancelWhenUnmounted` and `cancelAllSubscriptions` as parameters (see example)

## `cancelableModal(Element, props)` - A helper function for rendering an element to `document.body` that will automatically remove itself from the dom when the observable completes.
The `Element` passed is the "modal" or any other element that will get rendered and appended to the DOM. The element will be passed two props, `save` and `close` for saving data out of the modal or closing the modal.
The `props` parameter is used to pass extra props to the modal.

# Examples
```js
import {Cancelable, CancelableComponent, cancelableModal} from 'react-cancelable';

@Cancelable //decorate the component
class SomeComponent extends React.Component {
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

class SomeComponent extend React.Component {
  componentDidMount() {
    this.cancelWhenUnmounted(
      /* This will be automatically canceled if the observable does not
       * onComplete or onError before the React component is unmounted.
       */
      fetchSomeData.subscribe( data => this.setstate({data}) )
    );
  }
  render() {
    return <CancelableComponent>
    {(cancelWhenUnmounted, cancelAllSubscriptions) => {
      // store the methods for cancelling, or they could be
      // passed to a child component
      this.cancelWhenUnmounted = cancelWhenUnmounted;
      this.cancelAllSubscriptions = cancelAllSubscriptions;
      return <div>My stuff</div>
    }}
    </CancelableComponent>
  }
}

function YourModal({save, close}) {
  return <div>
    <button onClick={() => (save("data"), close())}>Save</button>
    <button onClick={close}>cancel</button>
  </div>
}

// This could easily be consumed by the Cancelable decorator or component
cancelableModal(YourModal, propsToPass).subscribe(
  data => console.log(data)
);
```
