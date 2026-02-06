# React Native Interview Questions

***

### **1) JavaScript & TypeScript (12 questions)**

<details>
  <summary>JavaScript &amp; TypeScript — Core + Advanced (12)</summary>

  <details><summary>1. Explain <code>var</code>, <code>let</code>, <code>const</code> and hoisting (TDZ).</summary>

Great—let’s keep this crisp, developer-friendly, and example-driven.

## 1) `var`, `let`, `const` + Hoisting & TDZ (Temporal Dead Zone)

### Scope & Re-assignment

*   **`var`**
    *   **Function-scoped** (or global if declared outside functions).
    *   **Can be re-declared and re-assigned** in the same scope.
    *   **Attaches to `window`/global object** in browsers when global.
*   **`let`**
    *   **Block-scoped** (`{ ... }`).
    *   **Cannot be re-declared** in the same scope; **can be re-assigned**.
*   **`const`**
    *   **Block-scoped**.
    *   **Cannot be re-declared or re-assigned** (but **objects/arrays are still mutable**—binding is constant, not value).

### Hoisting & TDZ

*   **Hoisting** = variable declarations are moved to the top of their scope *at compile time*.
*   `var` is hoisted and initialized to **`undefined`** → accessing it **before declaration** doesn’t throw, but gives `undefined`.
*   `let`/`const` are hoisted **without initialization** → accessing them **before declaration** throws a **ReferenceError** due to the **Temporal Dead Zone (TDZ)**—the time between entering scope and the actual declaration.

***

## Quick Examples

### 1) Scope differences

```js
function test() {
  if (true) {
    var a = 1;     // function-scoped
    let b = 2;     // block-scoped
    const c = 3;   // block-scoped
  }
  console.log(a); // 1
  // console.log(b); // ReferenceError
  // console.log(c); // ReferenceError
}
test();
```

### 2) Hoisting behavior

```js
console.log(x); // undefined (var is hoisted & initialized)
var x = 10;

console.log(y); // ReferenceError (TDZ)
let y = 20;

console.log(z); // ReferenceError (TDZ)
const z = 30;
```

### 3) Re-declaration & re-assignment

```js
var a = 1;
var a = 2;   // OK (re-declare)
a = 3;       // OK

let b = 1;
// let b = 2;  // SyntaxError (cannot re-declare)
b = 2;        // OK

const c = 1;
// const c = 2; // SyntaxError (cannot re-declare)
// c = 2;       // TypeError (cannot re-assign)
```

### 4) `const` with objects/arrays

```js
const user = { name: 'Harshal' };
user.name = 'Harshal V.'; // OK (mutating object)
/// user = {} // TypeError (cannot re-assign binding)

const arr = [1, 2];
arr.push(3); // OK
```

### 5) Common bug: `var` in loops (closures)

```js
// Problem: all logs '3' due to function-scoped var
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log('var i:', i), 0);
}
// Fix: use let (block-scoped per iteration)
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log('let j:', j), 0); // 0,1,2
}
```

### 6) TDZ with default parameters

```js
let a = 1;
// function f(a = a) { } // ReferenceError (right `a` is in TDZ of param scope)
function f(a = 1) { return a; } // Safe
```

***

## Practical Guidelines (Interview-ready)

*   Use **`const` by default**, switch to **`let`** when you need reassignment.
*   **Avoid `var`**—it causes tricky scope/hoisting bugs, especially in loops and async code.
*   Remember **TDZ**: don’t access `let`/`const` before their declaration—keep declarations at the top of the block.
*   For **financial apps**, prefer **immutability** (`const` + immutable patterns) to avoid subtle state bugs.

  </details>

  <details><summary>2. How do closures work? Example of stale state in React hooks.</summary>

Great question—let’s keep it concise and practical.

## Closures (Quick Refresher)

A **closure** is when a function “remembers” the variables from its **lexical scope** even after that function has returned.

```js
function makeCounter() {
  let count = 0;
  return function next() {
    count += 1;     // next() closes over `count`
    return count;
  };
}

const counter = makeCounter();
counter(); // 1
counter(); // 2
```

In React, closures show up in **event handlers, effects, and async callbacks**—and can cause **stale state** bugs if you accidentally capture an old value.

***

## Stale State in React Hooks (What & Why)

**Stale state** happens when a callback created in an earlier render **closes over** old `state`/`props` and then runs later (e.g., a timer, promise, subscription).

### ❌ Classic Bug: `setInterval` closing over old state

```jsx
function Timer() {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => {
      // ❌ 'count' here is the value from when effect ran (stale)
      setCount(count + 1);
    }, 1000);

    return () => clearInterval(id);
  }, []); // empty deps runs once → callback always sees initial count (0)

  return <Text>{count}</Text>;
}
```

**Symptoms**: `count` only goes 0 → 1 and then stops, or increments erratically.

### ✅ Fix 1: Functional state updates (recommended)

Use the **updater function** to read the **latest** state at call time:

```jsx
setCount(prev => prev + 1);
```

```jsx
React.useEffect(() => {
  const id = setInterval(() => {
    setCount(prev => prev + 1); // ✅ no stale capture
  }, 1000);
  return () => clearInterval(id);
}, []);
```

***

### ❌ Bug: Async callbacks with stale state

```jsx
function SearchBox() {
  const [query, setQuery] = React.useState('');

  const onSearch = async () => {
    await fetch('/api?q=' + query); // ❌ may use old `query` if handler was created earlier
  };

  // ...
}
```

### ✅ Fix 2: Rely on fresh values (read at call time)

Pass the current value into the async function at the time you call it:

```jsx
const onSearch = async (q) => {
  await fetch('/api?q=' + q); // ✅ uses the current value passed in
};

// usage
<TextInput value={query} onChangeText={setQuery} />
<Button title="Search" onPress={() => onSearch(query)} />
```

***

### ❌ Bug: Event handler closes over stale `props`

```jsx
function Item({ id, onDelete }) {
  const handleDelete = () => {
    // ❌ may close over old `id` if parent reorders/re-renders
    onDelete(id);
  };
  return <Button title="Delete" onPress={handleDelete} />;
}
```

This is often fine, but can bite when handlers live long (e.g., registered globally) or are memoized incorrectly.

### ✅ Fix 3: Keep stable handler but access latest values via refs

```jsx
function Item({ id, onDelete }) {
  const idRef = React.useRef(id);
  React.useEffect(() => { idRef.current = id; }, [id]);

  const handleDelete = React.useCallback(() => {
    onDelete(idRef.current); // ✅ always latest
  }, [onDelete]);

  return <Button title="Delete" onPress={handleDelete} />;
}
```

***

## Patterns to Prevent Stale Closures

1.  **Functional updates** for state that depends on previous state:
    ```jsx
    setState(prev => compute(prev));
    ```

2.  **Correct effect dependencies**:
    *   If the effect **uses** a value, it should usually be in the dependency array.
    *   Or refactor to **functional updates** or **refs** when you need a stable effect.

3.  **Refs for mutable, non-UI state** that must stay fresh across callbacks:
    ```jsx
    const latest = React.useRef(value);
    React.useEffect(() => { latest.current = value; }, [value]);
    ```

4.  **Abort/cleanup async work** to avoid using outdated values:
    ```jsx
    React.useEffect(() => {
      const ac = new AbortController();
      fetch(url, { signal: ac.signal }).catch(() => {});
      return () => ac.abort();
    }, [url]);
    ```

5.  **useCallback with correct deps** to avoid stale captures (don’t over-memoize):
    ```jsx
    const onSubmit = React.useCallback(() => {
      // uses `formData` → include it in deps
    }, [formData]);
    ```

6.  **(React 19+) `useEvent`** (if available in your setup) creates event handlers that always see **fresh props/state** without re-subscribing.

***

## Quick RN-specific Example: Stale state in API polling

```jsx
function Balances() {
  const [refresh, setRefresh] = React.useState(false);

  React.useEffect(() => {
    const id = setInterval(async () => {
      // ❌ might read stale 'refresh' if referenced directly
      // fetch balances...
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // ✅ use ref to read latest flag inside the interval
  const refreshRef = React.useRef(refresh);
  React.useEffect(() => { refreshRef.current = refresh; }, [refresh]);

  return <Switch value={refresh} onValueChange={setRefresh} />;
}
```

***

## TL;DR (Interview Soundbite)

*   Closures capture variables from their defining render.
*   **Stale state** happens when long-lived callbacks (timers, async, subscriptions) use **old captured values**.
*   **Fixes**: use **functional updates**, **proper effect deps**, **refs for latest values**, **abort/cleanup** async, and **useCallback/useEvent** appropriately.

  </details>

  <details><summary>3. Explain event loop, microtasks vs macrotasks using Promises and setTimeout.</summary>

Here’s a **simple, interview-friendly, developer-focused** explanation of the **event loop, microtasks, and macrotasks**, with **clear diagrams and code examples**.  
No external search is needed since this is core JavaScript knowledge.

***

# ✅ **3. Explain Event Loop, Microtasks vs Macrotasks using Promises and setTimeout**

The **Event Loop** controls *how JavaScript executes code*, especially when mixing **sync code**, **Promises**, **setTimeout**, **fetch**, and other async tasks.

JavaScript is **single-threaded** → it can run **one thing at a time**, and the event loop decides *what runs next*.

***

# 🧠 **Event Loop Overview**

JavaScript has:

1.  **Call Stack** → executes your code line-by-line.
2.  **Task Queues**
    *   **Microtask Queue** → *high priority*
        *   Promises (`.then`, `.catch`, `.finally`)
        *   `queueMicrotask()`
        *   `MutationObserver`
    *   **Macrotask Queue** → *lower priority*
        *   `setTimeout`
        *   `setInterval`
        *   `setImmediate` (Node.js)
        *   `I/O` callbacks
        *   UI rendering tasks

