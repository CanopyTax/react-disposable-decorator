import { DisposableDecorator, disposableModal } from "./react-disposable.js";
import { Observable } from "rx";
import { mount } from "enzyme";
import React from "react";

describe("DisposableElement", function() {
	it("should render", function() {
		function Component({ cancelWhenUnmounted, cancelAllSubscriptions, stuff }) {
			return <div>Hello {stuff}</div>;
		}

		const disposable = disposableModal(Component).subscribe(data => {
		});

		expect(document.body).toMatchSnapshot();
		disposable.dispose();
	});

	it("should provide close method", function(done) {
		class Component extends React.Component {
			componentDidMount() {
				setTimeout(this.props.close, 100);
			}
			render() {
				return <div>Hello {this.props.stuff}</div>;
			}
		}

		const disposable = disposableModal(Component).subscribe(data => {});

		setTimeout(() => {
			expect(document.body).toMatchSnapshot();
			disposable.dispose();
			done();
		}, 200);
	});

	it('should work with disposable decorator', function() {
		class Component extends React.Component {
			componentDidMount() {
				this.props.cancelWhenUnmounted(
					disposableModal(Modal).subscribe(data => {})
				);
			}
			render() {
				return <div>Hello {this.props.stuff}</div>;
			}
		}

		class Modal extends React.Component {
			render() {
				return <button close={this.props.close}></button>
			}
		}

		const Decorated = DisposableDecorator()(Component);
		const wrapper = mount(<Decorated stuff={1} />);
		expect(document.body).toMatchSnapshot();
		wrapper.unmount();
		expect(document.body).toMatchSnapshot();
	});
});
