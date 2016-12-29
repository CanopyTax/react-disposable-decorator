import React from "react";

export default function(DecoratedComponent) {
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
