import React from 'react'
import {shallow} from 'enzyme'
import Cancelable from './react-disposable-decorator.js'

describe(`@Cancelable`, () => {
  let mockComponent, mockCDM, mockCWU

  beforeEach(() => {
    mockComponent = class Mock extends React.Component {
      componentDidMount() {
        mockCDM.apply(this, arguments)
      }
      render() {
        return null
      }
      componentWillUnmount() {
        mockCWU.apply(this, arguments)
      }
    }

    mockCDM = jest.fn()
    mockCWU = jest.fn()
  })

  it(`passes the cancelWhenUnmounted and cancelAllSubscriptions props to the decorated component`, () => {
    mockCDM = function() {
      expect(typeof this.props.cancelWhenUnmounted).toBe('function')
      expect(typeof this.props.cancelAllSubscriptions).toBe('function')
    }
    const Comp = Cancelable(mockComponent)
    const wrapper = shallow(<Comp />).dive()
  })

  it(`throws an error if you call cancelWhenUnmounted with something that isn't cancelable`, () => {
    mockCDM = function() {
      expect(() => {
        this.props.cancelWhenUnmounted()
      }).toThrow()

      expect(() => {
        this.props.cancelWhenUnmounted(undefined)
      }).toThrow()

      expect(() => {
        this.props.cancelWhenUnmounted(null)
      }).toThrow()

      expect(() => {
        this.props.cancelWhenUnmounted({})
      }).toThrow()

      expect(() => {
        this.props.cancelWhenUnmounted({disposeee: jest.fn()}) // almost a cancelable thing except for the typo
      }).toThrow()
    }
    const Comp = Cancelable(mockComponent)
    const wrapper = shallow(<Comp />).dive()
  })

  it(`will automatically dispose of an rx@4 subscription (disposable)`, () => {
    const disposable = {dispose: jest.fn()}

    mockCDM = function() {
      this.props.cancelWhenUnmounted(disposable)
    }

    const Comp = Cancelable(mockComponent)
    const wrapper = shallow(<Comp />)
    const innerWrapper = wrapper.dive()

    expect(disposable.dispose).not.toHaveBeenCalled()

    wrapper.unmount()

    expect(disposable.dispose).toHaveBeenCalled()
    expect(disposable.dispose.mock.calls.length).toBe(1)
  })

  it(`will automatically dispose of an rx@>=5 subscription`, () => {
    const subscription = {unsubscribe: jest.fn()}

    mockCDM = function() {
      this.props.cancelWhenUnmounted(subscription)
    }

    const Comp = Cancelable(mockComponent)
    const wrapper = shallow(<Comp />)
    const innerWrapper = wrapper.dive()

    expect(subscription.unsubscribe).not.toHaveBeenCalled()

    wrapper.unmount()

    expect(subscription.unsubscribe).toHaveBeenCalled()
    expect(subscription.unsubscribe.mock.calls.length).toBe(1)
  })

  it(`will automatically dispose of a object with a cancel method (like lodash throttle functions)`, () => {
    const cancelable = {cancel: jest.fn()}

    mockCDM = function() {
      this.props.cancelWhenUnmounted(cancelable)
    }

    const Comp = Cancelable(mockComponent)
    const wrapper = shallow(<Comp />)
    const innerWrapper = wrapper.dive()

    expect(cancelable.cancel).not.toHaveBeenCalled()

    wrapper.unmount()

    expect(cancelable.cancel).toHaveBeenCalled()
    expect(cancelable.cancel.mock.calls.length).toBe(1)
  })

  it(`lets you pass in multiple subscriptions into cancelWhenUnmounted`, () => {
    const subscription1 = {unsubscribe: jest.fn()}
    const subscription2 = {unsubscribe: jest.fn()}

    mockCDM = function() {
      this.props.cancelWhenUnmounted(subscription1, subscription2)
    }

    const Comp = Cancelable(mockComponent)
    const wrapper = shallow(<Comp />)
    const innerWrapper = wrapper.dive()

    expect(subscription1.unsubscribe).not.toHaveBeenCalled()
    expect(subscription2.unsubscribe).not.toHaveBeenCalled()

    wrapper.unmount()

    expect(subscription1.unsubscribe).toHaveBeenCalled()
    expect(subscription1.unsubscribe.mock.calls.length).toBe(1)

    expect(subscription2.unsubscribe).toHaveBeenCalled()
    expect(subscription2.unsubscribe.mock.calls.length).toBe(1)
  })

  it(`cancels all subscriptions when you call cancelAllSubscriptions()`, () => {
    const subscription1 = {unsubscribe: jest.fn()}
    const subscription2 = {unsubscribe: jest.fn()}

    let mountProps

    mockCDM = function() {
      mountProps = this.props
      this.props.cancelWhenUnmounted(subscription1, subscription2)
    }

    const Comp = Cancelable(mockComponent)
    const wrapper = shallow(<Comp />)
    const innerWrapper = wrapper.dive()

    expect(subscription1.unsubscribe).not.toHaveBeenCalled()
    expect(subscription2.unsubscribe).not.toHaveBeenCalled()

    mountProps.cancelAllSubscriptions()

    expect(subscription1.unsubscribe).toHaveBeenCalled()
    expect(subscription1.unsubscribe.mock.calls.length).toBe(1)

    expect(subscription2.unsubscribe).toHaveBeenCalled()
    expect(subscription2.unsubscribe.mock.calls.length).toBe(1)
  })

  it(`cancels a subscription immediately if someone foolishly calls cancelWhenUnmounted after the component is unmounted`, () => {
    let mountProps

    mockCDM = function() {
      mountProps = this.props
    }

    const Comp = Cancelable(mockComponent)
    const wrapper = shallow(<Comp />)
    const innerWrapper = wrapper.dive()

    wrapper.unmount()

    const subscription = {unsubscribe: jest.fn()}

    expect(subscription.unsubscribe).not.toHaveBeenCalled()

    mountProps.cancelWhenUnmounted(subscription)

    expect(subscription.unsubscribe).toHaveBeenCalled()
    expect(subscription.unsubscribe.mock.calls.length).toBe(1)
  })
})
