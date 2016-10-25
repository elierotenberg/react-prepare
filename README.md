## react-prepare

`react-prepare` allows you to have you deeply nested components with asynchronous dependencies, and have everything just work with server-side rendering.

The typical use-case is when a deeply-nested component needs to have a resource fetched from a remote HTTP server, such as GraphQL or REST API. Since `renderToString` is synchronous, when you call it on your app, this component won't render correctly.

One solution is to have a central router at the root of your application that knows exactly what data needs to be fetched before rendering. But this solution doesn't fit the component-based architecture of a typical React app. You want to declare data dependencies at the component level, much like your declare your props.

This is exactly what `react-prepare` does: it allows you to declare asynchronous dependencies at the component level, and make them work fine with server-side rendering as well as client-side rendering.

`react-prepare` is agnostic and can be used vanilla, but it comes with a tiny helper that makes it extremely easy to use along `redux` and `react-redux` (see examples below).

#### Example with `react-redux`

Lets assume you have defined an async action creator `fetchTodoItems(userName)` which performs HTTP request to your server to retrieve the todo items for a given user and stores the result in your redux state.

Your `TodoList` component definition would look like this:

```js
import { dispatched } from 'react-prepare';
import { connect } from 'react-redux';

import { fetchTodoItems } from './actions';

const TodoList = ({ items }) => <ul>{items.map((item, key) =>
  <li key={key}>{item}</li>
</ul>}</ul>;

export default dispatched({ userName }, (dispatch) => dispatch(fetchTodoItems(userName)))(
  connect(({ todoItems }) => ({ items: todoItems })(
    TodoList,
  ),
);
```

And your server-side rendering code would look like this:

```js
import { renderToString } from 'react-dom/server';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { Provider } from 'react-redux';
import prepare from 'react-prepare';

import reducer from './reducer';

async function serverSideRender(userName) {
  const store = createStore(reducer, applyMiddleware(thunkMiddleware));
  const app = <Provider store={store}>
    <TodoList userName={userName} />
  </Provider>;
  await prepare(app);
  return {
    html: renderToString(app),
    state: store.getState(),
  };
}
```

Your client could re-use the data fetched during server-side rendering directly, eg. assuming your injected it in `window.__APP_STATE__`:

```js
const store = createStore(reducer, JSON.parse(window.__APP_STATE__));
render(<Provider store={store}>
  <TodoList userName={userName} />
</Provider>, document.getElementById('app'));
```

### API

#### `dispatched(sideEffect: async(props, dispatch), opts)(Component)`

Helper to use `prepared` more simply if your side effects consists mostly of dispatching redux actions.

#### `prepared(sideEffect: async(props, context), opts)(Component)`

Decorates Component so that when `prepare` is called, `sideEffect` is called (and awaited) before continuing the rendering traversal.

Available `opts` is an optional configuration object:

- `opts.pure` (default: `true`): the decorated component extends `PureComponent` instead of `Component`.
- `opts.componentDidMount` (default: `true`): on the client, `sideEffect` is called when the component is mounted.
- `opts.componentWillReceiveProps` (default: `true`): on the client, `sideEffect` is called again whenever the component receive props.

#### `async prepare(Element)`

Recursively traverses the element rendering tree and awaits the side effects of components decorated with `prepared` (or `dispatched`).
