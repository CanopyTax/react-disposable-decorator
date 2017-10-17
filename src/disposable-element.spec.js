import { CancelableComponent } from "./react-cancelable.js";
import { Observable } from "rx";
import { mount } from "enzyme";
import React from "react";

describe("CancelableComponent", function() {
	it("should render", function() {
		function Component({ cancelWhenUnmounted, cancelAllSubscriptions, stuff }) {
			return <div>Hello {stuff}</div>;
		}

		const wrapper = mount(
			<CancelableComponent>
				{(cancelWhenUnmounted, cancelAllSubscriptions) => (
					<Component
						cancelWhenUnmounted={cancelWhenUnmounted}
						cancelAllSubscriptions={cancelAllSubscriptions}
						stuff={1}
					/>
				)}
			</CancelableComponent>
		);

		expect(wrapper).toMatchSnapshot();
	});

	it("should cancel subscriptions", function(done) {
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

		const wrapper = mount(
			<CancelableComponent>
				{(cancelWhenUnmounted, cancelAllSubscriptions) => (
					<Component
						cancelWhenUnmounted={cancelWhenUnmounted}
						cancelAllSubscriptions={cancelAllSubscriptions}
						stuff={1}
					/>
				)}
			</CancelableComponent>
		);

		wrapper.unmount();
		setTimeout(done, 200);
	});

	it("should cancel all subscriptions", function(done) {
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

		const wrapper = mount(
			<CancelableComponent>
				{(cancelWhenUnmounted, cancelAllSubscriptions) => (
					<Component
						cancelWhenUnmounted={cancelWhenUnmounted}
						cancelAllSubscriptions={cancelAllSubscriptions}
						stuff={1}
					/>
				)}
			</CancelableComponent>
		);

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

		const makeError = () => mount(
			<CancelableComponent>
				{(cancelWhenUnmounted, cancelAllSubscriptions) => (
					<Component
						cancelWhenUnmounted={cancelWhenUnmounted}
						cancelAllSubscriptions={cancelAllSubscriptions}
						stuff={1}
					/>
				)}
			</CancelableComponent>
		);

		expect(makeError).toThrowError('cancelWhenUnmounted should be called with one or more disposables (an object with a dispose function)');
	});
});
