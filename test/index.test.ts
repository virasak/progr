import runtime, { Dispatch, Program } from '../src';

enum CounterMessage {
  Inc, Dec, DecLater
}
describe('Runner with counter program', () => {
  var state: number;
  var dispatch: Dispatch<CounterMessage>;
  const program: Program<number, CounterMessage> = {
    update(count, message) {
      switch (message) {
        case CounterMessage.Inc: return [count + 1,];
        case CounterMessage.Dec: return [count - 1];
        case CounterMessage.DecLater: return [count, (dispatch) => dispatch(Promise.resolve(CounterMessage.Dec))];
        default: return [count];
      }
    },
    view(count, _dispatch) {
      state = count;
      dispatch = _dispatch;
    }
  };

  it('should able to run counter both inside view and direct call with runner.dispatch', () => {
    const counter = runtime(program)(0);
    expect(state).toEqual(0);
    expect(counter.getState()).toEqual(0);

    counter.dispatch(CounterMessage.Inc);
    expect(state).toEqual(1);
    expect(counter.getState()).toEqual(1);

    dispatch(CounterMessage.Inc);
    expect(state).toEqual(2);
    expect(counter.getState()).toEqual(2);

    counter.dispatch(CounterMessage.Dec);
    expect(state).toEqual(1);
    expect(counter.getState()).toEqual(1);

    counter.dispatch(CounterMessage.DecLater);
    expect(state).toEqual(1);
    expect(counter.getState()).toEqual(1);
    setTimeout(() => {
      expect(state).toEqual(0);
      expect(counter.getState()).toEqual(0);
    }, 0);

  });

  it('should accept initial action', () => {
    const counter = runtime(program)(0, resolve => resolve(CounterMessage.Inc));
    expect(counter.getState()).toEqual(0);
    setImmediate(() => {
      expect(counter.getState()).toEqual(1);
    });
  })

  it('should accept initial action with promise-liked message', () => {
    const counter = runtime(program)(0, resolve => resolve(Promise.resolve(CounterMessage.Inc)));
    expect(counter.getState()).toEqual(0);
    setImmediate(() => {
      expect(counter.getState()).toEqual(1);
    });
  })
});
