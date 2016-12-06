import React from "react";

export default function(DecoratedComponent) {
	return class Disposable extends DecoratedComponent {
		constructor(props) {
			super(props);
			this.__proto__.disposables = [];

			const originalComponentWillUnmount = this.__proto__.componentWillUnmount;
			this.__proto__.componentWillUnmount = function() {
				this.disposables.forEach(disposable => {
					if (disposable && typeof disposable.dispose === 'function')
						disposable.dispose()
				})
				if (originalComponentWillUnmount)
					originalComponentWillUnmount.apply(this, arguments)
			}
		}
	}
}