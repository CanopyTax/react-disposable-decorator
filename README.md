# react-disposable-decorator
Decorator for automatically canceling observable subscriptions when a React
component is unmounted.

A `cancelWhenUnmounted` function is passed to the decorated component as a prop,
which should be called with an observable subscription (a disposable). [Click here](https://github.com/Reactive-Extensions/RxJS/issues/817#issuecomment-122729155)
for more documentation on canceling observables.

#Installation
`npm install react-disposable-decorator`

#Usage
```js
import Disposable from 'react-disposable-decorator';

@Disposable //decorate the component
export default class SomeComponent extends React.Component {
  componentDidMount() {
    this.props.cancelWhenUnmounted(
      /* This will be automatically canceled if the observable does not
	   * onComplete or onError before the React component is unmounted.
	   */
      fetchSomeData.subscribe( data => this.setstate({data}) )
    );
  }
}
...
```