### ⭐ Order of execution:

    Synchronous code
    ↓
    All Microtasks
    ↓
    One Macrotask
    ↓
    Render UI (in RN or browser)
    ↓
    Repeat...

***

# 📌 **Microtasks vs Macrotasks**

| Type           | Examples                                               | Priority  |
| -------------- | ------------------------------------------------------ | --------- |
| **Microtasks** | Promises, queueMicrotask                               | ⭐ Highest |
| **Macrotasks** | setTimeout, setInterval, setImmediate, fetch callbacks | Lower     |

***

# 🔍 Example 1 — Promises vs setTimeout

```js
console.log("A");

setTimeout(() => {
  console.log("B - Timeout");
}, 0);

Promise.resolve().then(() => {
  console.log("C - Promise");
});

console.log("D");
```

### Output order:

    A
    D
    C - Promise   (microtask)
    B - Timeout   (macrotask)

### Why?

1.  Sync → A, D
2.  **Promise microtask** → C
3.  **setTimeout macrotask** → B

***

# 🔍 Example 2 — Multiple microtasks before any macrotask

```js
setTimeout(() => console.log("Timeout"), 0);

Promise.resolve().then(() => console.log("Promise 1"));
Promise.resolve().then(() => console.log("Promise 2"));
```

### Output:

    Promise 1
    Promise 2
    Timeout

👉 The event loop **empties the microtask queue completely** before running **any** macrotask.

***

# 🔍 Example 3 — Microtask inside a macrotask

```js
setTimeout(() => {
  console.log("A - Timeout");

  Promise.resolve().then(() => {
    console.log("B - Microtask inside Timeout");
  });
}, 0);

console.log("C - Sync");
```

### Output:

    C - Sync
    A - Timeout
    B - Microtask inside Timeout

Why?

*   After the **timeout macrotask**, JS checks for **microtasks created inside it** → so B prints before the next macrotask.

***

# 🔍 Example 4 — React Native Scenario (API + UI update)

```js
console.log("Start");

fetch("https://example.com")     // async task
  .then(() => console.log("Fetched - Microtask"));

setTimeout(() => {
  console.log("Timer - Macrotask");
}, 0);

console.log("End");
```

### Output:

    Start
    End
    Fetched - Microtask
    Timer - Macrotask

***

# 🔥 RN-Specific Explanation (Interview Gold)

In **React Native**, the event loop affects:

*   **JS thread performance**
*   **UI thread responsiveness**
*   Promises (handled in **microtasks**) update state *immediately after sync code finishes*
*   Timers (`setTimeout`) run in the **macrotask phase**, so they **always run later**

This is why:

```js
setState(...) inside Promise.then()
```

updates the UI **before** any timer callbacks.

***

# 🎤 **Short Interview Version (Perfect Answer)**

> JavaScript runs in a single thread.  
> The **event loop** decides what runs next by prioritizing **microtasks** over **macrotasks**.
>
> *   **Microtasks** (Promises, queueMicrotask) run **immediately after synchronous code**.
> *   **Macrotasks** (setTimeout, setInterval, I/O) run **after microtasks**.
>
> Example:
>
> ```js
> Promise.resolve().then(() => console.log("microtask"));
> setTimeout(() => console.log("macrotask"));
> ```
>
> Output will always be:  
> `microtask` → `macrotask`.
>
> In React Native, this affects animations, async calls, UI updates, and avoiding JS thread blocking.

  </details>

  <details><summary>4. Deep vs shallow copy — how do you update deeply nested state safely?</summary>

Great one—this comes up a lot in React/React Native code reviews.

## 4) Deep vs Shallow Copy — Safely Updating Deeply Nested State

### 🔹 Shallow Copy

Copies **only the first level**. Nested objects/arrays still **reference the same memory**.

```js
const orig = { a: 1, b: { c: 2 } };
const shallow = { ...orig };

shallow.b.c = 3;
console.log(orig.b.c); // 3  ❌ mutated original!
```

*   Methods: object spread `{...obj}`, `Object.assign({}, obj)`, array spread `[...arr]`, `arr.slice()`.
*   **Use when** you only need to change top-level fields **and** you won’t mutate nested parts.

***

### 🔹 Deep Copy

Copies **the entire graph** (recursively). Nested structures are **independent**.

Common options:

*   `structuredClone(obj)` (modern JS)
*   `JSON.parse(JSON.stringify(obj))` (simple, but lossy)
*   `cloneDeep` from `lodash`
*   Immutable helpers like **Immer** (recommended for React state)

> ⚠️ **Caveats**
>
> *   `JSON` approach **strips** functions, `Date`, `Map`, `Set`, `undefined`, `Symbol`.
> *   `structuredClone` supports most built-ins (Date/Map/Set, etc.), but not functions.
> *   `cloneDeep` handles most cases but adds a dependency and has runtime cost.

***

## ✅ How to Update Deeply Nested State Safely (React/RN)

### 1) **Manual immutable update** with spreads

Good for small changes; verbose for deep trees.

```js
// state shape
const [state, setState] = useState({
  user: { profile: { name: 'Harshal', city: 'Pune' }, accounts: [] }
});

// update: profile.city
setState(prev => ({
  ...prev,
  user: {
    ...prev.user,
    profile: {
      ...prev.user.profile,
      city: 'Mumbai',
    },
  },
}));
```

**Arrays**:

```js
// replace item in array by id
setState(prev => ({
  ...prev,
  user: {
    ...prev.user,
    accounts: prev.user.accounts.map(acc =>
      acc.id === targetId ? { ...acc, balance: acc.balance + 100 } : acc
    ),
  },
}));
```

***

### 2) **Immer** (`immer` or via Redux Toolkit) – cleanest for deep updates

Write “mutating” code; Immer produces **immutable** copies under the hood.

```js
import { produce } from 'immer';

setState(prev =>
  produce(prev, draft => {
    draft.user.profile.city = 'Mumbai';
    const target = draft.user.accounts.find(a => a.id === targetId);
    if (target) target.balance += 100;
  })
);
```

**Why good for interviews**:

*   Prevents accidental mutations.
*   Less boilerplate.
*   Works great with complex forms and nested data in RN apps.

***

### 3) **Normalize state** (flatten nested entities)

Best for **large apps** (Redux/React Query + selectors). Avoids deep trees entirely.

**Before (nested):**

```js
state = {
  users: [{ id: 'u1', accounts: [{ id: 'a1' }] }]
};
```

**After (normalized):**

```js
state = {
  users: { u1: { id: 'u1', accounts: ['a1'] } },
  accounts: { a1: { id: 'a1', balance: 500 } }
};
```

**Update becomes trivial:**

```js
setState(prev => ({
  ...prev,
  accounts: {
    ...prev.accounts,
    a1: { ...prev.accounts.a1, balance: prev.accounts.a1.balance + 100 }
  }
}));
```

> Normalization improves performance and reduces re-render blast radius (great for big RN lists).

***

### 4) **Refs for large mutable structures** (advanced)

If a big object changes frequently but **shouldn’t trigger re-renders**, keep it in a `useRef` and copy only the parts bound to UI state. This is more advanced and situational (e.g., caches).

***

### 5) **Avoid common pitfalls**

*   ❌ **Direct mutation**: `state.user.profile.city = '...'`  
    React won’t detect changes reliably → stale UI/re-renders won’t happen as expected.
*   ❌ **Deep JSON cloning for everything**: slow & lossy.
*   ❌ **Over-deep nesting**: design state to be flatter.

***

## Quick Patterns (Copy/Paste)

### Update object in a nested array by id

```js
setState(prev => ({
  ...prev,
  items: prev.items.map(it =>
    it.id === id ? { ...it, status: 'done' } : it
  ),
}));
```

### Add/remove in nested array

```js
// add
setState(prev => ({
  ...prev,
  items: [...prev.items, newItem],
}));

// remove by id
setState(prev => ({
  ...prev,
  items: prev.items.filter(it => it.id !== id),
}));
```

### Replace deep path with Immer

```js
setState(prev => produce(prev, d => { d.a.b.c.list[index].flag = true; }));
```

### Safely increment nested numeric field

```js
setState(prev => ({
  ...prev,
  wallet: {
    ...prev.wallet,
    limits: {
      ...prev.wallet.limits,
      daily: prev.wallet.limits.daily + 1000,
    },
  },
}));
```

***

## RN Performance Tips

*   Prefer **functional `setState`** (`setState(prev => ...)`) to avoid stale closures.
*   Memoize heavy child components; pass stable props.
*   For massive nested updates, **Immer** is clearer and **less error-prone**.
*   Consider **React Query** for server state; keep client state minimal.

***

## TL;DR (Interview Answer)

*   **Shallow copy** copies the first level; nested references remain shared.
*   **Deep copy** recursively copies all levels.
*   In React, **never mutate state**; use **spreads** or **Immer** and consider **normalized state** for complex trees.
*   Use **functional updates** and **immutable array methods** (`map`, `filter`, `slice`) to update nested data safely.

  </details>

  <details><summary>5. What is debouncing vs throttling? Give real RN use cases.</summary>

Here’s a clean, interview-ready explanation with React Native–focused examples—simple enough for juniors, solid enough for seniors.

***

# ✅ **5. What is Debouncing vs Throttling? (With Real React Native Use Cases)**

Both **debouncing** and **throttling** are techniques to control **how often a function runs**, especially when triggered repeatedly (typing, scrolling, gestures, network calls).

