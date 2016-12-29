# react-disposable-decorator
Decorator for properly disposing and canceling observables.

Adds a `disposables` array as a prop to the decorated component. Anything pushed into the disposables prop
will be properly canceled and disposed when the decorated component is unmounted. This means that in your
.subscribe(), you won't have to check if your component has been unmounted while you were waiting on
a value from an observable.

#Installation
`npm install react-disposable-decorator`

#Usage
```js
import Disposable from 'react-disposable-decorator';

@Disposable //decorate the component
export default class SomeComponent extends React.Component {
  componentDidMount(){
    this.props.disposables.push( //push observables to the disposables array
      fetchSomeData.subscribe( data => this.setstate({data}) )
    )
  }
}
...
```
