export type Dispatch<T> = (message: T) => void
export type Action<T> = (dispatch: (message: T | PromiseLike<T>) => void) => void;
export interface Program<S, T> {
  update(state: S, message: T): [S] | [S, Action<T>];
  view(state: S, dispatch: Dispatch<T>): void;
}

export class Runner<S, T> {
  constructor(private readonly program: Program<S, T>, private state: S, action?: Action<T>) {
    this.render(action);
  }

  getState = () => this.state;

  dispatch = (message?: T) => {
    if (message !== undefined) {
      const [state, action] = this.program.update(this.state, message);
      this.state = state;
      this.render(action);
    }
  };

  private render = (action?: Action<T>) => {
    this.program.view(this.state, this.dispatch);
    if (action !== undefined) {
      new Promise(action).then(this.dispatch);
    }
  }
}

export default <S, T>(program: Program<S, T>) => (state: S, action?: Action<T>) => new Runner(program, state, action);