***

# 🔵 **Debouncing**

**Debounce = wait until the user *stops* doing something.**

A function runs **only after a pause** in activity.

### ⏱ How it works:

*   User triggers events rapidly (typing, scrolling).
*   Timer resets on every call.
*   Function runs *only once*, after X ms of no further calls.

### 📌 Real RN Use Cases

#### **1) Search-as-you-type API calls**

Avoid hitting `/search?q=` on every keystroke.

```js
import { debounce } from 'lodash';

const search = debounce((text) => {
  fetch(`/api/search?q=${text}`);
}, 300);

<TextInput onChangeText={search} />
```

#### **2) Autocomplete suggestions**

Google Places, user directories, product search.

#### **3) Prevent double button taps**

(Though usually solved with disabled states)
Debounce ensures the action fires once after tapping stops.

***

# 🟢 **Throttling**

**Throttle = run the function at most *every X ms*, no matter how many times it’s triggered.**

### ⏱ How it works:

*   Event fires repeatedly (scrolling, dragging).
*   Throttle ensures the function executes **at a fixed rate**.

### 📌 Real RN Use Cases

#### **1) Scroll event handlers (FlatList/ScrollView)**

Prevent re-render explosions:

```js
import { throttle } from 'lodash';

const onScroll = throttle((e) => {
  console.log("Scroll position:", e.nativeEvent.contentOffset.y);
}, 200);

<ScrollView onScroll={onScroll} scrollEventThrottle={16} />
```

#### **2) Tracking drag/gesture movements**

Use throttle to limit updates for:

*   PanResponder
*   Reanimated gesture handlers
*   Map panning

#### **3) Analytics/telemetry events**

Avoid logging hundreds of events per second when user scrolls/dragging.

***

# 🔥 **Side-by-Side Difference (Simple Summary)**

| Concept      | When it fires                 | Goal                    | RN Example                        |
| ------------ | ----------------------------- | ----------------------- | --------------------------------- |
| **Debounce** | After user *stops* triggering | Avoid unnecessary calls | Search API, autocomplete          |
| **Throttle** | At fixed intervals            | Limit events            | Scroll tracking, gesture movement |

***

# 🧠 **Interview-Safe Explanation (Short Version)**

> Debouncing delays a function until the activity stops—great for search inputs or preventing double taps.
>
> Throttling limits how often a function runs—useful for scroll handlers or gestures.
>
> In React Native, debouncing prevents unnecessary API calls, throttling prevents performance drops due to frequent scroll/gesture events.

***

# 🛠 Bonus: Native Example (Custom Debounce)

(If they ask you to implement it manually)

```js
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
```

  </details>

  <details><summary>6. How does tree-shaking work? How does it impact RN bundle size?</summary>

Absolutely—here’s a crisp, interview-ready explanation with practical React Native angles and copy‑paste examples.

***

## ✅ What is Tree‑Shaking?

**Tree‑shaking** is **dead code elimination**: the bundler analyzes your imports/exports statically and **removes any code that isn’t actually used (unreferenced)** in your app.

It works best with:

*   **ES Modules (ESM)**: `import { foo } from 'pkg'` (static, analyzable)
*   **Pure, side‑effect‑free modules**
*   **No dynamic `require` or export patterns** that hide usage from the bundler

In RN, Metro (the bundler) + minifier (and then Hermes bytecode) benefit from tree‑shaking to reduce JS bundle size and improve startup.

***

## 🧠 How Tree‑Shaking Works (Conceptual)

1.  **Static analysis** of the module graph (ESM import/export).
2.  Mark **reachable** symbols starting from your app’s entry point.
3.  **Drop unused exports** (dead code).
4.  Run minification/constant folding → **smaller JS bundle**, **less code to parse/execute** → **faster startup (TTI)**.

> In RN specifically, smaller JS means **faster Hermes bytecode compilation** (or faster load if precompiled), **less memory**, and typically **lower startup time**.

***

## 🔧 What Helps / Breaks Tree‑Shaking in React Native

### ✅ Helps

*   **Named ESM imports**:
    ```ts
    // Good: only pulls `map` code
    import { map } from 'lodash-es';
    ```
*   **Direct path imports (tree‑shaking fallback)**:
    ```ts
    // If a lib isn’t ESM, cherry-pick paths
    import debounce from 'lodash/debounce';
    ```
*   **Packages with `"sideEffects": false`** in `package.json`.
*   **Pure annotations** to aid DCE:
    ```js
    const x = /*#__PURE__*/ heavyFactory();
    ```
*   **Avoid “barrel” files** that re-export everything:
    ```ts
    // ❌ Bad
    export * from './utils';
    ```
    ```ts
    // ✅ Good (explicit)
    export { fmtCurrency } from './fmtCurrency';
    ```

### ❌ Hurts

*   **CommonJS** patterns (harder to shake):
    ```js
    const _ = require('lodash'); // pulls a ton
    ```
*   **`export *` / dynamic requires**:
    ```js
    const mod = require(someVar); // bundler can’t analyze statically
    ```
*   **Modules with side effects** (top‑level code that runs on import).
*   Overuse of “barrel” index files that aggregate + re‑export entire folders.

***

## 📦 Practical Impact on RN Bundle Size

*   Using ESM or cherry-picked imports from big libs (e.g., `lodash-es`, `date-fns`, `ramda`) can reduce dozens/hundreds of KB.
*   Replacing **Moment.js** with **Day.js**/**date‑fns** can save \~100–200 KB (varies).
*   Avoid pulling full UI kits/icons if you only need a few components.
*   Fewer bytes → **smaller Hermes bytecode** → **faster cold start** and **less memory**.

> **Note:** React Native doesn’t do web‑style “code splitting” at route level; you typically ship a single bundle. So **tree‑shaking is critical** to avoid shipping dead code.

***

## 🧩 RN‑Focused Examples

### 1) Prefer ESM / Cherry-Picking

```ts
// ❌ Bad: imports entire lodash
import _ from 'lodash';
const r = _.debounce(fn, 200);

// ✅ Better: cherry-pick
import debounce from 'lodash/debounce';
const r = debounce(fn, 200);

// ✅ Best if supported: ESM
import { debounce } from 'lodash-es';
```

### 2) Avoid dynamic re-exports (barrels)

```ts
// ❌ utils/index.ts
export * from './format';
export * from './math';
export * from './date'; // drags all three

// ✅ Explicit exports
export { formatCurrency } from './format';
export { sum } from './math';
```

### 3) Pure annotation for factories

```ts
// A factory that returns a heavy object only used in one branch
const heavy = /*#__PURE__*/ createHeavyThing();
```

### 4) Keep imports leaf-like

```ts
// ❌ Bad: importing root that re-exports many modules
import { Button } from '@ui-kit';

// ✅ Good: import just the component
import Button from '@ui-kit/components/Button';
```

***

## 🛠 RN Config & Library Tips

*   **Use libraries with ESM builds** when possible (`lodash-es`, `date-fns`, many modern libs).
*   Replace **Moment → Day.js** or **date‑fns**.
*   Avoid **huge icon packs**; generate a subset or use **react-native-svg** with inline SVGs.
*   Prefer **React Navigation** lazy options where applicable (not tree‑shaking per se, but helps TTI).
*   Consider **Babel plugin `babel-plugin-lodash`** for automatic cherry‑picking if you must use lodash classic.
*   Keep Metro default minifier; don’t introduce patterns that block DCE (like runtime `require` based on variables).

***

## 🧪 Verifying Bundle Size Changes

*   **Inspect bundle**:
    ```bash
    npx react-native bundle \
      --platform ios \
      --dev false \
      --entry-file index.js \
      --bundle-output out/main.jsbundle \
      --assets-dest out/
    ls -lh out/main.jsbundle
    ```
*   **Hermes bytecode size** (if using Hermes):
    ```bash
    npx react-native-hermes profile
    ```
*   Use **source-map/explorers** (e.g., `source-map-explorer`) to see what’s taking space (you may need to convert or inspect pre-Hermes bundle).

***

## ⚡ Interview TL;DR

> Tree‑shaking eliminates unused code at build time using static analysis of ESM imports/exports.  
> In React Native, it directly **shrinks the JS bundle**, which then becomes **smaller Hermes bytecode**, improving **startup time** and **memory**.  
> Use **ESM imports, explicit exports, cherry-picking**, avoid **CommonJS and dynamic exports**, and prefer **lightweight, modular libraries**.

  </details>

  <details><summary>7. When to use <code>unknown</code> vs <code>any</code> vs <code>never</code> in TypeScript?</summary>

Great question—this one comes up a lot in TypeScript code reviews.

## 7) When to use `unknown` vs `any` vs `never` in TypeScript

### TL;DR (Interview soundbite)

*   **`any`**: “Skip type checking.” Avoid it—unsafe, spreads bugs.
*   **`unknown`**: “Type-safe `any`.” You **must** narrow/refine before using.
*   **`never`**: “Impossible value.” Used for functions that **never return** or for **exhaustive checks**.

***

## `any` — opt out of type safety

*   Disables type checking for that value. You can do anything with it.
*   Use **sparingly** (temporary migrations, 3rd-party untyped code).
*   **Risk:** masks real bugs, hurts refactors, spreads to other types.

```ts
let data: any = getFromSdk();
data.foo.bar();   // Compiles, might crash at runtime
```

**When (if ever) to use**

*   Quick prototype or legacy code patches (replace later).
*   Known safe values where you can’t model types yet (add TODO).

***

## `unknown` — safest top type (prefer over `any`)

*   You **cannot** use it without **narrowing** (via `typeof`, `instanceof`, user-defined type guards, schema validation).
*   Great for **unsafe inputs**: network responses, `JSON.parse`, message events.

```ts
function handleMessage(msg: unknown) {
  // msg.toUpperCase(); // ❌ Error: Object is of type 'unknown'.
  if (typeof msg === 'string') {
    console.log(msg.toUpperCase()); // ✅ Now safe
  }
}
```

**With schema validation (zod/yup)**

```ts
import { z } from 'zod';

