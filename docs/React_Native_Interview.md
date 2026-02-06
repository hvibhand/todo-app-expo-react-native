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

  <details><summary>13. Explain RN Architecture (Bridge, JSI, TurboModules, Fabric).</summary>

Absolutely—here’s a crisp, developer‑friendly overview of **React Native architecture** and how it evolved: **Bridge → JSI → TurboModules → Fabric**. I’ll explain what each is, why it matters for performance, and what you should do in real apps.

***

## 🧱 The Big Picture

React Native historically had **three realms**:

*   **JS runtime** (Hermes or JavaScriptCore) — runs your React app logic.
*   **Native/UI realm** (Android/iOS) — renders views and accesses device APIs.
*   **A communication layer** that connects them.

Over time, RN moved from the **legacy Bridge** to **JSI**, enabling **TurboModules** (faster native modules) and **Fabric** (new renderer).

    JS (Hermes/JSC)
       │
       │  (old) Batched, JSON-serialized calls
       ▼
    Legacy Bridge  ❌ (slow, asynchronous, JSON, copy overhead)
       │
       └──────────────► Native/UI

    JS (Hermes/JSC)
       │
       │  (new) Direct C++ interface
       ▼
    JSI  ✅ (zero-copy, sync/async, function pointers)
       │
       ├─► TurboModules (fast native modules)
       └─► Fabric (new UI renderer)

***

## 1) Legacy **Bridge** (old architecture)

*   **How it works:** JS and Native talk via an **asynchronous, batched bridge** using **JSON serialization**. Messages queue up and are processed in order.
*   **Limitations:**
    *   Serialization & copies → **overhead**
    *   Always async → **no synchronous calls** (some APIs need sync)
    *   Backpressure/jank under heavy traffic (animations, large lists)
*   **Where you still see it:** In older RN apps and libraries not yet migrated.

> TL;DR: The Bridge made RN possible, but it became a bottleneck for **perf‑sensitive** features (animations/gestures/crypto).

***

## 2) **JSI** (JavaScript Interface) — the modern foundation

*   **What it is:** A **C++ API** that embeds the JS engine (Hermes/JSC) and lets native code **expose functions/objects directly** to JS **without the Bridge**.
*   **Why it matters:**
    *   **Zero/low‑copy** data access
    *   **Synchronous** calls where needed
    *   Unlocks **high‑perf** libraries (e.g., crypto, image processing, ML) directly from JS
*   **Practical impact:**
    *   Libraries can implement **JSI bindings** for near-native performance.
    *   Enables the new systems: **TurboModules** and **Fabric**.

> Think of JSI as “C++ hooks” into the JS VM—no JSON, no message queue required.

***

## 3) **TurboModules** — next‑gen Native Modules

*   **What they are:** Native modules rewritten to use the **JSI** pipeline rather than the Bridge.
*   **Benefits:**
    *   **Lazy loading** (modules are loaded on first use → smaller startup cost)
    *   **Direct calls via JSI** (fewer copies, optional sync)
    *   Stronger **type safety** when paired with codegen (RN’s codegen can auto-generate stubs)
*   **When to use:** For any custom native module you write today—**prefer TurboModules**.
*   **Migration tip:** If you depend on heavy Bridge‑based modules, look for Turbo/JSI versions or alternatives.

***

## 4) **Fabric** — the new concurrent UI renderer

*   **What it is:** The next‑gen renderer for React Native views (replacing the old UI manager).
*   **Key improvements:**
    *   **Concurrent React** compatible (interruptible rendering → smoother UX)
    *   **Synchronous layout** when needed (better coordination with native)
    *   **View flattening & better memory** handling
    *   Uses **Yoga** (layout) + **C++ core** for consistency across platforms
*   **Why you care:**
    *   Lower TTI, smoother gestures/animations, more deterministic layout
    *   It’s the future—new UI kits target Fabric compatibility.

***

## How they fit together in modern RN

*   **JSI** is the base layer.
*   **TurboModules** use JSI for fast native module calls.
*   **Fabric** uses JSI for the renderer, enabling concurrent rendering and better perf.
*   **Hermes** JS engine is optimized for RN (fast startup, smaller memory), and works hand‑in‑hand with JSI.

***

## RN Version & Enablement (practical notes)

*   Recent RN versions (0.70+) have **Hermes on by default** and ship the **New Architecture** tooling (Fabric + TurboModules).
*   In a new app, you typically **opt into the New Architecture** with config flags; many popular libraries are already compatible.
*   For brownfield/legacy apps, you can **migrate incrementally**:
    1.  Turn on **Hermes**.
    2.  Migrate critical libraries to **JSI/Turbo** alternatives.
    3.  Enable **Fabric** and fix any view manager incompatibilities.

*(Exact flags and steps vary by RN version; the recommended approach is to start with Hermes and adopt Turbo/Fabric per library/feature.)*

***

## Real‑world impact (what interviewers expect)

*   **Performance:** Less overhead between JS and native; better **startup**, **memory**, and **animation smoothness**.
*   **Reliability:** Fewer flaky async hops; sync APIs possible when appropriate.
*   **Scalability:** **Lazy module init** and **codegen** improve large app maintainability.
*   **Future‑proof:** Fabric aligns RN with **React Concurrent** features.

***

## Example: Why Reanimated 2/3 feels smooth

Reanimated uses **worklets** and **JSI** to run animations on the UI thread, avoiding the Bridge—so gestures and animations don’t lag even if the JS thread is busy. This is exactly the kind of win JSI enables.

***

## What to say in the interview (short version)

> The **legacy Bridge** batched JSON messages between JS and native, which added latency and copies.  
> The **JSI** replaces this with a direct C++ interface to the JS engine, allowing **synchronous** and **zero‑copy** calls.  
> On top of JSI, **TurboModules** provide faster, lazy‑loaded native modules, and **Fabric** is the new UI renderer supporting **Concurrent React**, with more deterministic layout and better performance.  
> Modern RN apps should enable **Hermes**, adopt **TurboModules** for native integrations, and migrate UI to **Fabric** for the best performance.

  </details>

  <details><summary>14. How does Hermes improve startup performance?</summary>

Great one—Hermes is a big lever for **cold start** and **memory** in React Native apps. Here’s an interview‑ready, RN‑practical answer.

***

## ✅ How Hermes Improves Startup Performance

Hermes is a JS engine optimized for React Native. It reduces startup time by:

1.  **Precompiled Bytecode (ahead of time)**

*   Instead of shipping raw JS that must be parsed & compiled at app launch, Hermes can **precompile your bundle into bytecode** during build.
*   On startup, Hermes **loads bytecode directly** → **skips parse + JIT compilation** → faster **TTI (Time To Interactive)** and lower CPU spikes on cold start.

2.  **Smaller Runtime & Memory Footprint**

*   Hermes has a **compact GC** and a small baseline, so it **allocates less memory** on startup.
*   Lower heap usage means **fewer GC pauses** and faster object allocation early in app life.

3.  **Deterministic, JIT‑less Execution**

*   Hermes favors **ahead-of-time compilation** over heavy JIT warmup.
*   This avoids the “warmup lag” and *unstable perf* you sometimes see with JIT engines, improving **consistent** startup behavior—especially on low‑end Android devices.

4.  **Faster Source Map & Debuggable Bytecode**

*   Optimized integration with Metro improves bundle & source map handling, aiding **symbolication** and **error reporting** without a big cost at startup.

5.  **Better Integration with RN New Architecture**

*   The **JSI-based** pipeline (TurboModules/Fabric) benefits from Hermes’s close integration, lowering **bridge overhead** and enabling faster **module loading** during app launch.

***

## 🔬 What “startup” improvements typically look like

(Varies by app & device; these are common patterns teams observe)

*   **Cold start TTI**: improved by **100–500ms** on mid/low-end devices (sometimes more if your old engine had heavy parse/compile).
*   **App size tradeoff**: APK/IPA may grow slightly (engine + bytecode), but **JS bundle bytes shrink** and execution is faster.
*   **Memory**: lower peak memory during startup; fewer GC interruptions early.

> Tip: Always **measure on your real target devices** (especially low‑RAM Androids). Enable Hermes on **one platform at a time** and compare A/B.

***

## 🛠 How to Enable Hermes (React Native ≥ 0.70 is Hermes‑first)

**Android — `android/gradle.properties`**

```properties
# Usually already true in modern RN templates
hermesEnabled=true
```

**iOS — `ios/Podfile`**

```ruby
use_react_native!(
  :hermes_enabled => true,    # Enable Hermes
  :fabric_enabled => true     # (Optional) if you’re on Fabric
)
```

Reinstall pods and rebuild:

```bash
cd ios && pod install && cd ..
npx react-native run-android
npx react-native run-ios
```

**Optional: Precompile to Hermes bytecode**

*   RN’s modern build typically handles Hermes bytecode by default in release builds.
*   To confirm, inspect your **release artifacts** and monitor **startup logs** (Hermes prints a banner; you can also check `global.HermesInternal` in JS).

***

## 📏 How to Measure the Impact

**JS Metrics**

```ts
const start = Date.now();
// After your app is “ready to interact” (e.g., first screen mounted)
console.log('TTI(ms)=', Date.now() - start);
```

**Android**

*   Add **`Systrace`**/`Android Profiler` for CPU & memory.
*   Compare **release** builds with/without Hermes.
*   Check **Flipper** Hermes plugin for profiling.

**iOS**

*   Use **Instruments → Time Profiler** for cold start.
*   Compare app memory footprint and first render time.

**In‑app**

*   Emit **performance marks** (e.g., from splash start → first screen displayed), send to analytics for real‑world telemetry.

***

## ⚠️ Common Gotchas (and fixes)

*   **App size**: Engine adds footprint; but overall performance improves. Use **ABI splits** (Android App Bundles) to keep download size in check.
*   **Non‑Hermes‑friendly libs**: Rare now, but ensure native/JSI libs support Hermes; update to latest versions.
*   **Debug vs Release**: Only trust **release** metrics for startup comparisons—debug builds are much slower and not comparable.

***

## 🎤 Short Interview Answer

> Hermes speeds up React Native startup by **precompiling JS to bytecode**, so the app **skips parsing/JIT at launch**. It also has a **smaller, mobile‑optimized GC and runtime**, which reduces memory and CPU spikes during cold start. With **JSI**, Hermes integrates tightly with **TurboModules/Fabric**, improving module load and early render phases. In practice, you’ll often see **hundreds of ms** improvement in cold start TTI, especially on lower‑end Android devices.

  </details>

  <details><summary>15. JS thread vs UI thread — what runs where?</summary>

Great question—this is foundational for diagnosing performance in React Native.

## 15) JS thread vs UI thread — what runs where?

### Threads at a glance (modern RN with Hermes, JSI, Fabric)

*   **JS thread**: Runs your **JavaScript/TypeScript** (React app logic, setState, effects, business code). Also runs most **timers**, **promises**, and typical **gesture handlers** (unless offloaded).
*   **UI thread (Main thread)**: Handles **touch input**, **view updates**, **layout & drawing**, and **native animations**. It must stay **butter-smooth** (60/120 FPS).
*   **Shadow/Layout thread** (legacy): Yoga layout calculations often happened off the main thread. With **Fabric**, layout is more tightly integrated and synchronized, but still designed to keep rendering responsive.

> In the **old architecture**, JS ↔ Native communication went over the **Bridge** (batched, async). In the **new architecture**, **JSI** enables **TurboModules** (fast native calls) and **Fabric** (new renderer), reducing overhead and enabling sync/zero‑copy patterns.

***

## What runs on the **JS thread?**

*   React rendering & reconciliation (diffing virtual tree, scheduling updates).
*   Your **component code**, **hooks/effects**, business logic.
*   **Timers** (`setTimeout`, `setInterval`), **Promises/microtasks**.
*   **Networking callbacks** (the event/callback side).
*   Many **gesture/animation drivers**—unless using libraries that offload to UI thread (see below).

**If you block the JS thread**, symptoms:

*   Taps/scrolls stop responding.
*   Press handlers fire late.
*   Frames drop during heavy loops / JSON processing / crypto in JS.

**Avoid:** Long, synchronous JS work on the JS thread.

***

## What runs on the **UI thread?**

*   Touch input dispatch, hit testing.
*   View hierarchy updates, layout resolve, drawing.
*   Native animations (Core Animation on iOS; UI/Render thread paths on Android).
*   Fabric’s rendering pipeline & commit to native views.

**If you block the UI thread**, symptoms:

*   Visual jank despite JS thread being free.
*   Navigation transitions stutter.
*   Animations drop frames.

**Avoid:** Long synchronous work or heavy main-thread I/O in native code.

***

## Modern optimizations you can use

### 1) **Reanimated 2/3 worklets (run on UI thread)**

