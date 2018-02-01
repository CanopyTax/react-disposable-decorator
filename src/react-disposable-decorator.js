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
    }

    render() {
      return <DecoratedComponent {...this.props} cancelWhenUnmounted={this.cancelWhenUnmounted} cancelAllSubscriptions={this.cancelAllSubscriptions} />
    }
    componentWillUnmount() {
      this.cancelAllSubscriptions();
    }
    cancelWhenUnmounted = (...thingsToCancel) => {
      thingsToCancel.forEach(thingToCancel => {
        if (!thingToCancel || typeof thingToCancel.dispose !== 'function') {
          throw new Error(`cancelWhenUnmounted should be called with one or more disposables (an object with a dispose function)`);
        }
        this.disposables.push(thingToCancel);
      });
    }
    cancelAllSubscriptions = () => {
      this.disposables.forEach(disposable => {
        if (disposable && typeof disposable.dispose === 'function') {
          disposable.dispose();
        }
      });

      this.disposables = [];
    }
  }
}