const AccountSchema = z.object({ id: z.string(), balance: z.number() });

function parseAccount(payload: unknown) {
  const account = AccountSchema.parse(payload); // throws if invalid
  // account is typed { id: string; balance: number }
  return account;
}
```

**When to use**

*   **External/untrusted data**: API responses, storage, deep `any` from SDKs.
*   Public library boundaries: accept `unknown` and **validate**.
*   Safer alternative to `any` when you need to postpone typing.

***

## `never` — values that don’t exist

*   A function returning `never` **does not return** (throws, infinite loop).
*   Used for **exhaustiveness checks** in discriminated unions.

```ts
function fail(msg: string): never {
  throw new Error(msg);
}

function exhaustiveCheck(x: never): never {
  throw new Error('Unreachable: ' + x);
}

type Status = { type: 'ok' } | { type: 'error' };

function render(s: Status) {
  switch (s.type) {
    case 'ok': return '✅';
    case 'error': return '❌';
    default:
      // If a new union member is added and not handled, this errors at compile time
      return exhaustiveCheck(s);
  }
}
```

**When to use**

*   Functions that always throw/loop.
*   Enforce **exhaustive switch** logic in domain models (great in fintech flows: transaction states, KYC states, auth states).

***

## Quick RN/Banking Examples

### Validate external data (prefer `unknown` + schema)

```ts
type Balance = { currency: 'INR' | 'USD'; amount: number };

function asBalance(payload: unknown): Balance {
  if (
    typeof payload === 'object' && payload !== null &&
    (payload as any).currency && (payload as any).amount &&
    (payload as any).currency === 'INR' || (payload as any).currency === 'USD'
  ) {
    return payload as Balance; // better with zod in real code
  }
  throw new Error('Invalid balance payload');
}
```

### Guarding event payloads (unknown first)

```ts
function onMessage(evt: unknown) {
  if (typeof evt === 'object' && evt && 'type' in (evt as any)) {
    // safe to branch further
  }
}
```

### Exhaustive state machine (use `never` to ensure all cases)

```ts
type AuthState =
  | { tag: 'unauthenticated' }
  | { tag: 'otpSent' }
  | { tag: 'authenticated' }
  | { tag: 'locked' };

function next(state: AuthState, event: { type: string }) {
  switch (state.tag) {
    case 'unauthenticated': /* ... */ return state;
    case 'otpSent':         /* ... */ return state;
    case 'authenticated':   /* ... */ return state;
    case 'locked':          /* ... */ return state;
    default:
      const _exhaustive: never = state; // compile-time error if a new tag is added
      return _exhaustive;
  }
}
```

***

## Rules of Thumb

*   **Default to precise types**.
*   If you must defer typing, choose **`unknown` over `any`** and **validate** before use.
*   Use **`never`**:
    *   return type for functions that never return;
    *   **exhaustiveness** checks in unions (improves correctness during refactors).
*   Avoid `any` in shared modules—it spreads and undermines type safety, critical in **financial apps**.

  </details>

  <details><summary>8. Explain TypeScript utility types: Partial, Pick, Omit, Record.</summary>

Absolutely—here’s a concise, interview-ready guide to the **TypeScript utility types** you’ll use every day: **`Partial`**, **`Pick`**, **`Omit`**, and **`Record`**. I’ll include short examples and common RN use cases.

***

## 8) TypeScript Utility Types: `Partial`, `Pick`, `Omit`, `Record`

### 1) `Partial<T>`

**Makes all properties of `T` optional.**  
Great for **patch updates**, **form drafts**, or **builder** patterns.

```ts
type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
};

type UserPatch = Partial<User>;
// Equivalent to:
// { id?: string; name?: string; email?: string; phone?: string; }

function updateUser(id: string, patch: Partial<User>) {
  // send partial to API...
}
```

**React Native example (form drafts):**

```ts
type Profile = { firstName: string; lastName: string; city: string };
const [draft, setDraft] = useState<Partial<Profile>>({});
```

> **Tip:** `Partial` is **shallow**—nested objects aren’t automatically partial. For deep structures, define nested `Partial`s or use helper types (e.g., `DeepPartial` from community libs).

***

### 2) `Pick<T, K>`

**Selects a subset of properties** from `T`.  
Use to **restrict props**, **shape DTOs**, or **limit API payloads**.

```ts
type User = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
};

type PublicUser = Pick<User, 'id' | 'name'>;
// { id: string; name: string; }
```

**RN example (component props):**

```ts
type ButtonProps = {
  title: string;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
};

type MinimalButtonProps = Pick<ButtonProps, 'title' | 'onPress'>;

function MinimalButton(props: MinimalButtonProps) { /* ... */ }
```

***

### 3) `Omit<T, K>`

**Removes** a set of properties from `T`.  
Use for **deriving safer types** (e.g., **strip sensitive data**, **prohibit client-supplied fields**).

```ts
type User = {
  id: string;
  name: string;
  passwordHash: string;
  createdAt: string;
};

type SafeUser = Omit<User, 'passwordHash'>;
// { id: string; name: string; createdAt: string }
```

**RN example (form input):** prevent clients from setting server-managed fields:

```ts
type UserCreateInput = Omit<User, 'id' | 'createdAt' | 'passwordHash'>;
// { name: string }
```

> **Pick vs Omit?**
>
> *   Use **`Pick`** when you know **what to include**.
> *   Use **`Omit`** when you know **what to exclude**.  
      >     Prefer **`Pick`** for API stability—explicit is safer.

***

### 4) `Record<K, T>`

Constructs an object type with keys of type `K` and values of type `T`.  
Great for **maps/dictionaries**, **lookup tables**, **feature flags**, **theme tokens**.

```ts
type Currency = 'INR' | 'USD' | 'EUR';
type Rates = Record<Currency, number>;
// { INR: number; USD: number; EUR: number }

const fx: Rates = { INR: 1, USD: 0.012, EUR: 0.011 };
```

**RN example (styles/theme tokens):**

```ts
type Size = 'xs' | 'sm' | 'md' | 'lg';
type SpacingScale = Record<Size, number>;
const spacing: SpacingScale = { xs: 4, sm: 8, md: 16, lg: 24 };
```

**RN example (feature flags by environment):**

```ts
type Env = 'dev' | 'uat' | 'prod';
type FeatureFlags = Record<Env, { codePushEnabled: boolean; perfLogs: boolean }>;

const flags: FeatureFlags = {
  dev:  { codePushEnabled: true,  perfLogs: true },
  uat:  { codePushEnabled: true,  perfLogs: false },
  prod: { codePushEnabled: false, perfLogs: false },
};
```

> **Tip:** `Record<string, T>` is a typed index signature (object with string keys). Prefer **literal unions** for stricter keys.

***

## Putting Them Together (Practical Patterns)

### A) Safe API payloads

```ts
type Account = {
  id: string;
  holder: string;
  balance: number;
  updatedAt: string;
};

type UpdateAccountPayload = Partial<Pick<Account, 'holder' | 'balance'>>;
// { holder?: string; balance?: number }
```

### B) Component props transformations

```ts
type TextInputBaseProps = {
  value: string;
  onChangeText: (v: string) => void;
  secureTextEntry?: boolean;
  placeholder?: string;
  testID?: string;
};

type SecureInputProps = Omit<TextInputBaseProps, 'secureTextEntry'> & { secure?: boolean };

function SecureInput({ secure, ...rest }: SecureInputProps) {
  return <TextInput secureTextEntry={secure} {...rest} />;
}
```

### C) Normalized entities

```ts
type Txn = { id: string; amount: number };
type TxnMap = Record<string, Txn>;

const txns: TxnMap = {
  t1: { id: 't1', amount: 100 },
  t2: { id: 't2', amount: 200 },
};
```

***

## Common Pitfalls & Tips

*   `Partial` is **shallow**—nested objects stay required unless you apply `Partial` at deeper levels.
*   Prefer `Pick` for **public contracts**—it’s explicit and safer during refactors.
*   `Omit` is implemented as `Pick<T, Exclude<keyof T, K>>`—composition with unions works well.
*   `Record<Keys, T>` expects Keys to be **string/number/symbol or a union of literals**—using `string` makes it open‑ended; prefer unions for strictness.
*   For more complex cases, know related utilities:
    *   `Required<T>` (make everything required)
    *   `Readonly<T>` (immutable)
    *   `NonNullable<T>` (remove `null | undefined`)
    *   `ReturnType<T>` / `Parameters<T>` (infer from functions)

***

## Interview TL;DR

*   **`Partial<T>`**: Make fields optional (patch updates, form drafts).
*   **`Pick<T, K>`**: Include only specific fields (public DTOs, minimal props).
*   **`Omit<T, K>`**: Exclude fields (strip sensitive/server fields).
*   **`Record<K, T>`**: Key–value maps with typed keys (flags, dictionaries, themes).

  </details>

  <details><summary>9. How do you type custom React hooks?</summary>

Awesome—let’s make this **practical, short, and copy‑paste friendly**.  
Here’s how to **type custom React/React Native hooks in TypeScript** with the most common patterns you’ll use daily.

***

## ✅ Core Principles

*   **Type the params** (including optional config) and **return type** explicitly.
*   Prefer **object return** for extensibility; use **tuples** when the meaning is obvious (e.g., `[value, setValue]`).
*   Use **generics** when the hook works with arbitrary types (`<T>`).
*   Use React’s official types:  
    `Dispatch`, `SetStateAction`, `MutableRefObject`, `EffectCallback`, `DependencyList`.

```ts
import { useRef, useState, useEffect, Dispatch, SetStateAction, MutableRefObject } from 'react';
```

***

## 1) Simple State Hook (Tuple) — `useToggle`

```ts
import { useState } from 'react';

