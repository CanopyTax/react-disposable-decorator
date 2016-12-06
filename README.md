# react-disposable-decorator
Decorator for properly disposing of observables

Creates `this.disposables = []` and calls `.dispose()` on all elements of the array when the decorated component unmounts

#Installation
`npm install react-disposable-decorator`

#Usage
```js
import Disposable from 'react-disposable-decorator';

@Disposable //decorate the component
export default class someComponent extends React.Component {
  constructor(props) {
	  super(props);
  }
  
  componentDidMount(){
    this.disposables.push( //push observables to the disposables array
      fetchSomeData.subscribe( data => this.setstate({data}) )
    )
  }

...
```
