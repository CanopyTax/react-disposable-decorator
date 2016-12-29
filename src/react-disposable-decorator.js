import React from "react";

export default function(DecoratedComponent) {
	return class Disposable extends React.Component {
		constructor(props) {
			super(props);
			this.disposables = [];
		}
		render() {
			return <DecoratedComponent {...this.props} disposables={this.disposables} />
		}
		componentWillUnmount() {
			this.disposables.forEach(disposable => {
				if (disposable && typeof disposable.dispose === 'function') {
					disposable.dispose();
				}
			});
		}
	}
}