type UseToggleResult = [boolean, {
  on: () => void;
  off: () => void;
  toggle: () => void;
}];

export function useToggle(initial = false): UseToggleResult {
  const [value, setValue] = useState<boolean>(initial);
  return [
    value,
    {
      on: () => setValue(true),
      off: () => setValue(false),
      toggle: () => setValue(v => !v)
    }
  ];
}
```

*   **Why tuple?** The two positions have obvious meaning (value + actions).
*   Returning an **object in position 2** keeps it extensible.

***

## 2) Generic Hook (Value Agnostic) — `usePrevious<T>`

```ts
import { useEffect, useRef } from 'react';

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => { ref.current = value; }, [value]);
  return ref.current;
}
```

*   Returns the **previous value** of any type `T`.

***

## 3) Generic Async Hook with Discriminated Union — `useAsync<T>`

```ts
import { useCallback, useEffect, useRef, useState } from 'react';

type AsyncIdle   = { status: 'idle'   };
type AsyncLoading= { status: 'loading' };
type AsyncError  = { status: 'error';  error: unknown };
type AsyncSuccess<T> = { status: 'success'; data: T };

type AsyncState<T> = AsyncIdle | AsyncLoading | AsyncError | AsyncSuccess<T>;

export function useAsync<T>(fn: () => Promise<T>, deps: React.DependencyList = []) {
  const [state, setState] = useState<AsyncState<T>>({ status: 'idle' });
  const mounted = useRef(true);

  useEffect(() => () => { mounted.current = false; }, []);

  const run = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const data = await fn();
      if (mounted.current) setState({ status: 'success', data });
    } catch (error) {
      if (mounted.current) setState({ status: 'error', error });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { run(); }, [run]);

  return { ...state, retry: run } as const;
}
```

*   Uses a **discriminated union** so consumers get **exhaustive type‑safe checks** on `status`.

***

## 4) Debounced Value Hook (RN‑friendly) — `useDebouncedValue<T>`

```ts
import { useEffect, useState } from 'react';

export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
```

**RN use case**: Debounce search text before hitting an API.

***

## 5) Controlled State with External/Inner Control — `useControllableState<T>`

```ts
import { useCallback, useState } from 'react';

type UseControllableStateParams<T> = {
  value?: T;                          // controlled
  defaultValue: T;                    // uncontrolled initial
  onChange?: (next: T) => void;
};

export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: UseControllableStateParams<T>): [T, (next: T | ((prev: T) => T)) => void] {
  const [inner, setInner] = useState<T>(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? (value as T) : inner;

  const set = useCallback((next: T | ((prev: T) => T)) => {
    const computed = typeof next === 'function' ? (next as (p: T) => T)(current) : next;
    if (!isControlled) setInner(computed);
    onChange?.(computed);
  }, [current, isControlled, onChange]);

  return [current, set];
}
```

*   Typing the setter accepts **value or updater function** like React’s `setState`.

***

## 6) Hook Returning a Stable Callback — `useEvent`-style

When you need a handler that **always sees the latest props/state** without changing identity:

```ts
import { useCallback, useRef } from 'react';

export function useEvent<T extends (...args: any[]) => any>(handler: T): T {
  const ref = useRef<T>(handler);
  ref.current = handler;

  const stable = useCallback(((...args: Parameters<T>) => {
    return ref.current(...args);
  }) as T, []);

  return stable;
}
```

*   The generic keeps parameter/return types of the original function.

***

## 7) API Hook with Generics and Runtime Validation

If you’re consuming unknown data, **type the hook generically** and validate:

```ts
import { useEffect, useState } from 'react';

type FetchState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: unknown };

export function useFetch<T>(url: string, parse: (raw: unknown) => T) {
  const [state, setState] = useState<FetchState<T>>({ status: 'idle' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setState({ status: 'loading' });
      try {
        const res = await fetch(url);
        const json = await res.json();
        const data = parse(json); // runtime validation
        if (!cancelled) setState({ status: 'success', data });
      } catch (error) {
        if (!cancelled) setState({ status: 'error', error });
      }
    })();
    return () => { cancelled = true; };
  }, [url, parse]);

  return state;
}
```

*   Consumers pass `parse` (zod/yup or hand‑rolled guard) to keep types **safe**.

***

## 8) Typing Refs in Hooks

```ts
import { useRef, MutableRefObject } from 'react';

export function useLatest<T>(value: T): MutableRefObject<T> {
  const ref = useRef<T>(value);
  ref.current = value;
  return ref;
}
```

*   `MutableRefObject<T>` is the correct return type for mutable refs.

***

## 9) Returning Tuples with Literal Types (keep positions typed)

When returning tuples with mixed types, use `as const` or an explicit tuple type:

```ts
export function useCounter(initial = 0) {
  const [value, setValue] = useState(initial);
  const inc = () => setValue(v => v + 1);
  const dec = () => setValue(v => v - 1);
  return [value, { inc, dec }] as const; // readonly tuple typing
}
// type: readonly [number, { inc: () => void; dec: () => void }]
```

***

## 10) Error-First Result Pattern

```ts
type Ok<T> = { ok: true;  data: T };
type Err<E = unknown> = { ok: false; error: E };
type Result<T, E = unknown> = Ok<T> | Err<E>;

export function useSafeAsync<T>(fn: () => Promise<T>) {
  const [res, setRes] = useState<Result<T>>({ ok: false, error: null });

  useEffect(() => {
    (async () => {
      try { setRes({ ok: true, data: await fn() }); }
      catch (e) { setRes({ ok: false, error: e }); }
    })();
  }, [fn]);

  return res;
}
```

*   Discriminated union makes consumption safe with `if (res.ok)` checks.

***

## Pitfalls & Tips

*   **Don’t export `any`** from hooks—propagates unsafe types across the app.
*   Prefer **`unknown` at the boundary** (API, storage), then **narrow** or **validate**.
*   **Tuples vs objects**:
    *   Use **tuples** for a small, conventional API (`[value, setValue]`).
    *   Use **objects** when you have many return members or optional ones.
*   **Stable identities** (`useCallback` / `useRef`) prevent re-renders in consumers.
*   **Discriminated unions** improve DX and safety for async or multi‑state hooks.

***

## Short Interview Answer (Soundbite)

> Type custom hooks by typing **params and return explicitly**, use **generics `<T>`** for reusable data‑agnostic hooks, return **tuples** for conventional state + actions and **objects** for extensibility, use React types like `Dispatch`, `SetStateAction`, `MutableRefObject`, and prefer **discriminated unions** for async state. Validate unknown data at the boundary and avoid `any`.

  </details>

  <details><summary>10. How to structure a scalable TS project for a large RN app?</summary>

Awesome—this is where “senior” signals show up in interviews. Here’s a **battle‑tested structure** for large, TypeScript‑first React Native apps that scales across teams, features, and years of maintenance.

> **Goals:** clear boundaries, fast builds, easy refactors, testability, security (banking‑grade), and developer productivity.

***

## 🔷 High‑Level Principles

*   **Feature‑first** structure (group files by feature, not type).
*   **Layered architecture**: `app` (UI), `features` (screens + hooks), `entities` (domain), `shared` (cross‑cutting), `processes` (auth/session), `widgets` (reusable UI).
*   **Strict TypeScript** (`"strict": true`), **absolute imports**, **no circular deps**, **no deep cross‑feature imports**.
*   **Runtime validation** at boundaries (API/storage) using `zod`/guards.
*   **Server state** with **React Query**, **client state** minimal (RTK or Zustand).
*   **Monorepo‑ready** (optional) for shared packages (design system, analytics, API SDK).

***

## 📁 Suggested Folder Layout (App)

    apps/mobile/
      app/                       # App shell (entry, navigation, providers)
        providers/               # QueryClientProvider, ThemeProvider, etc.
        navigation/              # Root navigator, linking config
        store/                   # Redux/Zustand (if used), persisted store
        App.tsx

      processes/                 # Multi-feature flows (auth/session/bootstrap)
        auth/
          model/                 # hooks/state for auth flow
          ui/                    # auth screens container-level
          lib/                   # guards, route protections

      entities/                  # Domain models (normalized, reusable)
        user/
          model/                 # selectors, entity adapters
          api/                   # userApi.ts (React Query or RTK Query)
          lib/                   # zod schemas, mappers
          types.ts
        account/
          model/
          api/
          lib/
          types.ts

      features/                  # Feature modules (screens + logic)
        transfer/
          ui/                    # screen components
          model/                 # feature local state, hooks
          api/                   # feature-specific queries/mutations
          lib/                   # utils specific to this feature
          routes.ts

        statements/
          ui/
          model/
          api/
          lib/
          routes.ts

      shared/                    # Cross-cutting utilities
        ui/                      # small atomic components (Buttons, Inputs)
        lib/                     # helpers (date, currency), not domain-specific
        api/                     # http client, interceptors, error normalization
        config/                  # env, feature flags
        styles/                  # theme, tokens
        i18n/                    # translations
        hooks/                   # generic hooks (useDebouncedValue, useEvent)
        types/                   # shared types
        constants/

      tests/                     # e2e, fixtures
      __mocks__/
      index.js                   # RN entry
      tsconfig.json
      babel.config.js
      package.json

> **Why this works:** Each feature owns its UI + hooks + API calls; **entities** centralize domain logic and types to avoid duplication; **shared** keeps generic things.

***

## 🧱 Monorepo Variant (optional but recommended at scale)

    .
    ├─ apps/
    │  └─ mobile/                # RN app
    ├─ packages/
    │  ├─ ui-kit/                # Design system (RN components)
    │  ├─ api-sdk/               # Typed SDK (fetch/axios + zod)
    │  ├─ analytics/             # Event contracts & client
    │  └─ tooling/               # ESLint configs, tsconfig bases
    └─ package.json              # workspace root (pnpm/yarn workspaces)

*   Share **design system**, **analytics**, **API SDK** across web + mobile.

***

## ⚙️ TypeScript Configuration

**`tsconfig.json` (app level)**

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "baseUrl": ".",
    "paths": {
      "@app/*": ["app/*"],
      "@features/*": ["features/*"],
      "@entities/*": ["entities/*"],
      "@shared/*": ["shared/*"]
    },
    "types": ["jest", "react", "react-native"]
  },
  "exclude": ["android", "ios", "e2e", "dist"]
}
```

