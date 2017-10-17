import React from "react";
import ReactDOM from "react-dom";
import { Observable } from "rx";

const inTestingEnv = typeof jasmine !== "undefined";

export function DisposableDecorator() {
	return function decorator(DecoratedComponent) {
		return class Disposable extends React.Component {
			disposables = [];
			render() {
				return (
					<DecoratedComponent
						{...this.props}
						cancelWhenUnmounted={this.cancelWhenUnmounted}
						cancelAllSubscriptions={this.cancelAllSubscriptions}
					/>
				);
			}
			componentWillUnmount() {
				this.cancelAllSubscriptions();
			}
			cancelWhenUnmounted = cancelWhenUnmounted.bind(this);
			cancelAllSubscriptions = cancelAllSubscriptions.bind(this);
		};
	};
}

export function disposableModal(El, props = {}) {
	let el;

	return Observable.create(observer => {
		el = document.createElement("div");
		document.body.appendChild(el);

		ReactDOM.render(
			<El {...props} close={observer.onCompleted} save={observer.onNext} />,
			el
		);
	}).finally(() => {
		ReactDOM.unmountComponentAtNode(el);
		el.parentNode.removeChild(el);
	});
}

export class DisposableElement extends React.Component {
	disposables = [];
	render() {
		return this.props.children(
			this.cancelWhenUnmounted,
			this.cancelAllSubscriptions
		);
	}
	componentWillUnmount() {
		this.cancelAllSubscriptions();
	}
	cancelWhenUnmounted = cancelWhenUnmounted.bind(this);
	cancelAllSubscriptions = cancelAllSubscriptions.bind(this);
}

function cancelWhenUnmounted(...thingsToCancel) {
	thingsToCancel.forEach(thingToCancel => {
		if (!thingToCancel || typeof thingToCancel.dispose !== "function") {
			throw new Error(
				`cancelWhenUnmounted should be called with one or more disposables (an object with a dispose function)`
			);
		}
		this.disposables.push(thingToCancel);
	});
}

function cancelAllSubscriptions() {
	this.disposables.forEach(disposable => {
		if (disposable && typeof disposable.dispose === "function") {
			disposable.dispose();
		}
	});

	this.disposables = [];
}
