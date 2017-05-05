import React from "react";

const inTestingEnv = typeof jasmine !== 'undefined';
const enabled = !inTestingEnv || (typeof ReactDisposableDecoratorEnabled !== 'undefined' && ReactDisposableDecoratorEnabled);

export default function(DecoratedComponent) {
	if (!enabled) {
		return DecoratedComponent;
	}

	return class Disposable extends React.Component {
		constructor(props) {
			super(props);
			this.disposables = [];
		}
		render() {
			return <DecoratedComponent {...this.props} cancelWhenUnmounted={this.cancelWhenUnmounted} />
		}
		componentWillUnmount() {
			this.disposables.forEach(disposable => {
				if (disposable && typeof disposable.dispose === 'function') {
					disposable.dispose();
				}
			});
		}
		cancelWhenUnmounted = (...thingsToCancel) => {
			thingsToCancel.forEach(thingToCancel => {
				if (!thingToCancel || typeof thingToCancel.dispose !== 'function') {
					throw new Error(`cancelWhenUnmounted should be called with one or more disposables (an object with a dispose function)`);
				}
				this.disposables.push(thingToCancel);
			});
		}
	}
}