**Babel alias (Metro) – `babel.config.js`**

```js
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    ['module-resolver', {
      root: ['./'],
      alias: {
        '@app': './app',
        '@features': './features',
        '@entities': './entities',
        '@shared': './shared'
      }
    }],
    'react-native-reanimated/plugin'
  ]
};
```

> **Tip:** Keep **absolute imports** consistent between TS `paths` and Babel `alias`.

***

## 🔐 API Layer (safe by default)

**`shared/api/http.ts`**

```ts
import { Platform } from 'react-native';

export interface HttpError extends Error {
  status?: number;
  details?: unknown;
}

export async function http<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) }
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: HttpError = new Error('HTTP_ERROR');
    err.status = res.status;
    err.details = json;
    throw err;
  }
  return json as T;
}
```

**Runtime validation with zod** (boundary protection):

```ts
import { z } from 'zod';
const Account = z.object({ id: z.string(), balance: z.number() });
type Account = z.infer<typeof Account>;

export async function getAccount(id: string) {
  const data = await http<unknown>(`/api/accounts/${id}`);
  return Account.parse(data); // throws if shape is wrong
}
```

***

## 🧠 State Management Strategy

*   **React Query** for server state (cache, retries, mutations).
*   **Redux Toolkit** (or Zustand) for **client state**: feature flags, session, UI state.
*   Keep **entities normalized** for large lists (selectors).

**Example: React Query provider**

```tsx
// app/providers/query.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const client = new QueryClient();
export const withQueryProvider = (C: React.FC) => () => (
  <QueryClientProvider client={client}><C /></QueryClientProvider>
);
```

**Example: Redux store (if needed)**

```ts
// app/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import sessionReducer from '@entities/user/model/sessionSlice';
export const store = configureStore({ reducer: { session: sessionReducer } });
export type RootState = ReturnType<typeof store.getState>;
```

***

## 🧭 Navigation

*   Keep **navigation routes** per feature (`features/transfer/routes.ts`).
*   Centralize **linking config** and **guards** (auth) in `app/navigation/`.
*   Use **typed route params** with `@react-navigation/native` types.

***

## 🎨 Theming & UI

*   **Design tokens** in `shared/styles/` (spacing, colors, typography).
*   A **UI kit** in `shared/ui/` with stable API (Button, Text, Input).
*   RTL & accessibility support from day one.

***

## 🌍 i18n

*   `shared/i18n/` with message keys; do **not** embed user‑visible strings in code.
*   Keep **formatting utilities** (numbers, currency, dates) centralized (important for finance).

***

## 🧪 Testing Stack

*   **Unit**: Jest + React Native Testing Library.
*   **Integration/UI**: React Native Testing Library (screen interactions).
*   **E2E**: Detox.
*   **Contract tests** (optional): ensure mobile ↔ backend schema compatibility.

**`jest.config.js` (basic)**

```js
module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|react-native-reanimated|@react-navigation)/)'
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect']
};
```

***

## 🧹 Quality Gates

*   **ESLint** (eslint-config), **Prettier**, **TypeScript strict**, **lint-staged** + **husky**.
*   **Import boundaries**: prevent cross‑layer leaks.

**`eslintrc` import restrictions**

```json
{
  "rules": {
    "no-restricted-imports": ["error", {
      "patterns": [
        { "group": ["@features/*/ui/*", "@features/*/model/*"], "message": "Import via the feature's public index only." }
      ]
    }]
  }
}
```

(Advanced: use **dependency-cruiser** to assert layering rules in CI.)

***

## 🔒 Security & Config

*   **Environment config** in `shared/config/` (per flavor/scheme).
*   **Secrets** via CI (never in repo).
*   **PII logging policy** (redaction utils).
*   Use **Keychain/Keystore** for tokens (via `react-native-keychain`).
*   **Feature flags** (remote) with a local cache (MMKV), keep **read‑only** in code.

***

## 📦 Build Flavors & Schemes (multi‑env)

*   **Android**: `debug`, `uat`, `release` (productFlavors).
*   **iOS**: Schemes + configurations (Debug/UAT/Release).
*   map env files → **app runtime config** via `shared/config`.

***

## 🧰 Codegen (highly recommended)

*   **API typings** from OpenAPI/GraphQL → generate **SDK** (in `packages/api-sdk`).
*   **Assets** (SVG → `react-native-svg` components).
*   **Icons**: generate subsets to avoid heavy packs.

***

## 🚀 CI/CD Essentials

*   **Cache** Gradle/CocoaPods.
*   Upload **dSYMs/ProGuard mappings**.
*   **Static analysis**: ESLint, tsc, dependency audits.
*   **Test matrix**: unit + E2E on key devices.
*   **Bundlesize** checks & perf budgets (fail PR if exceeded).

***

## 📉 Performance Discipline

*   Hermes on by default; measure TTI.
*   Avoid mega “barrel” imports; **tree‑shake friendly** libs (ESM).
*   Virtualized lists (FlashList/FlatList) with proper keys & memoization.
*   Image pipeline (sizes, caching, prefetch).

***

## 🧭 Example: Feature Public API

**`features/transfer/index.ts`**

```ts
export * as transferRoutes from './routes';
export { TransferScreen } from './ui/TransferScreen';
export { useTransfer } from './model/useTransfer';
```

Consumers import only from this index to keep boundaries clean:

```ts
import { TransferScreen } from '@features/transfer';
```

***

## ✅ Checklist (copy for your repo’s README)

*   [ ] TS strict + absolute imports
*   [ ] Feature‑first modules with public API index
*   [ ] Entities for domain logic (normalized)
*   [ ] React Query for server state, minimal client state
*   [ ] Runtime validation at all boundaries (zod)
*   [ ] ESLint rules for import boundaries & cycles
*   [ ] Theming, i18n, accessibility ready
*   [ ] Tests: unit, RTL, Detox; CI gates
*   [ ] Flavors/schemes per environment; config centralized
*   [ ] Perf budgets and bundle inspection in CI

  </details>

  <details><summary>11. How to manage typings for native modules without @types?</summary>

Great topic—this comes up a lot when integrating untyped native modules or JS-only RN libraries. Here’s a **practical, interview‑ready** guide with **copy‑paste** patterns.

***

## ✅ Goals

*   Get **type-safe** usage today (even if the lib has no `@types`).
*   Keep types **local and maintainable**.
*   Make it **easy to upgrade** or contribute upstream later.

***

## 1) Create a Local **Ambient Declaration** (`.d.ts`) Shim

When a package has no types, add a **module declaration** file in your app:

    types/
      shims/
        react-native-awesome-camera.d.ts
    tsconfig.json

**`types/shims/react-native-awesome-camera.d.ts`**

```ts
declare module 'react-native-awesome-camera' {
  import { EmitterSubscription } from 'react-native';

  export type CameraMode = 'photo' | 'video';

  export interface CameraOptions {
    mode?: CameraMode;
    quality?: number; // 0..1
    flash?: 'off' | 'on' | 'auto';
  }

  export interface CaptureResult {
    uri: string;
    width: number;
    height: number;
    durationMs?: number;
  }

  export function open(options?: CameraOptions): Promise<CaptureResult>;
  export function close(): void;

  export function addCameraEventListener(
    event: 'onFaceDetected' | 'onBarcodeScanned',
    handler: (payload: unknown) => void
  ): EmitterSubscription;
}
```

**`tsconfig.json`**

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "*": ["*", "types/shims/*"] },
    "typeRoots": ["./types", "./node_modules/@types"],
    "strict": true
  }
}
```

**Why:** This gives you **autocomplete and safety** without touching the library’s code.

***

## 2) Start Safe: Prefer `unknown` Over `any` at the Boundary

If you don’t fully know shapes yet, **type the minimal surface** and narrow inside app code:

```ts
declare module 'untyped-analytics' {
  export function logEvent(name: string, params?: unknown): void;
}
```

Use **runtime validation** at call sites (zod/yup or custom guards):

```ts
import { z } from 'zod';
import { logEvent } from 'untyped-analytics';

const PurchaseParams = z.object({ id: z.string(), amount: z.number() });