Animations and some gesture calculations can run on the **UI thread**, independent of JS thread.

```ts
// Example (conceptual)
const animated = useSharedValue(0);

const pan = useAnimatedGestureHandler({
  onActive: (e) => {
    animated.value = e.translationX; // runs on UI thread
  },
});

const style = useAnimatedStyle(() => ({
  transform: [{ translateX: animated.value }],
}));
```

**Benefit:** Smooth gestures/animations even if JS thread is busy.

### 2) **TurboModules / JSI for heavy compute**

Move CPU-heavy or crypto/image ops to a native module exposed via **JSI** (sync or async) to avoid blocking JS.

```ts
// pseudo-typing
import { hashSync } from 'react-native-jsi-crypto'; 
const digest = hashSync(largeBuffer); // native speed, non-Bridge
```

### 3) **InteractionManager** (defer non-critical JS work)

Schedule JS work **after** animations/interactions finish.

```ts
import { InteractionManager } from 'react-native';

InteractionManager.runAfterInteractions(() => {
  // Heavy non-urgent JS (parsing, precomputation)
});
```

### 4) **Background/Headless tasks**

For periodic background work (sync, notifications), use **Headless JS** / background fetch so heavy work isn’t done during critical UI time.

***

## Typical pitfalls & fixes

### Pitfall A: Heavy loops on JS thread

```ts
// ❌ Will freeze taps/scroll for hundreds of ms
const sum = bigArray.reduce((a, b) => a + b, 0);
```

**Fixes:**

*   Chunk work with timers/microtasks (cooperative scheduling).
*   Move to native/JSI or a web worker–like approach (community libs), or let the backend do it.

### Pitfall B: Doing layout/measure in a tight render loop

*   Measuring in **every** render/frame causes layout thrash.
*   Prefer **onLayout**, memoized layout, or **Fabric** measurement APIs; batch changes.

### Pitfall C: JS-driven animations

*   `Animated` (old, JS-driven) stutters if JS is busy.
*   **Use Reanimated** (UI-thread worklets) or **native driver** where applicable.

***

## What updates the screen?

1.  **JS thread** computes new React tree (setState/useState → reconciliation).
2.  The framework **commits updates** to native (via Fabric).
3.  **UI thread** applies layout/draws frames.

If step 1 is slow → **UI can’t get updates** → apparent lag.
If step 3 is slow → **frames drop** even if JS is fast.

***

## How to keep both threads healthy

*   **JS thread**
    *   Minimize sync CPU work (JSON, transforms, crypto → native/JSI).
    *   Use **React.memo**, **useMemo**, **useCallback** to prevent useless renders.
    *   Virtualize long lists (FlatList/FlashList), keyExtractor, `getItemLayout`.
    *   Debounce/throttle high-frequency events.

*   **UI thread**
    *   Prefer **Reanimated** for animations/gestures.
    *   Avoid expensive view trees; flatten where possible.
    *   Optimize images (size, caching), avoid layouts that relayout everything.
    *   Keep native main-thread work minimal.

***

## Quick RN examples

**Avoid blocking JS on navigation**

```ts
// ❌ Heavy sync work during screen mount
useEffect(() => {
  const data = parseLargeJsonSync(raw); // freezes UI interactions
}, []);
```

**Better**

```ts
useEffect(() => {
  InteractionManager.runAfterInteractions(() => {
    parseLargeJsonInChunks(raw); // or move to native/JSI
  });
}, []);
```

**JS timers vs UI-thread animations**

```ts
// ❌ JS setInterval to drive animation → stutter under load
setInterval(() => setX(x => x + 1), 16);

// ✅ Reanimated drives on UI thread (smooth)
```

***

## Short interview soundbite

> The **JS thread** runs your React app logic—state updates, effects, timers, and most business code.  
> The **UI (main) thread** handles input, layout, and drawing.  
> If you block the JS thread, the app stops responding to taps; if you block the UI thread, animations and scrolling stutter.  
> Use **Reanimated** to run animations on the UI thread, **JSI/TurboModules** for heavy compute, **InteractionManager** to defer non‑critical JS, and keep both threads light for 60/120 FPS.

  </details>

  <details><summary>16. How to optimize re-renders using memo, useMemo, useCallback?</summary>

Absolutely—let’s keep this practical and RN‑focused with clear rules, examples, and pitfalls.

***

## 16) How to optimize re‑renders using `React.memo`, `useMemo`, `useCallback`

### 🔑 Core idea

React re-renders a component when its **parent re-renders** and **any of its props** have a **new reference** or **new primitive value**.  
We optimize by:

*   **Keeping props stable** (same references when value didn’t change),
*   **Splitting components** so only affected subtrees update,
*   **Memoizing** values/functions to avoid new identities, and
*   **Avoiding unnecessary state/prop changes**.

***

## 1) `React.memo` — prevent child re-render when props are “equal”

```tsx
import React from 'react';

type RowProps = { id: string; title: string; onPress: (id: string) => void };

const Row = React.memo(function Row({ id, title, onPress }: RowProps) {
  return <Item title={title} onPress={() => onPress(id)} />;
});
// Optional custom comparator: React.memo(Component, areEqual)
```

**When to use**

*   Pure visual components that receive **stable props**.
*   List items (e.g., FlatList `renderItem`) that only change when item data changes.

**Custom comparator** (for expensive prop objects):

```tsx
const Row = React.memo(RowImpl, (prev, next) =>
  prev.id === next.id && prev.title === next.title && prev.onPress === next.onPress
);
```

> ⚠️ `React.memo` is only effective if **props don’t change identity** every render.

***

## 2) `useCallback` — keep function props stable

Parents often pass handlers like `onPress={() => doSomething(item)}`—this creates **new functions** each render → child re-renders.

```tsx
// ❌ New function each render → child re-renders
<Item onPress={() => onPress(id)} />

// ✅ useCallback keeps same reference if deps unchanged
const handlePress = useCallback(() => onPress(id), [onPress, id]);
<Item onPress={handlePress} />
```

**Common RN patterns**

*   `renderItem` for lists:

```tsx
const renderItem = useCallback(({ item }) => (
  <Row id={item.id} title={item.title} onPress={onPressRow} />
), [onPressRow]);

<FlatList renderItem={renderItem} /* ... */ />
```

*   Stable `keyExtractor`:

```tsx
const keyExtractor = useCallback((item) => item.id, []);
```

> ⚠️ Don’t overuse `useCallback`. Only add it where a stable function **prevents a real re-render** (e.g., memoized children or list renderers).

***

## 3) `useMemo` — keep object/array props stable + cache expensive computations

*   **For referential stability** of props:

```tsx
// ❌ New array each render (breaks memo equality)
<Item tags={[...tags]} />

// ✅ Stable reference if tags unchanged
const stableTags = useMemo(() => tags, [tags]); // (if tags comes from state/props already stable, this isn’t needed)
<Item tags={stableTags} />
```

*   **For expensive calculations**:

```tsx
const sorted = useMemo(() => heavySort(transactions), [transactions]);
```

> Use `useMemo` for **expensive** work or when you must pass **stable object/array** props into `React.memo` children.

***

## 4) Split components to reduce blast radius

```tsx
// Parent re-renders often due to unrelated state
function AccountScreen() {
  const [filter, setFilter] = useState('');
  // … other states triggering rerenders

  return (
    <>
      <FilterBar value={filter} onChange={setFilter} />
      <AccountList filter={filter} />   {/* isolate list */}
    </>
  );
}

// Memo child that only depends on `filter`
const AccountList = React.memo(({ filter }: { filter: string }) => {
  // expensive list
});
```

**Result:** Only `AccountList` re-renders when `filter` changes, not when other parent states change.

***

## 5) RN list essentials (big wins)

*   **Use `React.memo` for row items**.
*   **Pass stable `renderItem`, `keyExtractor`, and handlers** (useCallback).
*   Provide `getItemLayout`, `initialNumToRender`, and proper `key` to reduce work.
*   Consider **FlashList** for better defaults with large datasets.

```tsx
const Row = React.memo(/* ... */);

const renderItem = useCallback(({ item }) => (
  <Row id={item.id} title={item.title} onPress={onPressRow} />
), [onPressRow]);

<FlatList
  data={items}
  keyExtractor={useCallback((i) => i.id, [])}
  renderItem={renderItem}
  getItemLayout={getItemLayout}
/>
```

***

## 6) Avoid creating new references in JSX

**Bad:**

```tsx
<Item style={{ padding: 12 }} />          // new object each render
<Item tags={['new', 'hot']} />            // new array each render
<Item onPress={() => doSomething(id)} />  // new function each render
```

**Good:**

```tsx
const style = useMemo(() => ({ padding: 12 }), []);
const tags = useMemo(() => ['new', 'hot'], []);
const handle = useCallback(() => doSomething(id), [doSomething, id]);

<Item style={style} tags={tags} onPress={handle} />
```

> Memoizing trivial constants is optional; do it when passed to memoized children or frequently re-rendered lists.

***

## 7) Common pitfalls (and fixes)

*   **Stale closure** in callbacks:
    *   Use functional updates or include dependencies correctly.
    *   For long-lived handlers, use a **ref** to always read latest values.

```tsx
const latest = useRef(value);
useEffect(() => { latest.current = value; }, [value]);

const handler = useCallback(() => {
  doSomething(latest.current);
}, []);
```

*   **Over-memoization**:
    *   `useMemo`/`useCallback` have overhead; avoid blanketing everything.
    *   Focus on components within **hot paths** (lists, grids, frequently updating screens).

*   **Context causing re-renders**:
    *   Avoid putting fast‑changing values in a global context.
    *   Use **context selectors** (libraries) or **split contexts** by concern.

*   **Object equality in `React.memo`**:
    *   If you pass nested objects that change identity, add a **custom comparator** or return **stable references** via `useMemo`.

***

## 8) Practical checklist (copy for code reviews)

*   [ ] Split large components—only the subtree that changes should re-render.
*   [ ] Wrap heavy/leaf components with `React.memo`.
*   [ ] Ensure props to memoized children are **referentially stable** (useMemo/useCallback).
*   [ ] In lists: memoize `renderItem`, `keyExtractor`, item rows.
*   [ ] Avoid inline object/array/function props in hot paths.
*   [ ] Use functional `setState` to avoid stale closures.
*   [ ] Measure before/after with **Flipper Perf Monitor**, React DevTools Profiler.

***

## 9) Micro examples

**A) Prevent child re-render when parent state changes unrelatedly**

```tsx
function Parent() {
  const [count, setCount] = useState(0);
  const user = { id: 'u1', name: 'Harshal' }; // ❌ new each render

  return (
    <>
      <Button title="Increment" onPress={() => setCount(c => c + 1)} />
      <UserCard user={user} />
    </>
  );
}

const UserCard = React.memo(({ user }: { user: { id: string; name: string } }) => {
  return <Text>{user.name}</Text>;
});
```

**Fix:** stabilize `user`

```tsx
const user = useMemo(() => ({ id: 'u1', name: 'Harshal' }), []);
```

**B) Stable handler to memo child**

```tsx
const onPressUser = useCallback((id: string) => {
  // navigation, analytics, etc.
}, []);

<UserRow id={id} onPress={onPressUser} />
```

***

## 10) When NOT to optimize

*   Small screens/forms where re-renders are cheap.
*   If child already re-renders due to state changes inside itself.
*   When memoization complexity + deps management outweighs benefit.

Start with a clear **perf issue** (e.g., list stutter) → profile → apply targeted memoization.

***

## TL;DR (Interview answer)

*   Use **`React.memo`** to skip re-renders when props don’t change.
*   Use **`useCallback`** to keep **function props stable**.
*   Use **`useMemo`** to cache **expensive computations** and keep **object/array props stable**.
*   Split components and optimize **lists** (memoized rows + stable renderers).
*   Avoid creating **new references in JSX** for hot paths. Measure with DevTools/Flipper.

  </details>

  <details><summary>17. Best practices for FlatList performance (windowing, keys, memoization).</summary>

Absolutely—here’s a **practical, interview‑ready** checklist to get buttery‑smooth **FlatList** performance in React Native, with copy‑paste snippets and explanations.

***

## 17) Best practices for **FlatList** performance (windowing, keys, memoization)

### 1) Use **stable keys** (never array index)

*   Stable keys let RN recycle cells correctly and avoid re‑mounts.

```tsx
const keyExtractor = React.useCallback((item: Item) => item.id, []);
<FlatList keyExtractor={keyExtractor} /* ... */ />
```

> **Avoid:** `keyExtractor={(item, index) => String(index)}` — causes extra renders on inserts/deletes/reorders.

***

### 2) Memoize **renderItem** and the **row component**

*   Prevents row re-renders unless **relevant props** actually change.

