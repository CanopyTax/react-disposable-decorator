import { DisposableDecorator } from "./react-disposable.js";
import { Observable } from "rx";
import { mount } from "enzyme";
import React from "react";

describe("DisposableDecorator", function() {
	it("should render", function() {
		function Component({ cancelWhenUnmounted, cancelAllSubscriptions, stuff }) {
			return <div>Hello {stuff}</div>;
		}

		const Decorated = DisposableDecorator()(Component);

		const wrapper = mount(<Decorated stuff={1} />);

		expect(wrapper).toMatchSnapshot();
	});

	it("should cancel a subscription when unmounting", function(done) {
		class Component extends React.Component {
			componentDidMount() {
				this.props.cancelWhenUnmounted(
					Observable.timer(100).subscribe(() => {
						fail('should have canceled the subscription');
					})
				);
			}
			render() {
				return <div>Hello {this.props.stuff}</div>;
			}
		}

		const Decorated = DisposableDecorator()(Component);

		const wrapper = mount(<Decorated stuff={1} />);

		wrapper.unmount();

		setTimeout(done, 200);
	});

	it("should cancel multiple subscriptions when unmounting", function(done) {
		class Component extends React.Component {
			componentDidMount() {
				this.props.cancelWhenUnmounted(
					Observable.timer(100).subscribe(() => {
						fail('should have canceled the subscription');
					})
				);

				this.props.cancelWhenUnmounted(
					Observable.timer(50).subscribe(() => {
						fail('should have canceled the subscription');
					})
				);
			}
			render() {
				return <div>Hello {this.props.stuff}</div>;
			}
		}

		const Decorated = DisposableDecorator()(Component);

		const wrapper = mount(<Decorated stuff={1} />);

		wrapper.unmount();

		setTimeout(done, 200);
	});

	it("should cancel all subscriptions imperatively", function(done) {
		class Component extends React.Component {
			componentDidMount() {
				this.props.cancelWhenUnmounted(
					Observable.timer(100).subscribe(() => {
						fail('should have canceled the subscription');
					})
				);

				this.props.cancelWhenUnmounted(
					Observable.timer(50).subscribe(() => {
						fail('should have canceled the subscription');
					})
				);

				this.props.cancelAllSubscriptions();
			}
			render() {
				return <div>Hello {this.props.stuff}</div>;
			}
		}

		const Decorated = DisposableDecorator()(Component);

		const wrapper = mount(<Decorated stuff={1} />);

		setTimeout(done, 200);
	});

	it("should throw when a non subscription is passed", function() {
		class Component extends React.Component {
			componentDidMount() {
				this.props.cancelWhenUnmounted(
					"this should not work"
				);
			}
			render() {
				return <div>Hello {this.props.stuff}</div>;
			}
		}

		const Decorated = DisposableDecorator()(Component);

		const makeError = () => mount(<Decorated stuff={1} />);
		expect(makeError).toThrowError('cancelWhenUnmounted should be called with one or more disposables (an object with a dispose function)');
	});
});