function trackPurchase(p: unknown) {
  const safe = PurchaseParams.parse(p); // throws if invalid
  logEvent('purchase', safe);
}
```

***

## 3) Typing **React Native NativeModules** (Bridge API)

When a library exposes methods via `NativeModules`, define an interface and assert:

```ts
// types/shims/native-modules-foo.d.ts
declare module 'react-native' {
  export interface NativeModulesStatic {
    FooModule: {
      getVersion(): Promise<string>;
      echo(msg: string): string;
      multiply(a: number, b: number): Promise<number>;
    };
  }
}
```

Then use:

```ts
import { NativeModules } from 'react-native';
const { FooModule } = NativeModules;

async function sample() {
  const v = await FooModule.getVersion(); // typed as string
}
```

> This augments `NativeModules` so IntelliSense and type checks work across the app.

***

## 4) Typing **TurboModules** (JSI / TurboModuleRegistry)

If the package exports a TurboModule via `TurboModuleRegistry.get`, define the `Spec` and get typed access:

```ts
// types/shims/FooTurboModule.d.ts
declare module 'react-native/Libraries/TurboModule/TurboModuleRegistry' {
  export function getEnforcing<T>(name: string): T;
}

// Create your module spec
export interface FooSpec {
  getDeviceName(): Promise<string>;
  add(a: number, b: number): number;
}

// Typed accessor
declare module 'react-native-foo' {
  import { getEnforcing } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
  export function getFooModule(): FooSpec;
}
```

Usage:

```ts
import { getFooModule } from 'react-native-foo';
const Foo = getFooModule();
Foo.add(2, 3); // typed number
```

> Pattern: Define a **`Spec`** interface that matches native signatures, then cast the module to that **once**, and keep types everywhere else.

***

## 5) Typing **JSI Modules** (global functions/objects)

If module registers globals (e.g., `global.__foo`), declare them:

```ts
// types/shims/global-jsi.d.ts
declare global {
  const FooJSI: {
    hash(data: string): string;
    randomBytes(len: number): Uint8Array;
  };
}
export {};
```

Usage:

```ts
const digest = FooJSI.hash('hello'); // fully typed
```

***

## 6) Add Types inside the **Library** (if you control it)

If you’re the module author or use a fork:

*   Emit a `types` folder and reference it in **`package.json`**:
    ```json
    { "types": "types/index.d.ts" }
    ```
*   Or inline JSDoc (works surprisingly well):

```ts
// index.js in the lib
/**
 * @typedef {{mode?: 'photo'|'video', quality?: number}} CameraOptions
 */

/** @param {CameraOptions=} options */
export function open(options) { /* ... */ }
```

TypeScript users get types from JSDoc without a `.d.ts`.

***

## 7) Organize & Maintain Shims

*   Keep all shims in `types/shims/`.
*   Add **README comments** with the **library version** the types match:
    ```ts
    // Types for react-native-awesome-camera v1.4.2
    ```
*   When upgrading the lib, diff its README/native code and update shims.

***

## 8) Contribute Upstream (or to DefinitelyTyped)

Once stable, **upstream your declarations**:

*   **Option A:** Send a PR to the library adding `types/` and `"types": "types/index.d.ts"` in `package.json`.
*   **Option B:** Publish to **DefinitelyTyped** (`@types/your-lib`) with tests.  
    Add `"types": ["your-lib"]` to your app’s `tsconfig.json` to prefer DT types.

> Benefits: Less maintenance for you; community improvements.

***

## 9) Fallback Strategy (temporary)

If you must ship quickly:

```ts
// Minimal escape hatch with a TODO
declare module 'some-legacy-module' {
  const mod: unknown; // or 'any' as last resort
  export default mod;
}
// TODO(harshal): replace with proper spec types before release
```

Then wrap usage with **narrowers** at the edges to avoid `any` pollution.

***

## 10) Example: Pulling Signatures from Native Code

When crafting the `.d.ts`, skim native signatures:

**Android (Kotlin)**

```kotlin
@ReactMethod fun multiply(a: Double, b: Double, promise: Promise)
@ReactMethod fun echo(msg: String): String // (rare sync)
```

→ TS:

```ts
multiply(a: number, b: number): Promise<number>;
echo(msg: string): string;
```

**iOS (Swift)**

```swift
@objc(echo:resolver:rejecter:)
func echo(msg: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock)
```

→ TS:

```ts
echo(msg: string): Promise<string>;
```

Match Promise vs sync **accurately** to avoid runtime surprises.

***

## 11) Guard Against Future Breaks

*   **Wrap module access** behind a tiny typed facade you control:
    ```ts
    // shared/native/camera.ts
    import { open as rawOpen } from 'react-native-awesome-camera';
    import { z } from 'zod';

    export const Capture = z.object({ uri: z.string(), width: z.number(), height: z.number() });
    export type Capture = z.infer<typeof Capture>;

    export async function open(opts?: { quality?: number }) {
      const result = await rawOpen(opts);
      return Capture.parse(result);
    }
    ```
*   If the upstream module changes shape, only your **facade** needs edits.

***

## 12) Quick Checklist

*   [ ] Create `.d.ts` in `types/shims` with `declare module 'pkg'`.
*   [ ] Prefer `unknown` for untrusted data; **narrow or validate** with zod.
*   [ ] Augment `NativeModules` or define a **TurboModule `Spec`**.
*   [ ] If globals/JSI → add `declare global`.
*   [ ] Point `tsconfig.json` `typeRoots` to `types`.
*   [ ] Wrap third‑party modules behind a **typed facade**.
*   [ ] Contribute types upstream when stable.

***

## Copy‑Paste Template (`declare module`)

```ts
// types/shims/some-lib.d.ts
declare module 'some-lib' {
  export interface Options {
    timeoutMs?: number;
  }
  export interface Result {
    ok: boolean;
    data?: unknown;
    error?: string;
  }
  export function init(opts?: Options): void;
  export function run(cmd: string): Promise<Result>;
}
```

  </details>

  <details><summary>12. How do you avoid floating-point issues when dealing with currency?</summary>

Here’s a **clear, interview‑ready** explanation with practical RN/TS examples, perfect for financial‑app discussions.

***

# ✅ 12. How do you avoid floating‑point issues when dealing with currency?

JavaScript numbers use **IEEE‑754 floating‑point**, which cannot represent many decimal values exactly.

Example:

```ts
0.1 + 0.2    // 0.30000000000000004 ❌
0.29 * 100   // 28.999999999999996 ❌
```

This is unacceptable in banking, payments, or trading apps.

Below are the **correct** techniques.

***

# ✅ **1) Store currency in *integers* (smallest unit)**

**Gold standard** in fintech.

*   Store INR as **paise**, USD as **cents**, JPY as **yen**.
*   Do ALL math using integers.
*   Convert to decimal **only at display time**.

### Example

```ts
// ₹199.75 represented as 19975 paise
const amountPaisa = 19975;

// Add ₹20.25 (2025 paise)
const total = amountPaisa + 2025; // 22000 paise = ₹220.00
```

### Formatting back

```ts
function formatINR(paise: number) {
  return (paise / 100).toFixed(2); 
}

formatINR(22000); // "220.00"
```

### Why best?

*   100% precise
*   Easy math
*   Works across backend + mobile + DB
*   No rounding surprises

***

# ✅ **2) Use a decimal library (when integer strategy is not enough)**

Recommended libraries:

*   **decimal.js**
*   **big.js**
*   **bignumber.js**

Example using **decimal.js**:

```ts
import Decimal from 'decimal.js';

const a = new Decimal('0.1');
const b = new Decimal('0.2');

a.plus(b).toString(); // "0.3"  ✅ precise
```

For React Native, these libs are lightweight and safe.

***

# ✅ **3) Avoid floating-point APIs & always convert string → decimal → string**

When receiving values from APIs:

### ❌ Don’t do this:

```ts
const total = amountFromApi + fee;      // risky if amounts are floats
```

### ✅ Do this:

```ts
const total = new Decimal(amountFromApi).plus(fee);
```

Or use integer conversion:

```ts
const total = Number(amountFromApi) * 100 + Number(fee) * 100;
```

***

# ✅ **4) Use ` Intl.NumberFormat` for display only**

Do NOT use formats for calculations.

```ts
const fmt = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
});

fmt.format(123456 / 100);  // ₹1,234.56
```

***

# ✅ **5) Always round explicitly**

Banking requires deterministic rounding:

*   **Round half up**
*   **Round half to even** (RBI guidelines sometimes require this)
*   **Round floor** for fees
*   **Custom rounding** for interest calculations

Using Decimal.js:

```ts
new Decimal("1.005").toDecimalPlaces(2);  // "1.01"
```

***

# ✅ **6) Never trust floating numbers from APIs**

Example server response:

```json
{ "amount": 199.75 }
```

Do NOT store that float directly.

### Convert safely:

```ts
const paise = Math.round(199.75 * 100);  // 19975
```

Or, better, have backend **send integers**:

```json
{ "amount": 19975, "currency": "INR" }
```

***

# ✅ **7) Use TypeScript types to enforce safety**

Define strong types:

```ts
type CurrencyMinorUnit = number;  // e.g., paise, cents

interface Money {
  amount: CurrencyMinorUnit;
  currency: 'INR' | 'USD' | 'EUR';
}
```

Then enforce integer math:

```ts
function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) throw new Error("Mismatch");
  return { amount: a.amount + b.amount, currency: a.currency };
}
```

***

# 🔥 **8) Real RN examples — Search, Checkout, Offers**

## Example: cart total

```ts
const totalPaise = cartItems
  .reduce((sum, item) => sum + (item.pricePaise * item.qty), 0);
```

## Example: EMI calculation (library)

```ts
import Decimal from "decimal.js";

