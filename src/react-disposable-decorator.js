import React from "react";

const disabled = typeof disableReactDisposableDecorator === 'undefined' ? false : disableReactDisposableDecorator;
const inTestingEnv = typeof jasmine !== 'undefined';

export default function(DecoratedComponent) {
  if (disabled) {
    return DecoratedComponent;
  }

  const originalDisplayName = DecoratedComponent.displayName || DecoratedComponent.name;

  return class Disposable extends React.Component {
    // Don't change display name in tests, so that snapshots and wrapper.find('CompName') works.
    // But in browser/non-tests react-dev-tools are easier to understand with a slightly altered display name
    static displayName = inTestingEnv ? originalDisplayName : `Cancelable(${originalDisplayName})`

    constructor(props) {
      super(props);
      this.disposables = [];
      this.mounted = true;
    }

    render() {
      return <DecoratedComponent {...this.props} cancelWhenUnmounted={this.cancelWhenUnmounted} cancelAllSubscriptions={this.cancelAllSubscriptions} />
    }
    componentWillUnmount() {
      this.cancelAllSubscriptions();
      this.mounted = false;
    }
    cancelWhenUnmounted = (...thingsToCancel) => {
      if (thingsToCancel.length === 0) {
          throw new Error(`cancelWhenUnmounted should be called with one or more cancelables (an object with a dispose, unsubscribe, or cancel function)`);
      }

      thingsToCancel.forEach(thingToCancel => {
        if (!thingToCancel || (typeof thingToCancel.dispose !== 'function' && typeof thingToCancel.cancel !== 'function' && typeof thingToCancel.unsubscribe !== 'function')) {
          throw new Error(`cancelWhenUnmounted should be called with one or more cancelables (an object with a dispose, unsubscribe, or cancel function)`);
        }

        if (this.mounted) {
          this.disposables.push(thingToCancel);
        } else {
          // They called cancelWhenUnmounted after the component unmounted...
          cancel(thingToCancel)
        }
      });
    }
    cancelAllSubscriptions = () => {
      this.disposables.forEach(disposable => {
        cancel(disposable)
      });

      this.disposables = [];
    }
  }
}

function cancel(thing) {
  if (typeof thing.dispose === 'function') {
    thing.dispose()
  } else if (typeof thing.unsubscribe === 'function') {
    thing.unsubscribe()
  } else if (typeof thing.cancel === 'function') {
    thing.cancel()
  } else {
    // Don't throw an error when we can't cancel the thing they passed in.
  }
}
