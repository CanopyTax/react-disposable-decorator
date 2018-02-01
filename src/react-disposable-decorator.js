import React from "react";

const disabled = typeof disableReactDisposableDecorator === 'undefined' || disableReactDisposableDecorator;

export default function(DecoratedComponent) {
  if (!disabled) {
    return DecoratedComponent;
  }

  return class Disposable extends React.Component {
    static displayName = `Disposable(${DecoratedComponent.displayName || DecoratedComponent.name})`

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