const principal = new Decimal("120000"); // Rs 1.2L
const rate = new Decimal("0.12").div(12);
const n = 24;

const emi = principal.times(rate).times((1 + rate) ** n)  
```

***

# 🚫 What NOT to do (common interview pitfalls)

### ❌ Do NOT store currency as floating numbers

### ❌ Do NOT multiply floats without converting

### ❌ Do NOT rely on JS `.toFixed()` for calculations

### ❌ Do NOT calculate interest with floats

### ❌ Do NOT use floating values in Redux state

***

# 🎤 Short Interview Answer (Ideal)

> JS floats cause precision errors (0.1 + 0.2 ≠ 0.3).  
> In fintech, we avoid this by:
>
> 1.  Storing all currency in **minor units (paise/cents)** as integers.
> 2.  Doing calculations using integers or a **decimal library** like `decimal.js`.
> 3.  Converting to formatted currency only when displaying using `Intl.NumberFormat`.
> 4.  Explicit rounding rules and safe TypeScript types.  
      >     This guarantees consistent and accurate financial calculations.

  </details>

</details>

***

### **2) React Native Core Concepts (12 questions)**

<details>
  <summary>React Native Core Concepts (12)</summary>

  <details><summary>13. Explain RN Architecture (Bridge, JSI, TurboModules, Fabric).</summary></details>

  <details><summary>14. How does Hermes improve startup performance?</summary></details>

  <details><summary>15. JS thread vs UI thread — what runs where?</summary></details>

  <details><summary>16. How to optimize re-renders using memo, useMemo, useCallback?</summary></details>

  <details><summary>17. Best practices for FlatList performance (windowing, keys, memoization).</summary></details>

  <details><summary>18. How to handle responsive UI across multiple screen sizes?</summary></details>

  <details><summary>19. Explain RN navigation stacks & how you prevent memory leaks.</summary></details>

  <details><summary>20. What are Error Boundaries and how to implement one?</summary></details>

  <details><summary>21. Explain deep linking & universal links.</summary></details>

  <details><summary>22. How do push notifications work (APNs, FCM)?</summary></details>

  <details><summary>23. RN accessibility best practices (TalkBack/VoiceOver).</summary></details>

  <details><summary>24. When to use CodePush, and why banking apps may restrict it?</summary></details>

</details>

***

### **3) Expo vs React Native CLI (6 questions)**

<details>
  <summary>Expo vs React Native CLI (6)</summary>

  <details><summary>25. When to choose Expo Managed vs Bare workflows?</summary></details>

  <details><summary>26. Limitations of Expo for banking apps (background tasks, pinning).</summary></details>

  <details><summary>27. How to migrate from Expo Managed to Bare?</summary></details>

  <details><summary>28. What are Expo config plugins?</summary></details>

  <details><summary>29. How Expo Updates differ from CodePush?</summary></details>

  <details><summary>30. EAS Build vs Fastlane — when to prefer each?</summary></details>

</details>

***

### **4) Native Modules & Platform APIs (8 questions)**

<details>
  <summary>Native Modules & Platform APIs (8)</summary>

  <details><summary>31. When do you create a native module? Explain bridging.</summary></details>

  <details><summary>32. How does certificate pinning work in RN?</summary></details>

  <details><summary>33. How to implement secure biometric authentication (FaceID/TouchID)?</summary></details>

  <details><summary>34. How do you securely store tokens using Keychain/Keystore?</summary></details>

  <details><summary>35. How to handle app links/universal links in Android/iOS?</summary></details>

  <details><summary>36. How to handle native crashes & symbolication (dSYM/ProGuard)?</summary></details>

  <details><summary>37. How to expose high-performance functions via JSI?</summary></details>

  <details><summary>38. What’s Play Integrity / DeviceCheck / App Attest?</summary></details>

</details>

***

### **5) Architecture & State Management (12 questions)**

<details>
  <summary>Architecture &amp; State Management (12)</summary>

  <details><summary>39. Compare Redux Toolkit, Zustand, Recoil, MobX for large apps.</summary></details>

  <details><summary>40. When to use React Query vs Redux?</summary></details>

  <details><summary>41. How to structure a scalable feature-first RN architecture?</summary></details>

  <details><summary>42. What is a domain layer? Why is it useful?</summary></details>

  <details><summary>43. How to handle normalized data & selectors?</summary></details>

  <details><summary>44. How do you design loading/error states elegantly?</summary></details>

  <details><summary>45. Persisting state securely using redux-persist + MMKV.</summary></details>

  <details><summary>46. Handling global authentication state across navigation.</summary></details>

  <details><summary>47. Implementing feature flags safely.</summary></details>

  <details><summary>48. How to enforce separation of concerns for clean architecture?</summary></details>

  <details><summary>49. Approaches for multi-brand / white-label apps.</summary></details>

  <details><summary>50. Strategy for refactoring legacy Redux to RTK.</summary></details>

</details>

***

### **6) API Integration, Networking, Security (12 questions)**

<details>
  <summary>API Integration &amp; Networking (12)</summary>

  <details><summary>51. How to design an API layer using Axios/Fetch wrappers?</summary></details>

  <details><summary>52. Explain OAuth2/OIDC PKCE flow for mobile apps.</summary></details>

  <details><summary>53. How to handle token refresh safely?</summary></details>

  <details><summary>54. Handling retries with exponential backoff.</summary></details>

  <details><summary>55. Cursor-based vs offset-based pagination.</summary></details>

  <details><summary>56. GraphQL basics: caching, persisted queries.</summary></details>

  <details><summary>57. How do you validate API response schemas (zod/yup)?</summary></details>

  <details><summary>58. Normalizing API errors for consistent UX.</summary></details>

  <details><summary>59. Secure network logging without exposing PII.</summary></details>

  <details><summary>60. Rate limiting & retry policies.</summary></details>

  <details><summary>61. WebSockets vs polling vs SSE in RN.</summary></details>

  <details><summary>62. Time sync issues when signing financial transactions.</summary></details>

</details>

***

### **7) Data Storage & Offline Strategy (6 questions)**

<details>
  <summary>Data Storage & Offline Strategy (6)</summary>

  <details><summary>63. Compare AsyncStorage, MMKV, SQLite, Realm.</summary></details>

  <details><summary>64. Encrypt-at-rest strategies for mobile storage.</summary></details>

  <details><summary>65. How to design offline-first workflows with conflict resolution?</summary></details>

  <details><summary>66. How to manage large lists or caches efficiently?</summary></details>

  <details><summary>67. Securely caching user/session data.</summary></details>

  <details><summary>68. How to detect rooted/jailbroken devices?</summary></details>

</details>

***

### **8) Security, Compliance & Privacy (Financial Apps) (14 questions)**

<details>
  <summary>Security, Compliance &amp; Privacy (14)</summary>

  <details><summary>69. Overview of OWASP MASVS for secure mobile apps.</summary></details>

  <details><summary>70. PCI-DSS rules for financial mobile apps.</summary></details>

  <details><summary>71. Threat modeling basics (STRIDE) for RN banking apps.</summary></details>

  <details><summary>72. Root/jailbreak detection techniques.</summary></details>

  <details><summary>73. Anti-tamper measures (anti-hooking, anti-debug).</summary></details>

  <details><summary>74. Secure screenshot prevention (FLAG_SECURE).</summary></details>

  <details><summary>75. Certificate pinning best practices.</summary></details>

  <details><summary>76. Secure session timeout + token invalidation.</summary></details>

  <details><summary>77. How to handle sensitive logs & prevent PII leaks.</summary></details>

  <details><summary>78. Secure biometric fallback flows.</summary></details>

  <details><summary>79. Risks of WebViews & how to harden them.</summary></details>

  <details><summary>80. GDPR/CPRA compliance basics.</summary></details>

  <details><summary>81. Permissions hardening (least privilege).</summary></details>

  <details><summary>82. Secure cryptography usage (don’t roll your own).</summary></details>

</details>

***

### **9) Performance & Build Optimization (10 questions)**

<details>
  <summary>Performance &amp; Optimization (10)</summary>

  <details><summary>83. How to measure app startup time & TTI?</summary></details>

  <details><summary>84. Reducing bundle size — practical strategies.</summary></details>

  <details><summary>85. Preventing heavy operations on JS thread.</summary></details>

  <details><summary>86. Image optimization techniques.</summary></details>

  <details><summary>87. Jank-free animations using Reanimated.</summary></details>

  <details><summary>88. Memory leaks debugging tools (Flipper/Instruments).</summary></details>

  <details><summary>89. Performance budgets & CI enforcement.</summary></details>

  <details><summary>90. Avoiding unnecessary re-renders in complex forms.</summary></details>

  <details><summary>91. List virtualization strategies.</summary></details>

  <details><summary>92. Hermes bytecode preloading advantages.</summary></details>

</details>

***

### **10) Build, Release & CI/CD (8 questions)**

<details>
  <summary>Build, Release &amp; CI/CD (8)</summary>

  <details><summary>93. Android build flavors + iOS schemes for multiple envs.</summary></details>

  <details><summary>94. R8/ProGuard rules for safe obfuscation.</summary></details>

  <details><summary>95. Handling iOS provisioning, certificates & entitlements.</summary></details>

  <details><summary>96. Secure handling of CI secrets.</summary></details>

  <details><summary>97. Fastlane basics (build, sign, upload).</summary></details>

  <details><summary>98. Handling store rejections (App Store & Play Store).</summary></details>

  <details><summary>99. Phased rollout strategy & kill switches.</summary></details>

  <details><summary>100. Automated testing + build pipelines with GitHub Actions/Bitrise.</summary></details>

</details>