```tsx
type RowProps = { item: Item; onPress: (id: string) => void };

const Row = React.memo(({ item, onPress }: RowProps) => {
  return <ItemCard title={item.title} onPress={() => onPress(item.id)} />;
});

const renderItem = React.useCallback(
  ({ item }: { item: Item }) => <Row item={item} onPress={onPressRow} />,
  [onPressRow]
);

<FlatList renderItem={renderItem} /* ... */ />
```

> Tip: If rows still re-render, check you’re not passing **new object/array/function props** each time (memoize them too).

***

### 3) Windowing & batch render settings (tune per screen)

These control how many items mount initially and per batch—avoid rendering “the whole world”.

```tsx
<FlatList
  data={data}
  renderItem={renderItem}
  keyExtractor={keyExtractor}
  initialNumToRender={10}            // fast first paint
  maxToRenderPerBatch={10}           // how many per batch
  updateCellsBatchingPeriod={50}     // ms between batches
  windowSize={5}                     // # of screens to render (2 before, 2 after + current)
  removeClippedSubviews              // unmount offscreen (Android big win)
/>
```

*   **`initialNumToRender`**: small but enough to avoid blank on first scroll.
*   **`windowSize`**: 5 is a good start for feeds; reduce for simpler lists, increase for big screens.

***

### 4) Provide **`getItemLayout`** (when item height is known or computable)

Prevents measurement passes and allows **constant-time** scroll jumps → big perf win.

```tsx
// Fixed height rows
const ITEM_HEIGHT = 72;

const getItemLayout = React.useCallback(
  (_: Item[] | null | undefined, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }),
  []
);

<FlatList getItemLayout={getItemLayout} /* ... */ />
```

*   For variable heights within a few patterns, consider caching heights or grouping by size.

***

### 5) Avoid creating new references in JSX (hot path)

```tsx
// ❌ causes unnecessary re-renders
<ItemCard style={{ padding: 12 }} tags={['new']} onPress={() => onPress(id)} />

// ✅ stabilize
const style = React.useMemo(() => ({ padding: 12 }), []);
const tags = React.useMemo(() => ['new'], []);
const handlePress = React.useCallback(() => onPress(id), [onPress, id]);

<ItemCard style={style} tags={tags} onPress={handlePress} />
```

***

### 6) Use **`extraData`** carefully

Only pass `extraData` when necessary. It forces FlatList to re-check rows when the value changes.

```tsx
<FlatList data={items} extraData={selectedId} /* ... */ />
```

> If too many unrelated values are in `extraData`, you’ll trigger avoidable row updates.

***

### 7) Split UI to reduce re-render blast radius

Keep parent lightweight; memoize heavy children (filters, headers, footers).

```tsx
const ListHeader = React.memo(() => <Filters />);

<FlatList ListHeaderComponent={ListHeader} /* ... */ />
```

Also memoize `ItemSeparatorComponent`, `ListEmptyComponent` if they are not trivial.

***

### 8) Control infinite scroll (end reached noise)

Tune `onEndReachedThreshold` and debounce `onEndReached` to avoid duplicate loads.

```tsx
const onEndReached = React.useCallback(() => {
  if (!hasMore || loading) return;
  loadMore();
}, [hasMore, loading, loadMore]);

<FlatList onEndReached={onEndReached} onEndReachedThreshold={0.5} />
```

***

### 9) Images: pre-size & cache

*   Provide **width/height** to avoid layout thrash.
*   Use `react-native-fast-image` (or modern caching) for heavy feeds.
*   Prefetch thumbnails; lazy-load larger assets after idle.

```tsx
<FastImage
  source={{ uri, priority: FastImage.priority.normal }}
  style={{ width: 72, height: 72 }}
  resizeMode={FastImage.resizeMode.cover}
/>
```

***

### 10) Avoid expensive inline conditions in rows

Compute heavy values outside render or **useMemo** inside row:

```tsx
const computed = React.useMemo(() => heavyCompute(item), [item.id]);
```

***

### 11) Use **FlashList** for very large lists (drop-in, better defaults)

If your list is huge or stutters, **FlashList** (Shopify) often performs better with minimal changes:

```tsx
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={data}
  renderItem={renderItem}
  keyExtractor={keyExtractor}
  estimatedItemSize={72}
/>
```

*   `estimatedItemSize` lets it compute layout efficiently.
*   Still apply memoization best practices.

***

### 12) Don’t do heavy JS work during scroll

Network parsing, JSON transforms, crypto, etc. will block the JS thread → scroll jank.

*   Move to **JSI/native** or defer via **`InteractionManager.runAfterInteractions`**.

```tsx
import { InteractionManager } from 'react-native';
InteractionManager.runAfterInteractions(() => parseLargeJSON());
```

***

### 13) Advanced: `CellRendererComponent` / `shouldRasterizeIOS`

*   **`CellRendererComponent`** can help batch row wrappers (rarely needed).
*   On iOS, for complex static cells, `style={{ transform: [], backfaceVisibility: 'hidden' }}` or layer‑backing can help, but use sparingly. Measure first.

***

### 14) Avoid nested scrollable lists when possible

Nested `FlatList`/`ScrollView` can fight for gestures and memory. Prefer a single list with **section headers** (`SectionList`) or render expanded content inline.

***

### 15) Measure & verify (don’t guess)

*   **React DevTools Profiler**: which components re-render and why.
*   **Flipper Perf Monitor**: FPS and JS frame drops.
*   **Systrace/Android Profiler** / **Xcode Instruments** for native jank.

***

## Example: Putting it together

```tsx
type Item = { id: string; title: string };

const Row = React.memo(({ item, onPress }: { item: Item; onPress: (id: string) => void }) => {
  const handlePress = React.useCallback(() => onPress(item.id), [onPress, item.id]);
  return <ItemCard title={item.title} onPress={handlePress} />;
});

const keyExtractor = React.useCallback((it: Item) => it.id, []);
const getItemLayout = React.useCallback(
  (_: Item[] | null | undefined, index: number) => ({
    length: 72,
    offset: 72 * index,
    index,
  }),
  []
);

export function ItemsList({ data, onPressRow }: { data: Item[]; onPressRow: (id: string) => void }) {
  const renderItem = React.useCallback(
    ({ item }: { item: Item }) => <Row item={item} onPress={onPressRow} />,
    [onPressRow]
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      windowSize={5}
      removeClippedSubviews
      getItemLayout={getItemLayout}
      onEndReachedThreshold={0.5}
    />
  );
}
```

***

## Quick checklist (for code reviews)

*   [ ] Stable `keyExtractor` (no index).
*   [ ] `Row` uses `React.memo`.
*   [ ] `renderItem`, `keyExtractor`, handlers are `useCallback`.
*   [ ] No inline objects/arrays/functions in hot paths.
*   [ ] Reasonable `initialNumToRender`, `windowSize`, batching.
*   [ ] `getItemLayout` provided (if item height known).
*   [ ] Image sizes fixed + caching in place.
*   [ ] Infinite scroll tuned; no duplicate loads.
*   [ ] Measured with Profiler/Flipper.

  </details>

  <details><summary>18. How to handle responsive UI across multiple screen sizes?</summary>

Here’s a clean, **interview‑ready**, RN‑focused guide on building **responsive UI across multiple screen sizes**—Android & iOS, small to large devices, tablets, notch devices, dynamic type, etc.

***

# ✅ **18. How to handle responsive UI across multiple screen sizes?**

React Native does **not** scale layouts automatically—you must design components that adapt to:

*   Varying screen widths/heights
*   Pixel density (DPI)
*   Safe areas (notches, home indicators)
*   Dynamic text scaling (accessibility)
*   Orientation changes
*   Tablets vs phones

Below are the **best practices** with code snippets.

***

# 1) **Use Flexbox layout (primary tool)**

Flexbox handles most responsiveness with **no pixel math**.

### Example

```tsx
<View style={{ flexDirection: 'row', flex: 1 }}>
  <View style={{ flex: 1, backgroundColor: 'red' }} />
  <View style={{ flex: 2, backgroundColor: 'blue' }} />
</View>
```

*   Avoid fixed widths/heights unless necessary.
*   Prefer `flex`, `justifyContent`, `alignItems`, `gap`, `padding`, `margin`.

***

# 2) **Use % widths instead of absolute pixels**

```tsx
<View style={{ width: '90%', alignSelf: 'center' }}>
  <Text>Responsive Box</Text>
</View>
```

Useful for cards, containers, images, grids, modals.

***

# 3) **Use `Dimensions` or `useWindowDimensions()`**

Automatically adapt on screen rotation or resizing.

```tsx
import { useWindowDimensions } from 'react-native';

const { width, height } = useWindowDimensions();
```

### Example: Responsive columns

```tsx
const numColumns = width > 600 ? 3 : 2;  // tablet vs phone
```

***

# 4) **Use breakpoints (like web responsive design)**

Define breakpoints once:

```tsx
export const BREAKPOINTS = {
  phone: 0,
  tablet: 600,
  largeTablet: 900,
};
```

Usage:

```tsx
const layout = width > BREAKPOINTS.tablet ? 'tablet' : 'phone';
```

***

# 5) **Safe Area for notches, status bar, home bar**

Use `react-native-safe-area-context`

```tsx
import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView style={{ flex: 1 }}>
  <AppContent />
</SafeAreaView>
```

Ensures UI does not overlap:

*   iPhone notch
*   Android cutouts
*   Home indicator
*   Status bars

***

# 6) **Use scalable units (moderate scale)**

Pixel-perfect UI breaks on different DPIs.  
Use libraries for consistent scaling:

### Option A: `react-native-size-matters`

```tsx
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

const styles = StyleSheet.create({
  title: { fontSize: scale(18) },
  card: { padding: moderateScale(12) },
});
```

### Option B: `react-native-responsive-screen`

```tsx
import { widthPercentageToDP, heightPercentageToDP } from 'react-native-responsive-screen';

const styles = {
  container: {
    width: widthPercentageToDP('90%'),
    height: heightPercentageToDP('20%'),
  },
};
```

> These help maintain **consistent UI across small/large Android devices**.

***

# 7) **Support Dynamic Type / Font scaling**

Text needs to respond to Accessibility font size settings.

```tsx
<Text
  allowFontScaling
  numberOfLines={2}
  adjustsFontSizeToFit
>
  Hello World
</Text>
```

To **prevent breaking layouts**:

```tsx
<Text style={{ flexShrink: 1 }}>Scalable Text</Text>
```

***

# 8) **Use platform-specific styles when needed**

```tsx
import { Platform } from 'react-native';

const styles = {
  card: {
    padding: Platform.OS === 'ios' ? 16 : 12,
  }
};
```

Styling differences help on:

*   Android tablets
*   iPads
*   iOS default padding

***

# 9) **Use responsive images**

Always specify image **width/height**, even when responsive.

```tsx
<Image
  resizeMode="contain"
  style={{ width: '100%', height: 200 }}
  source={{ uri }}
/>
```

For device‑scale bitmap variants:

*   Deliver multiple density images (`@1x`, `@2x`, `@3x`).

***

# 10) **Grids & Lists — responsive columns**

```tsx
const numColumns = width > 600 ? 3 : 2;

<FlatList
  numColumns={numColumns}
  columnWrapperStyle={{ gap: 10 }}
  contentContainerStyle={{ padding: 10 }}
  data={data}
  renderItem={renderItem}
/>
```

Good for:

*   Product grids
*   Dashboards
*   Photo galleries

***

# 11) **Use `react-native-responsive-fontsize` (optional)**

```tsx
import { RFValue } from 'react-native-responsive-fontsize';
<Text style={{ fontSize: RFValue(14) }}>Text</Text>
```

***

# 12) **Tablet‑specific UI patterns**

For tablets, use **side-by-side layouts**:

```tsx
const isTablet = width > 600;

return isTablet ? (
  <View style={{ flexDirection: 'row' }}>
    <Sidebar />
    <Content />
  </View>
) : (
  <Content />
);
```

Makes banking apps look professional:

*   Dashboard + Sidebar
*   Split transactions & detail view

***

# Real-world RN examples (banking apps)

### **A) Transaction list spacing**

```tsx
const isLargeScreen = width > 420;

<TransactionRow style={{ padding: isLargeScreen ? 20 : 12 }} />
```

### **B) Responsive card grid**

```tsx
const cardWidth = width > 450 ? width / 3 : width / 2;
```

### **C) Bottom sheet heights**

```tsx
const SHEET_HEIGHT = height * 0.5;   // half screen
```

***

# Pitfalls (what interviewers want to hear)

*   ❌ Hardcoded widths/heights break on tablets
*   ❌ Absolute positioning everywhere
*   ❌ Ignoring dynamic text sizes → clipped UI
*   ❌ Using ScrollView inside ScrollView
*   ❌ Huge, non-flexbox layouts that don't wrap

***

# Best Practices Summary (Interview answer)

> Use **Flexbox** as the foundation, responsive **percent widths**, breakpoints, `useWindowDimensions()`, and safe area views.  
> For scaling, use tools like `size-matters` or `responsive-screen`.  
> Always adapt **font scaling**, **image sizing**, and **tablet layouts**.  
> Avoid fixed pixel values unless required, and measure UI with Preview on different screen sizes.

  </details>

  <details><summary>19. Explain RN navigation stacks & how you prevent memory leaks.</summary>

Great topic—navigation architecture and leak‑proofing go hand in hand in React Native apps.

Below is a concise, **interview‑ready** guide covering **navigation stacks** (how they work, how to structure them) and **practical patterns to prevent memory leaks** (timers, subscriptions, async work, and navigator listeners).

***

## ✅ 19) React Native navigation stacks & preventing memory leaks

### 1) What is a **navigation stack**?

*   A **stack** is a **LIFO** history of screens. Each `navigate()`/`push()` **adds** a screen; `goBack()` **pops** the top.
*   Typical stacks:
    *   **Auth stack** (Login → OTP → Reset)
    *   **App stack** (Tabs or Drawer nested with feature stacks)
    *   **Modal stack** (overlays, sheets)
*   With **React Navigation**, stacks nest:
    *   **Root**: `Stack`
    *   **Tab**: `BottomTab`
    *   **Feature**: nested `Stack` inside each tab
*   Navigation state lives in JS; transitions/gestures are native.

> Key APIs: `navigate`, `push`, `replace`, `reset`, `goBack`, `setParams`.  
> Use **`replace`** for auth handoff (prevents back to login); use **`reset`** after onboarding.

***

### 2) Example: Common architecture (root → tabs → feature stacks)

```tsx
// Root navigator
const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const TransferStack = createNativeStackNavigator();

function TransferNavigator() {
  return (
    <TransferStack.Navigator>
      <TransferStack.Screen name="TransferHome" component={TransferHome} />
      <TransferStack.Screen name="Recipient" component={Recipient} />
      <TransferStack.Screen name="Review" component={Review} />
      <TransferStack.Screen name="Success" component={Success} />
    </TransferStack.Navigator>
  );
}

function Tabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Transfer" component={TransferNavigator} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Auth" component={AuthStack} />
      <RootStack.Screen name="Main" component={Tabs} />
      <RootStack.Screen name="Modal" component={SomeModal} options={{ presentation: 'modal' }} />
    </RootStack.Navigator>
  );
}
```

**Patterns**

*   **Auth → Main**: use `replace('Main')` so back doesn’t return to login.
*   **Deep link** to a nested screen by **name** and **params**; export route types for TS safety.

***

## Preventing Memory Leaks

Leaks in RN typically come from **un‑cleared references** (timers, subscriptions, listeners, inflight async), **overgrown stacks**, or **long‑lived closures** capturing old state. Use the patterns below.

### 3) Clean up **timers, intervals, animations**

```tsx
useEffect(() => {
  const id = setInterval(poll, 5000);
  return () => clearInterval(id); // ✅ cleanup
}, []);
```

For animations (old `Animated`):

```tsx
useEffect(() => {
  const anim = Animated.timing(value, { toValue: 1, duration: 300, useNativeDriver: true });
  anim.start();
  return () => anim.stop(); // ✅
}, []);
```

### 4) Cancel **network requests / async work** on unmount

```tsx
useEffect(() => {
  const ac = new AbortController();
  (async () => {
    try {
      const res = await fetch(url, { signal: ac.signal });
      const json = await res.json();
      if (!ac.signal.aborted) setData(json);
    } catch (e) { /* handle */ }
  })();
  return () => ac.abort(); // ✅ cancel in-flight
}, [url]);
```

If using **React Query**, it automatically cancels queries on unmount/focus change; prefer it for server state.

### 5) Unsubscribe **event listeners**

Common culprits: `AppState`, `BackHandler`, `Dimensions`, `NetInfo`, `Keyboard`, `Linking`, `Appearance`, `DeviceEventEmitter`.

```tsx
useEffect(() => {
  const sub = AppState.addEventListener('change', onChange);
  return () => sub.remove(); // ✅
}, []);
```

Back handler:

```tsx
useEffect(() => {
  const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
  return () => sub.remove(); // ✅
}, [onBack]);
```

### 6) Use **navigation lifecycle** correctly (`useFocusEffect`)

Run screen‑specific logic only while focused; cleanup when blurred to avoid dangling work.

```tsx
import { useFocusEffect } from '@react-navigation/native';

useFocusEffect(
  React.useCallback(() => {
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id); // cleanup on blur
  }, [refresh])
);
```

### 7) Avoid **state updates after unmount** (stale closures)

Guard with a ref or cancellation:

```tsx
function useMountedRef() {
  const ref = useRef(true);
  useEffect(() => () => { ref.current = false; }, []);
  return ref;
}

const mounted = useMountedRef();
useEffect(() => {
  let done = false;
  (async () => {
    const data = await load();
    if (!done && mounted.current) setData(data);
  })();
  return () => { done = true; };
}, []);
```

### 8) Prevent **stack bloat** (navigation leaks)

*   Prefer `replace()` for flows (auth, wizard step transitions) when going forward should **remove** previous screens:
    ```ts
    navigation.replace('Dashboard');
    ```
*   After onboarding/login, **reset** to a clean state:
    ```ts
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
    ```
*   Avoid `push()` loops on the same route for idempotent actions (e.g., detail → detail). Use `navigate()` (which reuses) or a **route key** if unique is needed.
*   For modals, ensure you **dismiss** (`goBack`) rather than stacking new ones repeatedly.

### 9) Keep **params lightweight** (no large objects/functions)

*   Don’t pass huge objects or functions in route params—they keep references alive.
*   Pass **IDs** and fetch on the screen.
*   If you must pass data, use **normalized cache** (React Query / Redux store) and reference by key.

### 10) Guard **listeners created in effects** with correct deps

Avoid re‑adding listeners on every render:

```tsx
const onChange = useCallback(() => { /* ... */ }, []); // stable
useEffect(() => {
  const sub = NetInfo.addEventListener(onChange);
  return () => sub(); // ✅ unsubscribe
}, [onChange]);
```

### 11) Reanimated / Gesture Handler

*   Prefer **Reanimated** worklets (UI thread) to avoid JS timers.
*   Clean up gesture handlers or subscriptions when screen blurs/unmounts.
*   Avoid keeping big JS objects in shared values.

### 12) Large lists in stacks (FlatList)

*   Use `removeClippedSubviews`, windowing, and **unmount heavy children** when leaving screen (move polling to `useFocusEffect`).
*   If stacks keep many screens mounted (e.g., `detachInactiveScreens={false}`), consider enabling **`detachInactiveScreens`** on navigators to free memory.

```tsx
<Stack.Navigator screenOptions={{ detachInactiveScreens: true }}>
  {/* ... */}
</Stack.Navigator>
```

### 13) Avoid global singletons retaining screen refs

*   Do not store `navigation` or component instances in singletons. If a singleton needs to trigger navigation, use an **event bus** pattern and have a **top‑level** listener (in the app shell) perform navigation.

***

## Mini checklists

**When adding a new screen**

*   [ ] All timers/intervals clear in cleanup.
*   [ ] All subscriptions remove in cleanup.
*   [ ] All fetches cancellable or handled by React Query.
*   [ ] Heavy work moved to `useFocusEffect` (start on focus, stop on blur).
*   [ ] Route params are small (IDs, not big objects).

**When wiring navigation**

*   [ ] Use `replace/reset` to prevent stack growth when appropriate.
*   [ ] Don’t `push` the same screen repeatedly (use `navigate` unless truly needed).
*   [ ] Enable `detachInactiveScreens` if memory pressure is observed.

***

## Code snippets you can copy

**Auth handoff without back to login**

```ts
// After success login
navigation.reset({
  index: 0,
  routes: [{ name: 'Main' }],
});
```

**Wizard step (replace keeps stack shallow)**

```ts
navigation.replace('Review', { id });
```

**Focus-bounded polling**

```tsx
useFocusEffect(
  useCallback(() => {
    const id = setInterval(fetchLatest, 5000);
    return () => clearInterval(id);
  }, [fetchLatest])
);
```

**Back handler that unsubscribes**

```tsx
useFocusEffect(
  useCallback(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });
    return () => sub.remove();
  }, [navigation])
);
```

**Cancelable fetch with AbortController**

```tsx
useEffect(() => {
  const ac = new AbortController();
  (async () => {
    try {
      const res = await fetch(url, { signal: ac.signal });
      setData(await res.json());
    } catch {}
  })();
  return () => ac.abort();
}, [url]);
```

***

## Short interview answer (soundbite)

> A **navigation stack** is a LIFO history of screens. In React Navigation, you compose stacks with tabs/drawers and use `navigate`, `push`, `replace`, and `reset` to control history.  
> To **prevent memory leaks**, always **clean up timers, listeners, and async work** (use `AbortController` or React Query), use **`useFocusEffect`** to start/stop work on focus/blur, prefer **`replace/reset`** to avoid overgrowing stacks, keep **route params small**, and enable **`detachInactiveScreens`** when needed. This keeps both memory and responsiveness healthy.

  </details>

  <details><summary>20. What are Error Boundaries and how to implement one?</summary>

Great question—this is a must‑know for shipping resilient RN apps.

## 20) What are Error Boundaries and how to implement one?

### What is an Error Boundary?

An **Error Boundary** is a React component that **catches JavaScript errors** in its **child component tree** during **rendering**, in **lifecycle methods**, and in **constructors** of child components. It lets you:

*   Show a **fallback UI** instead of a broken screen,
*   **Log** the error (Sentry/Crashlytics),
*   Optionally give users a **“Try again”** flow.

> ⚠️ **They do *not*** catch errors in:
>
> *   **Event handlers** (wrap with `try/catch`),
> *   **Asynchronous code** (e.g., `setTimeout`, Promises),
> *   **Server-side rendering**,
> *   **Errors thrown in the error boundary itself**.

***

## Minimal Error Boundary (class component)

```tsx
import React from 'react';
import { View, Text, Button } from 'react-native';

type Props = {
  fallback?: React.ReactNode;
  onReset?: () => void;
  children: React.ReactNode;
};

type State = { hasError: boolean; error?: Error };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to your service (Sentry/Crashlytics/etc.)
    // Sentry.captureException(error, { extra: info });
    console.error('ErrorBoundary caught:', error, info);
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return <>{this.props.fallback}</>;
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <Text style={{ fontSize: 16, marginBottom: 8 }}>Something went wrong.</Text>
          <Button title="Try again" onPress={this.reset} />
        </View>
      );
    }
    return this.props.children;
  }
}
```

**Usage (wrap a screen or a subtree):**

```tsx
export function TransferScreenWithBoundary() {
  return (
    <ErrorBoundary>
      <TransferScreen />
    </ErrorBoundary>
  );
}
```

***

## Resetting the boundary when navigating

When you navigate, you often want a **fresh** boundary so previous errors don’t persist. Key the boundary by the **route key**:

```tsx
import { useRoute } from '@react-navigation/native';

export function ScreenWrapper({ children }: { children: React.ReactNode }) {
  const route = useRoute(); // unique per screen instance
  return (
    <ErrorBoundary key={route.key}>
      {children}
    </ErrorBoundary>
  );
}
```

Wrap each screen’s content with `ScreenWrapper` to ensure it **resets on navigation**.

***

## Functional alternative with `react-error-boundary`

If you prefer hooks/functional style, use the community package:

```tsx
import { ErrorBoundary } from 'react-error-boundary';
import { View, Text, Button } from 'react-native';

function Fallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Oops: {error.message}</Text>
      <Button title="Try again" onPress={resetErrorBoundary} />
    </View>
  );
}

export function WrappedScreen() {
  return (
    <ErrorBoundary
      FallbackComponent={Fallback}
      onError={(error, info) => {
        // Sentry.captureException(error, { extra: info });
        console.error(error, info);
      }}
      onReset={() => {
        // optional: reset local state, refetch, etc.
      }}
    >
      <ActualScreen />
    </ErrorBoundary>
  );
}
```

> With React Navigation, combine with `key={route.key}` the same way to reset on route changes.

***

## What Error Boundaries **don’t** catch (and what to do)

### 1) Event handlers (use `try/catch`)

```tsx
const onPress = () => {
  try {
    riskyAction();
  } catch (e) {
    // show toast/dialog, log error
  }
};
```

### 2) Async/Promise / timers (handle in the async chain)

```tsx
useEffect(() => {
  let cancelled = false;
  (async () => {
    try {
      await riskyAsync();
    } catch (e) {
      if (!cancelled) {
        // set local error state → renders fallback area you control
      }
    }
  })();
  return () => { cancelled = true; };
}, []);
```

### 3) Global “last resort” handler (crash surface)

For unexpected unhandled errors in production, you can set a global JS handler (and native handlers) via libraries like `react-native-exception-handler` or directly:

```tsx
const defaultHandler = (ErrorUtils as any).getGlobalHandler?.();
(ErrorUtils as any).setGlobalHandler?.((e: any, isFatal?: boolean) => {
  // Log to Crashlytics/Sentry
  // Show a fatal error screen if needed
  defaultHandler?.(e, isFatal);
});
```

*(Use judiciously; prefer scoped boundaries where possible.)*

***

## Where to place Error Boundaries (practical guidance)

*   **Root boundary**: Around your entire app to avoid full white screens.
*   **Feature boundaries**: Around risky areas (heavy lists, webviews, complex forms, experimental modules).
*   **Route boundaries**: Around individual screens so one broken screen doesn’t take down others.
*   **Async UI**: For network-heavy screens, show controlled error UIs (not necessarily a global boundary).

***

## UX & Observability best practices

*   Show a **friendly message** with a **Retry** and “Report issue” (optional).
*   **Log** with user/session context and breadcrumbs (Sentry/Crashlytics).
*   Include a **unique error ID** to correlate user reports with logs.
*   Avoid infinite loops (don’t keep throwing from the fallback).
*   Test by throwing deliberately:
    ```tsx
    if (__DEV__ && forceError) { throw new Error('Test error'); }
    ```

***

## Interview soundbite

> Error Boundaries are **class (or library) components** that catch errors during **rendering and lifecycle** of their children and display a **fallback UI** instead of crashing the app. They don’t catch **event handler** or **async** errors, so those need **try/catch** (or request‑level error handling). In RN, place boundaries at the **root** and around **screens/features**, **log** with Sentry/Crashlytics, and **reset** the boundary on navigation by keying it to the **route key**.

  </details>

  <details><summary>21. Explain deep linking & universal links.</summary>

Absolutely—here’s a clear, interview‑ready guide to **Deep Linking** and **Universal/App Links** in React Native, with copy‑paste configs and practical testing tips.

***

## ✅ What are Deep Links, Universal Links, and App Links?

*   **Deep Link (generic)**: A link (e.g., `mybank://transfer/123`) that **opens your app** and navigates to a specific screen/route. Uses a **custom URL scheme**.
    *   Pros: Easy to set up.
    *   Cons: Not verified; the OS can show a chooser; doesn’t work from web by default.

*   **iOS Universal Links**: **HTTP/HTTPS links** (e.g., `https://app.mybank.com/transfer/123`) that, when tapped, **open your app directly** (no browser) if installed; otherwise they **fall back to the website**. Mapping is verified via an **`apple-app-site-association`** (AASA) file hosted on your domain.

*   **Android App Links**: Android’s equivalent to Universal Links. **HTTPS links** verified via **`assetlinks.json`** so Android can **directly open** your app without a chooser if installed; otherwise goes to the web page.

> **Rule of thumb**: Use **Universal Links (iOS)** and **App Links (Android)** for production banking apps; keep a **custom scheme** as a fallback (for internal automation, QR codes, manual testing).

***

## 🧭 RN App-Level Linking: Single source of truth

With **React Navigation**, define a **linking configuration** to map URLs → screens.

```ts
// app/navigation/linking.ts
import { LinkingOptions } from '@react-navigation/native';

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['mybank://', 'https://app.mybank.com'], // scheme + universal/app links
  config: {
    screens: {
      Main: {
        screens: {
          Home: 'home',
          Transfer: {
            screens: {
              TransferHome: 'transfer',
              Recipient: 'transfer/recipient',
              Review: 'transfer/review/:id',
              Success: 'transfer/success/:id',
            },
          },
          Profile: 'profile',
        },
      },
      Auth: {
        screens: {
          Login: 'login',
          Otp: 'otp',
        },
      },
    },
  },
};

export default linking;
```

Then pass it to the NavigationContainer:

```tsx
<NavigationContainer linking={linking} fallback={<Splash />}>
  {/* navigators */}
</NavigationContainer>
```

***

## 📱 iOS — Universal Links

### 1) Enable Associated Domains

In Xcode → Target → **Signing & Capabilities** → **+ Capability** → **Associated Domains**:

    applinks:app.mybank.com
    applinks:my.mybank.com    // if you have multiple domains

### 2) Host `apple-app-site-association` (AASA)

*   Serve at: `https://app.mybank.com/apple-app-site-association` (no `.json` extension)
*   Content-Type: `application/json`
*   **No redirects**; must be HTTPS.

**Minimal AASA example:**

```json
{
  "applinks": {
    "details": [
      {
        "appIDs": ["ABCDE12345.com.mybank.mobile"],
        "paths": [
          "/transfer/*",
          "/login",
          "/otp",
          "/profile/*",
          "/home",
          "NOT /admin/*"
        ]
      }
    ]
  }
}
```

*   `appIDs`: `<TeamID>.<BundleID>`
*   `paths`: Which paths should open the app. `"*"` for everything, `"NOT /path"` to exclude.

### 3) Handle incoming links in RN

React Navigation handles routing if `linking` is configured. If you need lower‑level access:

```ts
import { Linking } from 'react-native';
useEffect(() => {
  const sub = Linking.addEventListener('url', ({ url }) => {
    // optional custom handling
  });
  return () => sub.remove();
}, []);
```

### Testing (iOS)

*   Install app (release is more representative).
*   On device: tap `https://app.mybank.com/transfer/123`.
*   If it opens Safari instead: verify **AASA** (no redirects, correct `appIDs`, correct bundle ID/team ID), Associated Domains entitlement, and path matches.

***

## 🤖 Android — App Links

### 1) Intent filter for HTTPS routes (AndroidManifest.xml)

```xml
<activity
  android:name=".MainActivity"
  android:autoVerify="true"
  android:exported="true">
  <intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="https"
          android:host="app.mybank.com" />
  </intent-filter>

  <!-- Optional: custom scheme fallback -->
  <intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="mybank" />
  </intent-filter>
</activity>
```

### 2) Host `assetlinks.json`

Serve at `https://app.mybank.com/.well-known/assetlinks.json`:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.mybank.mobile",
      "sha256_cert_fingerprints": [
        "11:22:33:AA:BB:...:FF"  // release certificate fingerprint
      ]
    }
  }
]
```

**Important**:

*   Use the **release** signing cert fingerprint (use `keytool -list -v -keystore ...` or from Play Console).
*   Domain must serve valid **HTTPS**; no redirects.

### 3) Verify on device

```bash
adb shell am start -a android.intent.action.VIEW \
  -d "https://app.mybank.com/transfer/123"
```

If it shows a chooser or opens the browser:

*   Check `assetlinks.json` path, content, and fingerprint.
*   Ensure `android:autoVerify="true"` and device has network to verify.
*   Some OEMs require manual default selection once.

***

## 🧰 Custom URL Scheme (fallback / internal)

**iOS (Info.plist):**

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>mybank</string>
    </array>
  </dict>
</array>
```

**Android (AndroidManifest.xml):**

```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="mybank" />
</intent-filter>
```

**Usage:** `mybank://transfer/123`

***

## 🔐 Security & Compliance (Banking)

*   **Do not** encode sensitive data (tokens, PAN, PII) directly in URLs—they can appear in logs, notifications, referrers.
*   For **login/OTP** deep links, use **short‑lived codes**; exchange server‑side for tokens.
*   Validate **signature**/HMAC in deferred deep links if distributing via marketing.
*   Use **universal/app links** so OS verifies ownership—prevents phishing via custom schemes.
*   Implement **allow‑list** of domains and routes, reject anything else.

***

## 🧭 Handling “open app if installed, else go to store/web”

*   **Universal/App Links** already do app‑if‑installed, else web fallback.
*   If you need **App Store / Play Store fallback**, use a **redirector** service or JS on the fallback page to detect app presence and route accordingly.

***

## 🔄 Deferred Deep Links (after install)

If a user taps a link without the app installed, you may want to open the **intended screen after install**. This typically uses a provider (e.g., **Firebase Dynamic Links**, **Branch.io**, **AppsFlyer**):

*   Create a smart link that opens web → store → app,
*   SDK reads the params on first open and navigates accordingly.

> For interviews, mention “**Firebase Dynamic Links** or **Branch** for deferred deep linking and attribution.”

***

## 🧪 Testing matrix (copy for your QA plan)

*   iOS: iPhone with app installed vs not installed; iOS 14–17; tap from **Notes**, **Mail**, **Safari**.
*   Android: Multiple OEMs; Chrome vs in‑app browsers; installed vs not installed; first open behavior.
*   Confirm **path routing** (`/transfer/:id`, `/otp`, `/profile/:id`) for both platforms.
*   Verify **AASA** and **assetlinks.json** with curl / Chrome “Digital Asset Links” tool.
*   Ensure **fallback** behavior (web/app store) is correct.

***

## Common Pitfalls (and fixes)

*   **AASA/assetlinks served with wrong content‑type** or behind **redirects** → OS cannot verify.
*   **Wrong TeamID/BundleID** in AASA or **wrong certificate fingerprint** in assetlinks → verification fails.
*   Using only **custom schemes** → security risk & poor UX (chooser dialogs).
*   Missing **prefixes** or route **config** in React Navigation linking → link opens app but doesn’t navigate to correct screen.
*   Passing **huge data** in URLs → leaks, crashes; pass IDs and fetch in app.

***

## Short interview soundbite

> Deep links open a specific route in your app. For production, we use **iOS Universal Links** and **Android App Links**, which are verified HTTPS links that open the app directly if installed, falling back to the website otherwise. They’re enabled by entitlements/intent filters and verified via **AASA** (iOS) and **assetlinks.json** (Android). In React Navigation, we define a **linking config** mapping paths to screens. We avoid putting sensitive data in URLs, validate inputs, and use a provider like **Dynamic Links/Branch** for **deferred deep linking**.

  </details>

  <details><summary>22. How do push notifications work (APNs, FCM)?</summary>

Absolutely—let’s keep this **interview‑ready** and **practical** for React Native, with clear flows, payload examples, and gotchas for **APNs (iOS)** and **FCM (Android/iOS)**.

***

## ✅ What are Push Notifications—High Level

A push notification involves four parties:

1.  **Your app on the device** → requests **permission** and obtains a **device token**.
2.  **Platform push service** → **APNs** (Apple) or **FCM** (Google) routes the notification to devices.
3.  **Your app server** (or provider like Firebase/OneSignal/Braze) → sends payloads to APNs/FCM.
4.  **The OS** → displays the notification or wakes the app (limited) to process it.

In **React Native**, most teams use **Firebase Cloud Messaging (FCM)** to unify Android + iOS, but you can also send directly to **APNs** on iOS.

***

## 🛠️ Basic Flows

### iOS (APNs)

1.  App asks for **user permission** (`alert`, `sound`, `badge`).
2.  App registers with **APNs** and receives a **device token** (per app/device/build).
3.  Your server uses **APNs HTTP/2** with your **Auth Key (.p8)** or legacy certificate to send a payload to that token.
4.  APNs delivers to the device; iOS displays or hands to your app depending on state and payload flags.

### Android (FCM)

1.  App gets a **registration token** from **FCM** (no explicit user permission required before Android 13; now Android 13+ requires runtime notification permission).
2.  Your server calls **FCM HTTP v1** API with the token (or a **topic**).
3.  FCM routes and delivers; Android posts the notification or passes data to your app.

### Using FCM on both platforms

*   **iOS**: Your app still registers with APNs, but **Firebase iOS SDK** exchanges the APNs token for an **FCM token**; you send via **FCM** and Google handles the APNs handshake under the hood.
*   **Android**: Native.

> **Why teams like FCM**: one API (HTTP v1) for both platforms, topics, conditions, analytics, and device group messaging.

***

## 🔐 Permissions & Tokens

*   **iOS**: Must request **UNUserNotificationCenter** permissions; user can deny, limit alerts, or allow provisional (quiet) notifications. Token can change—**refresh and update your backend** on every app start.
*   **Android**: Android 13+ requires **`POST_NOTIFICATIONS`** runtime permission. Tokens also rotate—update backend appropriately.

***

## 🔔 Message Types (Important for behavior)

*   **Notification message**: OS displays it automatically; app callback may not run if the app is killed (varies).
*   **Data message**: Delivered to the app’s handler; you’re responsible for showing a local notification if needed.
*   **Silent / Background**:
    *   **iOS**: `content-available: 1` (background refresh). Requires background mode and is throttled; no UI.
    *   **Android**: pure data message handled in the background service.

> Banking apps often use **data messages** + **local notifications** for precise control and to **avoid PII** in the cloud‑visible notification.

***

## 📦 Payload Examples

### APNs (HTTP/2 over TLS, direct to Apple)

**Header:**

*   `apns-topic: <bundle-id>` (or `<bundle-id>.voip` for VoIP)
*   Optional: `apns-push-type: alert|background|voip`
*   `apns-priority: 10` (alert) or `5` (background)

**Body (alert):**

```json
{
  "aps": {
    "alert": { "title": "Payment Received", "body": "₹1,250 from Rohan" },
    "badge": 3,
    "sound": "default"
  },
  "txnId": "abc123",            // custom data (avoid PII)
  "deeplink": "mybank://txn/abc123"
}
```

**Background (silent) push:**

```json
{
  "aps": { "content-available": 1 },
  "refresh": true
}
```

**Curl (example using token auth)**

```bash
curl -v \
  --header "apns-topic: com.mybank.mobile" \
  --header "apns-push-type: alert" \
  --header "authorization: bearer <jwt-from-your-p8-key>" \
  --data '{"aps":{"alert":{"title":"Hello","body":"World"},"sound":"default"}}' \
  https://api.push.apple.com/3/device/<apns-device-token>
```

### FCM (HTTP v1, both Android+iOS)

**Notification message:**

```json
{
  "message": {
    "token": "<fcm-token>",
    "notification": {
      "title": "Payment Received",
      "body": "₹1,250 from Rohan"
    },
    "data": {
      "deeplink": "mybank://txn/abc123",
      "txnId": "abc123"
    },
    "android": {
      "priority": "HIGH",
      "notification": { "channel_id": "payments", "sound": "default" }
    },
    "apns": {
      "headers": { "apns-push-type": "alert", "apns-priority": "10" },
      "payload": { "aps": { "sound": "default", "badge": 3 } }
    }
  }
}
```

**Data-only message (you show local notification)**

```json
{
  "message": {
    "token": "<fcm-token>",
    "data": {
      "type": "PAYMENT",
      "amountMinor": "125000",
      "currency": "INR",
      "deeplink": "mybank://txn/abc123"
    },
    "android": { "priority": "HIGH" },
    "apns": { "headers": { "apns-push-type": "background" }, "payload": { "aps": { "content-available": 1 } } }
  }
}
```

***

## 🧩 React Native Handling (using `@react-native-firebase/messaging`)

**Request permissions (iOS & Android 13+):**

```ts
import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';

export async function requestPushPermission() {
  if (Platform.OS === 'ios') {
    await messaging().requestPermission(); // alerts/sounds/badges (configurable)
  } else if (Platform.OS === 'android' && Platform.Version >= 33) {
    await PermissionsAndroid.request('android.permission.POST_NOTIFICATIONS');
  }
}
```

**Get / refresh FCM token:**

```ts
const fcmToken = await messaging().getToken();
// Send to backend, associate with user/session/device
messaging().onTokenRefresh(token => updateBackend(token));
```

**Foreground message listener:**

```ts
const unsubscribe = messaging().onMessage(async remoteMessage => {
  // Show in-app banner or build a local notification
});
```

**Background/quit state handler (Headless):**

```ts
// index.js (must be top-level)
messaging().setBackgroundMessageHandler(async remoteMessage => {
  // Process data, schedule local notification if needed
});
```

**Navigating from a notification tap:**

*   Use `getInitialNotification()` for cold start.
*   Use `onNotificationOpenedApp` for background → foreground transitions.
*   Map `deeplink` or params to your navigation.

> Always **debounce navigation** to avoid double navigation if both handlers fire.

***

## 📣 iOS Extensions & Rich Notifications

*   **Notification Service Extension (NSE)**: Download media, decrypt payloads, or modify content **before display** (e.g., mask account digits).
*   **Mutable content**: Set `mutable-content: 1` (APNs) to trigger NSE.
*   **Categories & actions**: Define interactive buttons and handle actions in app.

***

## 📊 Delivery, Priority & Throttling

*   **APNs**: `apns-priority: 10` for alert, `5` for background. `content-available` pushes are throttled and not guaranteed if the app is force-quit.
*   **FCM**: `priority: HIGH` for time-sensitive messages. Use **collapse keys** / **notification keys** to avoid spam and save battery.
*   **No delivery guarantees** for background data on iOS; design idempotent sync on app open.

***

## 🔐 Security & Privacy (Banking-grade)

*   **Never put PII or secrets in notification payloads**—they can appear on lock screens and logs. Prefer IDs/tokens and fetch details in-app.
*   **Use short-lived IDs** and server fetch on open.
*   **Encrypt sensitive parts** (if business allows) and decrypt in **Notification Service Extension** (iOS).
*   **Rotate tokens** on logout; **unsubscribe from topics** on logout.
*   **App Attest (iOS)** / **Play Integrity (Android)** for device trust; don’t deliver high-risk content to untrusted devices.
*   Respect **user consent** (GDPR/CPRA), and provide controls to mute topics.

***

## 🧱 Channels (Android) & Interruption Levels (iOS)

*   **Android**: Create **Notification Channels** (e.g., `payments`, `security`) with proper importance. Users control per-channel settings.
*   **iOS**: Set **interruption level** (iOS 15+) responsibly; most banking notifications should be **active** or **time-sensitive** only if justified. Use **relevance score** sparingly.

***

## 🧪 Testing

*   **iOS**: Xcode device logs, `apns-topic` & `apns-push-type` correctness, A/B silent vs alert.
*   **Android**: `adb shell cmd notification` tools; test background/Doze modes; OEM differences.
*   **End-to-end**: Validate tap opens the intended screen (deep link), and that state is correct if the app was killed.

***

## 🧭 Design Choices (What to say in interviews)

*   Use **FCM HTTP v1** for unified send (Android+iOS), but be aware of **APNs semantics** (e.g., `content-available`, `mutable-content`).
*   Prefer **data-only** messages + **local notifications** for precise control and **privacy**.
*   Implement **idempotent processing** (dedupe with `collapse_key`/`apns-id`/your own IDs).
*   Handle **permission prompts** with UX (explain value, maybe “pre‑prompt” screen).
*   Ensure **token lifecycle** (refresh, revoke on logout) and **topic hygiene**.

***

## Quick RN Checklist

*   [ ] Request permissions (iOS & Android 13+).
*   [ ] Obtain and sync **FCM token** to backend; handle refresh.
*   [ ] Foreground, background, and cold start handlers wired.
*   [ ] Local notifications for data messages; channels set up on Android.
*   [ ] Deep links wired (tap → correct screen).
*   [ ] No PII in payloads; NSE used if needed on iOS.
*   [ ] Token unsubscribe on logout; topic manage per user.
*   [ ] Tested on real devices, app killed, low battery, Doze, and poor network.

  </details>

  <details><summary>23. RN accessibility best practices (TalkBack/VoiceOver).</summary>

Absolutely — here is a **clean, interview‑ready**, React Native–focused guide on **Accessibility (A11y)** with **TalkBack (Android)** and **VoiceOver (iOS)** best practices.  
This is practical, easy for developers to apply, and strong enough for senior‑level interviews in banking/FinTech.

***

# ✅ **23. React Native Accessibility Best Practices (TalkBack / VoiceOver)**

Accessibility in RN ensures your app works for users with visual, motor, cognitive, or hearing impairments. Both **TalkBack (Android)** and **VoiceOver (iOS)** rely on the **Accessibility Tree**, which you control via RN props.

***

# 🔹 1) Add correct accessibility labels

Use `accessibilityLabel` to clearly describe the element’s purpose.

```tsx
<TouchableOpacity
  accessibilityLabel="Send money to Rohan"
  onPress={sendMoney}
>
  <Text>Send</Text>
</TouchableOpacity>
```

**Best practices**

*   Don’t repeat visual text if the button already has clear text.
*   Provide context: “₹500 debited on 2 Feb” instead of “Transaction”.

***

# 🔹 2) Mark interactive elements as accessible

```tsx
<TouchableOpacity accessible>
  <Text>Pay Now</Text>
</TouchableOpacity>
```

**When to use `accessible`**

*   Wraps multiple children that should behave like one control (e.g., cards, rows).

Avoid nesting `accessible` elements—it confuses screen readers.

***

# 🔹 3) Use semantic roles (important!)

```tsx
<TouchableOpacity
  accessibilityRole="button"
  accessibilityState={{ disabled: isDisabled }}
>
  <Text>Login</Text>
</TouchableOpacity>
```

**Common roles**

*   `button`
*   `link`
*   `checkbox`
*   `switch`
*   `header`
*   `text`
*   `image`
*   `tab`
*   `menu`
*   `progressbar`

This gives TalkBack/VoiceOver proper meaning without extra words.

***

# 🔹 4) Respect focus order & control focus manually when needed

Focus should move logically from top → bottom.

Use:

### **Auto-focus when screen loads**

```tsx
const ref = useRef<View>(null);

useEffect(() => {
  ref.current?.focus();
}, []);
```

### **Move focus after an action (e.g., form error)**

```tsx
AccessibilityInfo.sendAccessibilityEvent({
  type: 'announcement',
  message: 'Invalid OTP entered'
});
```

This is critical in banking apps (OTP, transaction failures).

***

# 🔹 5) Support Dynamic Type / Font scaling

Never hard‑code `fontSize` without allowing scaling:

```tsx
<Text allowFontScaling adjustsFontSizeToFit numberOfLines={2}>
  Account Balance
</Text>
```

Avoid fixed heights that clip text when enlarged.

***

# 🔹 6) Describe images & icons correctly

### Meaningful image

```tsx
<Image
  accessibilityLabel="Profile photo of Harshal"
  accessible
/>
```

### Decorative image

```tsx
<Image
  accessible={false}
  importantForAccessibility="no"
  accessibilityIgnoresInvertColors
/>
```

**Do not** let decorative icons clutter the accessibility tree.

***

# 🔹 7) Use accessibility hints for interactions

```tsx
<TouchableOpacity
  accessibilityLabel="Account Balance"
  accessibilityHint="Double-tap to view detailed transactions"
>
  <Text>₹45,300</Text>
</TouchableOpacity>
```

Hints tell users what happens next.

***

# 🔹 8) Avoid dynamic content without announcements

When screen content changes automatically (e.g., after API loads):

### Announce updates:

```tsx
AccessibilityInfo.announceForAccessibility('Balance updated');
```

### Mark changing content as “live region”:

```tsx
<Text accessibilityLiveRegion="polite">
  {balance}
</Text>
```

***

# 🔹 9) Ensure Color Contrast (WCAG AA)

*   Text contrast ratio **≥ 4.5:1**
*   Large text ≥ 3:1
*   Avoid color‑only indicators for validation (use icons + text).

For example:
❌ Red text only → “Incorrect PIN”  
✅ Red error icon + text

***

# 🔹 10) Touch target size minimum 44×44 dp

On both platforms:

```tsx
style={{ padding: 12 }} // ~44dp
```

Small buttons = unusable with TalkBack/VoiceOver.

***

# 🔹 11) Avoid hidden, off-screen, or duplicated elements being read

Use:

```tsx
importantForAccessibility="no-hide-descendants"
```

to hide nested elements from the accessibility tree.

Example: When a modal opens, hide background content.

***

# 🔹 12) Make modals & bottom sheets accessible

*   Set initial focus into the modal.
*   Trap focus inside modal.
*   Disable background content:

```tsx
importantForAccessibility="no-hide-descendants"
```

Use libraries like **react-native-modal**, **gorhom/bottom-sheet** (they have built-in accessibility support).

***

# 🔹 13) Test with actual screen readers (critical!)

### iOS (VoiceOver)

*   Settings → Accessibility → VoiceOver → ON

Key gestures:

*   Swipe right/left = move focus
*   Double tap = activate
*   Three-finger swipe = scroll

### Android (TalkBack)

*   Settings → Accessibility → TalkBack
*   Volume key shortcut (press & hold both volume keys)

Also test:

*   Dynamic Type (iOS)
*   Large Font / Display Size (Android)
*   High contrast mode (Android)
*   Screen reader rotor (iOS)

***

# 🔹 14) Avoid passing encrypted or masked content incorrectly

For financial apps:

*   Mask sensitive text **visually AND in accessibility**.

Example: Mask CVV:

```tsx
<Text
  accessibilityLabel="CVV hidden for security"
>
  ***
</Text>
```

Example: Mask account number:

```tsx
accessibilityLabel="Account ending with 1234"
```

Never speak full card numbers or OTP codes.

***

# 🔹 15) Ensure gesture-driven UI is accessible

Custom swipe/drag gestures (like carousels or sliders) must have:

*   Keyboard equivalent actions
*   Accessible buttons (Next / Previous)
*   Described current index: “Slide 2 of 5”

***

# 🎤 **Short Interview Answer**

> In RN, accessibility means making your UI fully usable with TalkBack (Android) and VoiceOver (iOS).  
> Use proper semantic roles (`accessibilityRole`), clear labels, hints, and ensure elements are focusable.  
> Disable decorative elements from the a11y tree, support Dynamic Type, enforce touch target size, and announce dynamic updates.  
> Manage focus when modals/screens open, avoid nested accessible elements, and mask sensitive financial information.  
> Always test on actual devices with TalkBack and VoiceOver enabled.

  </details>

  <details><summary>24. When to use CodePush, and why banking apps may restrict it?</summary>

Here’s a **clean, interview‑ready**, React Native–specific answer explaining **when to use CodePush** and **why banking/financial apps often restrict or forbid it**.  
No search needed because this is conceptual knowledge.

***

# ✅ **24. When to use CodePush, and why banking apps may restrict it?**

## **What is CodePush (Microsoft App Center CodePush)?**

CodePush allows you to **push JavaScript and asset updates over‑the‑air (OTA)** to deployed RN apps **without going through App Store / Play Store review**.

You can update:

*   JS bundles
*   Images/assets
*   Minor UI tweaks
*   Bug fixes  
    BUT **NOT** native code (requires store release).

***

# ✅ **When to use CodePush (valid use cases)**

### **1. Hotfixes for critical bugs**

If you discover a:

*   crash,
*   navigation blocker,
*   payment flow blocker,
*   urgent UI bug

…and you need to fix it within minutes/hours → OTA updates are useful.

### **2. Minor UI changes**

*   Text corrections
*   Styles/layout adjustments
*   Feature flags flip (UI-only)
*   Non‑breaking component fixes

### **3. A/B experiments (non‑native)**

You can roll out **variations** of JS features to a percentage of users.

### **4. Gradual rollouts**

Roll out JS updates to 1% → 5% → 25% → 100% users to prevent wide impact.

### **5. Reduce store review delays**

Great for:

*   Internal tools
*   POCs
*   Apps with simple JS changes
*   Retail/non‑regulated apps

***

# ❌ **When NOT to use CodePush (especially in banking apps)**

Banks, insurance, and fintech companies often **block CodePush entirely** or restrict it severely.

Here’s why:

***

# 🔒 **1. Regulatory Compliance (App Store / Google Play)**

Apple and Google require that apps **shipped via the store reflect the reviewed version**.

*   Frequent OTA updates can be interpreted as **bypassing review**.
*   This violates **App Store Review Guidelines 3.3.2** (no altering features outside what was reviewed).
*   Google Play also restricts OTA updates that alter functionality.

**Financial apps (regulated industry)** must strictly comply.

***

# 🔒 **2. Security & Risk (JS is executable code)**

OTA updates push **new executable logic** without:

*   review,
*   regression testing at scale,
*   security sign‑off.

Risks include:

*   Accidental security regression
*   Fraud attack surface increased
*   Logic changed without audit trail
*   Weakening of control frameworks (SOX, PCI‑DSS, FFIEC)

In banking, **every code change** must be:

*   reviewed,
*   approved,
*   audited,
*   versioned.

OTA breaks this process unless heavily restricted.

***

# 🔒 **3. Code Validation & Integrity**

Banks require:

*   **Reproducible builds**
*   **Checksums**
*   **Immutable releases**
*   **Signed artifacts**

CodePush dynamically downloads JS → changes on device → version mismatch between:

*   Compliance teams
*   QA
*   End users
*   Crash logs

This complicates debugging and violates many governance policies.

***

# 🔒 **4. Risk of introducing native‑JS mismatch**

If you ship new JS that expects a **new native module**, OTA will break production users.

Banks require deterministic behavior across versions.

***

# 🔒 **5. Legal & Audit Requirements**

Banks must maintain:

*   versioned artifacts,
*   traceable deployments,
*   rollback evidence,
*   audit trails for regulations.

CodePush updates are:

*   invisible to App Store,
*   not recorded as store version changes,
*   ambiguous for auditors.

This is often unacceptable.

***

# ⛔ **6. User trust & Detectability**

iOS App Store reviewers can detect apps that mutate their logic post‑review.  
Bank apps risk:

*   **App rejection**
*   **Forced removal**
*   **Compliance escalations**

So many banks either:

*   Disable CodePush,
*   Only allow it for certain low‑risk screens,
*   Only use it internally.

***

# 💡 **7. Performance considerations**

*   Large JS bundles pushed OTA → increased startup time.
*   Poor rollback management can break app start.
*   Updates must be downloaded & verified on launch.

Banks prefer deterministic binary builds.

***

# 🏦 **So, why do banking apps restrict CodePush? (Interview Answer)**

> Banking apps often restrict or prohibit CodePush because it bypasses the official App Store/Play Store review pipeline, which is required for regulatory, security, and audit compliance.  
> OTA updates allow executable JS changes without formal approval, creating risk for fraud, unexpected behavior, and loss of traceability.  
> Banks need deterministic, signed, versioned builds with strict governance, making CodePush risky except for extremely low‑impact, non‑functional updates (if allowed at all).

***

# 🧭 **If banks use CodePush at all, they apply strict rules:**

✔ Only for **cosmetic UI fixes**  
✔ No logic changes affecting:

*   transactions,
*   authentication,
*   encryption,
*   data validation,
*   feature flags related to money movement

✔ Approval through governance  
✔ Strict rollback strategy  
✔ CodePush packages signed & validated  
✔ App Store/Play Store releases still required for functionality changes

***

# 🟢 **Alternative recommended for banking apps**

Use **feature flag services** instead of CodePush:

*   LaunchDarkly
*   ConfigCat
*   Firebase Remote Config

But **keep all logic inside the shipped binary**.

  </details>

</details>

***

### ****

<details>
  <summary>Expo vs React Native CLI (6)</summary>

  <details><summary>25. When to choose Expo Managed vs Bare workflows?</summary>

Here’s a **concise, interview‑ready answer** with clarity and practical guidance:

***

## ✅ **25. When to choose Expo Managed vs Bare Workflows?**

### **Expo Managed Workflow — When to Choose**

Use **Expo Managed** when:

*   You want **fast development**, **zero native code**, and **easy setup**.
*   Your app requirements fit within Expo’s pre‑built capabilities.
*   OTA updates (Expo Updates) are beneficial.
*   You are building **POCs, prototypes**, or **simple–medium complexity apps**.
*   You don’t need custom native modules.
*   You want cross‑platform consistency out of the box.

**Good for:**

*   Banking dashboards
*   Basic authentication flows
*   Card views, charts, forms
*   Apps using standard device APIs (camera, secure storage, biometrics)

***

### **Expo Bare Workflow — When to Choose**

Choose **Bare Workflow** when:

*   You need **full native control** (Android/iOS).
*   The project requires **custom native modules** not supported by Expo.
*   There’s a need to integrate **advanced SDKs** (banking/fintech often needs this).
*   App performance tuning at a native level is required.
*   Deep native security compliance is needed.

**Common banking use cases:**

*   Custom encryption modules (AES hardware-backed keystore)
*   Native security frameworks (e.g., App Attest, SafetyNet)
*   Advanced mobile SDK integrations (Fraud detection, MDM, SSO, biometrics)
*   Heavy background services or native threads
*   Custom UI components (e.g., OTP auto-read on Android)

***

## 🔍 Interview-Friendly Summary

> **Choose Expo Managed** for speed and simplicity when native capabilities are enough.  
> **Choose Expo Bare** when your project needs custom native code, special SDKs, or deeper platform control — common in enterprise banking apps.

***

## 📌 Example Scenario

### **Expo Managed (Ideal)**

A banking client app with:

*   Login, dashboard, transactions list
*   Biometric login (Expo supports it)
*   Secure storage (Expo SecureStore)

```js
import * as LocalAuthentication from 'expo-local-authentication';

const authenticate = async () => {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Login with Face ID",
  });
  console.log(result.success);
};
```

***

### **Bare Workflow (Required)**

You need to integrate a **native fraud‑detection SDK** that Expo doesn’t support.

```java
// Android native module example
public class FraudDetectionModule extends ReactContextBaseJavaModule {
    @Override
    public String getName() {
        return "FraudDetection";
    }

    @ReactMethod
    public void startDetection() {
        FraudSDK.start();
    }
}
```

In JS:

```js
import { NativeModules } from "react-native";

NativeModules.FraudDetection.startDetection();
```

  </details>

  <details><summary>26. Limitations of Expo for banking apps (background tasks, pinning).</summary>

Here’s a **concise, interview‑ready summary** of Expo’s **limitations for banking apps**, especially around **background tasks and certificate pinning** — the two areas banking clients often care about most.

***

## ✅ **26. Limitations of Expo for Banking Apps (Background Tasks, Pinning)**

### **1️⃣ Background Tasks — Limited / Not Full Native Control**

Expo Managed Workflow has major restrictions:

#### **Limitations**

*   ❌ Cannot run **continuous background services** (e.g., fraud monitoring, session heartbeat).
*   ❌ No support for **true background execution** like long‑running tasks.
*   ❌ Background Fetch works only within OS constraints and is **not reliable for mission‑critical flow**.
*   ❌ No ability to write **custom native background code** (unless using Bare Workflow).

**Why it matters for banking apps:**

*   Banking apps often need:
    *   Session monitoring
    *   Silent token refresh
    *   Fraud SDK background signals
    *   Device security checks in background

Expo Managed can’t support these.

#### **Expo Background Fetch Example (Limited)**

```js
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

TaskManager.defineTask("fetch-transactions", async () => {
  console.log("Running background task");
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

await BackgroundFetch.registerTaskAsync("fetch-transactions", {
  minimumInterval: 15 * 60, // OS controlled, not guaranteed
});
```

This is **not** suitable for banking-grade requirements.

***

### **2️⃣ SSL / Certificate Pinning — Not Possible in Managed Workflow**

Expo Managed:

*   ❌ Does **not allow certificate pinning** natively.
*   ❌ You cannot modify the native networking stack (OkHttp for Android / NSURLSession for iOS).
*   ❌ No native libraries like `react-native-pinch` can be added.

**Why it matters:**
Banking apps must prevent:

*   MITM attacks
*   Proxy-based interception
*   Traffic tampering

This requires deep native networking control → **Bare Workflow only**.

#### **What it looks like (Bare Workflow Example using react-native-pinch)**

```js
import { usePinned } from "@react-native-pinch/pinch";

const response = await fetch("https://bank-api.com", {
  method: "GET",
  sslPinning: {
    certs: ["bank_cert"],
  },
});
```

This **cannot** be done in Expo Managed because it requires custom native installation.

***

## 🧩 Other Expo Limitations Important for Banking Clients

Below are quick bullets useful in interviews:

### **Security Restrictions**

*   ❌ No ability to integrate advanced native security frameworks
    *   Android SafetyNet / Play Integrity API
    *   iOS DeviceCheck / App Attest
    *   Runtime integrity checks
*   ❌ No full root/jailbreak detection libraries (e.g., `react-native-jailbreak`)
*   ❌ No native code obfuscation tools

### **SDK Limitations**

*   ❌ Cannot integrate 3rd‑party native SDKs often used in banking:
    *   Fraud detection
    *   Device fingerprinting
    *   Secure OTP frameworks
    *   CRM / Analytics native SDKs

### **Performance / Architecture**

*   🚫 JS-only architecture limits ability to optimize critical paths.
*   🚫 Cannot create custom native UI components (important for secure PIN pads).

***

## 🟦 **Quick Interview Summary**

> **Expo Managed** is not ideal for banking apps due to limitations in background tasks, certificate pinning, security SDKs, and custom native code.  
> **Bare Workflow** is required for enterprise security and compliance.

  </details>

  <details><summary>27. How to migrate from Expo Managed to Bare?</summary>

Here’s a **clear, concise, interview‑ready answer** explaining **how to migrate from Expo Managed to Bare**, with the steps developers actually follow in real projects.

***

# ✅ **27. How to migrate from Expo Managed to Bare?**

Migrating from **Expo Managed** → **Expo Bare Workflow** is straightforward because Expo provides tooling for it.  
Bare Workflow gives you full access to **native iOS/Android code**, needed for banking apps requiring **security, device checks, SSL pinning, custom SDKs**, etc.

***

# ✅ **Step-by-Step Migration Process**

### **1️⃣ Run the eject command**

This converts your Managed project into a full native (Android + iOS) project.

```sh
expo prebuild
```

or the older command:

```sh
expo eject
```

This does three things:

*   Creates **android/** and **ios/** native directories.
*   Generates native code for required Expo modules.
*   Updates `app.json` → `expo-build-properties` configuration.

***

### **2️⃣ Install native dependencies needed for Bare**

After ejecting, you must install packages the native apps rely on:

```sh
npm install
npx pod-install
```

This generates:

*   `ios/Pods`
*   Xcode workspace
*   Updated Android Gradle files

***

### **3️⃣ Update native configuration**

Now you can modify:

*   `android/app/build.gradle`
*   `android/app/src/main/java/...`
*   `ios/YourApp/AppDelegate.m`
*   `ios/YourApp/Info.plist`

Common banking additions:

*   SSL pinning modules
*   Native security SDKs
*   Device root/jailbreak detection modules

***

### **4️⃣ Remove unsupported Expo modules (if any)**

Some Managed-only libraries don’t work in Bare.

If you see warnings like:

❌ `"expo-dev-client is required"`  
❌ `"This module is not compatible with Bare workflow"`

Remove or replace with:

*   Community libraries
*   Custom native code

***

### **5️⃣ Add any custom native modules you need**

Example: adding SSL pinning library in Android:

`android/app/build.gradle`

```gradle
dependencies {
    implementation project(':react-native-pinch')
}
```

iOS:

```ruby
pod 'react-native-pinch', :path => '../node_modules/react-native-pinch'
```

***

### **6️⃣ Build the native apps manually**

Now you build like a typical React Native app.

**iOS build:**

```sh
cd ios
pod install
xed .
```

Then build via Xcode.

**Android build:**

```sh
cd android
./gradlew assembleRelease
```

***

### **7️⃣ Run the app**

```sh
npx react-native run-android
npx react-native run-ios
```

Expo Go will **no longer** work—now you use a **custom dev client** or device simulators.

***

# 🧩 **Common Issues During Migration**

| Issue                               | Solution                                   |
| ----------------------------------- | ------------------------------------------ |
| Missing Pods                        | Run `npx pod-install`                      |
| Expo modules crash in Bare          | Add `"expo-dev-client"`                    |
| Build fails after adding native SDK | Update Gradle / Xcode build settings       |
| App icons/splash not applied        | Move config from `app.json` → native files |

***

# 🟦 **Interview-Ready Summary**

> To migrate from Expo Managed to Bare, run `expo prebuild`, which generates native Android/iOS folders. Then install pods, fix incompatible libraries, configure native build files, integrate native SDKs you need, and run the app using regular React Native tooling instead of Expo Go. This is required whenever your app needs deeper platform access — like SSL pinning, advanced security, or custom native modules.

  </details>

  <details><summary>28. What are Expo config plugins?</summary>

Here’s a **clean, short, interview‑friendly** explanation of **Expo Config Plugins**, with examples so developers can easily understand.

***

# ✅ **28. What are Expo Config Plugins?**

Expo **Config Plugins** allow you to **customize native iOS/Android code** *without leaving the Expo ecosystem*.  
They run during **`expo prebuild`** to automatically modify native files like:

*   `AndroidManifest.xml`
*   `Info.plist`
*   `build.gradle`
*   `Podfile`
*   AppDelegate / MainActivity

They are essential when using Expo Managed + Native modules together.

***

# 🟦 **Why Do Config Plugins Exist?**

Expo Managed workflow doesn’t expose native folders by default.  
But some libraries **need native configuration**, e.g.:

*   Firebase
*   Permissions
*   SSL pinning
*   Push notifications
*   App security SDKs

Config plugins give you a way to do this *safely* **without manually editing native code**.

***

# 🧩 **Simple Example: Adding a Permission (Android)**

A config plugin modifies native files programmatically:

### **plugin.js**

```js
const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = (config) => {
  return withAndroidManifest(config, (config) => {
    config.modResults.manifest.application[0]["uses-permission"] = [
      { $: { "android:name": "android.permission.CAMERA" } },
    ];
    return config;
  });
};
```

Now when running:

```sh
expo prebuild
```

Expo injects this into the AndroidManifest automatically.

***

# 🟦 **Package.json Integration**

```json
{
  "expo": {
    "plugins": ["./plugin.js"]
  }
}
```

***

# 🟩 **Real Banking Use Cases**

Config plugins are required for banking app scenarios:

### **1. Adding SSL Pinning native libraries**

E.g., adjusting Gradle and Info.plist.

### **2. Integrating Fraud Detection SDKs**

Plugins add required native frameworks.

### **3. Enforcing Device Security Configs**

*   Disable screenshots
*   Enable secure flags
*   Jailbreak/root detection modules

### **4. Custom permissions**

e.g., biometrics, background tasks.

***

# ⭐ Interview‑Ready Summary

> **Expo Config Plugins** let developers modify native iOS/Android project files during the Expo build process. They are needed when using native modules in Expo Managed apps — for permissions, SDK initialization, Gradle/Pod updates, or security configs — without manually editing native code.

  </details>

  <details><summary>29. How Expo Updates differ from CodePush?</summary>

Here’s a **concise, interview‑ready comparison** of **Expo Updates vs CodePush**, specifically from a **React Native Banking App** perspective.

***

# ✅ **29. How Expo Updates differ from CodePush?**

Expo Updates and CodePush both deliver **OTA (over‑the‑air) JS updates**, but they work very differently in terms of architecture, limitations, control, and enterprise suitability.

***

# 🟦 **1. Update Mechanism**

### **Expo Updates**

*   Ships updates through **Expo’s update service**.
*   Updates delivered from **Expo servers** unless you host your own with EAS.
*   Integrated into Expo’s build pipeline.

### **CodePush**

*   Provided by **Microsoft App Center**.
*   Updates come from **your CodePush deployment** (Staging/Production).
*   Works independently of Expo (pure React Native).

***

# 🟦 **2. Support for Native Code Changes**

### **Expo Updates**

❌ **Cannot** update native code or native modules.  
❌ Requires full app store release if native dependencies change.

### **CodePush**

❌ Same limitation: **JS-only updates**.  
✔️ But allows more flexibility in bundling JS and assets.

**Interview Note:**

> Both Expo Updates and CodePush only update JS/Assets — NOT native code.

***

# 🟦 **3. Banking-Specific Restrictions**

### **Expo Updates**

⚠️ Banking clients may reject Expo Updates because:

*   OTA source is external (Expo servers) unless self-hosted.
*   Not as granular in rollback or release channels.
*   Harder to enforce strict deployment governance.

### **CodePush**

✔️ Popular in enterprise/mobile banking apps.  
✔️ Supports strict release workflows:

*   Mandatory updates
*   Rollbacks
*   Staged rollouts
*   Separate Staging/Prod deployments

***

# 🟦 **4. Ease of Use**

### **Expo Updates**

✔️ Very easy, minimal config  
✔️ One-line publishing

```sh
expo publish
```

### **CodePush**

Requires:

*   App Center account
*   Installing SDK
*   Manually linking keys/config
*   Deploy via:

```sh
appcenter codepush release-react -a <appName> -d Production
```

***

# 🟦 **5. Bundle Download Behavior**

### **Expo Updates**

*   Downloads updates **in the background**.
*   Applies **on next app restart**.
*   Supports:
    *   Auto updates
    *   Manual updates
    *   Custom logic via `expo-updates`

### **CodePush**

More **granular control**:

*   Apply immediately
*   Apply on next restart
*   Apply at custom app event
*   Staged rollouts

Example:

```js
codePush.sync({
  installMode: codePush.InstallMode.IMMEDIATE,
});
```

***

# 🟦 **6. Flexibility & Customization**

### **Expo Updates**

*   Limited because it’s tied to the Expo ecosystem.
*   Works best in Managed workflow.
*   Bare workflow also works but requires config plugins.

### **CodePush**

*   Fully compatible with React Native CLI.
*   Better when using custom native modules (common in banking).

***

# 🟦 **7. Security**

### **Expo Updates**

✔️ Supports update signing  
✔️ Can self-host for enterprise  
⚠️ External OTA server used by default  
⚠️ Some banking clients disallow this

### **CodePush**

✔️ Strong enterprise adoption  
✔️ Signed releases  
✔️ Full control over infrastructure  
✔️ Better suited for regulated industries

***

# 🟩 **Quick Summary (Best for Interview)**

| Feature                           | Expo Updates                 | CodePush     |
| --------------------------------- | ---------------------------- | ------------ |
| Ease of setup                     | ⭐⭐⭐⭐⭐                        | ⭐⭐⭐          |
| Control                           | Medium                       | High         |
| Enterprise/BFSI suitability       | Medium                       | High         |
| Works without native code changes | Yes                          | Yes          |
| Requires Expo ecosystem           | Yes                          | No           |
| Rollback / Staged rollout         | Basic                        | Strong       |
| Update server control             | Limited (unless self-hosted) | Full control |

***

# ⭐ **Interview-Ready One-Liner Answer**

> **Expo Updates is simpler and integrated with Expo, but less flexible and not always enterprise-friendly. CodePush offers more deployment control, better governance, and is widely used in enterprise/banking apps, but requires extra setup and works only with React Native CLI/Bare workflow.**

  </details>

  <details><summary>30. EAS Build vs Fastlane — when to prefer each?</summary>

Here’s a **crisp, interview‑ready comparison** of **EAS Build vs Fastlane**, tailored for React Native + Banking/Enterprise scenarios.

***

# ✅ **30. EAS Build vs Fastlane — When to Prefer Each?**

## 🟦 **What is EAS Build?**

EAS Build (Expo Application Services) is a **cloud-based build system** built by Expo.

Best when you want:

*   No local environment setup
*   Consistent cloud builds
*   Automatic provisioning, signing
*   Managed workflow builds
*   OTA updates via Expo ecosystem

***

## 🟥 **What is Fastlane?**

Fastlane is a **local/CI automation toolkit** for iOS/Android that gives **full control** over:

*   Build pipelines
*   Signing
*   Store uploads
*   Screenshots, beta deployments
*   Custom scripts

It’s widely used in enterprise CI/CD like Azure DevOps, Jenkins, GitHub Actions.

***

# 🟦 **When to Prefer EAS Build**

Choose **EAS Build** when:

### **1. Working with Expo Managed workflow**

*   EAS is the only way to build Managed apps (since Expo Go doesn’t build standalone binaries).

### \*\*2. You want **zero native build setup**

*   No need for Xcode, Android Studio, certificates/keystores locally.

### **3. Team looking for simplicity**

*   Consistent cloud environment
*   Easy to onboard new developers

### **4. Cloud signing + managed credentials**

```sh
eas build --platform ios
```

### **5. Using EAS Update**

EAS tightly integrates with Expo Updates for seamless OTA delivery.

***

# 🟥 **When to Prefer Fastlane**

Choose **Fastlane** when:

### **1. Building a banking/enterprise app needing full native control**

Examples:

*   SSL pinning native modules
*   Fraud/Risk SDKs (ThreatMetrix, Appdome, Ravelin, etc.)
*   Advanced device security checks
*   Custom build flavors

### **2. Your builds run in private CI/CD**

*   Azure DevOps
*   Jenkins
*   GitHub Actions
*   GitLab CI

Fastlane fits perfectly into enterprise workflows.

### **3. You need granular store automation**

*   Automated iOS screenshot generation
*   App Store metadata sync
*   Beta uploads to TestFlight
*   Controlled staged rollout
*   Versioning scripts

### **4. Compliance restrictions**

Many banks don't allow code to pass through external cloud builders like EAS.

***

# 🟩 **Short Interview Summary**

> **Use EAS Build** for simplicity, Expo Managed apps, and fast cloud builds.  
> **Use Fastlane** when you need enterprise-level CI/CD control, native customizations, security compliance, and complex build pipelines.

***

# 🧩 **Simple Comparison Table**

| Feature                 | EAS Build             | Fastlane      |
| ----------------------- | --------------------- | ------------- |
| Build Location          | Cloud                 | Local/CI      |
| Setup Difficulty        | Easy                  | Medium/Hard   |
| Works with Expo Managed | ✔️                    | ❌             |
| Native Control          | Limited               | Full          |
| Security/Banking apps   | Medium                | Excellent     |
| Custom Pipelines        | Limited               | Unlimited     |
| Store Automation        | Basic                 | Very advanced |
| OTA Updates             | Built-in (EAS Update) | Not built-in  |
| Dependency on Expo      | Yes                   | No            |

***

# 🟦 **Practical Example**

### **EAS Build command:**

```sh
eas build --platform android
```

### **Fastlane lane example:**

```ruby
lane :playstore_release do
  gradle(task: "assembleRelease")
  upload_to_play_store(track: "production")
end
```

***

# ⭐ Final Interview-Friendly One-Liner

> **EAS Build** is best for Expo workflows and simplicity;  
> **Fastlane** is best for enterprise CI/CD, native flexibility, and compliance-heavy apps like banking.

  </details>

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
