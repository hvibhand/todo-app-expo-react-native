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

  <details><summary>31. When do you create a native module? Explain bridging.</summary>

Here’s a **short, crisp, interview‑ready answer** with clean examples — perfect for React Native banking app interviews.

***

# ✅ **31. When do you create a Native Module? Explain Bridging.**

## 🟦 **When do you create a Native Module?**

You create a **native module** in React Native when:

### **1️⃣ A required feature is NOT available in JavaScript**

*   Certificate pinning (custom native code)
*   Root/Jailbreak detection
*   App Attest / SafetyNet / Play Integrity
*   Device security checks
*   Secure keystore/hardware-backed encryption

### **2️⃣ Third‑party native SDK must be integrated**

*   Banking fraud SDKs (ThreatMetrix, LexisNexis, Appdome)
*   Native analytics SDKs
*   Custom camera/scanner libraries

### **3️⃣ Need to access low-level platform APIs**

*   Foreground/Background services (Android)
*   Keychain/Keystore secure operations
*   Native crypto operations

### **4️⃣ Performance-critical logic is better native**

*   Heavy computation
*   Image/video processing

**Simple Interview Answer:**

> Create a native module when the functionality you need is not available in React Native JS layer, or when you must integrate native SDKs or platform-specific features.

***

# 🟦 **What is Bridging?**

**Bridging** is the mechanism that lets JavaScript call native code (Objective‑C/Swift/Kotlin/Java) and receive results back.

React Native uses a **JS ↔ Native bridge** to communicate between the JavaScript thread and native modules.

**In short:**

> Bridging connects JavaScript code to native platform functionality.

***

# 🟩 **Simple Example — Creating a Native Module**

## **Android (Kotlin)**

### **1. Create Native Module**

```kotlin
class SecurityModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "SecurityModule"

    @ReactMethod
    fun isDeviceRooted(promise: Promise) {
        val rooted = RootChecker.isDeviceRooted()
        promise.resolve(rooted)
    }
}
```

### **2. Register Module**

```kotlin
class SecurityPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext) =
        listOf(SecurityModule(reactContext))

    override fun createViewManagers(reactContext: ReactApplicationContext) =
        emptyList<ReactViewManager>()
}
```

***

## **JavaScript Side**

```js
import { NativeModules } from "react-native";

const { SecurityModule } = NativeModules;

const rooted = await SecurityModule.isDeviceRooted();
console.log("Rooted:", rooted);
```

This is bridging in action.

***

# 🟦 **iOS (Swift) Example — Minimal**

```swift
@objc(SecurityModule)
class SecurityModule: NSObject {
  
  @objc
  func isJailbroken(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
      let jailbroken = JailbreakChecker.isDeviceJailbroken()
      resolve(jailbroken)
  }
}
```

JS calls it the same way.

***

# ⭐ **Interview-Friendly Summary**

> You create a native module when React Native doesn't provide the required functionality — usually for native SDKs, security APIs, hardware-backed encryption, or performance-heavy features.  
> Bridging is the process that allows JavaScript to call native code and receive data back using React Native’s JS–Native communication layer.

  </details>

  <details><summary>32. How does certificate pinning work in RN?</summary>

Here’s a **concise, interview‑ready explanation** of **how certificate pinning works in React Native**, with practical steps and code you can quote.

***

## ✅ 32. How does certificate pinning work in React Native?

### What is certificate pinning?

**Certificate pinning** ensures your app only trusts a server if its TLS certificate (or **public key**) matches a value you’ve pre‑approved (“pinned”).  
This blocks **MITM attacks** even if a device’s trust store is compromised or a malicious proxy is used.

**Two common strategies:**

*   **Certificate pinning**: compare the server’s leaf/intermediate cert to an embedded copy.
*   **Public Key pinning (SPKI)**: compare the SHA‑256 of the certificate’s public key.  
    *Preferred in mobile* because it survives CA re-issuance as long as the key pair doesn’t change.

> **Banking rule of thumb:** Pin **SPKI** (public key) and provide **at least one backup pin** to avoid accidental lockouts during certificate rotations.

***

## RN Workflows: What’s supported?

*   **Expo Managed:** ❌ No direct pinning (you can’t patch `NSURLSession`/`OkHttp`). You must eject to **Bare** or use a custom dev client.
*   **React Native CLI / Expo Bare:** ✅ Full support via native code or libraries (e.g., `@react-native-pinch/pinch`).

***

## Option A — Use a library (simplest)

### Using `@react-native-pinch/pinch` (iOS + Android)

Install (Bare workflow):

```bash
npm install @react-native-pinch/pinch
cd ios && pod install && cd ..
```

**JS usage (axios-like fetch with pinning):**

```js
import { fetch as pinnedFetch } from "@react-native-pinch/pinch";

async function getSecured() {
  const resp = await pinnedFetch("https://api.yourbank.com/v1/health", {
    method: "GET",
    sslPinning: {
      // Cert filenames (without extensions) placed in:
      // iOS: ios/AppName/ (main bundle) or via resources
      // Android: android/app/src/main/res/raw/
      certs: ["yourbank_prod"], // e.g., yourbank_prod.cer
      // or use 'pinnedPublicKeys' (SPKI base64) if supported by your version
    },
    timeoutInterval: 10000,
  });
  const text = await resp.text();
  return text;
}
```

> You ship the **.cer** (DER) in the app bundle; the library compares the TLS chain with the embedded certificate(s). Many teams prefer **SPKI** pins (if your version supports) to survive reissue.

***

## Option B — Native pinning (maximum control)

### Android (OkHttp with CertificatePinner)

Create a custom **OkHttpClient** with pins and use it in your networking layer (for example, in a native module or when customizing RN’s networking).

```kotlin
import okhttp3.CertificatePinner
import okhttp3.OkHttpClient

val pinner = CertificatePinner.Builder()
  // SPKI pins (base64 SHA-256 of the public key). Include backups!
  .add("api.yourbank.com",
      "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
      "sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=")
  .build()

val client = OkHttpClient.Builder()
  .certificatePinner(pinner)
  .build()
```

You can then:

*   Replace the default client used by your networking stack,
*   Or expose a **native module** that uses this client to make calls safely.

### iOS (URLSession with trust evaluation)

Implement a `URLSessionDelegate` to evaluate the server trust and compare **SPKI**:

```swift
import Foundation
import Security

final class PinnedSessionDelegate: NSObject, URLSessionDelegate {
  // Base64(SHA256(SPKI)) pins – include at least one backup
  let pinnedKeys = [
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
    "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB="
  ]

  func urlSession(_ session: URLSession,
                  didReceive challenge: URLAuthenticationChallenge,
                  completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void) {

    guard challenge.protectionSpace.authenticationMethod == NSURLAuthenticationMethodServerTrust,
          let serverTrust = challenge.protectionSpace.serverTrust,
          let serverCert = SecTrustGetCertificateAtIndex(serverTrust, 0) else {
      completionHandler(.cancelAuthenticationChallenge, nil)
      return
    }

    // Extract public key (SPKI)
    guard let serverKey = SecCertificateCopyKey(serverCert),
          let serverKeyData = SecKeyCopyExternalRepresentation(serverKey, nil) as Data? else {
      completionHandler(.cancelAuthenticationChallenge, nil)
      return
    }

    // Compute SHA256 over SPKI SubjectPublicKeyInfo
    let spkiHash = sha256Base64(spkiFromRawKey(serverKeyData)) // implement spki wrapper if needed

    if pinnedKeys.contains(spkiHash) {
      completionHandler(.useCredential, URLCredential(trust: serverTrust))
    } else {
      completionHandler(.cancelAuthenticationChallenge, nil)
    }
  }

  // Implement `spkiFromRawKey` and `sha256Base64` helpers accordingly.
}
```

Create a `URLSession` with this delegate and use it for sensitive calls, exposed via a **native module** to JS.

> Many teams instead embed `.cer` and compare the DER bytes or trust chain; **SPKI** is typically more resilient to cert reissue.

***

## Practical steps to implement pinning (checklist)

1.  **Decide pin type**: Prefer **SPKI** (public key pinning) for longevity; include **2+ pins** (active + backup).
2.  **Extract the pin**:
    *   Get the server’s cert:  
        `openssl s_client -connect api.yourbank.com:443 -servername api.yourbank.com </dev/null 2>/dev/null | openssl x509 -outform der > server.cer`
    *   Compute SPKI hash (one approach):  
        `openssl x509 -in server.cer -inform der -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl base64`
3.  **Add pins** to Android’s `CertificatePinner` and/or iOS trust evaluation—or use a library like `@react-native-pinch/pinch`.
4.  **Handle rotation**: Ship **multiple pins**; plan a rollout window before changing keys.
5.  **Fail closed**: If pin validation fails, **block the connection** and surface a user‑friendly error.
6.  **Test with proxies**: Confirm the app **rejects** traffic via Charles/Fiddler (with their root certificates installed).
7.  **Logging & telemetry**: Log pin failures (non‑sensitive), alert SRE/SecOps.
8.  **CI check**: Add scripts to ensure pins in code match security inventory; rotate ahead of expiry.

***

## Common gotchas (banking interviews love these)

*   **Expo Managed**: Pinning **not supported** without Bare/custom dev client.
*   **Single pin risk**: A single pin can **brick** connectivity during renewals; always add a **backup pin**.
*   **Pin scope**: Pin by **hostname**; wildcards require each host’s pins if keys differ.
*   **Leaf vs intermediate**: Pinning an **intermediate** or **SPKI** provides more stability than leaf cert pinning.
*   **Don’t pin to CA root**: Beats the purpose of pinning.
*   **Handle CDN/multi‑endpoint**: If using CDNs or multiple backends, each endpoint needs correct pins.

***

## Interview‑friendly one‑liner

> In React Native, certificate pinning is implemented in **Bare** apps by validating the server’s cert or public key (prefer **SPKI**) in **native networking (OkHttp/NSURLSession)** or via a library like `@react-native-pinch/pinch`. Always ship **backup pins**, fail closed, and test against interception proxies.

  </details>

  <details><summary>33. How to implement secure biometric authentication (FaceID/TouchID)?</summary>

Here’s a **clean, interview‑ready answer** on secure biometric authentication in React Native, tailored for **banking/financial apps**. Short, crisp, and includes the minimal code required.

***

# ✅ **33. How to implement secure biometric authentication (Face ID / Touch ID)?**

Biometric authentication in React Native is typically done using:

*   **LocalAuthentication / expo-local-authentication** (Expo Managed)
*   **react‑native‑keychain** or **react‑native‑biometrics** (Bare CLI, more secure)

For **banking apps**, the recommended approach is:

### ✔ Biometric + Secure Key Storage

### ✔ Hardware-backed encryption (Keystore / Keychain)

### ✔ No storing PIN/password in JS

***

# 🟦 **Approach 1 — Using `react-native-keychain` (Most secure; industry standard)**

### Why it's secure?

*   Stores secrets in **Secure Enclave (iOS)** and **Android Keystore**
*   Allows **biometric‑protected keys**
*   Prevents JS layer from reading raw PIN/password
*   Supports Face ID, Touch ID, BiometricPrompt

***

## 🔐 **Implementation (Bare Workflow / Banking Ready)**

### **1. Install**

```sh
npm install react-native-keychain
cd ios && pod install
```

***

## **2. Set a Biometric-Protected Credential**

(Used after user logs in normally)

```js
import * as Keychain from "react-native-keychain";

await Keychain.setGenericPassword("username", "session_token", {
  accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY, 
  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
});
```

This stores the token in hardware security + locks access with biometrics.

***

## **3. Authenticate using Biometrics**

```js
const creds = await Keychain.getGenericPassword({
  authenticationPrompt: {
    title: "Authenticate",
    subtitle: "Access your bank account",
    description: "Use Face ID / Touch ID",
  },
});

if (creds) {
  console.log("Authenticated! Token:", creds.password);
}
```

**The token is returned only after successful biometric authentication.**

***

# 🟩 **Approach 2 — Using `react-native-biometrics` (For cryptographic signing)**

Use this when you need **biometric keypairs** for high-security use cases like:

*   Transaction signing
*   Secure nonce verification
*   JWT signing with private key inside Secure Enclave

### Example: Generate a biometric keypair

```js
import ReactNativeBiometrics from 'react-native-biometrics';
const rnBiometrics = new ReactNativeBiometrics();

const { publicKey } = await rnBiometrics.createKeys();
console.log("Public key: ", publicKey);
```

### Sign a payload with biometric prompt:

```js
const { signature } = await rnBiometrics.createSignature({
  promptMessage: "Confirm transaction",
  payload: "transfer_2000_inr",
});
```

Server verifies with the stored public key → ensures **non-repudiation**.

***

# 🟦 **Approach 3 — Using Expo Managed (`expo-local-authentication`)**

Less secure (cannot access Secure Enclave/Keystore directly).

```js
import * as LocalAuthentication from 'expo-local-authentication';

const result = await LocalAuthentication.authenticateAsync({
  promptMessage: "Login with Face ID",
});
```

❌ Cannot store secure tokens in hardware  
❌ Not recommended for **real banking apps**

***

# ⭐ **Important Security Guidelines for Banking**

### ✔ Never store PIN/password in AsyncStorage or JS

### ✔ Store session tokens only in Keychain / Keystore

### ✔ Tie key usage to biometric auth (ACCESS\_CONTROL)

### ✔ Add fallback to device passcode

### ✔ Use biometric cryptographic keys for transaction signing

### ✔ Use native modules for highest security (RN CLI / Bare)

### ✔ Disable screenshots/screen recording on sensitive screens (Android FLAG\_SECURE)

***

# 🟦 **Interview‑Ready Summary**

> Implement secure biometric auth in React Native using **react-native-keychain** or **react-native-biometrics**. These libraries store secrets in **Secure Enclave / Android Keystore** and require **FaceID/TouchID** to unlock them. Expo’s biometrics can authenticate, but cannot store keys securely, so for banking-level security use RN CLI/Bare workflow with hardware-backed key storage and biometric‑protected access control.

  </details>

  <details><summary>34. How do you securely store tokens using Keychain/Keystore?</summary>

Here’s a **clear, interview‑ready**, security‑focused answer explaining how to **securely store tokens** using **Keychain (iOS)** and **Keystore (Android)** in React Native — ideal for **banking/financial apps**.

***

# ✅ **34. How do you securely store tokens using Keychain / Keystore?**

In banking apps, tokens **must not** be stored in:

*   ❌ AsyncStorage
*   ❌ Redux persistence
*   ❌ Filesystem
*   ❌ JS memory (long‑lived)

Instead, tokens must be kept in **hardware‑backed secure storage**:

*   **iOS → Keychain / Secure Enclave**
*   **Android → Keystore (TEE / StrongBox)**

React Native provides secure access using:

*   **`react-native-keychain`** (Best & most common)
*   **`react-native-biometrics`** (for cryptographic signing)

***

# 🟦 **Why Keychain/Keystore?**

Because they provide:

✔ Hardware security (TEE / Secure Enclave)  
✔ Encrypted at rest  
✔ OS‑level access controls  
✔ Optional biometric requirement  
✔ Protected even if device is rooted (to some degree)  
✔ Automatic key lifecycle management

***

# 🟩 **Best Practice Flow (Used in Banking Apps)**

### **1. User logs in with username/password**

→ App receives `access_token` + `refresh_token`.

### **2. Store them securely in Keychain/Keystore**

Using **biometric / device passcode protection** if needed.

### **3. Retrieve on next launch only after user authenticates**

(e.g., Face ID → unlock secure storage).

***

# 🟦 **Implementation Using `react-native-keychain`**

## **1. Install**

```sh
npm install react-native-keychain
cd ios && pod install
```

***

# **2. Store tokens securely**

Use **biometric + hardware‑backed** protection:

```js
import * as Keychain from "react-native-keychain";

await Keychain.setGenericPassword(
  "auth",
  JSON.stringify({
    access: accessToken,
    refresh: refreshToken,
  }),
  {
    accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY, // Require biometrics to unlock
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
    securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE, // Hardware TEE/Enclave required
  }
);
```

### What this does:

*   Stores encrypted data *inside hardware‑backed secure storage*.
*   Data is only returned after **Face ID / Touch ID / Biometrics**.

***

# **3. Retrieve the token**

```js
const creds = await Keychain.getGenericPassword({
  authenticationPrompt: {
    title: "Authenticate to access your account",
  },
});

if (creds) {
  const { access, refresh } = JSON.parse(creds.password);
  console.log("Tokens unlocked:", access);
}
```

If the user fails biometrics → **no tokens are returned**.

***

# **4. Delete token on logout**

```js
await Keychain.resetGenericPassword();
```

***

# 🟩 **Alternative (Stronger) Method — Cryptographic Keys**

Use **`react-native-biometrics`** to generate private keys inside the Secure Enclave/Keystore and **sign tokens** instead of storing them.

### Generate keys:

```js
import ReactNativeBiometrics from "react-native-biometrics";

const rnBiometrics = new ReactNativeBiometrics();

const { publicKey } = await rnBiometrics.createKeys();
console.log("Public Key:", publicKey);
```

### Sign payload with biometric prompt:

```js
const { signature } = await rnBiometrics.createSignature({
  promptMessage: "Authorize transaction",
  payload: "refresh_token_challenge",
});
```

The private key **never leaves** the hardware.

***

# 🛡 **Security Best Practices (Interview Gold)**

Banks expect these answers:

### ✔ Never store tokens in AsyncStorage

### ✔ Store tokens only in Keychain/Keystore (hardware enforcement)

### ✔ Use biometric access control (ACCESS\_CONTROL.BIOMETRY\_ANY)

### ✔ Rotate tokens frequently (short‑lived access tokens)

### ✔ Use refresh tokens with binding (device + user)

### ✔ Clear secure storage on:

*   logout
*   app reinstall
*   device compromise detected

### ✔ Add device security checks

*   Jailbreak/Root detection
*   Emulator detection
*   Debugger attachment detection

***

# ⭐ **Interview‑Ready Summary**

> Tokens must be stored only in **Keychain (iOS)** or **Android Keystore**, which provide hardware‑backed encryption. In React Native, use **react-native-keychain** to store tokens protected by biometrics/device passcode. On retrieval, the OS prompts for FaceID/TouchID and returns the token only after successful authentication. For maximum security, use **react-native-biometrics** to generate Secure Enclave keys and sign tokens instead of storing them.

  </details>

  <details><summary>35. How to handle app links/universal links in Android/iOS?</summary>

Here’s a **short, crisp, interview‑ready explanation** of handling **App Links (Android)** and **Universal Links (iOS)** in React Native — includes code and the exact steps banks expect.

***

# ✅ **35. How to handle App Links / Universal Links in Android & iOS?**

Deep links enable a URL like:

    https://mybank.com/reset-password

to **open the mobile app directly**, not the browser.

In React Native, you handle these links using:

*   **Platform config (App Links on Android, Universal Links on iOS)**
*   **React Native Linking API** to listen for incoming links

***

# 🟦 **ANDROID — App Links (Digital Asset Links)**

## **Step 1: Add Intent Filter in `AndroidManifest.xml`**

```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data
        android:scheme="https"
        android:host="mybank.com"
        android:pathPrefix="/auth" />
</intent-filter>
```

**`android:autoVerify="true"`** enables *verified* app links.

***

## **Step 2: Host Digital Asset Links JSON on your domain**

File must be here:

    https://mybank.com/.well-known/assetlinks.json

Example:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.mybank.app",
    "sha256_cert_fingerprints": [
      "A1:B2:C3:...:ZZ"
    ]
 links automatically open the app.

---

# 🟥 **iOS — Universal Links (Associated Domains)**

## **Step 1: Enable Associated Domains in Xcode**

`Signing & Capabilities → + Capability → Associated Domains`

Add:

```

applinks:mybank.com

```

---

## **Step 2: Host `apple-app-site-association` on domain**

Must be placed at:

```

<https://mybank.com/apple-app-site-association>

````

(no `.json` extension, no redirects)

Example:

```json
{
  "applinks": {
    "apps": [],
    "details": [{
      "appID": "ABCDE12345.com.mybank.app",
      "paths": [ "/auth/*", "/reset/*" ]
    }]
  }
}
````

***

# 🟦 **REACT NATIVE — Handling the link in JS**

Use `Linking` API.

### **On app launch**

```js
import { Linking } from "react-native";

Linking.getInitialURL().then(url => {
  if (url) handleDeepLink(url);
});
```

### **While app is running**

```js
useEffect(() => {
  const sub = Linking.addEventListener("url", ({ url }) => {
    handleDeepLink(url);
  });

  return () => sub.remove();
}, []);
```

### **Handle the URL**

```js
function handleDeepLink(url) {
  const route = url.replace("https://mybank.com/", "");

  if (route.startsWith("reset-password")) {
    navigation.navigate("ResetPasswordScreen");
  }
}
```

***

# 🟩 **Testing App Links (important in interviews!)**

### **Android**

```sh
adb shell am start \
  -a android.intent.action.VIEW \
  -d "https://mybank.com/auth/reset?id=123"
```

### **iOS (simulator)**

```sh
xcrun simctl openurl booted "https://mybank.com/auth/reset?id=123"
```

***

# 🛡 Banking‑Specific Considerations (recommended answers)

✔ Only enable app links on **HTTPS**  
✔ Use **short-lived signed links** for sensitive flows (reset password)  
✔ Expire deep link tokens on server  
✔ Block link reuse (replay attack prevention)  
✔ Avoid passing PII in URL  
✔ Validate token server‑side before navigating

***

# ⭐ **Interview‑Ready Summary**

> Android uses **App Links** with `assetlinks.json`.  
> iOS uses **Universal Links** with `apple-app-site-association`.  
> URLs are handled in React Native using the **Linking API** via `getInitialURL()` and event listeners.  
> Both platforms require hosting a domain file to verify that your domain is linked to your app.

  </details>

  <details><summary>36. How to handle native crashes & symbolication (dSYM/ProGuard)?</summary>

Here’s a **short, interview‑ready**, banking‑grade explanation of **Native Crash Handling & Symbolication** in React Native, covering **iOS (dSYM), Android (ProGuard/R8), and tools like Sentry/Firebase Crashlytics**.

***

# ✅ **36. How to handle native crashes & symbolication (dSYM / ProGuard)?**

In React Native, **JS errors** are easy to debug — but **native crashes** (iOS/Android) require symbolication to convert unreadable crash stacks into meaningful code locations.

Handling native crashes involves:

1.  **Capturing crash reports**
2.  **Uploading app symbols (dSYM for iOS, mapping.txt for Android)**
3.  **Viewing human‑readable crash stack traces**

Most teams use:

*   **Sentry**
*   **Firebase Crashlytics**
*   **Bugsnag**

***

# 🟥 **iOS — Symbolication using dSYM**

iOS native crashes produce stack traces referencing **memory addresses**, not actual code.

### 🎯 To symbolize crashes, you need:

*   **dSYM files** → Debug Symbol files generated by Xcode/EAS/Fastlane
*   Upload these to your crash reporter

### 🔧 1. Generate dSYM (Manual / CI / EAS)

If you build with Xcode:

**Xcode → Build Settings → Debug Information Format → DWARF with dSYM File**

dSYM is created at:

    ~/Library/Developer/Xcode/Archives/<date>/<app>.xcarchive/dSYMs/<app>.dSYM

### 🔧 2. Upload to Crashlytics

If using Firebase:

    upload-symbols -gsp GoogleService-Info.plist \
      -p ios <path-to-dSYM>

### 🔧 3. Upload to Sentry

    sentry-cli upload-dsym <path-to-dSYMs>

### Why banking apps care:

*   Crash symbolication helps track security‑related native code failures
*   iOS banking apps often use **App Attest**, biometrics, keychain, device integrity checks — these run natively → more native crashes

***

# 🟦 **Android — Symbolication using ProGuard / R8**

Android uses:

*   **ProGuard/R8 obfuscation**
*   Obfuscated stack traces → unreadable

Symbolication requires **mapping files**.

### 🔧 1. Enable ProGuard/R8 (default for release):

`android/app/build.gradle`

```gradle
minifyEnabled true
proguardFiles getDefaultProguardFile("proguard-android.txt"),
              "proguard-rules.pro"
```

### 🔧 2. Generate mapping.txt

Created automatically during release builds:

    android/app/build/outputs/mapping/release/mapping.txt

### 🔧 3. Upload to Crashlytics

    firebaseCrashlyticsUploadMappingFileRelease

Or for Sentry:

    sentry-cli upload-proguard --mapping-file mapping.txt

### Native crash logs (NDK)

If your app uses native libraries:

*   Upload **NDK symbols**
*   Crashlytics supports `upload-native-symbols`

***

# 🟩 **React Native Side — Listening for JS Errors**

Use **Error Boundaries** + **global JS handlers**.

### Example:

```js
import { setJSExceptionHandler, setNativeExceptionHandler } from "react-native-exception-handler";

setJSExceptionHandler((error, isFatal) => {
  // log to Sentry
});

setNativeExceptionHandler((errorString) => {
  // fallback reporting
});
```

**BUT** → Native crash symbolication still requires uploading symbols.

***

# 🟦 **Using Sentry (most popular in enterprise)**

### Install

    npm install @sentry/react-native
    npx sentry-wizard -i reactNative

### Symbol uploads happen automatically via:

    sentry-cli upload-dsym
    sentry-cli upload-proguard

Add to CI or EAS Build hooks.

**EAS Build** automatically uploads dSYM unless disabled.

***

# 🛡 Banking‑Specific Best Practices

✔ Always enable obfuscation (R8) for Android to protect code  
✔ Upload symbols **for every build** (CI/CD automated)  
✔ Never expose mapping.txt or dSYM publicly  
✔ Use Sentry/Crashlytics alerts for severe crashes  
✔ Track native module crashes (biometrics, security SDKs)  
✔ Keep symbols for **at least 90 days** for audits  
✔ Redact PII from crash logs (GDPR/PCI compliance)

***

# ⭐ **Interview‑Ready Summary**

> Native crashes in RN require symbolication.  
> On iOS, upload **dSYM** files; on Android, upload **ProGuard/R8 mapping files**. Tools like Sentry or Crashlytics then convert unreadable crash stacks into human‑readable code. Always automate symbol uploads in CI/CD, especially for banking apps where native security modules often trigger crashes.

  </details>

  <details><summary>37. How to expose high-performance functions via JSI?</summary>

Here’s a **short, crisp, interview‑ready** explanation of **JSI (JavaScript Interface)** and how to expose **high‑performance native functions** to React Native using JSI.  
This is the modern replacement for the old React Native Bridge (TurboModules).

***

# ✅ **37. How to expose high‑performance functions via JSI?**

JSI (JavaScript Interface) is the **new low‑level communication layer** in React Native that allows **direct, synchronous** access to native code from JavaScript — without the old async bridge and without JSON serialization.

### Why use JSI?

You use JSI when you need:

*   🚀 **High performance** (C++/native speed)
*   🚀 **Synchronous calls**
*   🚀 **Low‑latency operations**
*   🚀 **Memory‑intensive or CPU‑heavy native logic**

**Perfect for:**

*   Cryptography (AES, RSA, hashing)
*   ML inference
*   Image/video processing
*   Data compression
*   Secure enclave operations
*   Custom native engine integration
*   Banking apps requiring fast **HMAC**, **token signing**, **secure random**, etc.

***

# 🟦 **How JSI differs from the React Native Bridge**

| Old Bridge                 | JSI                              |
| -------------------------- | -------------------------------- |
| Async                      | Sync **&** async                 |
| JSON serialization         | Direct memory access             |
| Queues between JS ↔ Native | Shared C++ runtime               |
| Slow for large data        | Extremely fast                   |
| Not suitable for ML/crypto | Ideal for high‑performance tasks |

**One‑liner:**

> JSI lets JS talk to native code at C++ speed with no bridge overhead.

***

# 🟩 **How to expose high-performance native functions using JSI (Minimal Example)**

Below is the **interview‑ready flow**:

***

## **Step 1 — Create a C++ function (high-performance)**

`native-lib.cpp`

```cpp
#include <jsi/jsi.h>

using namespace facebook;

jsi::Value addNumbers(jsi::Runtime &rt, int a, int b) {
    return jsi::Value(a + b);
}
```

***

## **Step 2 — Expose it as a JSI Host Function**

```cpp
void installJsiBindings(jsi::Runtime &rt) {
    auto addFunc = jsi::Function::createFromHostFunction(
        rt,
        jsi::PropNameID::forAscii(rt, "addNumbers"),
        2,
        jsi::Runtime &rt,
           const jsi::Value &thisVal,
           const jsi::Value *args,
           size_t count -> jsi::Value {

            int a = args[0].asNumber();
            int b = args[1].asNumber();
            
            return jsi::Value(a + b);
        }
    );

    rt.global().setProperty(rt, "addNumbers", std::move(addFunc));
}
```

***

## **Step 3 — Load the JSI bindings in Android**

`MyModulePackage.java`

```java
@Override
public void initialize() {
    super.initialize();
    SoLoader.loadLibrary("mynative");
    MyNativeModule.install(getReactApplicationContext().getJavaScriptContextHolder().get());
}
```

Native C++ installer:

```cpp
void install(long jsContext) {
    auto runtime = reinterpret_cast<jsi::Runtime *>(jsContext);
    installJsiBindings(*runtime);
}
```

***

## **Step 4 — Call directly in JavaScript**

```js
const result = global.addNumbers(5, 7);
console.log(result); // 12
```

➡ No bridge, no async, no JSON.  
➡ Immediate C++ speed.

***

# 🟦 Banking‑Grade Example: HMAC SHA‑256 via JSI

JSI is used heavily in secure banking apps:

*   Token signing
*   HMAC verification
*   Secure random generation
*   Hardware key usage

**C++ (performance-critical):**

```cpp
jsi::Value hmacSha256(jsi::Runtime &rt, std::string key, std::string data) {
  auto hash = compute_hmac_sha256(key, data); // native crypto
  return jsi::String::createFromAscii(rt, hash);
}
```

JS:

```js
const signature = global.hmacSha256(secretKey, payload);
```

Runs **100x faster** than JS or old-bridge solutions.

***

# 🛡 **Why JSI matters for banking apps**

✔ Crypto must run securely + fast  
✔ Data cannot cross the RN bridge in plaintext  
✔ JSI allows secure enclave operations  
✔ Needed for:

*   Device binding
*   JWT signing
*   Authentication challenge flows
*   Fraud detection SDKs
*   Certificate/key operations

***

# ⭐ **Interview‑Ready Summary**

> JSI enables React Native to call native (C++/Java/Swift) code **synchronously at high speed**, bypassing the old bridge. You expose high‑performance functions by registering C++ host functions using JSI and attaching them to the JS runtime. This is ideal for banking needs like cryptography, ML, and hardware‑backed secure operations.

  </details>

  <details><summary>38. What’s Play Integrity / DeviceCheck / App Attest?</summary>

Here’s a **clean, short, interview‑ready explanation** of **Play Integrity, DeviceCheck, and App Attest** — exactly how they relate to **banking‑grade mobile security**.

***

# ✅ **38. What’s Play Integrity / DeviceCheck / App Attest?**

These are **mobile device integrity APIs** provided by Google and Apple.  
Banking/financial apps use them to **verify device trust**, detect tampering, prevent fraud, and tie tokens to a real device.

***

# 🟩 **1. Google Play Integrity API (Android)**

### **What it does**

Play Integrity API helps verify:

*   Whether the app install is **legitimate**
*   Whether the device is **trusted** (not rooted / tampered / emulator)
*   Whether the Play Store environment is intact
*   Whether the app binary has been modified

### **Checks returned (important for interviews)**

*   **App integrity** → Is this your genuine signed APK/AAB?
*   **Device integrity** → Is device rooted, custom ROM, emulator?
*   **Account integrity** → Is the Google account trustworthy?

### **Why banking apps use it**

✔ Prevents fraudsters using rooted devices/emulators  
✔ Prevents cloned or modified apps  
✔ Prevents token replay from untrusted devices  
✔ Ties authentication to validated device signals

### **RN integration**

Requires a **native module** or backend verification (Common path: call backend → backend verifies integrity token).

***

# 🟦 **2. Apple DeviceCheck (iOS)**

### **What it does**

DeviceCheck provides:

*   A way to assign **two bits** of device state (e.g., “isTrustedDevice”, “fraud\_flag”)
*   A token to verify device authenticity
*   Helps track state across reinstallations without storing data on device

### **Common use cases**

*   Mark suspicious devices
*   Block known fraud devices
*   Prevent multiple account abuse
*   Track device lifetime reputation

### **Why banking apps use it**

✔ Detect previously flagged devices  
✔ Prevent reinstall tricks  
✔ Tie user reputation to device hardware

### **RN integration**

Needs a **native module** that calls DeviceCheck framework → sends device token to backend → backend uses Apple API to validate.

***

# 🟧 **3. Apple App Attest (Highest-security API on iOS)**

### **What it does**

App Attest protects your app by generating hardware‑backed keys inside the device’s **Secure Enclave**, ensuring:

*   App binary is untampered
*   App is legitimate, not cloned
*   Requests are signed using device‑bound keys
*   Prevents app re-packaging, injection, or automation attacks

### **Key features**

*   Generates a device‑bound private key
*   Signs requests with Secure Enclave
*   Server verifies signature + attestation

### **Why banking apps use it**

✔ Prevents app cloning / injection  
✔ Protects API endpoints with device‑bound signatures  
✔ Stops session/token replay  
✔ Highest security level for iOS (TEE-backed)

### **RN integration**

Requires a **JSI/native module** because App Attest uses:

*   Secure Enclave APIs
*   Hardware key operations
*   Native attestation flows

***

# 🟦 **Quick Comparison Table**

| Feature                          | Play Integrity (Android) | DeviceCheck (iOS) | App Attest (iOS)               |
| -------------------------------- | ------------------------ | ----------------- | ------------------------------ |
| Detect root/jailbreak            | ✔ Yes                    | ❌ No              | ✔ Indirect (tampering)         |
| Detect tampered APK / cloned app | ✔ Yes                    | ❌ No              | ✔ Yes (strong)                 |
| Device reputation                | ✔ Account & device       | ✔ 2-bit state     | ❌ Not its purpose              |
| Hardware-backed security         | ✔ Strong                 | ✔ Some            | ✔✔✔ Strongest (Secure Enclave) |
| Best for banking                 | ⭐⭐⭐⭐                     | ⭐⭐⭐               | ⭐⭐⭐⭐⭐                          |

***

# ⭐ **Interview‑Ready One-Liner Summary**

> **Play Integrity** verifies the Android device + app authenticity.  
> **DeviceCheck** lets you track device reputation on iOS.  
> **App Attest** provides Secure Enclave–backed attestation to ensure the app isn’t tampered and requests come from a trusted device.  
> Banking apps combine these for fraud prevention, device binding, and anti‑tampering.

  </details>

</details>

***

### **5) Architecture & State Management (12 questions)**

<details>
  <summary>Architecture &amp; State Management (12)</summary>

  <details><summary>39. Compare Redux Toolkit, Zustand, Recoil, MobX for large apps.</summary>

Here’s a **clean, interview‑ready comparison** of **Redux Toolkit, Zustand, Recoil, MobX** with a focus on **large‑scale enterprise/banking apps**, scalability, performance, DX, and architecture.

***

# ✅ **39. Compare Redux Toolkit, Zustand, Recoil, MobX for large apps**

Below is a structured comparison you can give in interviews.

***

# 🟦 **1. Redux Toolkit (RTK)** — *Best for large, enterprise-scale apps*

### ✔ Pros

*   **Predictable state management** (immutable, pure reducers)
*   **Enterprise‑friendly** architecture (actions, slices, middleware)
*   Excellent **tooling** → Redux DevTools, RTK Query
*   Strong **community & maintenance**
*   Great for **team workflows** (clear patterns)
*   Built‑in async handling (`createAsyncThunk`)
*   RTK Query for data fetching, caching, invalidations

### ❌ Cons

*   More boilerplate than others
*   Verbose for small apps
*   Immutability can be slow for very large states (though Immer optimizes)

### 🎯 Suitable for:

*   **Large banking apps**
*   Multi-team projects
*   Strict architecture, auditability, reproducibility
*   Heavy API usage → RTK Query shines

***

# 🟩 **2. Zustand** — *Simple, fast, minimal state management*

### ✔ Pros

*   Extremely **lightweight** (1KB+)
*   **No boilerplate** → pure hooks
*   Uses **mutability with Immer** (optional)
*   Very **fast** due to shallow state listening
*   Perfect for **local/global mixed state**
*   Zero learning curve

### ❌ Cons

*   Not ideal when you need:
    *   strict architecture
    *   audit trails
    *   middleware-heavy flows
    *   time-travel debugging
*   State spreads easily → risk of implicit coupling

### 🎯 Suitable for:

*   Medium apps
*   Localized global state (filters, themes, UI data)
*   Performance-critical modules

### ❌ Not ideal for:

*   **Very large enterprise apps needing strict patterns**

***

# 🟧 **3. Recoil** — *Best for dependency-based state graphs*

### ✔ Pros

*   **Atom/Selector architecture** (reactive graph)
*   Automatic state derivation and memoization
*   Great for complex UI state relationships (e.g., forms, dashboards)
*   Minimal code, great DX

### ❌ Cons

*   Not as widely adopted in industry
*   Less community ecosystem
*   Not ideal for large backend-driven data apps
*   No strong middleware story

### 🎯 Suitable for:

*   Dashboard apps
*   UI-heavy interactions
*   Form-based workflows

### ❌ Not ideal for:

*   **Banking apps with large API integrations**
*   Strict architecture requirements

***

# 🟥 **4. MobX** — *Reactive, powerful, but risky for huge teams*

### ✔ Pros

*   Very **reactive**, minimal code
*   Mutations feel natural (OOP-friendly)
*   Very fast for **complex, nested state**
*   Ideal for computed values and observers

### ❌ Cons

*   Harder to enforce patterns in big teams
*   Debugging is harder (state changes can originate anywhere)
*   Can become “magic” and unpredictable if not controlled
*   Not strongly recommended for long-term maintenance in BFSI

### 🎯 Suitable for:

*   Apps needing reactive programming
*   Smaller teams
*   Heavy observable logic (forms, dashboards)

### ❌ Not ideal for:

*   **Enterprise apps requiring strict state governance**

***

# 🟦 **Comparison Table (Interview Friendly)**

| Feature                 | **Redux Toolkit** | **Zustand** | **Recoil**        | **MobX**               |
| ----------------------- | ----------------- | ----------- | ----------------- | ---------------------- |
| Boilerplate             | Medium            | Low         | Low               | Low                    |
| Performance             | Good              | ⭐ Excellent | Good              | ⭐ Excellent            |
| Scalability             | ⭐⭐⭐⭐⭐             | ⭐⭐⭐         | ⭐⭐⭐               | ⭐⭐                     |
| Team collaboration      | ⭐⭐⭐⭐⭐             | ⭐⭐          | ⭐⭐                | ⭐                      |
| Debugging tools         | ⭐⭐⭐⭐⭐             | ⭐⭐          | ⭐                 | ⭐                      |
| Architecture strictness | High              | Low         | Medium            | Low                    |
| Learning curve          | Medium            | Very Easy   | Easy              | Medium                 |
| Ecosystem               | Huge              | Medium      | Small             | Medium                 |
| Best For                | Enterprise apps   | Medium apps | Complex UI graphs | Reactive UI-heavy apps |

***

# 🟦 **Which one should banks use?**

### ✔ **Redux Toolkit (with RTK Query)** → Best for large-scale banking apps

*   Predictable
*   Auditable
*   Great for multi-team collaboration
*   Strong ecosystem
*   Easy integration with analytics, logs, error boundaries
*   Works perfectly with offline caching, pagination, normalized data

### Zustand may be used for:

*   Local states
*   Feature-level isolated state

But **not** as the main global state engine in enterprise.

### Recoil + MobX:

Good in theory, but **not widely adopted** in highly regulated domains.

***

# ⭐ Interview‑Ready Summary

> For large apps, **Redux Toolkit** is the most scalable, predictable, and enterprise‑ready solution with excellent tooling and RTK Query.  
> **Zustand** is great for lightweight, fast global state but not ideal for strict enterprise patterns.  
> **Recoil** excels at UI-driven dependency graphs, but lacks ecosystem maturity.  
> **MobX** is powerful and reactive, but less predictable and risky for large teams.

  </details>

  <details><summary>40. When to use React Query vs Redux?</summary>

Here’s a **short, interview‑friendly**, and **developer‑clear** answer for:

## **40. When to use React Query vs Redux?**

### ✅ **TL;DR Answer**

Use **React Query** for **server state**.  
Use **Redux** for **client state**.

***

## **When to use React Query**

Use **React Query** when dealing with **remote API data** that needs:

*   Fetching, caching, retrying
*   Background refreshing
*   Pagination / infinite scroll
*   Sync with server
*   Avoiding boilerplate (Redux actions/reducers/thunks)

**Good for:** Banking dashboards, account summaries, transactions list, loan statements — anything coming from server.

### Example (React Query)

```js
const { data, isLoading } = useQuery(['transactions'], fetchTransactions);
```

***

## **When to use Redux**

Use **Redux** when handling **local UI/client-specific state** that multiple screens depend on:

*   Authentication tokens (if not handled by secure storage)
*   Global app configuration
*   Feature flags
*   Complex UI states
*   Workflow states (multi-step forms)
*   State not coming from server

**Good for:** User preferences, app session data, multi-step KYC flow, internal business logic.

### Example (Redux)

```js
const user = useSelector(state => state.user);
dispatch(setTheme('dark'));
```

***

## **Easy Comparison Table**

| Need                | React Query | Redux                             |
| ------------------- | ----------- | --------------------------------- |
| Server data caching | ✅ Best      | ❌ Not built‑in                    |
| Background refresh  | ✅ Yes       | ❌ Manual                          |
| Automatic retries   | ✅ Yes       | ❌ Manual                          |
| Complex UI state    | ❌ Not ideal | ✅ Best                            |
| Global client state | ⚠️ Limited  | ✅ Great                           |
| Boilerplate         | Low         | High (unless using Redux Toolkit) |

***

## **Interview One‑Liner**

> **Use React Query for asynchronous server state and caching. Use Redux for global client state and complex UI workflows not tied to the backend.**

  </details>

  <details><summary>41. How to structure a scalable feature-first RN architecture?</summary>

Below is a **short, clean, interview‑friendly** answer with a practical folder structure and explanation tailored for **React Native + Banking apps + scalability**.

***

# **41. How to structure a scalable feature-first React Native architecture?**

### ✅ **Short Interview Answer**

A **feature‑first architecture** groups files by *feature*, not by file type.  
Each feature (e.g., *Login*, *Profile*, *Transactions*) is self‑contained with its own screens, components, hooks, API, and state.  
This makes the app **scalable, modular, testable, and maintainable**—ideal for large financial apps.

***

# **Recommended Folder Structure**

    src/
      features/
        auth/
          screens/
            LoginScreen.tsx
            RegisterScreen.tsx
          components/
            LoginForm.tsx
          api/
            auth.api.ts
          hooks/
            useLogin.ts
          state/
            authSlice.ts or auth.query.ts (Redux/React Query)
          types/
            auth.types.ts
          index.ts

        transactions/
          screens/
            TransactionsList.tsx
            TransactionDetail.tsx
          components/
            TransactionItem.tsx
          api/
            transactions.api.ts
          hooks/
            useTransactions.ts
          state/
            transactionsSlice.ts / transactions.query.ts
          types/
            transactions.types.ts
          index.ts

      shared/
        components/
        utils/
        hooks/
        constants/
        theme/

      navigation/
      services/
        http/
        storage/
      app.tsx

***

# **Why Feature‑First Works (Interview Points)**

### ✔ **1. Scales easily**

Each feature is isolated, so onboarding new devs is easy.

### ✔ **2. Loose coupling**

Features don’t depend on each other → low risk of regression.

### ✔ **3. High cohesion**

All logic related to a feature is stored together.

### ✔ **4. Perfect for modular banking apps**

Login, KYC, Payments, Transactions, Offers — all in separate modules.

***

# **How a Feature Looks (Example)**

### 🔹 `auth/api/auth.api.ts`

```ts
import { apiClient } from "../../services/http";

export const login = (payload) =>
  apiClient.post("/login", payload);
```

### 🔹 `auth/hooks/useLogin.ts`

```ts
import { useMutation } from "@tanstack/react-query";
import { login } from "../api/auth.api";

export const useLogin = () => {
  return useMutation(login);
};
```

### 🔹 `auth/screens/LoginScreen.tsx`

```tsx
import { useLogin } from "../hooks/useLogin";

export default function LoginScreen() {
  const { mutate, isLoading } = useLogin();

  return (
    <Button
      title="Login"
      onPress={() => mutate({ username: "a", password: "b" })}
      disabled={isLoading}
    />
  );
}
```

***

# **Key Principles (Mention in Interview)**

### 1️⃣ **Feature Isolation**

> Each feature has its own API, state, hooks, components.

### 2️⃣ **Shared Layer for Reusable Logic**

UI components, storage utils, fonts, themes go to `shared/`.

### 3️⃣ **Service Layer for Networking**

No direct API calls inside components.

### 4️⃣ **Scalable State Options**

*   Client state → Redux Toolkit
*   Server state → React Query

### 5️⃣ **Clean Navigation**

Each feature exports its own screens → plugged into root navigator.

***

# **Interview One‑liner**

> “In a scalable feature‑first React Native architecture, every feature is a self‑contained module including screens, API, state, hooks, and UI components. This leads to high cohesion, low coupling, and easy scalability for complex banking apps.”

  </details>

  <details><summary>42. What is a domain layer? Why is it useful?</summary>

Here’s a **short, interview‑friendly**, super clear explanation suited for React Native + banking domain apps.

***

# **42. What is a Domain Layer? Why is it useful?**

## ✅ **Short Interview Answer**

The **Domain Layer** contains the **core business logic** of the app — the rules, policies, and use‑cases that define *how* the system should behave independent of UI, API, or database.  
It makes the app **scalable, testable, and maintainable**, especially in complex banking workflows.

***

# **What is in the Domain Layer?**

Typically includes:

### **1) Use‑cases (business actions)**

Example:

*   “Fetch user balance”
*   “Validate PAN number”
*   “Calculate EMI”
*   “Verify OTP”

### **2) Entities / Models**

Pure business objects — not tied to API response shape.

### **3) Business rules & validations**

All banking rules live here:

*   transaction limits,
*   KYC conditions,
*   interest formulas, etc.

***

# **Why is the Domain Layer Useful?**

## ✔ 1. **Keeps business logic independent**

No UI or networking dependencies → easier changes.

If API changes, domain layer remains same.

## ✔ 2. **Highly testable**

You can unit‑test domain logic without UI or backend.

## ✔ 3. **Perfect for banking apps**

Banking rules change often, but UI shouldn’t break.

Domain isolates the complexity.

## ✔ 4. **Reusability**

Multiple screens can reuse the same use-case (e.g., `calculateEMI()` used in loans & calculators).

## ✔ 5. **Scalable architecture**

Clear boundary:  
UI → Application → Domain → Infrastructure

***

# **Example Folder Structure (Clean Architecture Style)**

    src/
      domain/
        entities/
          Transaction.ts
        useCases/
          CalculateEMI.ts
          FetchAccountBalance.ts
        repositories/
          AccountRepository.ts

***

# **Simple Code Example**

### **Domain Layer → use case**

```ts
// domain/useCases/CalculateEMI.ts

export const calculateEMI = ({ principal, interestRate, tenure }) => {
  const r = interestRate / 12 / 100;
  return (principal * r * Math.pow(1 + r, tenure)) /
         (Math.pow(1 + r, tenure) - 1);
};
```

### **UI Layer → uses the domain logic**

```tsx
import { calculateEMI } from "../../domain/useCases/CalculateEMI";

const emi = calculateEMI({ principal: 500000, interestRate: 8.5, tenure: 60 });
```

***

# **Interview One‑liner**

> “A domain layer holds the core business logic and use‑cases, independent of UI or API. It makes the app clean, testable, and scalable—especially in banking where rules and workflows are complex.”

  </details>

  <details><summary>43. How to handle normalized data & selectors?</summary>

Here’s a **short, interview‑friendly** guide with **code you can reuse**:

***

## **43. How to handle normalized data & selectors?**

### ✅ **Short Interview Answer**

*   **Normalize** relational data (store by `id`, keep arrays of ids).
*   Use **Redux Toolkit `createEntityAdapter`** (or `normalizr`) to manage CRUD and keep state flat.
*   Build **memoized selectors** with **Reselect (`createSelector`)** to derive views efficiently (joins, filters, pagination), avoiding unnecessary re-renders.
*   Keep **feature-scoped selectors**, compose them, and always key selectors by params.

***

## Why normalize?

*   Prevents duplication and inconsistent updates
*   Makes updates O(1) via `id` lookups
*   Enables cheap joins across entities (e.g., transactions → accounts → users)

***

## Recommended approach (Redux Toolkit)

### 1) **Model normalized state with Entity Adapters**

```ts
// features/transactions/state/transactions.slice.ts
import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

type Transaction = {
  id: string;
  accountId: string;
  amount: number;
  currency: 'INR' | 'USD';
  timestamp: string;
  status: 'PENDING' | 'POSTED' | 'FAILED';
};

const transactionsAdapter = createEntityAdapter<Transaction>({
  selectId: (t) => t.id,
  sortComparer: (a, b) => b.timestamp.localeCompare(a.timestamp), // newest first
});

const initialState = transactionsAdapter.getInitialState({
  // feature-specific UI state
  filters: { status: 'ALL' as 'ALL' | Transaction['status'] },
});

export const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    upsertMany: transactionsAdapter.upsertMany,
    upsertOne: transactionsAdapter.upsertOne,
    removeOne: transactionsAdapter.removeOne,
    setStatusFilter(state, action) {
      state.filters.status = action.payload;
    },
  },
});

export const { upsertMany, upsertOne, removeOne, setStatusFilter } = transactionsSlice.actions;
export default transactionsSlice.reducer;

// Export base selectors (unscoped – need to pass feature state)
export const transactionsSelectors = transactionsAdapter.getSelectors();
```

### 2) **Scope selectors per feature and compose**

```ts
// features/transactions/state/transactions.selectors.ts
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../../store';
import { transactionsSelectors } from './transactions.slice';

// Feature scope
const selectTransactionsState = (state: RootState) => state.transactions;

// Entity adapter selectors scoped to this feature
export const selectTransactionById = (state: RootState, id: string) =>
  transactionsSelectors.selectById(selectTransactionsState(state), id);

export const selectAllTransactions = (state: RootState) =>
  transactionsSelectors.selectAll(selectTransactionsState(state));

export const selectTransactionIds = (state: RootState) =>
  transactionsSelectors.selectIds(selectTransactionsState(state));

export const selectStatusFilter = (state: RootState) =>
  selectTransactionsState(state).filters.status;

// Derived selector (memoized)
export const selectFilteredTransactions = createSelector(
  [selectAllTransactions, selectStatusFilter],
  (txns, status) => (status === 'ALL' ? txns : txns.filter(t => t.status === status))
);

// Parameterized selector (key by param)
export const makeSelectTransactionsByAccount = () =>
  createSelector([selectAllTransactions, (_: RootState, accountId: string) => accountId],
    (txns, accountId) => txns.filter(t => t.accountId === accountId)
  );
```

> **Tip:** For parameterized selectors, **create a factory** (`makeSelect...`) so each component gets its own memoized instance.

### 3) **Join across entities with selectors (denormalize at the edge)**

```ts
// features/accounts/state/accounts.slice.ts (similar adapter)
export const selectAccountById = (state: RootState, id: string) =>
  state.accounts.entities[id];

// Join: transaction + account name
export const makeSelectEnrichedTransactionsForAccount = () => {
  const selectTxByAccount = makeSelectTransactionsByAccount();
  return createSelector(
    [selectTxByAccount, (_: RootState, accountId: string) => (state: RootState) => selectAccountById(state, accountId)],
    (txns, getAccountById) =>
      txns.map(t => {
        const account = getAccountById as unknown as (s: RootState) => any; // typed appropriately in real code
        return { ...t, accountName: (account as any)?.name ?? '—' };
      })
  );
};
```

***

## With **React Query** (server state)

*   You generally **don’t need to normalize** React Query caches; it caches per‑query‑key.
*   If the UI needs **cross-entity joins**, pull data via multiple queries and **derive** with `useMemo` or a small **client store** (Redux) for relationships.
*   For large relational UIs (transactions ↔ accounts ↔ payees), consider **hybrid**: React Query for fetching/caching, Redux for normalized cross-entity graph & UI state.

```tsx
const { data: txns = [] } = useQuery(['transactions', accountId], () => fetchTxns(accountId));
const { data: accounts = [] } = useQuery(['accounts'], fetchAccounts);

const enriched = useMemo(() => {
  const byId = new Map(accounts.map(a => [a.id, a]));
  return txns.map(t => ({ ...t, accountName: byId.get(t.accountId)?.name ?? '—' }));
}, [txns, accounts]);
```

***

## Pagination & infinite lists

*   Store **page metadata** separately from entities:

```ts
// in slice
pages: {
  byKey: {
    'acc:123|status:POSTED': { ids: ['t1','t2'], nextCursor: 'abc' }
  }
}
```

*   Selector composes: `ids -> entities` to render.

***

## Optimistic updates (banking-safe pattern)

1.  Update entity adapter (optimistic)
2.  Rollback on error
3.  For React Query, use `onMutate/onError/onSettled` patterns.
4.  Ensure **idempotency keys** server-side for transfers/payments.

***

## Performance tips

*   Prefer **`selectById`** in item rows (stable memoization per `id`).
*   Use **`useSelector` with shallowEqual** for small object selections.
*   **Don’t return new arrays** from selectors unless memoized (`createSelector`).
*   For lists, memoize **`map(id => <Row id={id} />)`** and memoize `Row`.

***

## Anti‑patterns to avoid

*   Storing **nested/duplicated** server payloads directly in state.
*   Building **huge selectors** that recompute every render; always memoize and parameterize.
*   Passing **non‑stable functions/objects** into selectors (breaks memoization).
*   Putting **server state** entirely in Redux if React Query already handles it.

***

## Tiny end‑to‑end example (screen)

```tsx
// features/transactions/screens/TransactionsList.tsx
import React, { useMemo } from 'react';
import { FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import { selectTransactionIds } from '../state/transactions.selectors';
import { TransactionRow } from '../components/TransactionRow';

export default function TransactionsList() {
  const ids = useSelector(selectTransactionIds); // stable from adapter
  const renderItem = useMemo(() => ({ item }: { item: string }) => (
    <TransactionRow id={item} />
  ), []);
  return <FlatList data={ids as string[]} renderItem={renderItem} keyExtractor={(id) => id} />;
}

// components/TransactionRow.tsx
import React from 'react';
import { Text, View } from 'react-native';
import { useSelector, shallowEqual } from 'react-redux';
import { selectTransactionById } from '../state/transactions.selectors';

export const TransactionRow = React.memo(({ id }: { id: string }) => {
  const txn = useSelector((s) => selectTransactionById(s, id), shallowEqual);
  if (!txn) return null;
  return (
    <View><Text>{txn.amount} {txn.currency}</Text></View>
  );
});
```

***

## One‑liner for the interview

> “Normalize entities (flat by id), manage them with `createEntityAdapter`, and expose memoized, parameterized selectors (`createSelector`). Denormalize only at the edge in selectors or `useMemo`. Use React Query for server caching and Redux for normalized client graph and UI state.”

  </details>

  <details><summary>44. How do you design loading/error states elegantly?</summary>

Here’s a **short, clean, interview‑friendly answer** with **examples** (perfect for React Native + banking apps):

***

# **44. How do you design loading/error states elegantly?**

### ✅ **Short Interview Answer**

“Design loading and error states so they are **non-blocking**, **context-aware**, **consistent**, and **accessible**. Use skeleton loaders for large lists, inline spinners for buttons, and provide retry actions for errors. Keep API, UI, and state machine flows predictable and reusable.”

***

# **Key Principles**

## **1. Use Context‑aware Loading States**

Use different loaders depending on the UI:

### ✔ Page-level → Full-screen skeleton or shimmer

### ✔ Component-level → Inline spinner

### ✔ Button-level → Loading inside button

***

### **Example — Button Loading**

```tsx
<Button
  title={isLoading ? "Processing..." : "Pay Now"}
  disabled={isLoading}
  onPress={mutate}
/>
```

***

## **2. Use Skeletons for Data-heavy UI**

Ideal for banking transaction lists, accounts, dashboards.

```tsx
const SkeletonTxn = () => (
  <View style={styles.row}>
    <Skeleton width={200} height={20} />
    <Skeleton width={100} height={20} />
  </View>
);
```

Skeletons reduce layout shift → feels fast.

***

## **3. Provide Meaningful Error States**

Error should explain *what failed* + a *retry* option.

### Example — Inline Error Component

```tsx
const ErrorView = ({ message, onRetry }) => (
  <View>
    <Text>{message}</Text>
    <Button title="Retry" onPress={onRetry} />
  </View>
);
```

***

## **4. Use React Query’s Built‑in States**

React Query simplifies loading/error logic:

```tsx
const { data, isLoading, isError, error, refetch } =
  useQuery(['transactions'], fetchTransactions);

if (isLoading) return <SkeletonTxnList />;
if (isError) return <ErrorView message={error.message} onRetry={refetch} />;

return <TxnList data={data} />;
```

***

## **5. Do Not Block the Entire UI (unless critical)**

Examples of non-blocking loaders:

*   Button loader instead of overlay
*   Inline row-level placeholders
*   "Refreshing…" instead of whole page spinner

Banking UX rule:

> Never block important actions like “logout”, “cancel”, “back”.

***

## **6. Show Toasts for Non-Critical Errors**

Network drop, timeout, etc.:

```tsx
Toast.show({
  type: "error",
  text1: "Unable to fetch transactions",
});
```

For critical errors (KYC fail, payment fail) → dedicated screen.

***

## **7. Use a Consistent State Machine**

Every async flow follows:

    idle → loading → success | error

Easy to test + predictable.

### Example (Zustand/Redux)

```ts
{
  status: "idle" | "loading" | "success" | "error",
  error: null
}
```

***

## **8. Provide Optimistic Feedback**

For smooth UX:

*   Show quick UI updates before server confirms
*   Roll back if fails

Example:

```tsx
mutate(paymentData, {
  onMutate: () => setStatus("processing"),
  onError: () => showErrorToast(),
  onSuccess: () => navigate("Success"),
});
```

***

# **Recommended Patterns (Mention in Interview)**

### ✔ Context-aware loaders

### ✔ Skeletons for large lists

### ✔ Retryable error views

### ✔ Non-blocking spinners

### ✔ Toasts for noncritical errors

### ✔ Predictable API state machines

### ✔ Graceful optimistic updates

***

# **Interview One-Liner**

> “I design loading and error states to be graceful and consistent: skeletons for large content, inline loaders for actions, helpful error messages with retry, and React Query to simplify state. Errors never block UI unnecessarily, and all async flows follow a clean state machine.”

  </details>

  <details><summary>45. Persisting state securely using redux-persist + MMKV.</summary>

Here’s a **short, interview‑ready** answer with **secure, production‑grade code** for React Native banking apps.

***

## **45. Persisting state securely using `redux-persist` + `MMKV`**

### ✅ **Short Interview Answer**

Use **MMKV** (fast, C++ storage) as the Redux Persist storage engine, **encrypt** at-rest data, and **whitelist only non-sensitive slices**. Keep high‑risk secrets (tokens, PIN/OTP) **outside Redux** or encrypt them with a **key from Keychain/Keystore**. Add **migrations**, **transforms**, and a **rehydration gate** for a smooth UX.

***

## Why MMKV?

*   **Very fast** (native, O(1) reads/writes), ideal for large Redux trees.
*   Small footprint; no JS bridge bottlenecks.
*   Works well with background app restarts and cold launches.

***

# 🔧 Setup Steps

### 1) Install deps

```bash
yarn add @reduxjs/toolkit redux-persist react-native-mmkv
# If you plan to encrypt:
yarn add react-native-keychain
# Optional: encryption transform
yarn add redux-persist-transform-encrypt
```

> On RN 0.71+, autolinking handles native linking. If needed, run `pod install` for iOS.

***

### 2) Create an MMKV instance (optionally encrypted)

> **Best practice:** Store the **encryption key** in **iOS Keychain / Android Keystore** (via `react-native-keychain`). Generate once, then reuse.

```ts
// src/storage/mmkv.ts
import { MMKV } from 'react-native-mmkv';
import * as Keychain from 'react-native-keychain';

const SECURE_KEY_NAME = 'mmkv_encryption_key_v1';

async function getOrCreateEncryptionKey() {
  // Try read
  const creds = await Keychain.getGenericPassword({ service: SECURE_KEY_NAME });
  if (creds) return creds.password;

  // Create a random key (32 bytes base64 or hex is fine)
  const key = [...Array(32)].map(() => Math.floor(Math.random() * 256)).join(',');
  await Keychain.setGenericPassword('mmkv', key, { service: SECURE_KEY_NAME, accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED });
  return key;
}

// Lazy singleton so we can await key before store config if needed
let storageInstance: MMKV | null = null;

export async function getMMKV() {
  if (!storageInstance) {
    const encryptionKey = await getOrCreateEncryptionKey(); // comment this line out if you prefer no encryption
    storageInstance = new MMKV({
      id: 'app_storage',
      encryptionKey, // remove if not encrypting
    });
  }
  return storageInstance;
}
```

> If your organization forbids device‑managed secrets for some flows, **don’t persist** those slices at all (see whitelisting).

***

### 3) Create a redux‑persist storage adapter for MMKV

```ts
// src/storage/mmkvPersistStorage.ts
import type { Storage } from 'redux-persist';
import { getMMKV } from './mmkv';

export const createMMKVStorage = (): Storage => ({
  async getItem(key: string) {
    const mmkv = await getMMKV();
    const value = mmkv.getString(key);
    return value ?? null;
  },
  async setItem(key: string, value: string) {
    const mmkv = await getMMKV();
    mmkv.set(key, value);
  },
  async removeItem(key: string) {
    const mmkv = await getMMKV();
    mmkv.delete(key);
  },
});
```

***

### 4) Configure Redux Store with Persist, Migrations, and Transforms

*   **Whitelist** only slices safe to persist.
*   **Blacklist** volatile/sensitive data (tokens, OTP, raw PII).
*   Add **migrations** when schema changes.

```ts
// src/store/index.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer, persistStore, createMigrate } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import { createMMKVStorage } from '../storage/mmkvPersistStorage';

// Slices
import authReducer from '../features/auth/state/auth.slice';
import settingsReducer from '../features/settings/state/settings.slice';
import transactionsReducer from '../features/transactions/state/transactions.slice';

// Optional: encryption transform (if you MUST persist sensitive fields)
import { createTransform } from 'redux-persist';
import createEncryptor from 'redux-persist-transform-encrypt';
import { Platform } from 'react-native';

// Example: strip volatile fields before persist (client-only state)
const stripVolatileTransform = createTransform(
  // inbound: state being persisted
  (inboundState: any, key) => {
    if (key === 'auth') {
      const { session, ...rest } = inboundState;
      // Never persist ephemeral fields like OTP, deviceChallenge, etc.
      const { otp, deviceChallenge, ...sessionSafe } = session ?? {};
      return { ...rest, session: sessionSafe };
    }
    return inboundState;
  },
  // outbound: state being rehydrated
  (outboundState) => outboundState,
  { whitelist: ['auth'] }
);

// Optional encryptor: ONLY if policy allows persisting sensitive data
const encryptor = createEncryptor({
  secretKey: Platform.select({ ios: 'placeholder-ios', android: 'placeholder-android' })!, // You can inject a runtime key (e.g., from Keychain) if needed
  onError: (e) => {
    // Consider logging to an in-house logger; avoid console in prod
  },
});

// Versioned migrations
const migrations = {
  0: (state: any) => state,
  1: (state: any) => {
    // Example migration: rename a field
    if (state?.settings?.themeMode) {
      state.settings.theme = state.settings.themeMode;
      delete state.settings.themeMode;
    }
    return state;
  },
};

const rootReducer = combineReducers({
  auth: authReducer,
  settings: settingsReducer,
  transactions: transactionsReducer,
});

const persistConfig = {
  key: 'root',
  storage: createMMKVStorage(),
  version: 1,
  whitelist: ['settings', 'transactions'], // ⚠️ Avoid persisting `auth` unless encrypted or minimal
  blacklist: ['_ui'], // any UI-only slices
  stateReconciler: autoMergeLevel2, // shallow merge two levels deep
  migrate: createMigrate(migrations, { debug: __DEV__ }),
  transforms: [
    stripVolatileTransform,
    // encryptor, // uncomment only if you must persist sensitive data AND handle runtime secretKey sourcing securely
  ],
  timeout: 10000,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
```

> **Security tip:** For **access tokens/refresh tokens**, prefer **MMKV (separate instance) + Keychain/Keystore** via your own small service (not Redux). If business demands Redux access, **encrypt** and minimize footprint (no refresh token if avoidable).

***

### 5) Gate your app until rehydration (prevent UI flash)

```tsx
// App.tsx
import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store';
import { Splash } from './src/shared/components/Splash';

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<Splash />} persistor={persistor}>
        {/* Your Navigation root */}
      </PersistGate>
    </Provider>
  );
}
```

***

## 🔐 Token Handling Pattern (Recommended)

```ts
// src/services/secureTokens.ts
import { MMKV } from 'react-native-mmkv';
import * as Keychain from 'react-native-keychain';

const TOKEN_STORAGE_ID = 'secure_tokens';

let storage: MMKV | null = null;
async function getStorage() {
  if (!storage) {
    const keyEntry = await Keychain.getGenericPassword({ service: 'tokens_key' });
    let key = keyEntry?.password;
    if (!key) {
      key = String(Date.now()) + Math.random().toString(36).slice(2);
      await Keychain.setGenericPassword('mmkv', key, { service: 'tokens_key' });
    }
    storage = new MMKV({ id: TOKEN_STORAGE_ID, encryptionKey: key });
  }
  return storage!;
}

export async function setAccessToken(token: string) {
  const s = await getStorage();
  s.set('accessToken', token);
}
export async function getAccessToken() {
  const s = await getStorage();
  return s.getString('accessToken') ?? null;
}
export async function clearTokens() {
  const s = await getStorage();
  s.delete('accessToken');
}
```

> Then **wire** your API client (Axios/Fetch) to read token from `secureTokens` during each request (or cache it in memory after first read).

***

## 🧠 What to persist vs not

**Persist (usually safe)**

*   Feature preferences, theme, toggles
*   Normalized cached lists (non-sensitive), pagination cursors
*   Dismissed banners, guides, filters

**Avoid or encrypt**

*   Access/refresh tokens (prefer secure storage service)
*   Sensitive PII (full PAN/Aadhaar, DOB, addresses)
*   OTPs, PINs, device binding secrets
*   Any secrets useful to an attacker offline

***

## 🧪 Testing & Troubleshooting

*   **Cold start test**: kill app, relaunch, assert rehydration guards the UI.
*   **Migration test**: bump `version`, simulate old state, verify transform.
*   **Tamper test**: corrupt a value, ensure app doesn’t crash (wrap selectors).
*   **Logout flow**: `persistor.purge()` + clear secure tokens.

```ts
import { persistor } from '../store';
import { clearTokens } from '../services/secureTokens';

export async function logout() {
  await clearTokens();
  await persistor.purge(); // clears redux-persist storage
}
```

***

## ⚡ Performance Tips

*   Keep persisted state **small**; large trees slow rehydration.
*   Use **entity adapters** to normalize lists; persist **ids + entities**.
*   Use **whitelists** narrowly (opt-in model).
*   Avoid rehydrating huge blobs into initial screens (gate & lazy load).
*   MMKV is synchronous under the hood but this adapter wraps async—still extremely fast vs AsyncStorage.

***

## 🗣️ Interview One‑liner

> “I use redux‑persist with an MMKV storage adapter for fast, reliable persistence. I whitelist only safe slices, encrypt at-rest data via a Keychain/Keystore-managed key, keep tokens in a separate secure service (not Redux), and add migrations, transforms, and a PersistGate to ensure smooth rehydration.”

  </details>

  <details><summary>46. Handling global authentication state across navigation.</summary>

Here’s a **short, interview‑friendly**, production‑ready explanation on:

# **46. Handling global authentication state across navigation**

This is one of the MOST commonly asked banking‑client RN interview questions.  
Below is the **cleanest and safest** pattern—used in enterprise apps.

***

# ✅ **Short Interview Answer**

“I keep authentication state in a global store (Redux/Zustand/Jotai), persist only what is safe, and expose it to navigation through a root `AuthGate`. Navigation tree switches between `AuthStack` and `AppStack` based on `isAuthenticated`. Tokens are stored securely (MMKV + Keychain). Rehydration is gated to prevent UI flash.”

***

# 🔥 **The Standard Architecture (Used by Banks)**

    App.tsx
     └─ AuthProvider / RootStoreProvider
          └─ AuthGate (waits for rehydration + token check)
               ├─ AuthStack  (Login, OTP, Register)
               └─ AppStack   (Home, Transactions, Payments, Profile)

Navigation is **derived** from global auth state — never pushed manually.

***

# 🧩 **Step 1: Global auth state**

Using **Redux Toolkit**:

```ts
// features/auth/state/auth.slice.ts
import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
```

> **Tokens are NOT stored here** → store in **secure storage** (`MMKV + Keychain`).

***

# 🔐 **Step 2: Token service (secure MMKV)**

```ts
import { MMKV } from "react-native-mmkv";

export const tokenStorage = new MMKV({ id: "secure", encryptionKey: "key123" });

export const saveToken = (t: string) => tokenStorage.set("token", t);
export const getToken = () => tokenStorage.getString("token");
export const clearToken = () => tokenStorage.delete("token");
```

***

# 🚪 **Step 3: AuthGate (root switcher)**

This waits until:

1.  redux‑persist rehydrates
2.  secure token loaded
3.  user is confirmed logged in or logged out

```tsx
// app/AuthGate.tsx
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import AuthStack from "./AuthStack";
import AppStack from "./AppStack";
import { getToken } from "../services/secureTokens";

export default function AuthGate() {
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = await getToken();
      // if token exists → validate → dispatch setUser
      setChecking(false);
    };
    bootstrap();
  }, []);

  if (checking) return null; // show splash or loader

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
```

> This prevents the “flash” where app shows logged-out UI before rehydration.

***

# 🧭 **Step 4: Navigation flows**

### **AuthStack**

```tsx
const AuthStack = createNativeStackNavigator();

export function AuthStackNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="OTP" component={OTPScreen} />
    </AuthStack.Navigator>
  );
}
```

### **AppStack**

```tsx
const AppStack = createBottomTabNavigator();

export function AppStackNavigator() {
  return (
    <AppStack.Navigator>
      <AppStack.Screen name="Home" component={HomeScreen} />
      <AppStack.Screen name="Transactions" component={TransactionsScreen} />
    </AppStack.Navigator>
  );
}
```

***

# 🔥 **Step 5: Login flow (global auth update)**

On successful login:

```tsx
const { mutate: login } = useLoginMutation();

login(values, {
  onSuccess: async (resp) => {
    await saveToken(resp.token);
    dispatch(setUser(resp.user));
  },
});
```

***

# 🧹 **Step 6: Logout flow**

```ts
await clearToken();
dispatch(logout());
navigation.reset({ index: 0, routes: [{ name: "Login" }] });
```

***

# ⭐ Best Practices (mention in interview)

### ✔ Use a global store for `isAuthenticated` + user

### ✔ Switch navigation tree based on state (not manual navigate)

### ✔ Store tokens in **secure storage**, not Redux

### ✔ Use an **AuthGate** to prevent flashing incorrect UI

### ✔ Refresh/validate tokens on app start

### ✔ On logout: clear tokens + reset navigation root

### ✔ Never persist sensitive auth slice unless encrypted

***

# 🎯 One‑liner for interviews

> “I handle global auth using a secure token store + Redux auth slice and switch navigation roots using an AuthGate. Navigation always derives from auth state, ensuring no flashes and fully secure transitions.”

  </details>

  <details><summary>47. Implementing feature flags safely.</summary>

Here’s a **short, interview‑ready**, safe, and production‑grade explanation for:

# **47. Implementing Feature Flags Safely (React Native + Banking Apps)**

Feature flags are widely used in financial apps to **gradually roll out risk‑sensitive features** (payments, onboarding, KYCs, offers, UPI features, etc.).  
Below is the cleanest, safest, and most enterprise‑friendly approach.

***

# ✅ **Short Interview Answer**

“I store feature flags on a remote config service, cache them securely (MMKV), expose them via a global feature‑flag context/store, and always design them as *non-breaking*, *server-controlled*, and *fail‑safe*. Flags determine navigation, UI exposure, and API behavior. Critical features always default to OFF if the flag service fails.”

***

# 🧩 **Why Feature Flags in Banking Apps**

*   Risk‑controlled gradual rollout
*   Kill‑switch for faulty features
*   A/B testing without resubmission
*   Instant rollback
*   Region / customer‑segment specific features
*   Hardening regulatory features (KYC v2, UPI flows)

***

# 🔐 **Security + Safety Principles**

You must mention these in interviews:

### ✔ Fail‑safe defaults

If config fails → feature should remain **OFF**.

### ✔ Server‑controlled

Flags should be fetched from backend or remote config, not hardcoded.

### ✔ Immutable behavior

Feature flags must not break core flows like login, payments.

### ✔ Secure caching

Use **MMKV** with optional encryption.

### ✔ Analytics‑driven gating

Capture metrics for on/off performance.

***

# 🔧 Architecture (Simple & Enterprise-safe)

    featureFlags/
      ├── featureFlags.service.ts   (fetch from API)
      ├── featureFlags.store.ts     (Redux/Zustand)
      ├── featureFlags.provider.ts  (context for hooks)
      ├── useFeatureFlag.ts         (single hook)
      └── types.ts

***

# 🛠 Step 1: Fetch flags from API (remote config)

```ts
// featureFlags.service.ts
import { apiClient } from "../services/http";

export async function fetchFeatureFlags() {
  const resp = await apiClient.get("/config/feature-flags");
  return resp.data; // { newKYC: true, instantLoans: false }
}
```

***

# 🧠 Step 2: Store in a global store (Zustand/Redux)

Using Zustand for simplicity:

```ts
// featureFlags.store.ts
import { create } from "zustand";

export const useFeatureFlagsStore = create((set) => ({
  flags: {},
  setFlags: (f) => set({ flags: f }),
}));
```

***

# 🔁 Step 3: Cache flags in secure MMKV

```ts
// featureFlags.cache.ts
import { MMKV } from "react-native-mmkv";

export const flagCache = new MMKV({ id: 'feature_flags' });

export function saveFlags(flags) {
  flagCache.set('flags', JSON.stringify(flags));
}

export function loadFlags() {
  const v = flagCache.getString('flags');
  return v ? JSON.parse(v) : null;
}
```

***

# 🚀 Step 4: Bootstrap on App Launch

```ts
// App.tsx or AppBootstrap.ts
import { fetchFeatureFlags } from "./featureFlags/featureFlags.service";
import { useFeatureFlagsStore } from "./featureFlags/featureFlags.store";
import { saveFlags, loadFlags } from "./featureFlags/featureFlags.cache";

async function initFeatureFlags() {
  const cached = loadFlags();
  if (cached) useFeatureFlagsStore.getState().setFlags(cached);

  try {
    const remote = await fetchFeatureFlags();
    useFeatureFlagsStore.getState().setFlags(remote);
    saveFlags(remote);
  } catch (e) {
    console.log("Flags fetch failed — using cached fallback.");
  }
}
```

***

# 🔍 Step 5: A simple hook to use flags anywhere

```ts
// useFeatureFlag.ts
import { useFeatureFlagsStore } from "./featureFlags.store";

export function useFeatureFlag(key: string) {
  return useFeatureFlagsStore((s) => s.flags[key] === true);
}
```

***

# 🎯 Step 6: Usage in UI

```tsx
const isNewKYCEnabled = useFeatureFlag("newKYC");

return (
  <>
    {isNewKYCEnabled ? <NewKYCFlow /> : <OldKYCFlow />}
  </>
);
```

***

# 🧭 Step 7: Gating Navigation Routes

```tsx
function HomeStack() {
  const enableLoans = useFeatureFlag("instantLoans");

  return (
    <Stack.Navigator>
      <Stack.Screen name="Dashboard" component={Dashboard} />
      {enableLoans && (
        <Stack.Screen name="InstantLoan" component={InstantLoanScreen} />
      )}
    </Stack.Navigator>
  );
}
```

***

# ⚠️ Safety & Compliance (important for banking interviews)

### ✔ Always default to OFF on error

Flags cannot break flows.

### ✔ Log every flag evaluation

Needed for audit trails.

### ✔ Flags should be **boolean** and **immutable**

No runtime extra logic.

### ✔ Sensitive flags (e.g., UPI, payments) → double-check with backend

Never trust only local flags for sensitive transactions.

***

# 🧪 Test Strategy for Feature Flags

### Unit tests:

*   Flags ON → new feature enabled
*   Flags OFF → legacy behavior
*   API fail → cached flags
*   Misconfigured flag → fallback OFF

### Integration tests:

*   Navigation hiding/showing routes
*   API-based gating
*   Kill-switch behavior

***

# 🎤 Interview One‑liner

> “I implement feature flags using a remote-config service, secure caching via MMKV, and a global feature-flag store. Navigation and UI derive from flags, with fail-safe defaults and strict separation for high-risk banking features.”

  </details>

  <details><summary>48. How to enforce separation of concerns for clean architecture?</summary>

Here’s a **short, clean, interview‑friendly** explanation tailored for **React Native + banking apps**, exactly how clean‑architecture separation of concerns should be explained in interviews.

***

# **48. How to enforce separation of concerns for clean architecture?**

### ✅ **Short Interview Answer**

“I enforce separation of concerns by dividing the app into independent layers — **UI**, **State/Presentation**, **Domain (business logic)**, and **Data/Infrastructure** — and ensuring each layer depends *only* on the one below it. Business rules live in the Domain, API/storage in Data, state/logic in Presentation, and UI only renders data. No layer crosses boundaries.”

***

# **The Clean Architecture Layers**

    UI Layer          → Screens, presentational components
    Presentation      → State management, controllers, view models
    Domain Layer      → Business rules, use cases, validation logic  
    Data Layer        → API, storage, repositories  

### **Dependency direction:**

    UI → Presentation → Domain → Data (inverted via interfaces)

***

# **1) UI Layer — No business logic allowed**

*   Only **renders**
*   Uses hooks or ViewModels to *ask for data*
*   No API calls
*   No database/storage access

```tsx
// LoginScreen.tsx
const { login, loading, error } = useLoginViewModel();
```

***

# **2) Presentation Layer — State + workflows**

This includes:

*   Redux / Zustand / Jotai slices
*   Controllers
*   React Query hooks
*   ViewModels

**Responsibilities:**

*   Connect UI ↔ Domain
*   Manage loading/error states
*   Manage screen workflows

```ts
// useLoginViewModel.ts
export function useLoginViewModel() {
  const loginUseCase = useLoginUseCase(); // from domain
  const login = async (payload) => loginUseCase.execute(payload);
  return { login };
}
```

***

# **3) Domain Layer — Pure business logic**

**Golden rule:** Domain must not import React, Axios, Storage, Navigation, or UI.

Contains:

*   Use cases
*   Business rules
*   Calculations (interest, charges, eligibility)
*   Entities/Models

```ts
// domain/useCases/LoginUseCase.ts
export class LoginUseCase {
  constructor(private repo: AuthRepository) {}

  async execute(payload) {
    if (!payload.username) throw new Error("Username required");
    return this.repo.login(payload);
  }
}
```

***

# **4) Data Layer — APIs, storage, encryption**

Implements interfaces that domain uses.

```ts
// data/repositories/AuthRepositoryImpl.ts
export class AuthRepositoryImpl implements AuthRepository {
  async login(payload) {
    return apiClient.post("/auth/login", payload);
  }
}
```

> UI never knows Axios exists.  
> Domain only knows the **interface**, not the implementation.

***

# **How to enforce Separation of Concerns (SoC)**

### **✔ 1. Strict Folder Structure**

    src/
      ui/
      presentation/
      domain/
      data/

Developers visually know where logic should go.

***

### **✔ 2. Use interfaces to invert dependencies**

Domain defines *contracts*, data layer implements them.

```ts
// domain/repositories/AuthRepository.ts
export interface AuthRepository {
  login(payload): Promise<User>;
}
```

This prevents domain → data coupling.

***

### **✔ 3. No business logic inside UI components**

UI = dumb  
Hooks/ViewModels = logic  
Domain = rules  
Data = IO (network, storage)

If UI needs complex logic → move into ViewModel.

***

### **✔ 4. Enforce in PR reviews**

Typical PR comments:

*   “This belongs to domain layer.”
*   “UI should not call API.”
*   “Move business logic out of the component.”

***

### **✔ 5. Ensure domain layer is framework‑agnostic**

Domain must run in:

*   Node
*   React Native
*   Web
*   Tests

No framework imports.

***

### **✔ 6. Unit test Domain layer in isolation**

Domain layer should run without mocking navigation, UI, or network.

***

## 🔥 Real Banking Example (Interviewer loves this)

### *Withdraw money flow:*

1.  **UI**: Show amount input
2.  **Presentation**: Manage form state
3.  **Domain**: Validate limits (e.g., RBI rules, daily limits)
4.  **Data**: API call to withdraw endpoint

If rules change (limit increased), only **Domain** updates — not UI.

***

# **Interview One‑liner**

> “I enforce clean architecture by separating UI, state/presentation, domain business rules, and data layers. Each layer has a single responsibility and strictly controlled dependencies. Domain never depends on UI or network, ensuring maintainability, testability, and safety — crucial for banking apps.”

  </details>

  <details><summary>49. Approaches for multi-brand / white-label apps.</summary>

Here’s a **short, interview‑ready**, and **practical** explanation of:

# **49. Approaches for Multi‑Brand / White‑Label React Native Apps**

White‑labeling means one codebase → multiple branded apps (UI, theme, assets, configs differ).

Below are the **4 safest and most common approaches** used in banking & fintech.

***

# ✅ **1. Build-Time Theming (Most Popular)**

Separate brand assets at **build time** using environment configs.

### **Each brand gets its own:**

*   Colors
*   Fonts
*   Icons/images
*   API endpoints
*   Branding config

### Folder structure:

    branding/
      brandA/
        colors.ts
        images/
        config.json
      brandB/
        colors.ts
        images/
        config.json
    src/
      app/
      features/

### Use a resolver at build time:

```tsx
import brand from "../branding/brandA/config.json";
export default brand;
```

### How you build:

```bash
yarn ios --scheme=BrandA
yarn ios --scheme=BrandB
```

**Good for:**  
Banks, NBFCs, payment apps with strict branding differences.

***

# ✅ **2. Runtime Branding (Dynamic Loading)**

Server returns the brand configuration at startup.

### Example flow:

1.  App boots → fetch brand config based on domain or user org.
2.  Apply theme + images dynamically.
3.  Cache with MMKV.

```tsx
const { theme } = useBrandConfig();  
return <ThemeProvider theme={theme}>...</ThemeProvider>;
```

**Pros:** One binary, dynamic switching  
**Cons:** More runtime complexity

**Best for:**  
Partners, enterprise clients, SaaS fintech dashboards.

***

# ✅ **3. Multi-Entry / Multi-App Setup (Monorepo)**

Use **Nx / Yarn workspaces** to share modules.

    apps/
      brandA-app/
      brandB-app/
    packages/
      shared-ui/
      shared-services/
      shared-domain/

Each brand app:

*   Imports shared modules
*   Overrides branding files
*   Has its own app entry + build scheme

**Good for:**  
Heavy customization between brands (custom screens, flows).

***

# ✅ **4. Plugin-Based Architecture (Modular Feature Flags)**

Brands turn features ON/OFF:

    isUPIEnabled: true
    isCreditCardFlowEnabled: false
    isInsuranceEnabled: true

Use:

*   Feature flags
*   Dynamic navigation
*   Pluggable modules

```tsx
const flags = useFeatureFlags();
if (flags.UPI) stack.add("UPIHome", UPIHome);
```

**Benefits:**  
Very scalable for multiple partners with unique regulatory needs.

***

# 🧱 **What NOT to do**

❌ Copy/paste multiple codebases  
❌ Hardcode brand switches everywhere  
❌ Mix branding logic with business logic  
❌ Put brand config inside Redux (use context or DI instead)

***

# 🔐 Banking‑Safe Considerations

### 1. **Configuration isolation**

Each brand must load only its allowed features.

### 2. **Secure brand API endpoints**

Brand configs must not expose keys or tokens.

### 3. **Brand-specific navigation**

Some clients may disable:

*   UPI
*   KYC v2
*   Loans
*   Cards

### 4. **Per‑brand build signing**

Different:

*   package names
*   app icons
*   certificates
*   deep links

***

# 🪄 Real Example (Enterprise-Grade Approach)

**Hybrid approach:**

*   Build‑time → colors, images, app icon, strings.
*   Runtime → feature flags + partner-specific toggles.
*   Shared → domain logic, components, business workflows.

This is how **HDFC, SBI, ICICI, Paytm white‑label partners** typically do it.

***

# 🎤 Interview One‑Liner

> “I use a feature-based multi-brand architecture where branding comes from build-time configs, runtime flags, or monorepo modularization. The business logic stays shared, branding stays isolated, and each brand gets its own theme, assets, configs, and navigation rules. This keeps the codebase maintainable across multiple white-label apps.”

  </details>

  <details><summary>50. Strategy for refactoring legacy Redux to RTK.</summary>

Here’s a **short, interview‑friendly**, and **practical real‑world strategy** for:

# **50. Strategy for Refactoring Legacy Redux → Redux Toolkit (RTK)**

This is one of the *most common* migration questions.  
Keep the answer structured, safe, and realistic.

***

# ✅ **Short Interview Answer**

“I migrate legacy Redux to RTK incrementally. First replace reducers with `createSlice` and remove switch‑cases. Then migrate thunks to `createAsyncThunk`. After that, simplify store setup using `configureStore`. Finally, remove boilerplate actions/reducers/selectors and adopt RTK Query where appropriate. Migration happens feature‑by‑feature, not all at once.”

***

# 🚀 **Full Step-by-Step Strategy (Used in Real Projects)**

***

# **1. Start Incrementally (Slice-by-Slice)**

You **do NOT rewrite everything**.

Choose 1 small slice → convert → test → move on.

### Legacy reducer:

```js
function authReducer(state = initialState, action) {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return { ...state, user: action.payload };
    default:
      return state;
  }
}
```

### Convert to RTK slice:

```ts
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload;
    }
  }
});
```

This removes switch‑cases, action constants, and reducers → **ultra clean**.

***

# **2. Replace old Thunks with `createAsyncThunk`**

Legacy thunk:

```js
export const login = (payload) => async (dispatch) => {
  dispatch({ type: "LOGIN_REQUEST" });
  try {
    const resp = await api.login(payload);
    dispatch({ type: "LOGIN_SUCCESS", payload: resp });
  } catch (e) {
    dispatch({ type: "LOGIN_FAILURE", error: e });
  }
};
```

RTK version:

```ts
export const login = createAsyncThunk(
  "auth/login",
  async (payload) => await api.login(payload)
);
```

Handle states directly in slice:

```ts
extraReducers: (builder) => {
  builder
    .addCase(login.pending, (state) => { state.loading = true })
    .addCase(login.fulfilled, (state, action) => { 
      state.user = action.payload;
      state.loading = false;
    })
    .addCase(login.rejected, (state) => { state.loading = false });
}
```

***

# **3. Replace manual store configuration**

### Legacy:

```js
const store = createStore(rootReducer, applyMiddleware(thunk));
```

### RTK:

```ts
const store = configureStore({
  reducer: rootReducer
});
```

This gives:

*   DevTools by default
*   Built‑in thunk
*   Good defaults

***

# **4. Adopt Feature‑First Folder Structure**

Restructure file layout to:

    features/
      auth/
        auth.slice.ts
        auth.thunks.ts
        auth.selectors.ts

This supports scalability for large banking apps.

***

# **5. Add Types (TypeScript) Gradually**

RTK works perfectly with TS.

```ts
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

Zero extra boilerplate.

***

# **6. Replace old selectors with memoized selectors (Optional)**

Legacy:

```js
export const getUser = state => state.auth.user;
```

Modern:

```ts
export const selectUser = (state: RootState) => state.auth.user;
```

Or derived selectors with `createSelector`.

***

# **7. Optional Upgrade Step: Introduce RTK Query**

Useful for:

*   Server data
*   API caching
*   Pagination
*   Automatic invalidation

Not required for migration, but ideal for banking dashboards.

***

# **8. Clean Dead Code & Remove Old Redux Boilerplate**

After all slices are migrated:

*   Delete `actionTypes.js`
*   Delete duplicated reducers
*   Remove old middleware logic
*   Remove manual thunk handling

***

# **9. Migrate Critical Features First**

In financial apps:

*   Auth
*   User profile
*   Accounts
*   Transactions

These are simplest and remove the biggest amount of boilerplate.

***

# ⭐ Suggested Migration Order (Interview‑Friendly)

1.  **Configure store with RTK**
2.  **Convert small reducers to slices**
3.  **Convert thunks to `createAsyncThunk`**
4.  **Adopt feature‑based folder structure**
5.  **Add types & selectors**
6.  **Optionally introduce RTK Query**
7.  **Remove old Redux boilerplate**

This sequence ensures **safe**, **non‑breaking**, **incremental** migration.

***

# 🎤 Interview One‑Liner

> “I migrate legacy Redux to RTK gradually: start with configuring store via `configureStore`, then rewrite reducers into `createSlice`, convert thunks into `createAsyncThunk`, reorganize into feature folders, and optionally introduce RTK Query. The migration is incremental, safe, and eliminates 70–80% of boilerplate.”

  </details>

</details>

***

### **6) API Integration, Networking, Security (12 questions)**

<details>
  <summary>API Integration &amp; Networking (12)</summary>

  <details><summary>51. How to design an API layer using Axios/Fetch wrappers?</summary>
Here’s a **short, interview‑friendly** answer with **production‑grade patterns** and **copy‑pasteable code** for React Native banking apps.

***

## **51. How to design an API layer using Axios/Fetch wrappers?**

### ✅ **Short Interview Answer**

“Create a **single HTTP client** (Axios/Fetch wrapper) with **typed methods**, **timeouts**, **retries**, **cancellation**, **auth token injection**, and **consistent error handling**. Keep endpoints in **service modules**, isolate **network concerns** (logging, backoff, headers) in the client, and expose **domain-friendly functions** to the app. Optionally integrate with **React Query** for caching.”

***

## **Goals of a good API layer**

*   **Single source** of HTTP truth (baseURL, timeouts, headers)
*   **Security**: auth token injection, idempotency keys, PII scrubbing
*   **Reliability**: retries with backoff, network timeouts, cancellation
*   **Observability**: structured logging, request IDs, error normalization
*   **DX**: TypeScript types, narrow return shapes, simple function signatures
*   **Extensibility**: middleware/interceptors, plugins (e.g., Sentry)

***

## **Recommended Structure**

    src/
      services/
        http/
          httpClient.ts         // Axios/Fetch wrapper
          interceptors.ts       // req/resp interceptors
          errors.ts             // error normalization
          backoff.ts            // retry strategy
        api/
          auth.api.ts           // feature service (clean functions)
          accounts.api.ts
          transactions.api.ts

***

## **1) Core Axios Client (Typed, Secure, Robust)**

```ts
// services/http/httpClient.ts
import axios, { AxiosError, AxiosInstance } from "axios";
import { getAccessToken } from "../secureTokens";
import { normalizeError, ApiError } from "./errors";
import { withExponentialBackoff } from "./backoff";

export type HttpClient = {
  get<T>(url: string, config?: object): Promise<T>;
  post<T, B = unknown>(url: string, body?: B, config?: object): Promise<T>;
  put<T, B = unknown>(url: string, body?: B, config?: object): Promise<T>;
  patch<T, B = unknown>(url: string, body?: B, config?: object): Promise<T>;
  delete<T>(url: string, config?: object): Promise<T>;
  raw: AxiosInstance;
};

const DEFAULT_TIMEOUT_MS = 15_000;

export function createHttpClient(baseURL: string): HttpClient {
  const instance = axios.create({
    baseURL,
    timeout: DEFAULT_TIMEOUT_MS,
  });

  // Request interceptor: auth, headers, request-id, idempotency key (for POST/transfer)
  instance.interceptors.request.use(async (config) => {
    const token = await getAccessToken(); // secure MMKV + Keychain/Keystore
    if (token) config.headers = { ...config.headers, Authorization: `Bearer ${token}` };

    // Correlation ID
    config.headers = { "x-request-id": makeRequestId(), ...config.headers };

    // Example: idempotency for sensitive POSTs (payments, transfers)
    if (config.method === "post" && isIdempotentEndpoint(config.url)) {
      config.headers["Idempotency-Key"] = config.headers["Idempotency-Key"] ?? makeIdempotencyKey();
    }

    // Prevent caching for GET in some flows
    if (config.method === "get") {
      config.headers["Cache-Control"] = "no-cache";
    }
    return config;
  });

  // Response interceptor: normalize errors, retry on transient failures
  instance.interceptors.response.use(
    (resp) => resp,
    async (error: AxiosError) => {
      const normalized = normalizeError(error);

      // Retry policy: only for safe/retriable conditions
      const retriable = normalized.isNetworkError || [502, 503, 504].includes(normalized.status ?? 0);
      const method = error.config?.method?.toLowerCase();

      if (retriable && (method === "get" || method === "head")) {
        return withExponentialBackoff(() => instance.request(error.config!));
      }

      // Token handling example (optional): if 401, signal auth refresh flow elsewhere
      // if (normalized.status === 401) { emitAuthExpiredEvent(); }

      return Promise.reject(normalized);
    }
  );

  // Narrow typed helpers
  async function wrap<T>(promise: Promise<any>): Promise<T> {
    try {
      const res = await promise;
      return res.data as T;
    } catch (e) {
      throw e as ApiError;
    }
  }

  return {
    get: <T>(url: string, config?: object) => wrap<T>(instance.get(url, config)),
    post: <T, B = unknown>(url: string, body?: B, config?: object) => wrap<T>(instance.post(url, body, config)),
    put:  <T, B = unknown>(url: string, body?: B, config?: object) => wrap<T>(instance.put(url, body, config)),
    patch:<T, B = unknown>(url: string, body?: B, config?: object) => wrap<T>(instance.patch(url, body, config)),
    delete:<T>(url: string, config?: object) => wrap<T>(instance.delete(url, config)),
    raw: instance,
  };
}

// utils
function makeRequestId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
function makeIdempotencyKey() {
  return `idem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function isIdempotentEndpoint(url?: string) {
  return url?.includes("/payments") || url?.includes("/transfers");
}
```

***

## **2) Error Normalization**

```ts
// services/http/errors.ts
import { AxiosError } from "axios";

export type ApiError = Error & {
  status?: number;
  code?: string; // backend/business code
  isNetworkError?: boolean;
  details?: unknown;
  requestId?: string;
};

export function normalizeError(err: unknown): ApiError {
  if ((err as AxiosError).isAxiosError) {
    const e = err as AxiosError<any>;
    const apiErr: ApiError = new Error(extractMessage(e));
    apiErr.status = e.response?.status;
    apiErr.code = e.response?.data?.code ?? e.code;
    apiErr.isNetworkError = !e.response;
    apiErr.details = scrubPII(e.response?.data);
    apiErr.requestId = e.response?.headers?.["x-request-id"];
    return apiErr;
  }
  const apiErr: ApiError = new Error("Unexpected error");
  return apiErr;
}

function extractMessage(e: AxiosError<any>) {
  return e.response?.data?.message || e.message || "Network error";
}

// Ensure logs don’t keep raw PII
function scrubPII(payload: any) {
  if (!payload) return undefined;
  const clone = { ...payload };
  if (clone.pan) clone.pan = mask(clone.pan);
  if (clone.aadhaar) clone.aadhaar = "***masked***";
  return clone;
}
function mask(v: string) {
  return v.replace(/\d(?=\d{4})/g, "*");
}
```

***

## **3) Retry / Backoff Utility**

```ts
// services/http/backoff.ts
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function withExponentialBackoff<T>(
  fn: () => Promise<T>,
  { tries = 3, base = 300, factor = 2, jitter = true } = {}
): Promise<T> {
  let attempt = 0;
  let lastError: any;
  while (attempt < tries) {
    try { return await fn(); } catch (e) {
      lastError = e;
      attempt++;
      if (attempt >= tries) break;
      let wait = base * Math.pow(factor, attempt - 1);
      if (jitter) wait = wait * (0.5 + Math.random());
      await sleep(wait);
    }
  }
  throw lastError;
}
```

***

## **4) Feature Service Modules (Domain‑friendly APIs)**

```ts
// services/api/transactions.api.ts
import { createHttpClient } from "../http/httpClient";

const http = createHttpClient(process.env.API_BASE_URL!);

export type Transaction = {
  id: string;
  accountId: string;
  amount: number;
  currency: "INR" | "USD";
  timestamp: string;
  status: "PENDING" | "POSTED" | "FAILED";
};

// Narrow, typed functions – don’t leak Axios outside
export const TransactionsApi = {
  list: (accountId: string, cursor?: string) =>
    http.get<{ items: Transaction[]; nextCursor?: string }>(
      `/accounts/${accountId}/transactions`,
      { params: { cursor, limit: 50 } }
    ),
  detail: (id: string) => http.get<Transaction>(`/transactions/${id}`),
  // Sensitive: add idempotency automatically via interceptor
  createPayment: (payload: { fromId: string; toId: string; amount: number }) =>
    http.post<{ paymentId: string; status: string }>(`/payments`, payload),
};
```

***

## **5) Cancellation (important for fast navigation / list searches)**

```ts
// Usage example with AbortController
const controller = new AbortController();
http.raw.get("/search", { signal: controller.signal, params: { q } });
// later on unmount or input change:
controller.abort();
```

> With Axios v1+, `signal` supports AbortController natively.

***

## **6) Using with React Query (recommended for server cache)**

```ts
import { useQuery, useMutation } from "@tanstack/react-query";
import { TransactionsApi } from "../services/api/transactions.api";

export function useTransactions(accountId: string) {
  return useQuery({
    queryKey: ["transactions", accountId],
    queryFn: () => TransactionsApi.list(accountId),
    staleTime: 30_000,
  });
}

export function useCreatePayment() {
  return useMutation({
    mutationFn: TransactionsApi.createPayment,
  });
}
```

*   Let **React Query** handle caching, dedupe, background refresh.
*   Keep the **HTTP client** responsible for security/retries/errors.

***

## **7) Production Security Checklist (Banking)**

*   **Auth tokens** from **secure storage** (Keychain/Keystore via MMKV), not Redux.
*   **Idempotency keys** for POST transfers/payments (prevent double-charging).
*   **Request/Correlation IDs** for tracing (backend logs).
*   **PII scrubbing** in logs/analytics.
*   **TLS pinning** if policy requires (e.g., `react-native-ssl-pinning` via a custom fetch; or use a native networking module).
*   **Timeouts & backoff** on all requests.
*   **Least privilege headers**; no secrets in query params.
*   **Environment isolation**: dev/qa/uat/prod base URLs via schemes/flavors.
*   **Input validation** at domain layer before calling API.

***

## **8) Nice-to-haves**

*   **Auto-refresh token** queue (serialize requests while refreshing).
*   **Global offline awareness** (NetInfo) to soft-fail quickly.
*   **Pagination helpers** (cursor-based).
*   **Upload/download helpers** with progress callbacks.
*   **Metrics hooks** (duration, retries, status distribution).

***

## **Interview One‑liner**

> “I wrap Axios in a typed client with interceptors for auth, request IDs, idempotency keys, timeouts and backoff. Errors are normalized centrally. Feature modules expose small typed functions. React Query handles caching, while the client enforces security, reliability, and observability.”

  </details>

  <details><summary>52. Explain OAuth2/OIDC PKCE flow for mobile apps.</summary>

Below is a **short, interview‑friendly**, super clear explanation of the **OAuth2 / OIDC PKCE flow for mobile apps**, specifically tailored for **React Native + Banking** use cases.

***

# **52. Explain OAuth2/OIDC PKCE flow for mobile apps.**

## ✅ **Short Interview Answer**

“PKCE is an extension to OAuth2/OIDC that makes the Authorization Code flow secure for mobile apps. The mobile app generates a random `code_verifier` and a hashed `code_challenge`. It sends the challenge during login. After the user authenticates in the browser, the authorization server returns an authorization code. The app exchanges that code along with the original `code_verifier`. If the two match, it gets tokens (ID token, access token, refresh token). This prevents attackers from stealing the authorization code and using it.”

***

# 🌟 **Why PKCE? (Simple Explanation)**

Mobile apps **cannot store client secrets safely** (APK/IPA can be reverse engineered).

PKCE makes OAuth secure **without a client secret** by adding:

*   **Code Verifier** (random string kept *only* on device)
*   **Code Challenge** (hash of verifier sent to auth server)

So even if someone steals the authorization code, they **cannot** exchange it without the verifier.

***

# 🔐 **OAuth2 + OIDC PKCE Flow (Step-by-Step)**

## **1️⃣ App creates:**

*   `code_verifier` → long random string
*   `code_challenge = SHA256(code_verifier)` (Base64URL-encoded)

```ts
const codeVerifier = generateRandomString();
const codeChallenge = base64UrlEncode(sha256(codeVerifier));
```

***

## **2️⃣ App opens system browser (AppAuth Chrome Custom Tab / SafariViewController)**

Redirect user to:

    https://auth-server.com/authorize?
      response_type=code&
      client_id=mobile-app&
      code_challenge=XYZ123&
      code_challenge_method=S256&
      redirect_uri=myapp://callback

### Why system browser?

*   More secure (cookies isolated, anti‑phishing)
*   Supports SSO

***

## **3️⃣ User logs in on the Authorization Server**

May involve:

*   Username+Password
*   MFA/OTP
*   Aadhaar/PAN verification
*   Biometrics

OIDC adds **ID Token** (JWT with user identity).

***

## **4️⃣ Authorization Server redirects back to the app**

Example:

    myapp://callback?code=AUTH_CODE_ABC

Your deep-link / AppAuth callback receives this.

***

## **5️⃣ App exchanges code + verifier for tokens**

POST:

    grant_type=authorization_code
    code=AUTH_CODE_ABC
    code_verifier=ORIGINAL_VERIFIER
    redirect_uri=myapp://callback

### Server verifies:

`SHA256(code_verifier)` must equal `code_challenge`.

If valid → returns:

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "id_token": "...",
  "expires_in": 3600
}
```

***

## **6️⃣ App stores tokens securely**

❌ Not Redux  
❌ Not AsyncStorage  
✔ **MMKV + device Keychain/Keystore**

***

## **7️⃣ App uses access token in API calls**

```ts
Authorization: Bearer ACCESS_TOKEN
```

***

## **8️⃣ Refresh token flow**

The app silently refreshes tokens:

    grant_type=refresh_token
    refresh_token=....

New tokens → old ones overwritten.

***

# 🔍 **OIDC (OpenID Connect) Extras**

OIDC adds **Identity Layer** on top of OAuth2.

You get:

*   **ID Token** → user identity in JWT
*   **UserInfo endpoint**
*   **Standard claims** (email, name, sub ID, phone)

Very common in banking because identity is critical.

***

# 🏦 **Why PKCE is essential in mobile banking?**

### ✔ Prevents authorization code interception

(e.g., malicious app capturing the redirect code)

### ✔ No need to ship client secret in app

(attackers can reverse engineer the binary)

### ✔ Mandatory for high‑security & regulatory flows

(eKYC, payments, UPI)

### ✔ Works with device SSO

(Okta, Auth0, Azure AD, Keycloak)

***

# 🎯 **Simple Diagram (Interview Friendly)**

    App -----------------> Auth Server
        (code_challenge)

    Browser Login -----> Auth Server
                         |
                         v
    Callback <--------- Auth Server
         (auth_code)

    App -----------------> Auth Server
      (auth_code + code_verifier)

    Tokens <------------- Auth Server

***

# 🧪 Common React Native Libraries

*   **react-native-app-auth** → Best & most secure
*   **@azure/msal-react-native** → Azure AD / B2C
*   **OIDC custom WebView redirect** → ❌ Avoid for banking
*   **OAuth via browser deep-link** → Recommended

***

# 🎤 **Interview One‑liner**

> “PKCE secures the OAuth2 Authorization Code flow for mobile apps by using a code\_verifier + code\_challenge pair. Even if the authorization code is intercepted, attackers cannot exchange it without the verifier. The PKCE flow uses a system browser, returns an auth code, then exchanges it securely for tokens stored in Keychain/Keystore.”

  </details>

  <details><summary>53. How to handle token refresh safely?</summary>

Here’s a **short, interview-ready**, *production-grade* explanation for:

# **53. How to handle token refresh safely? (Mobile + Banking Apps)**

This is one of the most important topics for *secure mobile apps*.  
Your answer must show **security**, **race‑condition safety**, and **correct architecture**.

***

# ✅ **Short Interview Answer**

“I use a secure refresh token flow with an isolated token service. I queue API requests during a refresh, refresh the token only once, retry the original request after success, and log the user out on repeated failures. Tokens are stored in secure storage (Keychain/Keystore via MMKV encrypted). The API client handles refresh internally through Axios interceptors.”

***

# 🔐 **Core Principles for Safe Token Refresh (Banking Grade)**

### ✔ 1. **Never refresh tokens in Redux / UI hooks**

Always refresh in the **API layer**, not in UI code.

### ✔ 2. **Only one refresh at a time**

Prevent multiple refresh calls → avoid token overwrite.

### ✔ 3. **Queue pending requests**

Requests that fail with 401 are queued until refresh completes.

### ✔ 4. **Store tokens securely**

Store using:

*   iOS Keychain
*   Android Keystore
*   Backed by **MMKV encrypted** instance

### ✔ 5. **Detect refresh-token theft / expiry → force logout**

If refresh fails → clear storage and logout safely.

### ✔ 6. **Use an idempotent refresh mechanism**

Refresh request must NOT duplicate user actions.

***

# 🧩 **Standard Architecture**

    httpClient (Axios)
       ├─ Auth Interceptor (attach access token)
       ├─ Response Interceptor (detect 401)
       │       ├─ queue requests
       │       ├─ refresh token (once)
       │       ├─ retry queued requests
       │       └─ logout if refresh fails
    secureTokens.ts (Keychain/MMKV)
    redux authSlice (only stores user profile; not tokens)

***

# 🛠️ **Code: Safe Token Refresh Queue (Axios)**

### **1) Secure Token Storage**

```ts
// secureTokens.ts
import { MMKV } from "react-native-mmkv";

const storage = new MMKV({ id: "secure", encryptionKey: "keyFromKeychain" });

export function getAccessToken() {
  return storage.getString("accessToken") ?? null;
}

export function getRefreshToken() {
  return storage.getString("refreshToken") ?? null;
}

export function saveTokens({ accessToken, refreshToken }) {
  if (accessToken) storage.set("accessToken", accessToken);
  if (refreshToken) storage.set("refreshToken", refreshToken);
}

export function clearTokens() {
  storage.delete("accessToken");
  storage.delete("refreshToken");
}
```

***

### **2) Axios Refresh Logic (One Refresh at a Time)**

```ts
// httpClient.ts
import axios from "axios";
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from "./secureTokens";

let isRefreshing = false;
let requestQueue: { resolve: Function; reject: Function }[] = [];

async function refreshToken() {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error("No refresh token");

  const resp = await axios.post("/auth/refresh", { refreshToken: refresh });
  saveTokens(resp.data);
  return resp.data.accessToken;
}

const api = axios.create({ baseURL: process.env.API_URL });

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // If unauthorized
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If refresh already happening → enqueue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          requestQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(Promise.reject);
      }

      // Begin refresh
      isRefreshing = true;

      try {
        const newToken = await refreshToken();

        // Retry queued requests
        requestQueue.forEach((p) => p.resolve(newToken));
        requestQueue = [];
        isRefreshing = false;

        // Set new token and retry failed request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        requestQueue.forEach((p) => p.reject(refreshErr));
        requestQueue = [];
        isRefreshing = false;

        // Logout strategy
        clearTokens();
        // Optionally: dispatch(logout()) or navigate("Login")
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(err);
  }
);

export default api;
```

***

# 🔥 **Why This is Safe for Banking Apps**

### **1. Prevents token races**

Multiple failed requests → only **one** refresh is executed.

### **2. Protects against token overwrite**

Queue ensures old refresh responses cannot overwrite new tokens.

### **3. Supports deep background refresh**

Safe for:

*   Auto-refresh before expiry
*   App resume
*   Silent SSO

### **4. Not vulnerable to refresh attacks**

Refresh tokens remain in:

*   Keystore
*   Keychain

Not in memory or Redux.

### **5. No accidental token leaks**

Tokens are never logged.  
No URL query params.  
Headers only.

***

# ⚠️ **Edge Cases to Handle (Mention in Interview)**

### ✔ Refresh token expired → logout

### ✔ Auth server unreachable → show offline UI

### ✔ App opened with expired tokens → bootstrap refresh

### ✔ Request while refreshing → must be queued

### ✔ Force logout on refresh token reuse (stolen token)

***

# 🏦 Banking-Specific Enhancements

### 🔸 **Add device binding keys**

Refresh requests must include device ID / public key.

### 🔸 **Use OAuth2/OIDC refresh rules**

Never refresh more than allowed (rotate refresh tokens).

### 🔸 **Refresh in background tasks**

Before expiry (e.g., using `react-native-background-timer` or AppState listeners).

***

# 🎤 **Interview One‑Liner**

> “I use a secure refresh-token flow in the Axios layer with a single refresh in flight, a request queue, retry-once logic, and secure storage via Keychain/Keystore. If refresh fails, I clear tokens and log out. UI never handles refresh; it’s fully encapsulated in the API client.”

  </details>

  <details><summary>54. Handling retries with exponential backoff.</summary>

Here’s a **short, interview‑friendly** explanation with **production‑grade patterns** for:

# **54. Handling retries with exponential backoff**

***

# ✅ **Short Interview Answer**

“I implement retries using **exponential backoff with jitter** to avoid server overload and retry storms. Only safe/retriable errors (network errors, 5xx, timeouts) are retried, and only for **idempotent** operations like GET. I cap max retries, add randomness, and integrate it in Axios/Fetch wrappers.”

***

# 🔥 Why Exponential Backoff?

*   Prevents hammering the server
*   Reduces load during outages
*   Smooths client retry spikes
*   Recommended by AWS, Google, Stripe, PayPal for reliability

Formula:

    delay = base * (2 ** attempt)
    with jitter = delay * (0.5 + random())

***

# 🛠 Minimal Production‑Ready Utility (Used in Interviews)

```ts
// backoff.ts
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function withExponentialBackoff<T>(
  fn: () => Promise<T>,
  {
    retries = 3,
    base = 300,
    factor = 2,
    jitter = true
  } = {}
): Promise<T> {
  let attempt = 0;
  let lastError;

  while (attempt < retries) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      attempt++;

      if (attempt >= retries) break;

      let delay = base * Math.pow(factor, attempt);
      if (jitter) {
        delay = delay * (0.5 + Math.random());
      }

      await sleep(delay);
    }
  }
  throw lastError;
}
```

***

# 🔗 Integrating Backoff into Axios Interceptor

```ts
import axios from "axios";
import { withExponentialBackoff } from "./backoff";

const api = axios.create({
  baseURL: process.env.API_BASE_URL,
  timeout: 15000,
});

api.interceptors.response.use(
  r => r,
  async (error) => {
    const status = error.response?.status;

    const retriable =
      !error.response ||            // network error
      status === 502 || status === 503 || status === 504;

    const method = error.config?.method?.toLowerCase();

    // Retry only idempotent requests
    if (retriable && (method === "get" || method === "head")) {
      return withExponentialBackoff(
        () => api.request(error.config)
      );
    }

    return Promise.reject(error);
  }
);
```

***

# 🧠 When to Retry (Good for Interview)

### **Safe to retry**

✔ Network failures  
✔ DNS errors  
✔ Timeouts  
✔ 502 / 503 / 504  
✔ Idempotent GET/HEAD  
✔ Payment/KYC status polling

### **Not safe to retry**

❌ POST transfers/payments *(unless using idempotency keys)*  
❌ Form submissions  
❌ Anything non-idempotent  
❌ Business errors (400, 401, 409)

***

# 🏦 Banking‑Specific Best Practices

### ✔ Use **idempotency keys** for sensitive POSTs

Prevents duplicate charges.

### ✔ Cap retries (max 3–5)

Avoid DoS‑like behavior.

### ✔ Add **full jitter**

Prevents retry storms after backend outage.

### ✔ Emit telemetry

Useful for reliability metrics & debugging issues.

### ✔ Never retry on:

*   Auth errors
*   Validation errors
*   Fraud/AML errors
*   OTP errors

***

# 🎯 Interview One‑Liner

> “I implement exponential backoff with jitter, retry only safe errors (network, 5xx), only retry idempotent requests, and integrate it inside the Axios layer. For banking POSTs, I rely on idempotency keys, not retries. This prevents retry storms and ensures safe, resilient networking.”

  </details>

  <details><summary>55. Cursor-based vs offset-based pagination.</summary>

Here’s a **short, crisp, interview‑ready** explanation of:

# **55. Cursor-based vs Offset-based pagination**

This is a classic API + mobile performance question—your answer should highlight **performance**, **consistency**, and **banking relevance**.

***

# ✅ **Short Interview Answer**

“Offset pagination uses `?offset=100&limit=20` and is simple but breaks when data changes—items can shift, causing duplicates or missing rows. Cursor pagination uses a stable `cursor` (like timestamp or ID) and is more reliable for real-time data. Banking apps use cursor-based pagination for transactions because it’s consistent, efficient, and safer for large datasets.”

***

# 📌 **Offset-based Pagination**

**Example:**

    GET /transactions?offset=40&limit=20

### ✔ Pros

*   Easy to implement
*   Works with SQL `LIMIT/OFFSET`
*   Good for small static data

### ❌ Cons

*   **Slow for large datasets** (offset scans)
*   **Data inconsistencies** — items shift if new transactions arrive
*   **Duplicates / missing items**
*   Bad for real-time lists (`transactions`, `feeds`)

> Banking systems rarely use offset because **transaction rows change constantly**.

***

# 📌 **Cursor-based Pagination**

**Example:**

    GET /transactions?cursor=txn_24488&limit=20

Response:

```json
{
  "items": [...],
  "nextCursor": "txn_24468"
}
```

### ✔ Pros

*   **Consistent** even if new data arrives
*   **Fast** (queries use indexed `id`, `timestamp`)
*   **Works in real-time**
*   Perfect for infinite scrolling

### ❌ Cons

*   Slightly more complex
*   Cannot jump to arbitrary pages (“go to page 7”)

> In mobile banking, cursor pagination is the **default** because you want stable, correct data.

***

# 🏦 **Why Banks Prefer Cursor-based Pagination**

*   Transaction data changes every second
*   Prevents showing **duplicate transactions**
*   Prevents missing **new credits or debits**
*   Supports **infinite scroll** with high reliability
*   Avoids expensive `OFFSET` scans on huge tables (millions of rows)

***

# 🧠 Example (Client-side React Query usage)

```ts
const fetchTxns = ({ cursor }) =>
  api.get("/transactions", { params: { cursor, limit: 20 } });

const {
  data,
  fetchNextPage,
  hasNextPage
} = useInfiniteQuery(["transactions"], fetchTxns, {
  getNextPageParam: (lastPage) => lastPage.nextCursor
});
```

Super smooth infinite scrolling.

***

# ⚖️ Quick Comparison Table

| Feature                    | Offset Pagination | Cursor Pagination |
| -------------------------- | ----------------- | ----------------- |
| Performance on large data  | ❌ Slow            | ✅ Fast            |
| Real-time consistency      | ❌ Poor            | ✅ Great           |
| Risk of duplicates/missing | High              | None              |
| Jump to page N             | Yes               | No                |
| Implementation complexity  | Easy              | Medium            |
| Banking suitability        | ❌ Not recommended | ✅ Best choice     |

***

# 🎤 Interview One‑liner

> “Offset pagination is simple but unreliable for dynamic data. Cursor-based pagination is stable, faster, and avoids duplicates—so it’s the recommended approach for banking transaction lists and any real-time feed.”

  </details>

  <details><summary>56. GraphQL basics: caching, persisted queries.</summary>

Here’s a **short, crisp, interview‑friendly** explanation of:

# **56. GraphQL basics: caching, persisted queries**

This answer is tailored for **React Native + mobile banking** style interviews.

***

# ✅ **Short Interview Answer**

“GraphQL uses a strongly typed schema and returns exactly the data the client needs. For caching, libraries like Apollo and URQL normalize data using entity IDs, enabling automatic updates. Persisted queries push predefined queries to the server, reducing bandwidth, improving security, and preventing malicious queries.”

***

# 🧩 **Basics of GraphQL**

*   One endpoint → `/graphql`
*   Client sends a **query** describing exactly what fields it needs
*   Server resolves via typed schema (`Query`, `Mutation`, `Subscription`)
*   No overfetching / underfetching

Example:

```graphql
query GetAccount($id: ID!) {
  account(id: $id) {
    id
    balance
    currency
  }
}
```

***

# 🎛 **1. GraphQL Caching (Client‑Side)**

### **Apollo Client Caching**

Apollo handles caching via its **normalized store**.

Example cache config:

```ts
const client = new ApolloClient({
  uri: "https://api.bank.com/graphql",
  cache: new InMemoryCache({
    typePolicies: {
      Account: {
        keyFields: ["id"],
      },
    },
  }),
});
```

### How caching works:

*   Each object with an `id` becomes a cache entry
*   Queries are merged into the cache
*   When the same entity appears elsewhere, Apollo reads from cache
*   Updates propagate automatically to all screens

This is great for:

*   Account details
*   Transaction updates
*   User profile

### Cache advantages:

✔ No repeated network calls  
✔ Instant UI updates  
✔ Efficient merges  
✔ Works offline (if using cache-first strategies)

***

# 📦 **Cache Policies You Should Mention**

Common read policies:

*   **cache-first** → fastest
*   **network-only** → always fresh
*   **cache-and-network** → returns cached data, then refreshes

Example:

```ts
useQuery(GET_ACCOUNTS, { fetchPolicy: "cache-and-network" });
```

***

# 🔐 **2. Persisted Queries (Very Important for Mobile)**

### What are persisted queries?

Instead of sending full GraphQL query strings every time, the client sends a **hash** (SHA‑256) of the query.

The server stores the actual query ahead of time.

### Example:

Client sends:

```json
{
  "id": "a8d1c9f123",
  "variables": { "accountId": "123" }
}
```

Server looks up the query by ID → executes → returns data.

***

# 👍 **Why Persisted Queries? (Interview‑safe points)**

### ✔ **Bandwidth savings**

GraphQL query strings are verbose. Hash is very small.

### ✔ **Performance boost**

Great for slow networks (common in mobile).

### ✔ **Security hardening**

Prevents:

*   Arbitrary queries
*   Introspection
*   Malicious nested queries
*   Heavy deep queries

Great for banking and regulated apps.

### ✔ **DoS protection**

Server only allows **known, whitelisted** queries.

***

# 🔧 How to implement persisted queries

### Option 1: Apollo Automatic Persisted Queries (APQ)

Apollo can hash queries automatically and retry if server doesn’t have them.

```ts
import { createPersistedQueryLink } from "@apollo/client/link/persisted-queries";
import { sha256 } from "crypto-hash";

const link = createPersistedQueryLink({ sha256 }).concat(
  new HttpLink({ uri: "/graphql" })
);
```

### Option 2: Hand‑rolled server-side registry

e.g., `query-id → query string` mapping.

***

# 🧠 How caching + persisted queries work together

*   Persisted queries reduce **query size**
*   Apollo cache reduces **query frequency**

Together → extremely fast and low‑latency mobile API performance.

***

# 🎤 **Interview One‑liner**

> “GraphQL caching works through entity normalization and cache policies like cache-first or cache-and-network. Persisted queries store queries server-side and let the client send only a hash, improving performance, reducing bandwidth, and preventing unknown queries—essential in mobile banking apps.”

  </details>

  <details><summary>57. How do you validate API response schemas (zod/yup)?</summary>

Here’s a **short, crisp, interview‑ready** answer on:

# **57. How do you validate API response schemas (zod / yup)?**

This question checks if you understand **runtime validation**, **type safety**, and **defensive programming** — critical in **banking apps** where backend responses must be trusted **only after validation**.

***

# ✅ **Short Interview Answer**

“I use Zod to validate API responses at runtime. I define schemas that match the expected server response, parse them in my API layer, and fail fast if the backend sends unexpected fields. This protects the app from malformed responses, backend bugs, and MITM attacks. Zod gives me TypeScript types automatically, making API usage type‑safe.”

***

# 🚀 Why Validate API Responses?

**Mobile apps are exposed to:**

*   Backend bugs / unexpected nulls
*   Contract mismatches between frontend & backend
*   Malicious/invalid payloads (especially in fintech/banking)

Validation ensures:

*   Defensive handling
*   Predictable UI rendering
*   Crash prevention
*   Security hardening

***

# 🧩 **Using Zod (Recommended)**

## **1. Define a schema**

```ts
import { z } from "zod";

export const TransactionSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  amount: z.number(),
  currency: z.enum(["INR", "USD"]),
  timestamp: z.string(),
  status: z.enum(["PENDING", "POSTED", "FAILED"]),
});
```

***

## **2. Validate API response**

```ts
const res = await api.get("/transactions/123");

const txn = TransactionSchema.parse(res); 
// Throws if schema mismatch
```

Use `.safeParse()` if you prefer non‑throwing behavior:

```ts
const result = TransactionSchema.safeParse(res);
if (!result.success) {
  // handle gracefully, log, fallback UI
}
```

***

## **3. Infer TS types automatically**

```ts
export type Transaction = z.infer<typeof TransactionSchema>;
```

This eliminates duplicated types.

***

# 🧱 Validating **list responses**

```ts
const TransactionListSchema = z.object({
  items: z.array(TransactionSchema),
  nextCursor: z.string().nullable(),
});
```

***

# 🔒 Banking-Safe Patterns

### ✔ Validate ALL external inputs

Response validation is a **security layer**.

### ✔ Normalize data (convert strings → numbers/dates)

Zod supports transforms:

```ts
const BalanceSchema = z.string().transform(Number);
```

### ✔ Fail fast in API layer, not UI

UI should receive **clean, guaranteed-correct data**.

### ✔ Log validation errors (with PII scrubbing)

Avoid logging sensitive data.

### ✔ Graceful fallback

If schema fails → show offline UI or generic error.

***

# 🆚 Yup vs Zod

| Feature               | Yup      | Zod       |
| --------------------- | -------- | --------- |
| Runtime validation    | ✅        | ✅         |
| TypeScript inference  | ❌ weak   | ✅ strong  |
| Transform support     | Limited  | Excellent |
| API shape validation  | Moderate | Excellent |
| Banking-grade schemas | Good     | Best      |

**Verdict:**  
👉 **Zod** is preferred for **API response validation**.

***

# 🧪 Example: Full API Layer with Validation

```ts
import { z } from "zod";
import http from "../httpClient";

const AccountSchema = z.object({
  id: z.string(),
  name: z.string(),
  balance: z.number(),
  currency: z.string(),
});

export type Account = z.infer<typeof AccountSchema>;

export async function getAccount(id: string): Promise<Account> {
  const res = await http.get(`/accounts/${id}`);
  return AccountSchema.parse(res);
}
```

Your screens now receive **strict, typed, sanitized** data.

***

# 🎯 Interview One‑liner

> “I validate API responses using Zod schemas in the API layer. I parse backend data, reject malformed responses, and generate TypeScript types automatically. This ensures reliability, safety, and type‑safe data flow—critical for banking-grade mobile apps.”

  </details>

  <details><summary>58. Normalizing API errors for consistent UX.</summary>

Here’s a **short, crisp, interview‑ready** explanation for:

# **58. Normalizing API errors for consistent UX**

This is a very common **senior‑level** question — interviewers want to see if you understand **error normalization**, **error mapping**, and **consistent UI/UX for failures**.

***

# ✅ **Short Interview Answer**

“I never show raw backend errors directly to the UI. I normalize all errors in a central API layer into a consistent structure with fields like `code`, `message`, `status`, and `isNetworkError`. This gives the UI predictable behavior and lets us map errors into user-friendly messages, regardless of which backend or endpoint they come from.”

***

# 🎯 Why Normalize API Errors?

Backend errors are often inconsistent:

*   Different microservices return different shapes
*   Some return `message`, others return `error`
*   Network errors look different from business errors
*   Validation errors differ per endpoint

**Without normalization → UI logic becomes messy**.  
With normalization → **one error shape for the whole app**.

***

# 🧱 #1: Define a Global Normalized Error Shape

```ts
export type NormalizedError = {
  status: number | null;       // HTTP status
  code: string | null;         // backend business code
  message: string;             // user-friendly error
  details?: unknown;           // optional debugging info
  isNetworkError: boolean;     // no response? timeout? offline?
  requestId?: string;          // correlation ID
};
```

***

# 🔧 #2: Central Error Normalizer (Axios Example)

```ts
// errors.ts
import { AxiosError } from "axios";

export function normalizeError(error: AxiosError): NormalizedError {
  const isNetwork = !error.response;

  const status = error.response?.status ?? null;
  const data = error.response?.data ?? {};

  return {
    status,
    code: data.code ?? error.code ?? null,
    message: extractMessage(error),
    details: sanitize(data),
    isNetworkError: isNetwork,
    requestId: error.response?.headers?.["x-request-id"],
  };
}

function extractMessage(err: AxiosError) {
  return (
    err.response?.data?.message ||
    err.response?.data?.error ||
    err.message ||
    "Something went wrong"
  );
}

// scrub PII before logging
function sanitize(payload: any) {
  if (!payload) return undefined;
  const clone = { ...payload };
  if (clone.pan) clone.pan = "***masked***";
  if (clone.aadhaar) clone.aadhaar = "***masked***";
  return clone;
}
```

This ensures every failure has the same structure.

***

# 🧩 #3: API Layer Returns Only Normalized Errors

```ts
try {
  const response = await http.get("/account");
  return response.data;
} catch (err) {
  throw normalizeError(err);
}
```

Now the **UI never sees raw backend errors**.

***

# 🎨 #4: UI Uses a Consistent Error Model

```tsx
const onError = (error: NormalizedError) => {
  if (error.isNetworkError) {
    showToast("No internet. Please try again later.");
  } else if (error.status === 401) {
    logoutUser();
  } else if (error.code === "LIMIT_EXCEEDED") {
    showModal("Your daily limit has been exceeded.");
  } else {
    showToast(error.message);
  }
};
```

**One error model → predictable UI behavior**.

***

# 🏦 Banking-Grade Error Types (Most Important)

### **1. Network errors**

*   No internet
*   Backend unreachable
*   Timeout

→ Use retry/backoff, offline UI.

### **2. Technical backend errors**

*   500, 502, 503, 504  
    → Show generic failure.

### **3. Authentication errors**

*   401 → token expired → refresh
*   403 → unauthorized → show forbidden screen

### **4. Business rule errors**

e.g.,

*   `"INSUFFICIENT_FUNDS"`
*   `"DAILY_LIMIT_REACHED"`
*   `"ACCOUNT_BLOCKED"`

→ Show specific UX.

### **5. Validation errors**

Field-level errors:  
`amount: "must be greater than 0"`

→ Map into form UI.

***

# 🧠 #5: Error Mapping Table (Optional But Interview Friendly)

    code: "INSUFFICIENT_FUNDS" → "Your balance is too low."
    code: "LIMIT_EXCEEDED" → "Transaction limit crossed."
    status: 401 → "Session expired."
    isNetworkError → "Check your internet connection."

Central mapping avoids repeating logic in screens.

***

# 🧾 #6: React Query Integration

```ts
useQuery({
  queryKey: ["txn"],
  queryFn,
  onError: (err: NormalizedError) => {
    handleAppError(err); // centralized handler
  },
});
```

Again — **UI only deals with normalized errors**.

***

# 🎤 **Interview One‑liner**

> “I normalize all API errors in a central Axios layer into a single consistent shape. UI components never handle raw backend errors—they rely on a clean `status`, `code`, `message`, and `isNetworkError` model. This ensures predictable UX and easy mapping of business errors like insufficient funds or daily limit exceeded.”

  </details>

  <details><summary>59. Secure network logging without exposing PII.</summary>

Here’s a **short, crisp, interview‑ready** explanation for:

# **59. Secure network logging without exposing PII**

This is a very common question in **banking/fintech** interviews.  
They want to see that you understand **security, masking, redaction, transport protection, and compliance**.

***

# ✅ **Short Interview Answer**

“I log only non‑sensitive metadata from network requests (method, URL, status, duration), and I redact or mask all PII before logging. I never log request/response bodies for sensitive endpoints. I centralize logging in the API layer, scrub sensitive fields, and use secure channels (HTTPS & encrypted logs) so no PAN/Aadhaar/phone/email accidentally leaks.”

***

# 🧩 **Why PII-safe Logging Matters**

*   Backend often returns sensitive info (PAN, Aadhaar, KYCs)
*   Device logs can be accessed by tools or root users
*   Logs sometimes get shipped to monitoring platforms
*   Compliance requirements (PCI‑DSS, GDPR, RBI)

**So you must never log raw payloads.**

***

# 🔒 **What NOT to Log**

❌ Full names  
❌ Aadhaar / PAN / SSN  
❌ Card numbers  
❌ OTP / PIN  
❌ Access tokens / refresh tokens  
❌ Full addresses  
❌ Bank account numbers  
❌ Raw API responses

***

# ✔️ What You CAN Log Safely

*   URL path (without query params)
*   Method (GET, POST)
*   Status Code
*   Duration / latency
*   Error code (business code)
*   request-id / correlation-id
*   Flags like `isNetworkError`, `retryCount`

***

# 🛠 **Centralized Safe Logger (Axios Example)**

```ts
// safeLogger.ts
const SENSITIVE_KEYS = [
  "pan",
  "aadhaar",
  "cardNumber",
  "accountNumber",
  "email",
  "phone",
  "otp",
  "pin",
  "token",
];

export function scrub(value: any) {
  if (!value || typeof value !== "object") return value;

  const clone: any = Array.isArray(value) ? [] : {};

  for (const key in value) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      clone[key] = "***masked***";  
    } else if (typeof value[key] === "object") {
      clone[key] = scrub(value[key]);
    } else {
      clone[key] = value[key];
    }
  }

  return clone;
}

export function logRequest(config: any) {
  console.log("[HTTP REQUEST]", {
    method: config.method,
    url: config.url,
    headers: scrub(config.headers),
  });
}

export function logResponse(response: any) {
  console.log("[HTTP RESPONSE]", {
    url: response.config.url,
    status: response.status,
  });
}

export function logError(error: any) {
  console.log("[HTTP ERROR]", {
    url: error?.config?.url,
    status: error?.response?.status,
    code: error?.response?.data?.code,
    message: error?.message,
  });
}
```

***

# 🔗 **Integrating with Axios**

```ts
api.interceptors.request.use((config) => {
  logRequest(config); // SAFE (masked)
  return config;
});

api.interceptors.response.use(
  (res) => {
    logResponse(res); // SAFE
    return res;
  },
  (err) => {
    logError(err); // SAFE
    return Promise.reject(err);
  }
);
```

👉 **Never** log `res.data`.

***

# 🏦 Banking-Safe Practices (Very Good to Mention)

### ✔ **1. Never log request/response bodies**

Only log metadata.

### ✔ **2. Mask sensitive fields**

PAN → `*******1234`  
Aadhaar → `******1234`  
Phone → `******7890`

### ✔ **3. Log only URL path**

No query params (they can contain PII).

### ✔ **4. Use correlation IDs**

Helps debug without exposing data.

### ✔ **5. Store logs securely**

Encrypted log storage (e.g., SumoLogic, Splunk, Datadog with encryption).

### ✔ **6. Separate dev vs prod logging**

*   Dev → allow full payload logging (with caution)
*   Prod → strict PII redaction

### ✔ **7. Turn off verbose logs in production**

Use feature flags or env flags.

***

# 🧠 Extra Tip (Interview Gold)

Mention **PII Redaction Middleware** + **Zero Trust Logging**.

> “Even our internal logs treat PII as untrusted data. Everything is masked before leaving the device. No raw data ever leaves the mobile app."

***

# 🎤 **Interview One-liner**

> “I centralize network logging, scrub all PII fields, never log payloads, and only log safe metadata like method, URL, status, and duration. This ensures compliant, secure logging without leaking sensitive data in a banking environment.”

  </details>

  <details><summary>60. Rate limiting & retry policies.</summary>

Here’s a **short, crisp, interview‑ready** answer for:

# **60. Rate limiting & retry policies (API best practices for mobile apps)**

This is a classic networking + reliability question.  
Banks *love* this topic because it shows you understand **safety**, **stability**, and **traffic control**.

***

# ✅ **Short Interview Answer**

“I implement client‑side rate limiting to prevent excessive calls and server throttling. When the server returns 429 or 503, I respect the `Retry‑After` header and retry using **exponential backoff with jitter**, but only for idempotent operations. For sensitive POSTs (payments, transfers), I use idempotency keys instead of retries.”

***

# 🧩 **1. What is Rate Limiting?**

Rate limiting prevents clients from calling an endpoint **too frequently**.

Types:

*   **Client‑side rate limiting** → throttle/debounce UI triggers
*   **Server‑side rate limiting** → backend returns `429 Too Many Requests`

Common causes:

*   Rapid search queries
*   User double‑taps
*   Infinite loops
*   Polling

***

# 🔧 Client-side Rate Limiting Patterns

### **1) Debounce (search box / typeahead)**

Only fire API after user stops typing.

```ts
const search = debounce((q) => api.search(q), 400);
```

### **2) Throttle (scroll, frequent taps)**

Send request at most once every X ms.

```ts
const send = throttle(() => api.refresh(), 1000);
```

### **3) Queueing**

Limit concurrency to 1–2 calls at a time.

***

# 🧩 **2. Retry Policies**

Retry only **safe** operations:

*   GET
*   HEAD
*   Status polling
*   Fetching metadata

⚠️ **Never retry payment/transfer POST unless idempotency key used**

Common retry triggers:

*   Network failure
*   Timeout
*   502 / 503 / 504
*   429 (too many requests)

***

# 🔄 **3. Exponential Backoff with Jitter (Safe & Standard)**

Backoff formula:

    delay = base * (2 ^ attempt) * random(jitter)

With jitter = random 50–100%.

Advantages:

*   Prevents retry storms
*   Smooths out server pressure
*   Aligns with AWS, Google, Stripe recommendations

Already implemented in:

```ts
withExponentialBackoff(() => api.request(config));
```

***

# 🧠 **4. Retry-after Header (Respect Server Signals)**

If server returns:

    HTTP 429 Too Many Requests
    Retry-After: 5

The client MUST wait 5 seconds before retry.

Example:

```ts
if (err.response?.status === 429) {
  const retryAfter = Number(err.response.headers["retry-after"]);
  await sleep(retryAfter * 1000);
  return api.request(err.config);
}
```

***

# 🛡 **5. Banking-Specific Safe Practices**

### ✔ **Use Idempotency Keys for POSTs**

Prevents double-charging during retries:

    Idempotency-Key: <UUID>

### ✔ **Avoid retrying high-risk operations**

*   Payments
*   UPI transactions
*   Fund transfers
*   OTP verification

### ✔ **Cap retries**

Max 3–5 retry attempts → prevent infinite loops.

### ✔ **Telemetry**

Log:

*   retry count
*   time taken
*   correlation ID

### ✔ **Prefer cursor-based pagination**

So retries don’t duplicate items.

***

# 🏦 **6. Where Rate Limiting Happens in Mobile Banking Apps**

### **UI layer**

*   Typeahead searches
*   Prevent double-taps on Pay button
*   Prevent multi-submit on login/KYC forms

### **API layer**

*   Deduplicate identical API calls
*   Queue & cancel stale requests
*   Retry GETs with exponential backoff

### **Backend**

*   Returns 429 when overloaded
*   Requires clients to respect retry-after

***

# 🧱 **7. Combined Flow (Interview Gold)**

**User spams Refresh button → throttled (client)**  
⬇  
**API call fails with 503 → automatic retry with backoff**  
⬇  
**After 3 attempts → show fallback UI**  
⬇  
**If backend returns 429 → honor Retry-After header**  
⬇  
**POST operations use idempotency keys**

***

# 🎤 Interview One-liner

> “I limit API calls using client-side throttling/debouncing, handle server 429/503 with exponential backoff + jitter, and only retry idempotent requests. For sensitive POSTs like payments, I use idempotency keys, not retries. This prevents retry storms and ensures safe, compliant behavior in mobile banking apps.”

  </details>

  <details><summary>61. WebSockets vs polling vs SSE in RN.</summary>

Here’s a **short, interview‑friendly**, practical comparison tailored for **React Native** (banking/fintech apps):

***

## **61. WebSockets vs Polling vs SSE (Server‑Sent Events) in React Native**

### ✅ **Quick TL;DR**

*   **WebSockets** → **Full‑duplex, low‑latency** bi‑directional channel. Best for **real‑time** two‑way features (trading ticks, chat, live dashboards).
*   **SSE (EventSource)** → **One‑way, server→client** stream over HTTP. Lightweight for **push updates** (status updates, long‑running job progress).
*   **Polling** → Client pulls at intervals. **Simplest**, most compatible, but **least efficient**; okay for **low‑frequency** updates or when infra is limited.

***

## **When to use what (banking examples)**

| Use case                                                                | Best choice                     | Why                                                  |
| ----------------------------------------------------------------------- | ------------------------------- | ---------------------------------------------------- |
| Live market/FX ticks, order book, trader chat                           | **WebSockets**                  | Ultra‑low latency, bi‑directional, continuous stream |
| Payment/transfer status, KYC job progress, notification badges          | **SSE** (or push notifications) | Server‑push, simpler than WS, efficient over HTTP    |
| Balance refresh every few mins, infrequent updates, constrained backend | **Polling**                     | Easiest to implement, acceptable for low frequency   |
| Background/device‑suspended notifications                               | **Push (FCM/APNs)**             | Streams pause in background; use push to wake app    |

> For **regulated actions** (payments/UPI), prefer server webhooks → **push notifications** → client **fetch** to avoid keeping long‑lived sockets unnecessarily.

***

## **React Native support & libraries**

*   **WebSockets**: Built‑in (`new WebSocket(url)`), widely used; GraphQL subscriptions use WS via `subscriptions-transport-ws` or `graphql-ws`.
*   **SSE**: No native `EventSource` in RN—use **polyfills** like `react-native-event-source` or implement **Fetch‑based SSE** reader.
*   **Polling**: Just `setInterval` + `fetch` (cancel with `AbortController`).
*   **NetInfo**: Use `@react-native-community/netinfo` to auto‑pause/retry on connectivity changes.
*   **Background limits**: iOS/Android may suspend sockets when app is backgrounded—don’t rely on WS/SSE for alerts; use FCM/APNs.

***

## **Pros & cons (what to mention in interviews)**

### **WebSockets**

**Pros**

*   True **bi‑directional**, low latency, multiplexing via one connection
*   Efficient for **high‑frequency** updates  
    **Cons**
*   More moving parts: heartbeats, **reconnect with backoff**, auth renewal
*   Backend infra must support WS, load balancing sticky sessions or token‑based routing
*   Battery impact if always on

**Use for:** trading, chat, real‑time dashboards, collaborative edits.

***

### **SSE (Server‑Sent Events)**

**Pros**

*   Simple **one‑way** server→client, HTTP/2 friendly
*   Auto‑reconnect semantics, smaller protocol overhead than WS
*   Great for **event streams** and **status updates**
    **Cons**
*   Not built‑in in RN → requires polyfill
*   **Downlink only**; if client needs to send commands, pair with normal POSTs

**Use for:** transaction status, job progress, notifications badges, audit logs stream.

***

### **Polling**

**Pros**

*   Works everywhere, easy to cache, simple to secure
*   No special infra required
    **Cons**
*   **Inefficient** (wasted calls), staleness between polls
*   Can hammer backend without careful throttling/jitter

**Use for:** low‑frequency refresh (e.g., every 30–60s), fallback when WS/SSE blocked.

***

## **Security & reliability checklist (banking-grade)**

*   **TLS**: Always `wss://` for WebSockets; HTTPS for SSE/polling.
*   **Auth**: Short‑lived access token; refresh safely. For WS, send token in query/header and **re‑authenticate on reconnect**.
*   **Reconnects**: Exponential backoff + **jitter**; cap attempts; pause when offline (NetInfo).
*   **Heartbeats**: WS ping/pong or app‑level heartbeat to detect half‑open connections.
*   **Backpressure**: Drop or coalesce stale messages (e.g., keep only latest price).
*   **PII**: Never stream sensitive PII; encrypt on transport; **mask in logs**.
*   **Background behavior**: Expect streams to pause; use **push notifications** for critical alerts.

***

## **Code snippets (RN)**

### 1) **WebSocket with reconnect + heartbeat**

```tsx
import { useEffect, useRef } from "react";
import NetInfo from "@react-native-community/netinfo";

export function usePriceSocket(url: string, token: string, onTick: (t: any) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hbRef = useRef<NodeJS.Timeout | null>(null);
  let attempts = 0;

  const connect = () => {
    const ws = new WebSocket(`${url}?token=${encodeURIComponent(token)}`);
    wsRef.current = ws;

    ws.onopen = () => {
      attempts = 0;
      // heartbeat every 30s
      hbRef.current && clearInterval(hbRef.current);
      hbRef.current = setInterval(() => ws.send(JSON.stringify({ type: "ping" })), 30000);
    };

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        if (msg.type === "pong") return;
        onTick(msg);
      } catch {}
    };

    ws.onerror = () => {/* avoid noisy logs in prod */};

    ws.onclose = () => {
      hbRef.current && clearInterval(hbRef.current);
      const backoff = Math.min(1000 * 2 ** attempts, 15000) * (0.5 + Math.random());
      attempts += 1;
      timerRef.current && clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => connect(), backoff);
    };
  };

  useEffect(() => {
    const unsub = NetInfo.addEventListener(state => {
      if (!state.isConnected) {
        wsRef.current?.close();
      } else if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
        connect();
      }
    });
    connect();
    return () => {
      unsub();
      timerRef.current && clearTimeout(timerRef.current);
      hbRef.current && clearInterval(hbRef.current);
      wsRef.current?.close();
    };
  }, [url, token]);
}
```

***

### 2) **SSE (EventSource polyfill)**

```tsx
// npm: react-native-event-source (or implement fetch-based reader)
import EventSource from "react-native-event-source";
import NetInfo from "@react-native-community/netinfo";

export function useSSE(url: string, token: string, onEvent: (e: any) => void) {
  useEffect(() => {
    let es: EventSource | null = new EventSource(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const sub = NetInfo.addEventListener(state => {
      if (!state.isConnected) {
        es?.close();
      } else if (!es) {
        es = new EventSource(url, { headers: { Authorization: `Bearer ${token}` } });
      }
    });

    es.addEventListener("message", (evt: any) => {
      try { onEvent(JSON.parse(evt.data)); } catch {}
    });
    es.addEventListener("error", () => { /* auto-reconnect handled by lib, optionally custom retry */ });

    return () => { sub(); es?.close(); };
  }, [url, token]);
}
```

***

### 3) **Polling with cancellation + jitter**

```tsx
import { useEffect, useRef } from "react";

export function usePolling(fetchFn: (signal: AbortSignal) => Promise<void>, baseMs = 10000) {
  const timer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let aborted = false;

    const tick = async () => {
      const ctrl = new AbortController();
      try {
        await fetchFn(ctrl.signal);
      } catch {}
      if (!aborted) {
        const jitter = baseMs * (0.5 + Math.random());
        timer.current = setTimeout(tick, jitter);
      }
    };

    tick();

    return () => {
      aborted = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [baseMs, fetchFn]);
}
```

***

## **Practical selection guide**

*   **Need two‑way, sub‑second updates?** → **WebSockets**
*   **Need server‑only push (lightweight) & HTTP infra reuse?** → **SSE**
*   **Backend doesn’t support streams or updates are rare?** → **Polling**
*   **App often in background and only needs alerts?** → **Push notifications**, then fetch on tap

***

## **Banking‑specific tips**

*   Coalesce frequent updates (e.g., emit only the **latest** price to UI)
*   Use **topic/room** subscriptions (symbol, accountId) to limit data volume
*   Always **authenticate** the stream and **authorize** per resource (no broad topics)
*   Implement **server‑side rate limits** + **client‑side throttling** to prevent overload
*   Add **observability**: connection uptime, reconnect count, message lag

  </details>

  <details><summary>62. Time sync issues when signing financial transactions.</summary>

Here’s a **short, crisp, interview‑ready**, banking‑grade answer for:

# **62. Time sync issues when signing financial transactions**

This is a *critical* topic in regulated/financial systems because **cryptographic signatures, JWTs, OAuth tokens, nonce/expiry windows, and HMAC signing** all depend on **accurate device time**.

***

# ✅ **Short Interview Answer**

“Financial transactions often require timestamped signatures (HMAC, JWT, OAuth, UPI‑style nonces). If the device clock is skewed, signatures become invalid. I fix this by never trusting device time—always use server time via `/time` sync endpoint or NTP drift calculation. I maintain a delta offset and apply it whenever generating signatures or timestamps.”

***

# 🔐 **Why Time Sync Matters in Financial Apps**

Financial APIs commonly require:

*   **Timestamped request headers**  
    (`X-Timestamp`, `X-Date`, `ts`, etc.)
*   **JWT `iat` and `exp` checks**
*   **HMAC signatures using timestamp**
*   **Replay‑attack protection** (valid for 30–120 seconds)
*   **Nonce/one‑time tokens with expiry**

If device is ahead/behind by even **±30 seconds**, API may reject the request with:

*   `INVALID_SIGNATURE`
*   `TIMESTAMP_OUT_OF_RANGE`
*   `REQUEST_EXPIRED`
*   `REPLAY_DETECTED`

This breaks payments, UPI mandates, investments, trading, etc.

***

# 🧠 **The Core Idea: Don’t Trust Device Time**

### ✔ Always derive a **server–client time delta**

    serverTime - deviceLocalTime = timeOffset

### ✔ Use the **server‑corrected time** for all:

*   Signing
*   Nonces
*   JWT creation
*   Timestamps
*   Request headers
*   Auditing

***

# 🛠 **Recommended Strategy (Banking Standard)**

## **1) Fetch server time at app startup**

API:

    GET /time
    → { serverTime: 1738823100000 } // UNIX ms

## **2) Compute offset**

```ts
const deviceTime = Date.now();
const delta = serverTime - deviceTime; // can be + or -
```

## **3) Store delta in memory (NOT persistent)**

```ts
let TIME_OFFSET = delta;
export const getServerCorrectedTime = () => Date.now() + TIME_OFFSET;
```

**Do NOT store delta permanently** — drift changes over time.

***

# 🔁 **4) Re-sync periodically**

*   On app launch
*   When app comes foreground
*   Before signing sensitive transactions
*   On every 401/invalid-signature error

Typically every **10–15 minutes**.

***

# 🔐 **5) Use corrected time in signatures**

Example for HMAC signing:

```ts
const ts = getServerCorrectedTime();

const payload = `${method}\n${path}\n${ts}`;
const signature = hmacSHA256(payload, secretKey);
```

Header:

    X-Timestamp: <corrected_ts>
    X-Signature: <signature>

Never use `new Date()` directly.

***

# 🔥 **6) Server tolerance window**

Most banking systems allow:

*   **±30 sec** drift → strict systems
*   **±2–5 min** drift → typical OAuth/JWT
*   **±1–2 sec** tolerance for trading

If out-of-range → customer gets failure.

Your app must anticipate this.

***

# 🧪 **7) Detect and handle time drift**

If error response contains:

*   `"TIMESTAMP_SKEW"`
*   `"INVALID_IAT"`
*   `"REQUEST_EXPIRED"`

Then **trigger automatic re-sync** with server time and retry the request.

***

# 📱 Why device time cannot be trusted

*   User changes system clock manually
*   OS auto‑sync disabled
*   Device clock drift (common in cheap Androids)
*   Timezone misconfigurations
*   Emulator/Debug devices
*   Time updated from carrier with delay

***

# 🏦 Banking/UPI/Trading Real Use Cases

### **UPI / Payment Gateways**

HMAC signatures contain timestamp → time drift breaks payments.

### **OAuth2 / OIDC**

JWT `iat`/`exp` → validates only if clock is accurate.

### **Mutual Funds / Investments**

NFO closing windows → exact timestamp needed.

### **Trading**

Order book timestamps must match server precision.

***

# ⚠️ Security Pitfalls (Mention in Interview)

### ✔ Never rely on device’s `Date.now()` for:

*   Nonces
*   Signing
*   JWT issuing
*   Payment initiation

### ✔ Never sync time using a random NTP server

Use:

*   Your bank’s `/time` API
*   Pre-configured official NTP pool
*   Signed time endpoints

### ✔ Never log raw timestamps for sensitive flows

Mask or sanitize logs.

***

# 🎤 **Interview One‑liner**

> “I never trust the device clock. I sync time with the server, compute a delta, and always use server‑corrected time for signing financial transactions, JWTs, nonces, and replay protection. If the server reports timestamp skew, I auto‑resync and retry.”

  </details>

</details>

***

### **7) Data Storage & Offline Strategy (6 questions)**

<details>
  <summary>Data Storage & Offline Strategy (6)</summary>

  <details><summary>63. Compare AsyncStorage, MMKV, SQLite, Realm.</summary>

Great topic. In banking apps we care about **speed**, **consistency**, **encryption**, **migrations**, and **debuggability**. Here’s a crisp, interview-ready comparison of **AsyncStorage vs MMKV vs SQLite vs Realm**, with when-to-use, trade‑offs, and tiny code snippets.

***

## TL;DR Decision Guide

*   **Feature flags, tokens, small JSON, preferences:** **MMKV** (fastest, robust) → fallback **AsyncStorage** for simplest setups.
*   **Relational data, complex queries, reports, pagination:** **SQLite** (deterministic, ACID, SQL you know).
*   **Rich domain models, object graphs, live queries, sync option:** **Realm** (object DB, encrypted, reactive, great offline-first).
*   **Avoid storing PII/secrets unencrypted** in any store. Use platform Keychain/Keystore + encrypted DB where needed.

***

## One-liner summaries

*   **AsyncStorage**: Simple key–value **JS bridge** storage (community module). OK for **small, non-sensitive** config/state. Not fast for heavy reads/writes.
*   **MMKV**: **Native, memory-mapped** key–value store (via JSI). **Ultra-fast**, type-safe primitives, optional encryption. Great default for app state.
*   **SQLite**: **Relational** ACID database. Strong for **structured data** with **queries, joins, indexes**. Mature, predictable.
*   **Realm**: **Object database** with **live objects**, **change notifications**, **zero-copy** like reads, **built-in encryption**, and optional **sync** (MongoDB Realm). Excellent for **offline-first** and complex domain models.

***

## What to use when (banking/servicing context)

| Scenario                                                       | Best Pick                       | Why                                                             |
| -------------------------------------------------------------- | ------------------------------- | --------------------------------------------------------------- |
| Session flags, feature toggles, UI prefs, last-sync timestamps | **MMKV**                        | Fast, low overhead, persistent KV.                              |
| Secure tokens/PII                                              | **Keychain/Keystore + MMKV/DB** | Store secrets in Keychain/Keystore; reference via IDs in store. |
| Transaction history, statements, pagination, filters           | **SQLite** or **Realm**         | Need indexes/queries (SQLite) or reactive models (Realm).       |
| Complex object graphs, offline-first with background sync      | **Realm**                       | Live queries, notifications, good write perf, encryption.       |
| Extremely large tables with SQL reporting                      | **SQLite**                      | Deterministic SQL, tooling, query plans.                        |

***

## Performance & Architecture

*   **AsyncStorage**: JS ↔ native bridge JSON serialization → **slower**, especially under frequent reads/writes. Good for < a few hundred keys.
*   **MMKV**: Native C++ storage + **JSI** (no bridge). **Near-constant time** reads, great for frequently accessed state.
*   **SQLite**: Disk-backed, indexable. Performance depends on **schema, indexes, transactions**, and batch operations.
*   **Realm**: MVCC storage, **zero-copy reads**, lazy loading, notifications. Excels with frequent reads and complex objects.

***

## Encryption & Security (important for banking)

*   **AsyncStorage**: No built-in encryption. Wrap with app-layer encryption if used beyond trivial prefs.
*   **MMKV**: Supports encryption (single key). Still treat as **sensitive**; key management matters.
*   **SQLite**: Use **SQLCipher** build for at-rest encryption, or encrypt at the app layer.
*   **Realm**: **Built-in at-rest encryption** (per‑DB key). Combine with platform secure enclave/Keychain/Keystore for key storage.

> **Best practice:** store encryption keys/refresh tokens **only** in **iOS Keychain / Android Keystore**. Keep minimal references in app stores.

***

## Migrations & Tooling

*   **AsyncStorage/MMKV**: Manual key migrations (version namespacing).
*   **SQLite**: Migration scripts (DDL), robust versioning; easy to diff/schema evolve.
*   **Realm**: Declarative migrations via schema versions; handles object model changes well.

***

## Bundle Size & Complexity

*   **AsyncStorage**: Tiny, simplest.
*   **MMKV**: Small native dep; minimal cognitive load.
*   **SQLite**: Native dep; tooling required; SQL knowledge.
*   **Realm**: Larger binary; powerful but adds modeling concepts and build steps.

***

## Quick code snippets

> *Note: Don’t put secrets directly here. Use Keychain/Keystore for tokens/passwords.*

### 1) AsyncStorage (small, non-sensitive values)

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const savePrefs = async () => {
  await AsyncStorage.setItem('theme', 'dark');
};

const loadPrefs = async () => {
  const theme = await AsyncStorage.getItem('theme'); // 'dark'
  return theme ?? 'light';
};
```

### 2) MMKV (fast KV; optional encryption)

```ts
import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({
  id: 'app',
  encryptionKey: '<<derive-from-keystore>>', // store/retrieve securely!
});

storage.set('theme', 'dark');
storage.set('biometricEnabled', true);

const theme = storage.getString('theme');
const bio = storage.getBoolean('biometricEnabled');
```

### 3) SQLite (structured, queryable)

```ts
import SQLite from 'react-native-sqlite-storage';

// open / create
const db = SQLite.openDatabase({ name: 'bank.db', location: 'default' });

// schema & insert
db.transaction(tx => {
  tx.executeSql(
    `CREATE TABLE IF NOT EXISTS txns (
      id TEXT PRIMARY KEY,
      amount REAL NOT NULL,
      postedAt INTEGER,
      category TEXT
    )`
  );

  tx.executeSql(
    `INSERT OR REPLACE INTO txns (id, amount, postedAt, category)
     VALUES (?, ?, ?, ?)`,
    ['T123', 1500.25, Date.now(), 'Utilities']
  );
});

// query with index usage
db.readTransaction(tx => {
  tx.executeSql(
    `SELECT * FROM txns WHERE postedAt >= ? ORDER BY postedAt DESC LIMIT 50`,
    [Date.now() - 30*24*60*60*1000],
    (_, res) => console.log(res.rows.raw())
  );
});
```

### 4) Realm (object DB, live queries, encryption)

```ts
import Realm from 'realm';

// define schema
class Transaction extends Realm.Object {
  _id!: string;
  amount!: number;
  postedAt!: Date;
  category?: string;

  static schema = {
    name: 'Transaction',
    primaryKey: '_id',
    properties: {
      _id: 'string',
      amount: 'double',
      postedAt: 'date',
      category: 'string?',
    },
  };
}

// open with encryption key (store key in Keystore/Keychain)
const realm = await Realm.open({
  path: 'bank.realm',
  schema: [Transaction],
  encryptionKey: getKeyFromSecureStore(), // 64-byte key
  schemaVersion: 2,
  onMigration: (oldRealm, newRealm) => {
    // migration logic when schema changes
  },
});

// write
realm.write(() => {
  realm.create('Transaction', {
    _id: 'T123',
    amount: 1500.25,
    postedAt: new Date(),
    category: 'Utilities',
  }, Realm.UpdateMode.Modified);
});

// reactive query
const txns = realm.objects<Transaction>('Transaction')
                  .filtered('postedAt >= $0', new Date(Date.now() - 30*24*60*60*1000))
                  .sorted('postedAt', true);

txns.addListener((collection, changes) => {
  // update UI on insert/delete/modify
});
```

***

## Common pitfalls & banking-grade recommendations

1.  **Don’t store secrets in AsyncStorage/MMKV/SQLite/Realm unencrypted.** Use **Keychain/Keystore** (with biometrics if needed).
2.  **Enable at-rest encryption** for any DB that may cache PII (Realm encryption or SQLCipher for SQLite).
3.  **Batch writes** and use **transactions** (SQLite/Realm) to avoid partial states.
4.  **Add indexes** for frequently filtered/sorted fields (SQLite) to avoid slow queries.
5.  **Plan migrations early** (version your schemas, keep migration tests).
6.  **Background sync**: write to local DB first, then sync; resolve conflicts server-side where possible; keep **lastSyncAt** in MMKV.
7.  **Size guardrails**: Avoid dumping large JSON blobs in key–value stores; prefer DB tables with normalized/denormalized shapes as appropriate.

***

## Quick “Which one should I say in interview?”

*   “For **config and fast app state** I use **MMKV**; for **structured transactional data** I pick **SQLite** with indexes and migrations; for **offline-first with complex domain models** and **encrypted at rest** I like **Realm**. **AsyncStorage** is fine for small non-sensitive flags but I avoid it for heavy lifting.”

  </details>

  <details><summary>64. Encrypt-at-rest strategies for mobile storage.</summary>

Here’s a clean, interview‑ready explanation of **Encrypt-at-Rest strategies for mobile storage**, tailored for **React Native in banking/financial apps**.

***

# **64. Encrypt‑at‑Rest Strategies for Mobile Storage (Banking‑Grade)**

Encrypt‑at‑rest means **protecting all locally stored data** (files, DBs, KV stores) so that if the device is compromised (stolen, rooted, jailbroken), data cannot be read without keys.

A banking app must treat **PII, tokens, financial data, cached transactions, and session info** as *sensitive* and protect them with proper encryption.

***

# **1. Platform-Level Encryption (Base Layer)**

### **iOS**

*   iOS provides **File Protection** automatically.
*   Data is encrypted using a hardware AES engine tied to the Secure Enclave.
*   Highest level: `NSFileProtectionComplete` (unlocked only after passcode entry).

### **Android**

*   Since Android 7+, **File-Based Encryption (FBE)**.
*   Hardware-backed keymaster protects keys.
*   However, *apps cannot rely only on OS-level encryption* → device may have weak/no passcode.

👉 **OS encryption alone is not enough for banking apps.**

***

# **2. Secure Key Storage (Critical Step)**

Never store encryption keys inside:

*   AsyncStorage
*   MMKV
*   SQLite / Realm
*   JS code
*   Redux state
*   Constants / env files

Instead, store keys in:

### **iOS Keychain**

*   Hardware-backed secure enclave.
*   Non-exportable keys.

### **Android Keystore**

*   Hardware-backed (**TEE / StrongBox**).
*   Keys cannot be extracted from device.

***

### **React Native example (Keychain):**

```ts
import * as Keychain from 'react-native-keychain';

await Keychain.setGenericPassword('db_key', '<<64-byte-random-key>>', {
  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
});
```

***

# **3. Encrypt-at-Rest per Storage Type**

## **a) MMKV Encryption**

MMKV supports AES encryption natively.

```ts
import { MMKV } from 'react-native-mmkv';

const encryptionKey = getKeyFromKeyStore(); // 16/32 bytes

export const storage = new MMKV({
  id: 'secure-storage',
  encryptionKey,
});
```

> Good for flags, non-PII cached fields, fast access.

***

## **b) SQLite Encryption (SQLCipher)**

SQLite itself is NOT encrypted.  
To use encrypted DB:

### **Use SQLCipher build** (React Native SQLite plugins support this version).

```ts
const db = SQLite.openDatabase({
  name: 'secure.db',
  key: dbKey,         // from keystore
  location: 'default'
});
```

> Best for structured transactional data, statements, caches.

***

## **c) Realm Encryption**

Realm supports built-in AES‑256 encryption.

```ts
const realm = await Realm.open({
  path: 'bank.realm',
  schema: [Transaction],
  encryptionKey: getKeyFromKeyStore(), // 64-byte key
});
```

> Great for complex offline-first data models with live queries.

***

## **d) File Encryption**

For files (PDF statements, receipts, downloaded documents):

### **iOS:**

```ts
writeFile(path, data, {
  NSFileProtectionKey: 'NSFileProtectionComplete'
});
```

### **Android:**

Use crypto APIs + Keystore key.

```ts
const cipher = Cipher.getInstance("AES/GCM/NoPadding");
cipher.init(Cipher.ENCRYPT_MODE, secretKeyFromKeystore);
```

> Never store financial PDFs unencrypted.

***

# **4. Encryption Strategies (Best Practices)**

## **A. App-Level Encryption (AES‑256‑GCM)**

Encrypt sensitive blobs manually:

```ts
const encrypted = AES.encrypt(text, appKey);
const decrypted = AES.decrypt(encrypted, appKey);
```

BUT → appKey **must** come from Keychain/Keystore.

***

## **B. Envelope Encryption**

Industry standard for banking.

1.  Generate a random **Data Encryption Key (DEK)** for DB/file.
2.  Store DEK **encrypted** using a **Key Encryption Key (KEK)** from Keychain/Keystore.
3.  At runtime:
    *   Retrieve KEK
    *   Decrypt DEK
    *   Use DEK to read/write data.

Reduces exposure and allows key rotation.

***

## **C. Key Rotation Strategy**

*   Maintain **key\_version** in storage.
*   On new app version:
    *   Decrypt with old key.
    *   Re-encrypt with new key.
    *   Update key version.

> Banking clients often ask: “How do you rotate encryption keys?”  
> → This answer nails it.

***

# **5. What to Encrypt in Banking Apps**

| Data                        | Should It Be Encrypted? | Where?                      |
| --------------------------- | ----------------------- | --------------------------- |
| Refresh tokens, auth tokens | **YES**                 | Keystore/Keychain only      |
| PII (name, account number…) | **YES**                 | SQLCipher / Realm encrypted |
| Transaction history         | **YES**                 | SQLCipher / Realm           |
| Feature flags / UI settings | No                      | MMKV / AsyncStorage         |
| PDF statements              | **YES**                 | App-level file encryption   |

***

# **6. Avoid These Common Mistakes**

❌ Storing tokens in AsyncStorage / MMKV directly  
❌ Hardcoding keys inside JS  
❌ Relying only on iOS/Android system encryption  
❌ Storing entire JSON blobs instead of structured encrypted storage  
❌ Not rotating keys  
❌ Leaving logs with sensitive information

***

# **Interview-Ready Summary (20 seconds)**

> “For encrypt-at-rest, I use platform Keychain/Keystore to store encryption keys.  
> For structured data I use SQLCipher or encrypted Realm.  
> For fast key-value I use encrypted MMKV.  
> For files like PDFs, I use AES‑256‑GCM with the key from Keychain.  
> I never store tokens or PII unencrypted, and I follow envelope encryption + key rotation strategy.”

  </details>

  <details><summary>65. How to design offline-first workflows with conflict resolution?</summary>

Here’s a **clean, interview‑ready, banking‑grade explanation** of **offline‑first workflows + conflict resolution**, with patterns, flowcharts, and code examples (Realm/SQLite).

***

# **65. How to Design Offline‑First Workflows with Conflict Resolution**

In banking apps, offline‑first design means:

✔ App works **fully without network**  
✔ User actions are **queue‑ed & replayed** later  
✔ Server remains the **source of truth**  
✔ Conflicts are resolved **deterministically**

Below is the exact design pattern expected in interviews.

***

# **1. Key Principles of Offline‑First Architecture**

### **A. Local-First Reads**

*   UI reads **only** from local DB (Realm/SQLite).
*   Network sync happens in background.

### **B. Command Queue for Writes**

When user performs an action offline (e.g., add payee, schedule transfer):

→ App creates a **pending operation** and stores it locally.

```json
{
  "id": "op123",
  "type": "ADD_PAYEE",
  "payload": { "name": "John", "account": "999001122" },
  "status": "pending"
}
```

### **C. Sync Engine**

A background service:

1.  Dequeues pending operations
2.  Calls API
3.  Updates local DB with server response
4.  Marks operation as resolved/failed

### **D. Server as Source of Truth**

Final state always matches server.

***

# **2. High-Level Offline Sync Flow**

            UI ⟷ Local DB (Realm/SQLite)
                     ⤊        ⤋
               Pending Operations Queue
                     ⤊        ⤋
                Sync Engine → API Server

***

# **3. Common Conflict Types**

| Conflict Type             | Example                     | Resolution                      |
| ------------------------- | --------------------------- | ------------------------------- |
| **Last Write Wins (LWW)** | Two devices update nickname | Use timestamp version           |
| **Field-level merge**     | User updates contact info   | Merge changed fields            |
| **Hard conflict**         | Transfer modified twice     | Server rejects; app shows error |
| **Server authoritative**  | Balance, statements         | Always overwrite local          |

In banking apps:  
➡ Most conflicts are **server-overwrites-local**, except editable user preferences.

***

# **4. Conflict Resolution Strategies**

## **Strategy A: Timestamp Versioning (LWW)**

Each record has:

*   `updatedAt`
*   `version`

When syncing:

*   Compare versions
*   Latest version wins

```ts
if (local.version > server.version) {
  sendLocalUpdate();
} else {
  overwriteLocal(serverData);
}
```

Used for:

*   Payee nicknames
*   User settings
*   Drafts

***

## **Strategy B: Operational Queue Replay (Event Sourcing)**

Each offline action is a **command**.

Example:

1.  Add Payee
2.  Update Payee
3.  Delete Payee

Commands are replayed **in order** on the server.

If server fails any operation—stop and show conflict UI.

***

## **Strategy C: Server Authoritative Overwrite**

For sensitive financial objects:

*   Balances
*   Statements
*   Transaction history

→ ALWAYS overwrite local.  
No merge.

***

## **Strategy D: Manual User Resolution**

Used rarely (e.g., standing instruction edit conflict).

Example:

> “Your changes conflict with updates made elsewhere.  
> Keep yours / Refresh with server?”

***

# **5. Recommended Architecture for Banking**

### **1. Local Database (Realm or SQLCipher SQLite)**

Stores:

*   Cached statements
*   Transaction history
*   Payees
*   Limits/preferences

### **2. Pending Operations Table**

Stores user actions waiting for sync.

### **3. Sync Worker**

Runs when:

*   App launches
*   Network restored
*   Timer interval (5–10 minutes)

### **4. Replay**

Executes commands in order.

***

# **6. Code Examples**

## **A. Storing Offline Operation**

```ts
realm.write(() => {
  realm.create('PendingOperation', {
    id: uuid.v4(),
    type: 'ADD_PAYEE',
    payload: JSON.stringify(payee),
    createdAt: new Date(),
    status: 'pending',
  });
});
```

***

## **B. Sync Engine Logic**

```ts
async function processQueue() {
  const ops = realm.objects('PendingOperation').filtered("status = 'pending'");

  for (const op of ops) {
    try {
      const res = await api.execute(op.type, JSON.parse(op.payload));

      realm.write(() => {
        applyServerChanges(res.data);   // update local DB
        op.status = 'done';
      });

    } catch (e) {
      // Retry policy
      if (op.retryCount > 3) {
        op.status = 'failed';
      } else {
        op.retryCount++;
      }
    }
  }
}
```

***

## **C. Version-Based Conflict Handling**

```ts
if (local.updatedAt > server.updatedAt) {
  // local newer → upload
  queueOperation('UPDATE', local);
} else {
  // server newer → replace local
  realm.write(() => {
    realm.create('Payee', server, Realm.UpdateMode.Modified);
  });
}
```

***

# **7. UX Patterns for Great Offline Experience**

✔ Show “Last synced 2 mins ago”  
✔ Grey out features that MUST be online (KYC, token refresh)  
✔ Indicate offline state with banner  
✔ Queue visual feedback for pending operations (spinner next to payee)  
✔ Retry automatically on next connection

***

# **8. Interview-Ready 20‑Second Summary**

> “For offline-first, I use a **local encrypted database** as the primary source of truth.  
> All user writes go into a **pending operations queue**, and a sync engine replays them when online.  
> Conflicts are resolved using **timestamp versioning**, **server authoritative data**, or **operational replay** depending on data sensitivity.  
> The server remains the final authority, and DB is updated after each successful sync.”

  </details>

  <details><summary>66. How to manage large lists or caches efficiently?</summary>

Here’s a **clear, interview‑ready**, React Native + banking-focused answer for:

# **66. How to Manage Large Lists or Caches Efficiently?**

Handling **large transaction lists**, **statement history**, or **searchable customer datasets** is a common challenge in banking apps. The goal is to keep UI fast, memory low, and scrolling buttery smooth.

Below are the exact techniques interviewers look for.

***

# ✅ **1. Use Virtualized Lists (FlatList / SectionList) Properly**

### Key optimizations:

```tsx
<FlatList
  data={transactions}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  initialNumToRender={12}
  maxToRenderPerBatch={10}
  windowSize={10}
  removeClippedSubviews={true} // huge gain on Android
  getItemLayout={getItemLayout} // improves scroll speed when row height fixed
/>
```

### Why this matters:

*   Only a **small window** of items is kept in memory.
*   Critical when dealing with **5k+ records** like transaction logs.

***

# ✅ **2. Paginated / Infinite Scrolling Instead of Full Loads**

Fetch transactions in batches (e.g., 20 or 50 at a time).

### Basic infinite scroll:

```tsx
<FlatList
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
/>
```

### Typical banking pattern:

*   Load 30 recent transactions.
*   When scrolling down, load older ones.
*   Cache older pages in local DB.

***

# ✅ **3. Cache in Local Database (Realm or SQLite)**

Never keep huge arrays in JS memory.

### Store list in DB:

*   SQLite/SQLCipher when using large relational sets.
*   Realm for reactive UI + fast reads.

Example query:

```ts
const txns = realm.objects('Transaction')
  .sorted('postedAt', true)
  .slice(offset, offset + limit);
```

Benefits:
✔ Fast indexed queries  
✔ Low memory  
✔ Easy pagination  
✔ Encrypted at rest (important for PII)

***

# ✅ **4. Use `getItemLayout` for Fixed Row Heights**

This avoids measuring row heights during scrolling.

```ts
const getItemLayout = (_, index) => ({
  length: 60,
  offset: 60 * index,
  index,
});
```

Massive performance boost for:

*   Transaction lists
*   Statements
*   Notifications

***

# ✅ **5. Memoize Row Components**

Prevent re-renders when scrolling.

```tsx
const TransactionRow = React.memo(({ item }) => {
  return <View><Text>{item.amount}</Text></View>;
});
```

Or use:

*   `useCallback` for renderItem
*   `React.memo` for row
*   `useMemo` for heavy formatting

***

# ✅ **6. Use Image/Asset Caching (FastImage etc.)**

If each row has icons/avatars:

*   Use **react-native-fast-image**
*   Enable memory + disk caching
*   Avoid base64 images completely

***

# ✅ **7. Normalized Data (Avoid Large JSON Blobs)**

Instead of storing a giant array:

❌

```json
{ "transactions": [ ...5000 items... ] }
```

✔  
Store items individually:

```ts
realm.create('Transaction', item, Realm.UpdateMode.Modified);
```

Then query only what UI needs.

***

# ✅ **8. Avoid Storing Lists in AsyncStorage/MMKV**

Why?

*   They load in **full** on app start.
*   They keep entire list in **JS memory**.
*   They are NOT designed for big datasets.

Use DB instead.

***

# ✅ **9. Implement Background Sync + Incremental Updates**

Don’t refresh the entire list each time.

Strategy:

1.  Fetch only delta changes (`since=timestamp`).
2.  Upsert into local DB.
3.  UI reflects changes instantly.

***

# ✅ **10. Use Key‑based Rendering**

Always use a **stable keyExtractor**:

```tsx
keyExtractor={(item) => item.id}
```

Never use:

```tsx
keyExtractor={(item, index) => index}
```

→ Causes re-renders & scroll jumps.

***

# 🚀 **Real Banking Example: Handling 20k+ Transactions**

Approach:

1.  Paginated fetch from server (50 per page).
2.  Store in SQLite/Realm with index on `postedAt`.
3.  UI uses FlatList with:
    *   memoized row
    *   10–12 initial render
    *   `windowSize: 10`
    *   fixed height + `getItemLayout`
4.  Infinite scroll + offline caching
5.  Delta sync on app open

Result → Smooth, memory efficient, stable.

***

# 🔥 **30‑Second Interview Summary**

> “For large lists, I never keep data in JS memory.  
> I use an encrypted local DB (Realm or SQLite) with paginated queries.  
> UI uses FlatList with virtualization, memoized rows, fixed heights, and windowSize tuning for smooth scrolling.  
> For network efficiency, I use incremental sync and lazy loading.  
> This ensures scalable caching for thousands of transactions with low memory usage.”

  </details>

  <details><summary>67. Securely caching user/session data.</summary>

Here’s a **sharp, interview‑ready**, React Native + banking‑grade answer for:

# **67. Securely Caching User / Session Data**

Banking apps must cache user/session data for performance and offline-first UX—but **security is non‑negotiable**. The goal is to:

✔ Protect tokens/PII  
✔ Support fast local reads  
✔ Prevent reverse‑engineering attacks  
✔ Handle logout/expiry properly  
✔ Resist rooted/jailbroken device access

Below is the answer hiring managers expect.

***

# ✅ **1. Principle: Never store secrets in JS‑accessible storage**

**Do NOT store sensitive data in:**

*   AsyncStorage ❌
*   MMKV (unencrypted) ❌
*   Redux Persist ❌
*   In‑memory JS variables (long‑lived) ❌
*   File system ❌

These are easy to extract on rooted/jailbroken devices.

**Only acceptable locations:**

*   **iOS Keychain**
*   **Android Keystore**
*   **Encrypted DB (SQLCipher/Realm)** (for non-token sensitive data)

***

# ✅ **2. What counts as sensitive?**

| Data                               | Securely Cache? | Store Where?               |
| ---------------------------------- | --------------- | -------------------------- |
| Access Token                       | YES             | Keychain/Keystore          |
| Refresh Token                      | YES             | Keychain/Keystore          |
| Device Binding Keys                | YES             | Keystore (hardware-backed) |
| User Profile                       | YES             | Encrypted DB               |
| PII (name, account, mobile, email) | YES             | Encrypted DB               |
| Preferences (theme, toggles)       | No              | MMKV/AsyncStorage          |
| Financial data (transactions)      | YES             | SQLCipher / Realm          |

***

# ✅ **3. Secure Token Storage (Keychain/Keystore)**

### React Native Secure Keychain storage:

```ts
import * as Keychain from 'react-native-keychain';

await Keychain.setGenericPassword("token", accessToken, {
  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
  storage: Keychain.STORAGE_TYPE.AES, // hardware backed
});
```

Retrieving:

```ts
const creds = await Keychain.getGenericPassword();
const accessToken = creds?.password;
```

> Tokens **must never touch** unencrypted storage.

***

# ✅ **3. Session Data Caching Architecture (Industry Standard)**

### **A. Tokens → Keychain/Keystore**

*   access token
*   refresh token
*   biometric keys
*   cryptographic signing keys

### **B. User profile / app data → Encrypted DB**

Realm (with encryption key) OR SQLCipher.

### **C. Light config → MMKV**

*   feature flags
*   app settings
*   booleans like “isOnboarded”

***

# ✅ **4. Encrypted DB for Cached User Data**

Banking apps typically store:

*   user profile
*   last 20–200 transactions
*   payees
*   limits
*   preferences

### **Realm encrypted storage example:**

```ts
const realm = await Realm.open({
  schema: [User, Transaction],
  encryptionKey: getKeyFromKeyStore(), // 64 bytes
});
```

### **Why encrypted DB?**

✔ Protects PII  
✔ Supports offline mode  
✔ Prevents local tampering  
✔ Enforces encryption-at-rest

***

# ✅ **5. Session Expiry & Auto‑Logout Strategy**

Secure caching includes **timely clearing**.

### Clear cache on:

*   logout
*   token refresh failure
*   app reinstall
*   device lock threshold exceeded
*   jailbreak/root detection
*   user triggered “clear data”

Example:

```ts
await Keychain.resetGenericPassword();
realm.write(() => realm.deleteAll());
storage.clearAll(); // MMKV
```

***

# ✅ **6. Protect Cached Data from Reverse Engineering**

### Techniques:

1.  **Hardware-backed keys** (Secure Enclave / TEE)
2.  **App Attestation** (device integrity: SafetyNet/DeviceCheck)
3.  **Root/Jailbreak detection**
4.  **Obfuscation / minification**
5.  **Prevent screenshots of sensitive screens**
6.  **Detect debuggers / instrumentation**

Banking-grade apps usually incorporate all of these.

***

# ✅ **7. Prevent Token Leakage in Memory**

Tokens can leak via logs or React state.

### Best practices:

*   Never log session data
*   Keep tokens **out of Redux**
*   Use short-lived in-memory refs
*   Clear tokens on app background
*   Use “Just-in-Time Retrieval” from Keychain for API calls

Example:

```ts
const token = await Keychain.getGenericPassword();
api.defaults.headers.Authorization = `Bearer ${token.password}`;
```

***

# ✅ **8. Best Patterns for Secure Caching**

### ✔ Envelope Encryption

*   Keystore key encrypts DB key
*   DB key encrypts data
*   Supports rotation

### ✔ Key Rotation

*   Store `key_version` in DB
*   Rotate keys on app updates

### ✔ Zero-copy token usage

*   Never clone tokens into multiple places
*   Always read straight from Keychain

***

# ⚡ **20-Second Interview Summary**

> “For secure caching, I store all tokens in Keychain/Keystore using hardware-backed encryption.  
> User profile and financial data go into an encrypted local DB (Realm/SQLCipher).  
> Only non-sensitive flags go into MMKV.  
> I implement cache clearing on logout, expiry, and device‑integrity failures, and prevent leakage through logs, Redux, or unencrypted storage.  
> This ensures fast offline access while keeping session data fully protected.”

  </details>

  <details><summary>68. How to detect rooted/jailbroken devices?</summary>

Here’s a **clean, interview‑ready** answer for:

# **68. How to Detect Rooted / Jailbroken Devices?**

(Banking‑grade, React Native friendly)

Detecting rooted/jailbroken devices is critical for banking apps because such devices can bypass OS security, intercept traffic, extract keys, or tamper with app storage.

Below are **the exact techniques interviewers expect**, plus code examples.

***

# ✅ **1. High‑Level Strategies**

### **A. Check for Root/Jailbreak Indicators**

Look for:

*   Presence of known root binaries
*   Suspicious system paths
*   Ability to write outside app sandbox
*   Dangerous system APIs working
*   Elevated permissions

### **B. Check for Tampering Tools**

*   Magisk
*   SuperSU
*   Cydia
*   Frida / objection
*   Xposed

### **C. Check File System Integrity**

*   Writable system partitions
*   Suspicious mount points
*   Unexpected symlinks

### **D. Use OS-Integrity APIs**

*   Google Play Integrity API (replacement for SafetyNet)
*   Apple DeviceCheck / App Attest

These give **strong signals** about device trust.

### **E. Combine Multiple Signals**

No single check is enough → use a **score-based approach**.

***

# ✅ **2. React Native Libraries**

### **Android + iOS**

✔ `react-native-jailbreak-detect`  
✔ `react-native-root-detection`

Typical usage:

```ts
import JailbreakDetector from "react-native-jailbreak-detector";

const isJailbroken = JailbreakDetector.isJailBroken();
const isTampered = JailbreakDetector.isTampered();

if (isJailbroken || isTampered) {
  // Block or restrict features
}
```

***

# ✅ **3. Common Jailbreak Detection Techniques (iOS)**

### 1️⃣ Check for jailbreak files

*   `/Applications/Cydia.app`
*   `/Library/MobileSubstrate/MobileSubstrate.dylib`
*   `/usr/sbin/sshd`

### 2️⃣ Check for writable system paths

Jailbroken devices allow writing to restricted directories.

### 3️⃣ Check for symbolic links

Example `/Applications` symlinked to `/private/var/stash`.

### 4️⃣ Check sandbox escape

Try writing outside app container → should fail.

### 5️⃣ Detect hooking frameworks

*   Cydia Substrate
*   Check if `dyld` loaded suspicious libraries

***

# ✅ **4. Common Root Detection Techniques (Android)**

### 1️⃣ Check for root binaries

*   `su`
*   `busybox`
*   `magisk` path

### 2️⃣ Execute `su` binary

If executable → rooted.

```java
Runtime.getRuntime().exec("su");
```

### 3️⃣ Check dangerous system properties

*   `ro.debuggable=1`
*   `ro.secure=0`

### 4️⃣ Check writable system directories

*   `/system`
*   `/vendor`

### 5️⃣ Check for tamper frameworks

*   Magisk
*   Xposed
*   EdXposed

### 6️⃣ Check SELinux status

*   Enforcing vs Permissive

***

# ✅ **5. Device Integrity APIs (Strongest Security)**

### **A. Google Play Integrity API (Android)**

*   Replaces SafetyNet Attestation
*   Checks:
    *   Device integrity
    *   Bootloader unlock
    *   Root hiding
    *   Emulator detection

### **B. Apple DeviceCheck / App Attest (iOS)**

Provides:

*   Jailbreak-resistant signals
*   Device integrity attestations

> **Best practice:** Use Play Integrity + App Attest + local checks.

***

# ✅ **6. Banking UX Strategy**

When rooted/jailbroken detected:

✔ Show warning  
✔ Restrict high‑risk features:

*   Payments
*   Add payee
*   Change password

✔ Many banks block the app completely  
→ “Your device does not meet security requirements.”

***

# ✅ **7. React Native Example (Combined Check)**

```ts
import RootCheck from 'react-native-root-detection';
import * as DeviceCheck from './deviceAttestation';

export async function isDeviceCompromised() {
  const rooted = await RootCheck.isDeviceRooted();
  const emulator = await RootCheck.isEmulator();
  const tampered = await RootCheck.isHookDetected();

  const integrity = await DeviceCheck.verifyIntegrity(); // server-side

  return rooted || emulator || tampered || !integrity;
}
```

***

# ⚡ **20‑Second Interview Summary**

> “I detect rooted/jailbroken devices by combining file‑system checks, permission checks, root binary detection, hooking detection, and sandbox escape attempts.  
> For strong security, I also use Play Integrity API on Android and App Attest on iOS.  
> Banking apps then restrict or block access if the device fails integrity checks.”

  </details>

</details>

***

### **8) Security, Compliance & Privacy (Financial Apps) (14 questions)**

<details>
  <summary>Security, Compliance &amp; Privacy (14)</summary>

  <details><summary>69. Overview of OWASP MASVS for secure mobile apps.</summary>

Here’s a **clean, interview‑ready overview** of **OWASP MASVS** tailored for **React Native + financial/banking apps**. Short, crisp, and perfect for quick prep.

***

# **69. Overview of OWASP MASVS (Mobile Application Security Verification Standard)**

**OWASP MASVS** is the **global security standard** for building and testing secure mobile apps.  
For banks/financial clients, MASVS is typically used as:

*   **Security checklist** for mobile development teams
*   **Benchmark** for pen‑testing & security audits
*   **Compliance requirement** (PCI DSS, RBI, FFIEC, ISO 27001, SOC2)

MASVS defines **security requirements across multiple levels** for both **mobile app architecture** and **defense‑in‑depth protections**.

***

# ✅ **MASVS Category Overview (Interview Shorthand)**

OWASP MASVS is divided into **8 categories**, each focusing on a different aspect of mobile security.

Below is the **developer-friendly summary**:

***

## **1. MASVS-STORAGE**

### *Secure Data Storage*

Ensures sensitive data is **never stored unencrypted** and storage is protected from extraction.

Includes:

*   Keychain (iOS) / Keystore (Android)
*   AES-encrypted DB (SQLCipher/Realm)
*   No PII in logs
*   No tokens in AsyncStorage/MMKV

👉 Banking apps MUST comply.

***

## **2. MASVS-CRYPTO**

### *Secure Cryptography*

Rules for encryption algorithms, key management, and avoiding custom crypto.

Includes:

*   AES‑256‑GCM / RSA‑2048+ / ECC
*   Hardware-backed keys (TEE/SE)
*   Proper random number generation
*   Key rotation

👉 Critical for storing session tokens, DEK/KEK, PII.

***

## **3. MASVS-AUTH**

### *Authentication & Session Management*

Protecting login, logout, tokens, and identity.

Includes:

*   Strong session lifecycle
*   Token expiration + refresh flow
*   Biometric auth (Keychain/Keystore-backed)
*   Device binding

👉 Required in banking apps for MFA and secure sessions.

***

## **4. MASVS-NETWORK**

### *Secure Network Communication*

Ensures data-in-transit protection.

Includes:

*   TLS 1.2+ only
*   Certificate pinning
*   No sending PII in URLs
*   Preventing MITM attacks

👉 Mandatory for financial services.

***

## **5. MASVS-PLATFORM**

### *Interaction with OS & Platform Security Features*

Ensures app respects platform security.

Includes:

*   Permissions hygiene
*   Safe WebView usage
*   No exporting sensitive activities
*   Secure clipboard handling

👉 Banks must whitelist minimal permissions.

***

## **6. MASVS-CODE**

### *Secure Coding & Hardening*

Protect apps from tampering & reverse engineering.

Includes:

*   Code obfuscation
*   Root/jailbreak detection
*   Anti-debugging
*   Prevent screen recording

👉 Protects API keys, logic, and business flows.

***

## **7. MASVS-RESILIENCE**

### *Anti-Tampering & Runtime Protection*

Ensures app resists hooking, instrumentation, and modifications.

Includes:

*   Detect Frida/Magisk/Xposed
*   Detect repackaging
*   Integrity checks
*   Emulator detection

👉 High‑risk mobile banking features MUST pass this.

***

## **8. MASVS-ARCHITECTURE**

### *Secure Application Architecture*

Ensures clean separation of concerns and threat modeling.

Includes:

*   Architectural threat modeling
*   Data flow mapping
*   Least privilege design
*   Secure API contracts

👉 Mandatory for enterprise compliance.

***

# 🎯 **MASVS Levels (MSTG-aligned)**

MASVS defines **3 target levels**:

| Level                      | Meaning                                   |
| -------------------------- | ----------------------------------------- |
| **L1 – Standard Security** | baseline security for any mobile app      |
| **L2 – Defense-in-Depth**  | higher protection for sensitive data apps |
| **R – Resilience**         | anti-tampering + anti-reversing           |

For banking apps → **L2 + R** is REQUIRED.

***

# 🔥 **How MASVS Applies to React Native Banking Apps**

| Area             | What to follow                                          |
| ---------------- | ------------------------------------------------------- |
| Storage          | SQLCipher/Realm encryption + Keystore/Keychain key mgmt |
| Tokens           | Never in AsyncStorage/MMKV; always hardware-backed      |
| Network          | TLS pinning (ssl‑pinning library), secure cookies       |
| Crypto           | Do not implement custom AES; use native crypto          |
| Code Hardening   | Obfuscate native + JS code; enable ProGuard/Hermes      |
| Device Integrity | Root/jailbreak detection + Play Integrity/App Attest    |
| Privacy          | No PII in logs/screenshots/clipboard                    |
| Resilience       | Detect Frida/Hooking frameworks                         |

***

# ⚡ **30‑Second Interview Summary**

> “OWASP MASVS is the global standard for secure mobile development.  
> It defines requirements across secure storage, crypto, authentication, networking, secure coding, platform usage, app architecture, and anti-tampering.  
> For banking, we target **MASVS‑L2 + MASVS‑R**, meaning strong encryption, secure session tokens, TLS pinning, Keychain/Keystore usage, jailbreak/root detection, and runtime protection against instrumentation.”

  </details>

  <details><summary>70. PCI-DSS rules for financial mobile apps.</summary>

Here is a **clear, interview‑ready summary of PCI‑DSS requirements for financial mobile apps**, aligned to **PCI‑DSS v4.0.1 (2024–2025)** and using insights from verified sources.

***

# **70. PCI‑DSS Rules for Financial Mobile Apps (Developer‑Friendly Overview)**

PCI‑DSS (Payment Card Industry Data Security Standard) defines **global rules for handling cardholder data** during **processing, transmission, and storage**.  
For mobile apps, PCI‑DSS applies whenever the app **touches** credit/debit card data—even briefly.

Below are the **key PCI‑DSS v4.0.1 requirements** relevant to React Native/banking apps.

***

# ✅ **1. Scope Minimization — Don’t Store PAN in App**

**Primary Account Number (PAN) and Sensitive Authentication Data must NEVER be stored on the mobile device.**  
✔ Use **early tokenization**  
✔ Avoid passing raw PAN through the app  
✔ Use PCI‑compliant SDKs (Stripe, Adyen, Braintree, etc.)

[\[dev.to\]](https://dev.to/vaibhav_shakya_e6b352bfc4/pci-dss-compliance-checklist-for-android-apps-1m4i)

***

# ✅ **2. Strong Data Encryption (In‑Transit + At‑Rest)**

### **In Transit**

*   Must use **TLS 1.2+ (prefer TLS 1.3)**
*   No cleartext requests
*   Implement **certificate pinning**

### **At Rest**

*   Use **AES‑256** for any sensitive data the app must hold temporarily.
*   Apply strong key management (Keychain/Keystore).

[\[capgo.app\]](https://capgo.app/blog/pci-dss-compliance-for-mobile-apps-key-requirements/)

***

# ✅ **3. Secure Cryptographic Key Management**

PCI requires:

*   **Key rotation**
*   Secure key storage (hardware-backed only)
*   Never hardcode crypto keys
*   Avoid custom encryption algorithms

✔ Use **Android Keystore** / **iOS Secure Enclave** for key isolation.

[\[capgo.app\]](https://capgo.app/blog/pci-dss-compliance-for-mobile-apps-key-requirements/)

***

# ✅ **4. Authentication & Session Security (Req. 8)**

PCI‑DSS v4.0.1 adds stricter authentication rules:

*   **Mandatory MFA** for accessing cardholder data
*   **Stronger passwords (12+ chars)**
*   Protect against phishing
*   Biometric authentication must have a safe fallback
*   Secure session lifecycle (auto‑expiry, token invalidation)

[\[appaudix.com\]](https://www.appaudix.com/blog/pci-dss-v4-mobile-apps-changes)

***

# ✅ **5. No Sensitive Data in Logs / Caches**

Apps must not leak card data through:

*   Logs
*   Analytics
*   Crash reports
*   Screenshots
*   Clipboard
*   Debugging output

Typical rules:

*   Mask PAN (only show last 4 digits)
*   Disable screenshots on sensitive screens
*   Remove PII from logs

[\[dev.to\]](https://dev.to/vaibhav_shakya_e6b352bfc4/pci-dss-compliance-checklist-for-android-apps-1m4i)

***

# ✅ **6. Code Security (Req. 6) — Secure SDLC**

PCI‑DSS now mandates:

### **A. Automated Code Reviews**

*   Static Analysis (SAST)
*   Dynamic Analysis (DAST)
*   Mobile app testing aligned with MASVS/MSTG

### **B. SCA (Software Composition Analysis)**

*   Track vulnerable third‑party libraries
*   Maintain SDK inventory

### **C. Secure-by-design development**

[\[appaudix.com\]](https://www.appaudix.com/blog/pci-dss-v4-mobile-apps-changes)

***

# ✅ **7. Runtime Protection & Integrity (Req. 11.6.1)**

Mobile apps must detect:

*   App tampering
*   Repackaging
*   Unauthorized code changes
*   Hooking frameworks (Frida/Magisk)
*   Jailbroken/rooted devices

This enables blocking high‑risk devices and preventing MITM or dynamic analysis.

[\[appaudix.com\]](https://www.appaudix.com/blog/pci-dss-v4-mobile-apps-changes)

***

# ✅ **8. Network Security — Enforce Strong TLS**

PCI‑DSS requires:

*   TLS 1.2+ only
*   HSTS enforcement
*   Certificate pinning
*   Rejecting invalid/expired certs
*   No plaintext HTTP traffic

[\[dev.to\]](https://dev.to/vaibhav_shakya_e6b352bfc4/pci-dss-compliance-checklist-for-android-apps-1m4i)

***

# ✅ **9. Targeted Risk Analysis (New in v4.0.1)**

Organizations must perform **Targeted Risk Analysis** for:

*   Frequency of security activities
*   Custom code
*   Tech-specific mobile behaviors

React Native apps must document:

*   Threat model
*   Risk ratings
*   Mobile architecture risks
*   Third‑party SDK threats

[\[appaudix.com\]](https://www.appaudix.com/blog/pci-dss-v4-mobile-apps-changes)

***

# ✅ **10. Strong Logging & Monitoring**

PCI requires:

*   Centralized audit logs
*   Tamper‑resistant logging
*   Continuous compliance monitoring
*   Alerting for suspicious activity

[\[appaudix.com\]](https://www.appaudix.com/blog/pci-dss-v4-mobile-apps-changes)

***

# ⚡ **Developer‑Friendly Summary (30 seconds)**

> “For PCI‑DSS in mobile apps, I ensure the app never stores PAN or sensitive data.  
> All transmitted data uses TLS 1.3 with certificate pinning, and any local-sensitive info uses AES‑256 with keys from the Keychain/Keystore.  
> We implement MFA, secure session handling, SAST/DAST/SCA, and runtime protection (root/jailbreak detection + tamper detection).  
> No card data goes into logs or screenshots.  
> Our architecture and risk analysis follow PCI‑DSS v4.0.1 requirements.”

  </details>

  <details><summary>71. Threat modeling basics (STRIDE) for RN banking apps.</summary>

Here’s a **clean, interview‑ready explanation** of **Threat Modeling Basics (STRIDE)** specifically tailored for **React Native banking apps**.  
No need for a web search here — this is conceptual content.

***

# **71. Threat Modeling Basics (STRIDE) for React Native Banking Apps**

**Threat modeling** helps identify potential security threats early in design so you can build secure mobile banking features proactively.

The most widely used model is **STRIDE**, created by Microsoft. It classifies threats into **6 categories**:

> **S**poofing  
> **T**ampering  
> **R**epudiation  
> **I**nformation Disclosure  
> **D**enial of Service  
> **E**levation of Privilege

Below is the **banking‑focused** explanation of each with React Native examples.

***

# ✅ **S – Spoofing**

**Attacker pretends to be someone else (user/device/server).**

### Examples in RN banking apps:

*   Fake login using stolen tokens
*   Intercepting biometrics fallback
*   Spoofing device ID / push token
*   Man‑in‑the-middle pretending to be your server (no TLS pinning)

### Mitigations:

*   MFA + biometric auth
*   Access tokens stored ONLY in Keychain/Keystore
*   TLS + certificate pinning
*   Backend revalidates device binding (e.g., device fingerprint)

***

# ✅ **T – Tampering**

**Unauthorized modification of code, data, or network traffic.**

### Examples:

*   Modified APK/IPA
*   React Native JS bundle tampered
*   SQLite/Realm DB tampered
*   API requests altered before sending
*   Over-the-air updates swapped

### Mitigations:

*   Code obfuscation (JS + native)
*   Runtime integrity checks (detect tampering)
*   Encrypted DB (SQLCipher/Realm encryption)
*   Hash verification of JS bundle
*   Detect Frida/Magisk/Xposed instrumentations

***

# ✅ **R – Repudiation**

**User denies performing an action (no proof of action).**

### Examples:

*   User says “I didn’t trigger this fund transfer.”
*   Logs manipulated on rooted devices
*   No audit trail for risky operations

### Mitigations:

*   Server-side audit logs with timestamp + device ID
*   Signed requests (HMAC with device key)
*   Immutable logs on backend
*   Disable client‑side trust for critical actions

***

# ✅ **I – Information Disclosure**

**Leakage of sensitive information.**

### Examples:

*   PAN/PII stored in AsyncStorage/MMKV
*   Sensitive info in logs, crash reports
*   Screenshots of OTP/payment screen
*   Intercepted traffic without TLS pinning

### Mitigations:

*   Encrypt at rest (AES‑256 DB encryption)
*   No PII in logs/snapshots
*   Disable screenshots on sensitive screens
*   TLS 1.2+/1.3 + cert pinning
*   Mask card numbers (show only last 4 digits)

***

# ✅ **D – Denial of Service (DoS)**

**Blocking the app or backend from functioning.**

### Examples:

*   Flooding API endpoints with requests
*   Large payloads causing memory crash
*   Repeated invalid login attempts
*   Local storage corruption causing app crash

### Mitigations:

*   Rate limiting at API gateway
*   Input validation (size limits)
*   Timeout thresholds
*   Store data in resilient DB (Realm)
*   Circuit breaker for API failures

***

# ✅ **E – Elevation of Privilege**

**Attacker gains higher permissions than allowed.**

### Examples:

*   Root/jailbreak → access app sandbox
*   Exploiting insecure deep links
*   Injecting JS into WebViews
*   Bypassing biometric screen to get tokens

### Mitigations:

*   Root/Jailbreak detection
*   Protect deep links with authentication
*   Disable JS in WebView unless required
*   Keystore/Secure Enclave for key access
*   Enforce re-authentication for sensitive actions

***

# 🔥 **STRIDE Applied to a React Native Banking App Architecture**

| STRIDE Area     | Typical Threat     | RN Mitigation                        |
| --------------- | ------------------ | ------------------------------------ |
| Spoofing        | Stolen tokens      | Hardware key storage + re-auth       |
| Tampering       | Modified JS bundle | Bundle signature checks, obfuscation |
| Repudiation     | No audit logs      | Server-side logs + signed requests   |
| Info Disclosure | PII in storage     | Encrypted DB + no debug logs         |
| DoS             | API flooding       | Server rate limits + validation      |
| EoP             | Rooting bypass     | Root detection + privilege checks    |

***

# 🎯 **How to Present in an Interview (20 seconds)**

> “For threat modeling I use STRIDE.  
> I map each banking feature to potential threats: spoofing for authentication, tampering for JS bundle/DB, data leakage for PII, DoS for APIs, and privilege escalation on rooted devices.  
> Then I apply RN controls like Keychain/Keystore, DB encryption, TLS pinning, root detection, code obfuscation, and strict session handling.”

  </details>

  <details><summary>72. Root/jailbreak detection techniques.</summary>

Here is a **clean, interview‑ready answer** for:

# **72. Root/Jailbreak Detection Techniques (React Native Banking Apps)**

*(Short, crisp, and aligned to real banking‑grade mobile security practices)*

This is a **conceptual security topic**, so no external sourcing is required.

***

# ✅ **High‑Level Goal**

Detect whether the device has been **rooted (Android)** or **jailbroken (iOS)** to prevent:

*   Keychain/Keystore extraction
*   SSL‑MITM attacks
*   File-system tampering
*   API hooking (Frida, Magisk, Xposed)
*   Code injection & sandbox escape

Banks typically **block** or **restrict** features on compromised devices.

***

# **A. iOS Jailbreak Detection Techniques**

### **1. Check for existence of jailbreak files**

Common jailbreak artifacts:

*   `/Applications/Cydia.app`
*   `/Library/MobileSubstrate/MobileSubstrate.dylib`
*   `/usr/sbin/sshd`
*   `/bin/bash`

```js
RNJailbreak.isJailbroken();
```

***

### **2. Check sandbox escape**

Jailbroken devices allow writes to restricted directories.

```swift
try "test".write(toFile: "/private/jb.txt", atomically: true, encoding: .utf8)
```

If write succeeds → jailbroken.

***

### **3. Check for suspicious symbolic links**

Example:

*   `/Applications` → symlink to `/private/var/stash/...`

***

### **4. Detect loaded dynamic libraries (dyld)**

Look for:

*   Cydia Substrate
*   Substitute
*   FridaGadget.dylib

***

### **5. Check for ability to call restricted syscalls**

E.g., `fork()` on non-jailbroken devices should fail.

***

# **B. Android Root Detection Techniques**

### **1. Check for su binary & busybox**

Search common root paths:

*   `/system/bin/su`
*   `/system/xbin/su`
*   `/sbin/su`
*   `magisk` module paths

```java
new File("/system/bin/su").exists()
```

***

### **2. Try executing su**

If command executes successfully → device is rooted.

```java
Runtime.getRuntime().exec("su");
```

***

### **3. Check system properties & permissions**

*   `ro.debuggable = 1`
*   `ro.secure = 0`
*   SELinux in **permissive** mode

***

### **4. Check writable system partitions**

Rooted devices often have:

*   `/system` mounted as read-write
*   Additional partitions exposed

***

### **5. Detect root management apps**

Identify:

*   Magisk Manager
*   SuperSU
*   Kingroot

***

### **6. Detect hooking frameworks**

Look for:

*   Xposed
*   EdXposed
*   LSPosed
*   Frida (running processes, open ports)

***

# **C. Cross‑Platform Runtime Tampering Detection**

### **1. Detect Frida dynamic instrumentation**

*   Check for Frida server port (27042)
*   Detect FridaGadget library
*   Detect suspicious process names
*   Monitor ptrace/anti-debug

### **2. Anti-debugging**

*   `isDebuggerConnected()`
*   ptrace guard on native side
*   Detect breakpoint traps

***

# **D. Integrity & Repackaging Detection**

### **1. Verify app signature**

Compare signing certificate with expected hash.

### **2. Validate JS bundle hash (React Native)**

On app launch:

*   Compute SHA‑256 of packaged JS bundle
*   Compare with expected hash embedded in native code

Mismatch → app tampered.

***

# **E. React Native Libraries for Fast Implementation**

### Popular production-ready libs:

*   **react-native-root-detection**
*   **react-native-jailbreak-detect**
*   **react-native-device-info** (emulator detection)

Typical usage:

```ts
import RootCheck from 'react-native-root-detection';

const compromised = await RootCheck.isDeviceRooted();
if (compromised) {
  // block or restrict features
}
```

***

# **F. Banking‑Grade Response Strategy**

When compromised device is detected:

✔ Show security warning  
✔ Allow only low‑risk screens (e.g., view offers)  
✔ Block sensitive flows (login, payments, fund transfer)  
✔ Disable session tokens  
✔ Report event to fraud engine

Many banks fully **block** app usage.

***

# **G. 20‑Second Interview Summary**

> “I detect rooted/jailbroken devices using multiple checks:  
> file-system anomalies, su binaries, writable system paths, dynamic library checks, sandbox escape attempts, and detection of tools like Magisk, Xposed, or Frida.  
> I also verify app integrity with signature checks and JS bundle hashing.  
> If the device is compromised, the app blocks high‑risk operations or denies access completely.”

  </details>

  <details><summary>73. Anti-tamper measures (anti-hooking, anti-debug).</summary>
Here is a **crisp, interview‑ready**, banking‑grade answer for:

# **73. Anti‑Tamper Measures (Anti‑Hooking, Anti‑Debugging) for React Native Banking Apps**

These measures prevent attackers from **modifying**, **debugging**, or **hooking** your mobile app using tools like **Frida, Magisk, Xposed, Ghidra, objection**, or dynamic instrumentation.

This is conceptual mobile security content, so no external sources are required.

***

# ✅ **A. Anti‑Debugging Techniques**

### **1. Detect Debugger Attachment**

Native layer (Java/Obj‑C/C++):

```java
if (Debug.isDebuggerConnected()) {
    // Take action: exit or restrict
}
```

iOS:

```objc
if (ptrace(PT_DENY_ATTACH, 0, 0, 0) != 0) {
   // debugger detected
}
```

**RN Strategy:**  
Call these via native modules on app launch + periodically in background threads.

***

### **2. ptrace Anti‑Debug Hook**

Prevents debuggers like LLDB/Android Studio from attaching.

### **3. Detect Breakpoints & Traps**

Scan for:

*   SIGTRAP exceptions
*   Suspicious syscalls
*   Abnormal thread states

### **4. Disable developer options (Android)**

Check:

*   `adb_enabled`
*   USB debugging

If enabled → restrict payments.

***

# ✅ **B. Anti‑Hooking Techniques**

Most critical for banking apps because attackers use **Frida**, **Xposed**, **Magisk**, **LSPosed**, etc.

### **1. Detect Hooking Frameworks**

#### **Detect Frida**

*   Scan for Frida server ports: `27042`, `27043`
*   Look for processes:
    *   `frida-server`
    *   `re.frida.server`
*   Check loaded libs for:
    *   `frida-gadget`
    *   `libfrida.so`

#### **Detect Xposed / LSPosed**

Check for classes in memory:

```java
Class.forName("de.robv.android.xposed.XposedBridge");
```

#### **Detect Magisk**

Check for files:

*   `/sbin/.magisk`
*   `/data/adb/magisk`

***

### **2. Detect Suspicious Memory Maps**

Hooking frameworks inject `.so` or `.dylib` into process memory.

Check `/proc/self/maps` for:

*   unexpected shared libs
*   writable + executable segments (W+X)

***

### **3. Anti‑Instrumentation**

Prevent dynamic instrumentation by:

*   Sealing methods (Native)
*   Using inline encryption
*   Making API calls time‑based so hooking slows them down
*   Obfuscating critical code paths

***

# ✅ **C. Anti‑Tamper / App Integrity Checks**

### **1. Verify App Signature**

Compare app signing certificate with expected SHA‑256.

If tampered APK/IPA installed → block app.

***

### **2. Verify React Native JS Bundle Integrity**

On app startup:

*   Compute SHA‑256 hash of `index.bundle`
*   Compare with hardcoded expected hash in native code

If mismatch → terminate.

```ts
const actual = computeBundleHash();
if (actual !== expected) exitApp();
```

***

### **3. Resource Integrity**

Check:

*   Manifest tampering
*   Modified Info.plist
*   Replaced icons/splash screens
*   Modified native .so/.dll

***

# ✅ **D. Root/Jailbreak Detection (Foundation for Anti‑Tamper)**

Hooking + debugging succeed mostly on compromised devices.

Use:

*   Checks for Cydia/Substrate (iOS)
*   su/busybox/magisk (Android)
*   Sandbox escape tests
*   Writable system directories
*   Emulator detection

If compromised → block login/payment flows.

***

# ✅ **E. Obfuscation & Code Hardening**

### **1. Obfuscate Java/Kotlin/Obj‑C**

*   ProGuard/R8 for Android
*   iOS symbol stripping

### **2. Obfuscate JavaScript Bundle**

Use:

*   **react-native-obfuscating-transformer**
*   String encryption
*   Dead‑code insertion

### **3. Disable JS Remote Debugger**

Prevent exposing JS via WebSocket port 8081.

***

# ✅ **F. Anti‑Reverse Engineering**

Includes:

*   String encryption (hide secrets & API endpoints)
*   White‑box cryptography (for high‑sensitivity keys)
*   Native code wrappers for sensitive logic
*   Packing apps with hardened SDKs (Appdome, Zimperium, ProGuard Hardened mode)

***

# ✅ **G. React Native Implementation Strategy**

### Combine these:

*   **Native anti‑debugging hooks**
*   **Native integrity checks**
*   **JS bundle hash verification**
*   **Root/jailbreak checks**
*   **Frida/hooking detection**
*   **Obfuscation**
*   **Certificate pinning**

Add a **security heartbeat loop**:

```ts
setInterval(() => {
   if (deviceCompromised()) {
      logoutUser();
      showSecurityWarning();
   }
}, 5000);
```

***

# 🔥 **20‑Second Interview Summary**

> “For anti‑tamper security, I combine anti‑debugging (ptrace, debugger detection), anti‑hooking (Frida/Xposed/Magisk detection), and integrity checks (APK/IPA signature + JS bundle hash).  
> I enforce root/jailbreak detection, obfuscate both native + JS code, and periodically run device integrity checks.  
> If tampering or hooking is detected, the app blocks sensitive operations or fully locks down.”

  </details>

  <details><summary>74. Secure screenshot prevention (FLAG_SECURE).</summary>

Here’s a **short, crisp, interview‑ready answer** for:

# **74. Secure Screenshot Prevention (FLAG\_SECURE) in React Native Banking Apps**

Mobile banking apps must prevent sensitive screens—like OTP, account details, balances, statements, and card info—from appearing in:

*   Screenshots
*   Screen recordings
*   Recent‑apps thumbnails
*   Casting/screen sharing

The main mechanism for this is **Android FLAG\_SECURE** and **iOS screen capture detection**.

Below is the exact explanation interviewers expect.

***

# ✅ **A. Android — Using `FLAG_SECURE` (Most Important)**

Android provides a simple native flag that **completely blocks screenshots & screen recording** for an Activity.

### **Native Implementation (Java/Kotlin)**

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    window.setFlags(
        WindowManager.LayoutParams.FLAG_SECURE,
        WindowManager.LayoutParams.FLAG_SECURE
    )
}
```

### **React Native Implementation**

Use a library like **react-native-flag-secure-android** or call native modules.

```ts
import FlagSecure from 'react-native-flag-secure-android';

// Enable
FlagSecure.activate();

// Disable (rarely needed)
FlagSecure.deactivate();
```

### What it protects:

✔ Screenshots  
✔ Screen recording  
✔ Multitasking view preview (Recents screen)

### What attackers see:

*   A **blank black screen** or hidden content instead of app UI.

***

# ✅ **B. iOS — No `FLAG_SECURE`, But We Use Screen Capture Detection**

iOS does **not** allow apps to block screenshots outright.

Instead, we can detect screen capture and react:

### **1. Detect screenshot events**

```swift
NotificationCenter.default.addObserver(
    forName: UIApplication.userDidTakeScreenshotNotification,
    object: nil,
    queue: .main
) { _ in
    // Blur or hide sensitive content
}
```

### **2. Detect screen recording**

```swift
if UIScreen.main.isCaptured {
    // Hide sensitive screen or blur
}
```

### **3. Blur sensitive screens**

Show a placeholder/blurred overlay:

```tsx
const isCaptured = useIsScreenCaptured(); // custom hook bridging native
return <>{isCaptured ? <BlurView /> : <ActualContent />}</>;
```

### Outcome on iOS:

✔ Screenshots show a blurred/blank overlay  
✔ Screen recording shows protected screen blurred

***

# ✅ **C. Best Practices for Banking Apps**

### **1. Apply protection only on sensitive screens**

*   Login/OTP
*   Account summary
*   Card details
*   Payment confirmation
*   Statements/PDF previews

### **2. Prevent preview in app switcher**

`FLAG_SECURE` fully hides it on Android.  
On iOS, blur the screen in `AppState` background:

```ts
AppState.addEventListener("change", state => {
  if (state === "background") showBlur();
  else hideBlur();
});
```

### **3. Prevent sensitive data snapshot in app linking**

Ensure:

*   No sensitive params in URLs
*   Remove preview images in universal links handoff

***

# ✅ **D. Banking‑Grade Security Requirements**

Banks often require:

✔ Mandatory `FLAG_SECURE` across the entire app (Android)  
✔ Blurred recent‑apps preview (iOS)  
✔ Screenshot detection for risk analytics  
✔ Disable screen casting (e.g., Google Cast) on sensitive screens  
✔ Masking sensitive views with overlays/blur

***

# 🎯 **20‑Second Interview Summary**

> “On Android, I enable `FLAG_SECURE` to block screenshots, screen recording, and recent‑apps previews.  
> On iOS, since screenshots can’t be blocked, I detect screen capture and dynamically blur or hide sensitive UI.  
> I wrap these into a reusable security component and apply them to OTP, account details, and payment screens for banking‑grade compliance.”

  </details>

  <details><summary>75. Certificate pinning best practices.</summary>

Here’s a **clean, interview‑ready, banking‑grade answer** for:

# **75. Certificate Pinning – Best Practices (React Native Banking Apps)**

*(Fully conceptual — no external sources required)*

Certificate pinning prevents **MITM attacks** by ensuring your app only trusts your **expected server certificate** or **public key**, not just any certificate signed by a trusted CA.

Below is the **short, crisp, senior‑level answer** expected in financial/banking interviews.

***

# ✅ **1. Prefer Public Key Pinning (Not Certificate Pinning)**

Because certificates **expire**, **renew**, and **rotate**, pinning the exact certificate can easily break the app.

Public key pinning survives:

*   Cert renewals
*   Cert re-issuances
*   Intermediate CA rotations

### Example:

Pin the SHA‑256 hash of the server's public key, not the cert.

***

# ✅ **2. Use Multiple Pins (Primary + Backup)**

To avoid app outages during certificate rotation:

*   **1 primary pin** → for current key
*   **1 or 2 backup pins** → for upcoming keys

If the server rotates certificates, app still works.

***

# ✅ **3. Rotate Pins Proactively (Before Expiry)**

Banks rotate certificates *every 6–12 months*.  
Your app should have:

*   A configurable pin list
*   Optional remote pin update (signed by backend)
*   Forced app update if pin set becomes outdated

***

# ✅ **4. Pin At the Highest Layer (Networking Layer)**

In React Native, pin at the native layer because JS is bypassable.

### Options:

*   **react-native-ssl-pinning**
*   **axios + rn-fetch-blob** with pinning
*   Native (OkHttp, NSURLSession) pinning inside modules

**Never trust JS-only pinning**, which attackers can patch.

***

# ✅ **5. Always Validate the Entire TLS Chain**

Pinning is an **extra**, not a replacement.

You still must enforce:

*   TLS 1.2+ / TLS 1.3
*   CA validation
*   Hostname verification

A bank’s rule:

> “Pinning is layered on top of normal TLS validation.”

***

# ✅ **6. Block Debug/Proxy Tools (Charles, Burp, mitmproxy)**

Even with pinning, attackers may try bypassing using:

*   Frida hooks
*   SSL unpinning modules
*   Custom patched APKs

Mitigations:

*   Anti‑Frida checks
*   Anti‑hooking (Xposed/Magisk detection)
*   App integrity checks
*   Root/jailbreak detection
*   Disable user-installed CAs (Android API) where possible

Pinning + anti‑tamper = strong client-side security.

***

# ✅ **7. Handle Pin Failures Securely**

On mismatch:

*   Fail **closed** (block request)
*   Show user-friendly message
*   Log event to fraud backend
*   Invalidate local session tokens

Never bypass pinning by fallback → major compliance violation.

***

# ✅ **8. Avoid Hardcoding Pins Directly in JS**

Reasons:

*   JS can be reverse-engineered
*   Attackers can patch JS bundle
*   WebView/remote debugging exposure

Store pin hashes:

*   In native code
*   With obfuscation
*   Possibly encrypted inside NDK/Swift code

Optional advanced:  
Use **white-box cryptography** for storing pin lists in high-security apps.

***

# ✅ **9. Testing Strategy (Very Important)**

Banks expect you to mention **testing**.

### Test cases:

*   Valid server cert → success
*   MITM proxy → fail
*   Expired cert → fail
*   Wrong public key → fail
*   Cert rotation event → app still works
*   Rooted device + unpinning attempt → detect + block

***

# 📌 Sample React Native Pinning Example (Using react-native-ssl-pinning)

```ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.mybank.com',
  httpsAgent: {
    pkPinning: true,
    certs: ['mybank_public_key_sha256'], // stored securely
  },
});
```

***

# 🎯 **20‑Second Interview Summary**

> “For certificate pinning, I always pin **public keys**, not certificates, and keep multiple pins for rotation.  
> I pin at the **native networking layer**, enforce TLS validation, and combine pinning with anti‑hooking, anti‑debugging, and root/jailbreak detection to stop SSL‑bypass attacks.  
> Pinning failures must strictly fail closed.  
> I also plan pin rotation and test against MITM tools like Charles/Burp.”

  </details>

  <details><summary>76. Secure session timeout + token invalidation.</summary>

Here is a **crisp, interview‑ready, banking‑grade** answer for:

# **76. Secure Session Timeout + Token Invalidation (React Native Banking Apps)**

*(Conceptual mobile security topic — no external sources needed.)*

Secure session handling in financial apps is **critical** because it protects user accounts from unauthorized access when devices are lost, shared, inactive, or compromised.

Below is exactly what interviewers expect.

***

# ✅ **1. Key Principles of Secure Session Management**

### **A. Short-Lived Access Tokens**

*   Access tokens must be **short-lived (5–15 minutes)**.
*   Reduces exposure if token is stolen.

### **B. Long-Lived Refresh Tokens**

*   Stored **only** in Keychain (iOS) / Keystore (Android).
*   Cannot be accessed by JS or file system.

### **C. Idle Timeout (User Inactivity)**

Banks commonly enforce:

*   **1–2 minutes** inactivity on sensitive screens (payment, account info)
*   **3–5 minutes** for general app use

### **D. Absolute Timeout (Max session lifetime)**

Example:

*   Maximum session = **15–30 minutes**
*   User forced to re-authenticate after this period.

***

# ✅ **2. Detecting User Inactivity (Idle Timeout)**

Track user interactions globally:

*   Touch events
*   Screen transitions
*   API calls
*   AppState changes

Example RN logic:

```ts
let timer;

function resetTimer() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    logoutUser(); // secure logout
  }, 3 * 60 * 1000); // 3 mins idle
}

const events = ['touchstart', 'click', 'scroll'];

events.forEach(event => {
  document.addEventListener(event, resetTimer);
});

resetTimer();
```

> In RN, implement this via gesture handlers, navigation listeners, and AppState.

***

# ✅ **3. App Background Timeout**

When app goes to background:

```ts
AppState.addEventListener("change", nextState => {
  if (nextState === "background") {
    startBackgroundTimer();
  }
  if (nextState === "active") {
    verifyIfTimeoutOccurred();
  }
});
```

Rules:

*   If app is backgrounded > **X minutes**, invalidate session.
*   Require biometric unlock before restoring session.

***

# ✅ **4. Token Invalidation Strategy (Very Important)**

When session expires or user logs out:

### **A. Access Token**

*   Delete from memory immediately
*   Remove from API client headers
*   Never store in local storage / MMKV / AsyncStorage

### **B. Refresh Token**

*   Delete securely from Keychain/Keystore:
    ```ts
    await Keychain.resetGenericPassword();
    ```

### **C. Backend Must Invalidate Tokens**

On logout or timeout, API should:

*   Mark refresh token as **revoked**
*   Block reuse (even if stolen)
*   Rotate keys and require re-login

### **D. Token Rotation**

After each refresh:

*   Issue new access + refresh token pair
*   Invalidate previous refresh token

This prevents **refresh token replay attacks**.

***

# ✅ **5. Secure Auto-Logout Flow (Banking Standard)**

### Trigger logout if:

*   Idle timeout reached
*   Background timeout exceeded
*   Device integrity failure (root/jailbreak detected)
*   PIN/biometric lock failed
*   Token refresh fails
*   Certificate pinning fails
*   App tampering detected
*   User logs out manually

### Actions during secure logout:

```ts
await Keychain.resetGenericPassword(); // refresh token
realm.write(() => realm.deleteAll());  // encrypted DB
MMKV.clearAll();                        // non-sensitive prefs
```

*   Clear navigation stack
*   Redirect to login
*   Force MFA again

***

# ✅ **6. Preventing Token Leakage**

### Best Practices:

*   Keep tokens in **memory only**, not JS global state
*   Never store access tokens anywhere persistent
*   Don’t send tokens to analytics or crash logs
*   Mask sensitive logs in production
*   Use HTTPS/TLS 1.2+ with pinning for all token refresh calls

***

# ✅ **7. Banking-Grade Enhancements**

### **A. Just-In-Time Token Loading**

Retrieve token from Keychain **right before** API call.  
Don’t keep long-lived token references.

### **B. Step-Up Authentication**

For high-risk actions:

*   Ask for biometric again
*   Even if session is active

### **C. Fraud Engine Integration**

Send session timeout + invalidation events to backend for audit logs.

### **D. Remote Session Revocation**

If backend flags risk:

*   Force logout on mobile instantly
*   Clear tokens + DB

***

# 🔥 **20-Second Interview Summary**

> “I implement strong session security using short-lived access tokens, long-lived refresh tokens stored only in Keychain/Keystore, and strict idle + absolute timeouts.  
> When timeout occurs, I perform secure logout: clear tokens, clear encrypted DB, clear navigation stack, and revoke tokens server-side.  
> I also use token rotation, background-timeout, biometric re-auth, and anti-tamper checks to ensure session integrity in a banking environment.”

  </details>

  <details><summary>77. How to handle sensitive logs & prevent PII leaks.</summary>

Here is a **clean, interview‑ready**, banking‑grade explanation for:

# **77. How to Handle Sensitive Logs & Prevent PII Leaks (React Native Banking Apps)**

*(Conceptual security topic — no web search needed.)*

Preventing sensitive data leakage is a **critical MASVS + PCI‑DSS + RBI compliance requirement** in financial apps.  
Logs are one of the most common accidental leak channels during development.

Below is a concise, developer‑friendly answer expected in interviews.

***

# ✅ **1. Never Log PII or Sensitive Data**

**Do NOT log:**

*   PAN/card number (even masked incorrectly)
*   CVV, expiry date
*   Account number / IFSC
*   Aadhaar / SSN / govt IDs
*   User name / mobile / email
*   OTP, session tokens, refresh tokens
*   JWT payloads
*   Transaction IDs or customer reference numbers

**Golden rule:**

> If it can identify a user or financial action → **never log it**.

***

# ✅ **2. Disable Logs in Production (Very Important)**

### Recommended approach:

*   Wrap all logs in a custom logger utility
*   Log only in **dev** or **internal QA builds**

Example:

```ts
const isProd = process.env.NODE_ENV === "production";

export const log = (...args) => {
  if (!isProd) console.log(...args);
};
```

**Don’t leave console.log spread across components.**  
Centralize logging.

***

# ✅ **3. Mask Sensitive Fields Automatically**

If logging structured data (e.g., API errors), mask sensitive fields:

```ts
function maskPII(data) {
  return {
    ...data,
    card: data.card ? `XXXX-XXXX-XXXX-${data.card.slice(-4)}` : undefined,
    phone: data.phone ? data.phone.replace(/\d(?=\d{2})/g, "*") : undefined,
  };
}
```

Never log raw JSON payloads from payments or KYC endpoints.

***

# ✅ **4. Encrypt Crash Logs (Sentry / Firebase Crashlytics)**

Crash log platforms may capture sensitive runtime state.  
To prevent leaks:

*   Disable breadcrumbs containing PII
*   Use `beforeSend` hooks to sanitize events
*   Mask context, user identifiers, and custom keys
*   Never set user email/phone ID in analytics/crash tools

Example (Sentry):

```ts
Sentry.init({
  beforeSend(event) {
    delete event.user;
    delete event.request?.headers;
    delete event.contexts;
    return event;
  }
});
```

***

# ✅ **5. Disable Network Logging / Debug Interceptors**

RN dev tools, Axios interceptors, and tools like Flipper can leak sensitive data.

### In production:

❌ Disable Flipper  
❌ Disable Axios request/response interceptors  
❌ Remove Charles/Burp proxy support  
❌ Ensure no plaintext logging of API payloads

***

# ✅ **6. Sensitive Screens Must Not Leak via Screenshots**

Combine logs + screenshot protections:

*   Use `FLAG_SECURE` (Android)
*   Blur UI on iOS when screen-capture detected
*   Remove sensitive data from in-memory Redux/state before logging

(Relates to Q74.)

***

# ✅ **7. Avoid Logging Full Error Objects**

Backend errors may contain:

*   Customer identifiers
*   PAN masks
*   Payment references
*   Internal debug IDs

Always sanitize:

```ts
catch (err) {
  log("API Error:", {
    code: err.code,
    message: err.message,
  });
}
```

Never log the full `err.response`.

***

# ✅ **8. Don’t Store Logs Persistently on Device**

Avoid:

*   Writing logs to filesystem
*   Storing debug files
*   Writing raw error objects to SQLite/MMKV/AsyncStorage

If persistent logs are required (rare):

*   Encrypt them
*   Apply strict retention (e.g., clear after 24 hours)

***

# ✅ **9. Ensure Backend Error Messages Are Sanitized Too**

PII leaks often come from server logs returned in API errors.

Rules:

*   Backend logs must not include PAN, account numbers, tokens
*   Client should never display server stack traces
*   Restrict verbose errors to staging environments only

***

# ✅ **10. Team & CI/CD Policy (Often Asked in Interviews)**

You should mention process-level controls:

*   Logging guidelines documented and enforced
*   PR reviews include **log inspection**
*   CI tools check for banned keywords (regex for PAN, Aadhaar, tokens)
*   Remove debug flags in release builds
*   Conduct periodic log audits

***

# 🔥 **20‑Second Interview Summary**

> “I ensure that no PII or financial data is ever logged.  
> All logs are disabled in production, crash logs are sanitized, network logs are removed, and sensitive screens are protected.  
> I mask any data that must be logged, scrub error objects, prevent persistent log storage, and enforce secure logging via PR reviews and CI checks.  
> This prevents PII leaks and meets banking‑grade MASVS + PCI‑DSS requirements.”

  </details>

  <details><summary>78. Secure biometric fallback flows.</summary>

Here is a **crisp, interview‑ready, banking‑grade explanation** for:

# **78. Secure Biometric Fallback Flows (React Native Banking Apps)**

*(Purely conceptual mobile security topic—no external sources needed.)*

In banking apps, biometrics (Face ID / Touch ID / Android Biometrics) are used to **unlock sessions**, **authorize payments**, or **re-authenticate** sensitive actions.  
A secure fallback flow ensures the app remains usable **without lowering security**, even when:

*   Biometric fails
*   Device doesn’t support biometrics
*   User disables biometrics
*   Spoofing/tampering attempts are detected

Below is the exact answer interviewers expect.

***

# ✅ **1. Core Rules of Secure Biometric Fallback**

### **A. Never fall back to “just continue without auth”** (big compliance violation)

Fallback must ALWAYS be:

*   **App PIN** (6‑digit minimum)
*   **Password + MFA**
*   **Server-side verification**

### **B. Fallback should NEVER be automatic**

If biometric fails → user must **explicitly choose fallback**.  
This prevents brute-force spoofing attempts.

### **C. Both biometric + fallback credential MUST be verified server-side**

Even if biometric is device‑local, once fallback is used:

*   Server must revalidate the session
*   Tokens must rotate
*   Risk engine gets notified

***

# ✅ **2. Typical Secure Fallback Flow (Banking Standard)**

### **Step 1 — User attempts biometric unlock**

```ts
LocalAuthentication.authenticateAsync();
```

### **Step 2 — Biometric fails (lockout/frustrated attempts)**

Show UI:

> “Biometric authentication failed. Use app PIN to continue.”

### **Step 3 — User enters App PIN**

*   PIN stored as **PBKDF2/Scrypt hash**
*   Compare hash locally
*   On success → call backend to re-validate
*   Backend issues new JWT / session token

### **Step 4 — Recreate new secure session**

*   Access token in memory only
*   Refresh token in Keychain/Keystore
*   Rotate tokens (invalidate previous ones)

### **Step 5 — Apply anti-hammering**

If PIN fails multiple times:

*   Temporarily lock account
*   Force full login with password + OTP

***

# ✅ **3. Secure Scenarios You MUST Handle**

### **A. User device has *no* biometrics**

→ Default to App PIN or password + OTP  
→ Biometrics screen should not appear at all

### **B. Biometric disabled by OS (Face ID disabled)**

→ Require immediate fallback to PIN/password

### **C. Too many failed biometrics (lockout)**

→ Show fallback screen immediately  
→ Disable biometrics until next app start or timeout

### **D. Rooted/jailbroken environment**

→ Block biometric unlock (spoofing risk)  
→ Force fallback to PIN + MFA  
→ Inform backend for risk scoring

### **E. Reset/ reinstall app**

→ Delete biometric keys (invalidate local keys)  
→ Full login only (no fallback allowed)

***

# ✅ **4. Technical Implementation Best Practices**

### **1. Use secure OS‑backed biometric APIs**

*   **Android:** BiometricPrompt + CryptoObject
*   **iOS:** LAContext with device-bound keys
*   **React Native:** expo-local-authentication or react-native-biometrics

### **2. Bind biometric to Keystore/Keychain keys**

*   Generate a symmetric crypto key
*   Protect it with biometric gating
*   On success → decrypt session key

This ensures:

*   Biometrics unlock **cryptographic capability**, not “app access”

### **3. PIN Storage Must Be Highly Secure**

*   Store **one-way salted hash** only
*   Derive using **PBKDF2/Scrypt/Argon2**
*   Never store plaintext PIN
*   Store hash in encrypted storage (Keychain/Keystore)

### **4. Ensure fallback login resets biometrics**

If user logs in via PIN/password:

*   Rotate biometric keys
*   Re-enroll biometric credential for next time

***

# ✅ **5. Security Controls to Prevent Biometric Bypass Attacks**

### **A. Block biometrics on compromised devices**

*   Jailbreak/root detection
*   Hooking detection (Frida/Magisk/Xposed)
*   Device integrity API (Play Integrity / App Attest)

### **B. Prevent replay attacks**

*   Biometric result must not directly unlock session token
*   Instead → unlock a cryptographic key to fetch token from Keychain

### **C. Step-up authentication**

For payments > threshold:

*   Ask user to authenticate again (biometric > PIN)
*   Even if session is active

***

# ✅ **6. Recommended UX for Banking Apps**

✔ Show error only ONCE for biometric failure  
✔ Immediately show “Try biometrics again” + “Use PIN instead”  
✔ Keep fallback input simple (6-digit PIN)  
✔ For sensitive operations → show biometric prompt again  
✔ Block fallback entirely when device integrity is compromised

***

# 🔥 **20‑Second Interview Summary**

> “A secure biometric fallback flow must never downgrade security.  
> When biometrics fail, I fall back to app PIN or password + MFA, verify credentials server-side, rotate tokens, and re-establish a new secure session.  
> Biometric keys are stored in Keystore/Keychain, PINs are hashed with PBKDF2/Scrypt, and biometrics are disabled entirely on rooted/jailbroken devices.  
> This ensures both usability and banking-grade security.”

  </details>

  <details><summary>79. Risks of WebViews & how to harden them.</summary>

Here’s a **clean, interview‑ready answer** for:

# **79. Risks of WebViews & How to Harden Them (React Native Banking Apps)**

*(Pure mobile‑security knowledge → no external search needed)*

WebViews are one of the **highest‑risk attack surfaces** in mobile banking apps because they combine **web security risks + mobile execution risks**.\
If not hardened, attackers can inject JS, load malicious pages, steal tokens, or perform phishing inside the app.

Below is the precise, banking‑grade explanation expected in interviews.

***

# ✅ **A. Key Risks of Using WebViews in Banking Apps**

## **1. JavaScript Injection / XSS inside WebView**

If the WebView loads dynamic HTML or remote content:

*   Attacker can inject JS
*   Access DOM
*   Read inputs (OTP, password)
*   Hijack navigation
*   Exfiltrate data

***

## **2. Unsafe `window.postMessage` / JS bridge**

React Native WebView exposes:

```ts
injectedJavaScript
onMessage
```

If misconfigured → native ↔ web bridge becomes an attack vector.

Attackers can:

*   Call native functions
*   Steal tokens/PII
*   Execute unauthorized native operations

***

## **3. Loading arbitrary URLs → Phishing**

If WebView can load any URL:

*   Attacker can redirect to phishing page inside the app
*   User thinks it's secure (bank app chrome)
*   Enters credentials/OTP
*   Credentials stolen

***

## **4. Mixed content (HTTP + HTTPS)**

If WebView allows HTTP:

*   MITM can inject malicious HTML/JS
*   Sensitive data can leak

***

## **5. File system access**

Android WebViews can access:

*   File URLs
*   External storage
*   Local HTML → becomes XSS target

***

## **6. Cookie theft**

If using WebView sessions:

*   Cookies may be stored in shared cookie jar
*   Risky: WebView → App → Browser cookie contamination

***

## **7. Debugging enabled in production**

WebViews can expose:

*   DevTools
*   Remote debugging ports
*   JS injection interface

Huge attack surface.

***

# ✅ **B. How to Harden WebViews (Banking‑Grade)**

Below are the **mandatory** controls for any financial app.

***

# **1. Disable JavaScript unless absolutely needed**

```tsx
<WebView javaScriptEnabled={false} />
```

If JS needed → restrict with CSP + controlled injection.

***

# **2. Disable dangerous APIs**

```tsx
<WebView
  domStorageEnabled={false}
  allowFileAccess={false}
  allowUniversalAccessFromFileURLs={false}
  allowFileAccessFromFileURLs={false}
/>
```

This prevents:

*   Local file XSS
*   Reading customer files
*   HTML injection

***

# **3. Restrict Navigation (Allowlisting Only)**

### Best practice:

Allow only *specific* trusted domains.

```tsx
const allowed = ["https://mybank.com", "https://secure.mybank.com"];

const onShouldStartLoadWithRequest = (req) => {
  return allowed.some(domain => req.url.startsWith(domain));
};
```

Block:

*   External URLs
*   Unknown redirects
*   Deep links to malicious sites

***

# **4. Disable Mixed Content**

Prevent HTTP inside HTTPS session:

```tsx
androidHardwareAccelerationDisabled={true}
mixedContentMode="never"
```

***

# **5. Use Strict Content-Security-Policy (CSP)**

If loading remote pages you own:

*   No inline JS
*   No external JS from unknown CDNs
*   Restrict script-src, frame-src, connect-src

Example CSP:

    default-src 'none';
    script-src 'self';
    style-src 'self';
    img-src 'self';
    connect-src https://api.mybank.com;
    frame-ancestors 'none';

***

# **6. Secure JS <-> Native Bridge**

### A. Validate messages

```tsx
onMessage={(event) => {
  const msg = JSON.parse(event.nativeEvent.data);
  if (!isValidMessage(msg)) return;
}}
```

### B. Don’t expose sensitive native methods

Never expose:

*   Token access
*   Payment actions
*   DB operations
*   Sensitive settings

### C. Prefer one-way messaging

Avoid receiving arbitrary instructions from JS.

***

# **7. Disable Remote Debugging In Production**

**Android**

```kotlin
WebView.setWebContentsDebuggingEnabled(false)
```

**iOS**
Automatic: iOS does NOT allow remote debugging in release builds.

***

# **8. Prevent Screenshot / Recording**

Combine WebView with FLAG\_SECURE / blur overlays (as covered in Q74).

***

# **9. Harden SSL/TLS (Very Important)**

If WebView loads HTTPS pages:

*   Enable TLS 1.2+
*   Enforce certificate pinning at WebView/network layer
*   Block invalid certificates
*   Reject user-installed CAs on Android (Network Security Config)

***

# **10. Isolate WebView Session**

Never share cookies between:

*   WebView
*   Mobile app
*   Browser

Use:

```tsx
sharedCookiesEnabled={false}
thirdPartyCookiesEnabled={false}
```

And isolate web session to prevent Cookie Fixation attacks.

***

# **11. Disable Keyboard Suggestions on Sensitive Inputs**

Inside WebView forms:



Prevent saving sensitive inputs into keyboard dictionary.

***

# **12. Perform Server-Side Risk Checks**

When loading WebView content:

*   Validate JWT session
*   Check device integrity (root/jailbreak)
*   Validate user account state
*   Inform fraud engine if WebView errors occur

***

# 🎯 **20‑Second Interview Summary**

> “WebViews are dangerous because of JS injection, unsafe bridges, mixed content, phishing, and cookie leaks.\
> To harden them, I disable JS unless required, block file access, enforce allowlisted URLs, disable mixed content, isolate cookies, apply CSP, close debugging, validate bridge messages, and use certificate pinning.\
> For sensitive flows like payments, I prefer native screens and avoid WebViews entirely.”

  </details>

  <details><summary>80. GDPR/CPRA compliance basics.</summary>

Here’s a **short, crisp, interview‑ready** explanation for:

# **80. GDPR / CPRA Compliance Basics (For Mobile Banking Apps)**

*(Conceptual privacy + security topic — no external sourcing needed.)*

Financial apps must follow **GDPR (EU)** and **CPRA/CCPA (California)** when handling personal data. These regulations govern *how you collect, store, process, retain, and delete user data*. Below is the clean, banking‑grade explanation expected in interviews.

***

# ✅ **1. Core Principles (Both GDPR & CPRA)**

### **A. Data Minimization**

Only collect what you absolutely need:

*   No unnecessary PII in API payloads
*   Avoid storing full DOB, PAN, Aadhaar, SSN unless required
*   Don’t store telemetry with identifiers

### **B. Purpose Limitation**

Use data **only** for the stated purpose:

> “Collect phone number for login only” → cannot reuse it for marketing without consent.

### **C. Storage Limitation**

*   Don't store data forever
*   Delete/expire old logs, cache, and analytics data

### **D. Transparency**

Explain:

*   What data you collect
*   Why you collect it
*   Who you share it with
*   How long you keep it

Shown via:

*   Privacy Notice
*   Consent screens
*   Just‑in‑time notifications

***

# ✅ **2. User Rights (You Must Implement in Banking Apps)**

## **GDPR Rights**

*   **Right to Access** → Users can request all data you hold
*   **Right to Rectification** → Fix incorrect data
*   **Right to Erasure (“Right to be forgotten”)**
*   **Right to Restrict Processing**
*   **Right to Data Portability**
*   **Right to Object (opt‑out)**
*   **Right Not to Be Profiled / Automated Decisions**

## **CPRA Rights**

*   **Right to Know** what is collected
*   **Right to Delete**
*   **Right to Correct**
*   **Right to Opt‑Out of Sale/Sharing**
*   **Right to Limit Use of Sensitive Data**
*   **Right to Non‑Discrimination**

***

# ✅ **3. What “Personal Data” means (very important)**

Includes:

*   Name
*   Phone/email
*   Device ID / IP address
*   Biometrics
*   Location
*   Transaction history
*   Account numbers
*   Online identifiers (cookies, analytics IDs)

Anything that identifies a person directly or indirectly = **Personal Data**.

***

# ✅ **4. Mobile‑Specific Privacy Requirements**

### **A. No PII in Logs (related to Q77)**

GDPR/CPRA strictly prohibit accidental leakage.

### **B. Explicit Consent for Sensitive Data**

Need **opt‑in** for:

*   Biometrics
*   Location
*   Analytics tracking
*   Crash reporting with metadata

### **C. Data Encryption**

*   Encrypt at-rest via Keychain/Keystore
*   Encrypt in-transit via TLS 1.2+/1.3
*   No plaintext storage

### **D. Prevent Unauthorized Access**

*   Secure session timeout
*   Token invalidation
*   PIN/biometric re-auth for sensitive screens

### **E. Data Retention Policies**

*   Auto-delete old data
*   Define retention for logs, cache, analytics
*   Purge on logout/reinstall

***

# ✅ **5. Data Subject Requests (DSR) Workflow**

Your backend + mobile app must support:

### **1. Export My Data**

Provide a JSON/CSV with:

*   Profile info
*   Transaction data
*   KYC data

### **2. Delete My Data**

App triggers deletion workflow:

*   Remove all local storage (MMKV/Realm/SQLite)
*   Backend flags for wipe
*   Persist only what regulators require (KYC retention)

### **3. Opt-Out Preferences**

*   Opt-out of sharing data for analytics/marketing
*   Disable personalized offers
*   Respect device-level OS permissions

***

# ✅ **6. Third‑Party SDK Compliance (Very important in interviews)**

GDPR/CPRA require you to:

*   Audit SDKs (Analytics, Crashlytics, Ads, Chat, Social login)
*   Disable PII collection unless user consents
*   Ensure SDK is not “selling data” (CPRA term)
*   Provide list of third parties in privacy policy
*   Respect “Do Not Track / Opt-Out” settings

For banking apps → avoid or heavily restrict third‑party SDKs.

***

# ✅ **7. Secure Data Handling in React Native**

### On device:

*   Use **Keychain/Keystore** for tokens
*   Use **encrypted DB (SQLCipher/Realm)** for PII
*   No PII in AsyncStorage/MMKV
*   Protect screenshots (FLAG\_SECURE)

### In network:

*   TLS 1.2+
*   Certificate pinning
*   No passing sensitive data in query params
*   Short‑lived tokens + rotation

### In analytics/crash logs:

*   Remove user identifiers
*   Mask or disable breadcrumbs
*   Ask consent before enabling tracking

***

# ✅ **8. Compliance Documentation (Often asked!)**

You must maintain:

*   Data Flow Diagram (DFD)
*   Records of Processing Activities (ROPA)
*   Privacy Impact Assessments (PIA/DPIA)
*   Retention policy
*   Consent logs
*   Vendor/SDK assessments
*   Breach response plan

***

# 🎯 **20‑Second Interview Summary**

> “GDPR and CPRA require data minimization, explicit consent, transparency, and strong user rights like access, deletion, and opt‑out.  
> In mobile banking apps, I ensure no PII in logs, encrypt all sensitive data, prevent screenshot leaks, limit retention, and store tokens only in hardware-backed keystores.  
> I also honor user rights, audit third‑party SDKs, and ensure secure session and token handling to maintain privacy compliance end‑to‑end.”

  </details>

  <details><summary>81. Permissions hardening (least privilege).</summary>

Here’s a **short, crisp, interview‑ready answer** for:

# **81. Permissions Hardening (Least Privilege) for React Native Banking Apps**

Mobile banking apps must follow the **principle of least privilege**:

> *Request only the permissions that are absolutely required, only when needed, and never pre‑grant broad access.*

This is a core requirement in **MASVS‑PLATFORM**, **GDPR/CPRA**, and multiple banking regulators’ guidelines.

Below is the exact, banking‑grade explanation expected in interviews.

***

# ✅ **1. Request the Minimum Permissions Possible**

Banking apps should **avoid** these unless absolutely necessary:

*   **Camera** → Only for KYC, cheque scanning (on-demand)
*   **Location** → Only if required for compliance (ATM finder OK), never “Always”
*   **Contacts** → Generally *forbidden*
*   **Storage** → Avoid legacy “READ/WRITE\_EXTERNAL\_STORAGE”; use scoped storage
*   **Phone state** → Avoid unless regulatory need
*   **Bluetooth / Nearby devices** → Rarely justified

**Default rule:**

> If a feature can be done without a permission → do it without permission.

***

# ✅ **2. Ask Permissions Just‑In‑Time (Not on App Launch)**

Permissions must be requested **at the moment** the user triggers the feature.

Examples:

*   KYC → Ask Camera permission only when user taps “Start KYC”
*   ATM Locator → Ask Location only when user opens the map
*   Cheque Deposit → Ask Camera + Storage only right before capture

This reduces scope, improves compliance, and avoids “blanket permissions”.

***

# ✅ **3. Use Permission Explanation Screens (Regulatory Requirement)**

Provide:

*   **Why** you need the permission
*   **How** the data is used
*   **What happens if user denies**

Example:

> “We need Camera permission to verify identity for KYC. Photos stay encrypted and never stored on device.”

This supports **GDPR transparency**, **CPRA notice**, and **MASVS-L1/L2**.

***

# ✅ **4. Deny Access if Permission Missing – Never Gracefully Degrade Security**

If a user denies permission for a **security feature**, the app must:

*   Block that action
*   Show fallback
*   Not bypass or weaken security

Example:  
If camera denied for cheque scanning → do NOT allow upload from gallery (risk of fraud).

***

# ✅ **5. Avoid Dangerous & Legacy Permissions**

### ❌ Never use (unless mandated):

*   `WRITE_EXTERNAL_STORAGE`
*   `READ_SMS`
*   `READ_CONTACTS`
*   `READ_PHONE_STATE`

Use:

*   Scoped storage
*   Intent-based file access
*   OS-provided pickers

Android 12+ and 13+ have stricter enforcement—good for banking security.

***

# ✅ **6. Harden Web-Based Permissions (WebView)**

If using WebViews:

*   Disable geolocation inside WebView
*   Disable camera/mic unless absolutely required
*   Block JavaScript APIs like `getUserMedia`
*   Use URL allowlisting to prevent permission abuse  
    (Related to Q79)

***

# ✅ **7. iOS-Specific Hardening**

*   Use **NSPrivacyUsageDescription** keys with precise messaging
*   Don’t use broad-purpose permissions (e.g., Photo Library “Add Only” instead of full access)
*   Avoid “Always On Location”; use “When In Use”

iOS App Store Compliance strongly enforces privacy minimization.

***

# ✅ **8. Android-Specific Hardening**

*   Use Android’s **runtime permissions**
*   Use **foreground service** permissions sparingly
*   Follow **Permission Groups** & avoid auto-granted dangerous permissions
*   Use **MANAGE\_EXTERNAL\_STORAGE** only if regulator-required (rare)

***

# ✅ **9. Audit & Remove Unused Permissions**

Tools:

*   Android Lint
*   iOS Privacy Report
*   Mobile AppSec scanners
*   Manual code review

Banks typically require:

*   Permission inventory
*   Justifications for each
*   Annual recertification

***

# 🎯 **10. Banking‑Grade Restrictions (From Real FIs)**

Most banks enforce:

✔ Zero permissions on app install  
✔ Only on-demand permissions  
✔ No background location  
✔ No access to contacts  
✔ No audio recording  
✔ No broad storage access  
✔ Strict privacy disclosures  
✔ Only OS-native pickers for files/images

***

# 🔥 **20‑Second Interview Summary**

> “I follow least privilege: request only the permissions needed, only at the moment they’re required, and never ask for broad or unnecessary access.  
> I use just-in-time permission prompts, transparent explanations, avoid dangerous legacy permissions, remove unused permissions, and harden WebView/browser permissions.  
> This meets MASVS, GDPR/CPRA, and banking audit requirements for minimal, purpose‑bound permission usage.”

  </details>

  <details><summary>82. Secure cryptography usage (don’t roll your own).</summary>

Here is a **short, crisp, interview‑ready**, banking‑grade explanation for:

# **82. Secure Cryptography Usage (Don’t Roll Your Own)**

*(Conceptual security topic → no external sourcing needed.)*

In financial apps, cryptography is **never implemented manually** because custom crypto is predictable, flawed, and easily broken. Banks must follow **NIST**, **OWASP MASVS-CRYPTO**, and **PCI‑DSS** guidance for approved algorithms, key management, and secure implementation.

Below is the exact answer interviewers expect.

***

# ✅ **1. Don’t Roll Your Own Crypto — What This Means**

**Never:**

*   Write your own AES/RSA/ECC implementation
*   Invent custom padding schemes
*   Develop proprietary hashing or key derivation
*   Create custom obfuscation and call it “encryption”
*   Build homemade token formats

**Always:**

*   Use platform‑provided, proven, vetted crypto libraries
*   Use standard algorithms with correct modes and padding
*   Follow strict key‑management rules

Because even experienced developers make mistakes with:

*   Padding
*   IV generation
*   Randomness
*   Key rotation
*   Authentication tags
*   Mode selection

One mistake → **banking data breach**.

***

# ✅ **2. Approved Algorithms (Banking Standards)**

### **Symmetric Encryption**

*   **AES‑256‑GCM** (preferred)
*   AES‑256‑CBC (only if authenticated with HMAC)

### **Asymmetric Encryption**

*   **RSA‑2048+**
*   **ECDSA/ECDH (P‑256, P‑384)**

### **Hashing**

*   **SHA‑256**
*   **SHA‑512**

### **Password/PIN Storage**

*   **PBKDF2**, **Scrypt**, **Argon2**
*   Never SHA‑1, MD5, plaintext

### **Randomness**

*   Only use **CSPRNG** (Cryptographically Secure Random Number Generators)
*   Never `Math.random()`

***

# ✅ **3. Use Hardware‑Backed Keystores for Keys**

React Native banking apps must use:

### **iOS**

*   Secure Enclave + Keychain
*   Non‑exportable private keys
*   Biometric-gated keys when needed

### **Android**

*   Android Keystore (TEE / StrongBox if available)
*   Key material never leaves secure hardware

**Never store keys in:**

*   AsyncStorage
*   MMKV (unencrypted)
*   JS variables
*   SQLite
*   Redux state

> Key storage is **more important** than the encryption algorithm.

***

# ✅ **4. Use Standard Libraries (Platform or Well‑Audited)**

### **iOS**

*   CommonCrypto
*   CryptoKit (preferred)

### **Android**

*   javax.crypto
*   BouncyCastle (if needed)
*   Tink (Google’s vetted crypto library)

### **React Native**

Use native modules or secure wrappers:

*   `react-native-keychain`
*   `react-native-encrypted-storage`
*   No pure‑JS crypto for sensitive operations

***

# ✅ **5. Cryptographic Best Practices (MASVS‑CRYPTO)**

### ✔ Use authenticated encryption

Always use **AES‑GCM** to prevent tampering.

### ✔ Never reuse IVs

Generate a random IV for every encryption.

### ✔ Use envelope encryption

*   KEK (hardware) → encrypts DEK (AES key)
*   DEK → encrypts data  
    Enables secure key rotation.

### ✔ Rotate keys regularly

Rotate:

*   Encryption keys
*   Biometric keys
*   Token signing keys
*   API secret keys

### ✔ Do not encrypt everything blindly

Classify data:

*   Tokens → Keychain/Keystore
*   PII → Encrypted DB
*   Preferences → MMKV (plaintext OK)

***

# ✅ **6. Secure Crypto Workflows in Banking Apps**

### **A. Secure Local Storage**

*   Encrypt sensitive data with AES‑GCM
*   Store DEK encrypted via Keystore/Keychain
*   Keep IV + auth tag with ciphertext

### **B. Secure Network Layer**

*   TLS 1.2/1.3 only
*   Certificate pinning
*   Strong cipher suites
*   HSTS enforced

### **C. Secure Token Handling**

*   JWTs must be signed with RSA/ECDSA
*   Short-lived access tokens
*   Refresh tokens stored only in secure hardware
*   Avoid custom token formats

### **D. Secure Biometric/Gated Keys**

*   Bind AES key to biometric prompt
*   Use secure enclave to protect operations

***

# ✅ **7. What NOT to Do (Common Mistakes)**

❌ Using Base64 and calling it “encryption”  
❌ Hardcoding keys in JS  
❌ Using AES-CBC without HMAC  
❌ Using Math.random() for IVs  
❌ Creating custom hashing  
❌ Compress → encrypt → sign order mistakes  
❌ JSON.stringify sensitive objects before encryption without sanitization  
❌ Storing private keys in Redux/MMKV/AsyncStorage  
❌ Encrypting with a static password in code

***

# 🔥 **8. 30‑Second Interview Summary**

> “In financial apps, I never roll my own crypto.  
> I use approved algorithms like AES‑256‑GCM, RSA‑2048, or ECDH, and rely on platform‑provided libraries with hardware‑backed keystores.  
> Keys never leave the Secure Enclave/TEE; only encrypted data does.  
> I use PBKDF2/Scrypt for PINs, rotate keys regularly, use envelope encryption, generate IVs securely, and ensure authenticated encryption.  
> This follows OWASP MASVS‑CRYPTO and banking compliance best practices.”

  </details>

</details>

***

### **9) Performance & Build Optimization (10 questions)**

<details>
  <summary>Performance &amp; Optimization (10)</summary>

  <details><summary>83. How to measure app startup time & TTI?</summary>

Here’s a **short, interview‑ready** explanation with **clear steps + code examples** on:

## **83. How to measure app startup time & TTI (Time‑to‑Interactive) in React Native?**

In React Native, startup performance is mainly about:

*   **Cold Start Time** → Time from app launch → JS bundle executed + first screen visible
*   **TTI (Time‑to‑Interactive)** → Time until UI is ready + user actions are responsive

***

# ✅ **1. Measure Startup Time (Native + JS)**

## **A) Using JavaScript timestamps (simple & effective)**

```js
// index.js
global.startTime = Date.now();

import { AppRegistry } from 'react-native';
import App from './App';

AppRegistry.registerComponent(appName, () => App);
```

Then inside App:

```js
useEffect(() => {
  const endTime = Date.now();
  console.log('Startup Time: ', endTime - global.startTime, 'ms');
}, []);
```

👉 Measures **JS bundle load + App component mount**.

***

# ✅ **B) Measure Native Startup Time (Android)**

Use `ReactMarker`:

```java
@Override
public void onCreate() {
    super.onCreate();
    long start = SystemClock.uptimeMillis();
    ReactMarker.addListener((name, tag, instanceKey) -> {
        if (name.toString().equals("CONTENT_APPEARED")) {
            long total = SystemClock.uptimeMillis() - start;
            Log.d("StartupTime", "Cold start time: " + total + "ms");
        }
    });
}
```

👉 More accurate for **Android cold startup**.

***

# ✅ **C) Measure Startup on iOS**

Use built‑in **RCTPerformanceLogger**:

```objc
#import <React/RCTPerformanceLogger.h>

RCTPerformanceLogger *perfLogger = [bridge performanceLogger];
NSArray *values = [perfLogger valuesForTags];
NSLog(@"Startup time: %@", values);
```

***

# ✔️ **2. Measuring TTI (Time to Interactive)**

TTI = when the app’s first screen is fully rendered + ready for user input.

### Easiest way → Mark when your “ready” UI is interactive

```js
const ttiStart = global.startTime;

useEffect(() => {
  requestAnimationFrame(() => {
    const tti = Date.now() - ttiStart;
    console.log('TTI: ', tti, 'ms');
  });
}, []);
```

👉 `requestAnimationFrame()` ensures UI has **finished rendering**.

***

# ✔️ **3. Using React Native Performance APIs (New API)**

```js
import { Performance } from 'react-native';

Performance.mark('app_start');

useEffect(() => {
  Performance.mark('app_interactive');
  Performance.measure('TTI', 'app_start', 'app_interactive');
});
```

***

# ✔️ **4. Using Flipper Performance Plugin**

Flipper → React Native DevTool  
Install RN Performance Plugin:

    yarn add rn-perf

Shows:

*   JS thread blocking
*   Bridge traffic
*   UI stalls
*   Component render times

Great for diagnosing slow startup.

***

# ✔️ **5. Why Banking Apps Focus on Startup Time?**

Because:

*   Users expect fast access to their account balance
*   Security screens (login/OTP) must load instantly
*   Regulatory UX requirements enforce performance KPIs

***

# **Final Interview‑Ready Answer (Short Version)**

> **Startup time** can be measured by logging timestamps in JS (`Date.now()` from index.js to first render) or using native markers like **ReactMarker (Android)** and **RCTPerformanceLogger (iOS)**.  
> **TTI** is measured by marking when the screen becomes fully interactive—commonly using `requestAnimationFrame()` or the latest **React Native Performance API**. Tools like **Flipper Performance Plugin** help analyze slow startup.

  </details>

  <details><summary>84. Reducing bundle size — practical strategies.</summary>

Here’s a **short, crisp, interview‑ready** answer with **practical + code‑based strategies** used in real React Native banking apps.

***

# ✅ **84. Reducing Bundle Size — Practical Strategies**

Bundle size impacts **startup time, OTA updates, and memory usage** — critical for banking apps.  
Here are the **most effective strategies** with short explanations + examples.

***

## **1️⃣ Use Hermes (BIGGEST reduction)**

Hermes produces **smaller bytecode bundles** compared to JS bundles.

**Enable Hermes (RN 0.70+ default)**  
**Android – `android/app/build.gradle`:**

```gradle
hermesEnabled: true
```

**iOS – `ios/Podfile`:**

```ruby
config = use_native_modules!
config[:hermes_enabled] = true
```

📉 Reduces bundle by **20–40%**.

***

## **2️⃣ Remove Unused / Heavy Dependencies**

Run:

    npx depcheck

Examples of **heavy libraries to replace**:

| Heavy                     | Replace With                  |
| ------------------------- | ----------------------------- |
| moment.js (300KB)         | dayjs (10KB)                  |
| lodash full               | lodash-es or specific imports |
| firebase full sdk         | modular v9+                   |
| react-native-vector-icons | custom subset / SVG           |

📉 Often saves **200–500KB**.

***

## **3️⃣ Use Named Imports (Tree-Shaking Friendly)**

Bad:

```js
import _ from "lodash";
```

Good:

```js
import debounce from "lodash/debounce";
```

Same for date-fns, lodash-es, ramda.

***

## **4️⃣ Minify & Shrink Code (Metro + ProGuard)**

### **Android ProGuard**

`android/app/proguard-rules.pro`:

```pro
-keep class com.facebook.** { *; }
-dontwarn com.facebook.**
```

Enable in `android/app/build.gradle`:

```gradle
minifyEnabled true
shrinkResources true
```

📉 Removes unused native Java/Kotlin code.

***

## **5️⃣ Enable Hermes Bytecode Pre-Compilation**

RN 0.71+ supports **precompiled bytecode**, dramatically shrinking JS bundle.

Android:

```gradle
enableHermesBytecodePrecompilation true
```

📉 Cuts JS bundle **almost in half**.

***

## **6️⃣ Split Bundles by Environment**

Use env-based dynamic bundling:

```js
if (__DEV__) {
  require('./devTools');
}
```

Production bundle excludes dev‑only modules.

***

## **7️⃣ Lazy Load Heavy Modules (Code Splitting)**

Example: Load charts/screens only when needed.

```js
const ChartsScreen = React.lazy(() => import('./ChartsScreen'));
```

This keeps your **initial bundle very small**.

***

## **8️⃣ Compress Images & Use WebP**

Optimize static assets:

*   Replace PNG/JPG → WebP
*   Use 1x images + scale via `Image.getSize()`
*   Offload large images to CDN

Metro config:

```js
module.exports = {
  transformer: {
    assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  },
};
```

📉 Saves **MBs** in asset bundle.

***

## **9️⃣ Use react-native-mmkv Instead of AsyncStorage**

AsyncStorage adds overhead; MMKV is **smaller and faster**.

```js
import MMKVStorage from "react-native-mmkv-storage";
```

***

## **🔟 Remove Inline JSON / Move to Remote Config**

Avoid large inline config files:

Bad ❌

```js
import bigJson from './data.json';
```

Good ✔️

*   Load via MMKV
*   Fetch & cache remote JSON
*   Enforce compression (gzip or brotli)

***

# **📌 Final Interview‑Ready Summary**

> To reduce bundle size in React Native, enable **Hermes**, eliminate unused dependencies, use **named imports**, turn on **ProGuard + resource shrinking**, compress images, and adopt **lazy loading** for heavy modules. Hermes bytecode pre‑compilation + avoiding heavy libraries like moment.js gives the biggest impact.

  </details>

  <details><summary>85. Preventing heavy operations on JS thread.</summary>

Here’s a **concise, interview‑ready** guide with **practical patterns + code** to ensure heavy work doesn’t block the **JS thread** (so gestures, animations, and navigation stay smooth).

***

## **85. Preventing heavy operations on the JS thread**

### 🎯 Goal

Keep the **JS event loop** free for: rendering, handling gestures, and scheduling. Push heavy work to **native/other threads** and make UI work **frame-synced**.

***

## ✅ Core Strategies (what to say in interview)

1.  **Move CPU‑intensive work off JS**

*   Use **JSI/TurboModules** or libraries that run on **native threads** for crypto, compression, parsing, image/video processing.
*   If you need pure JS off-thread, use **react-native-multithreading** or **react-native-threads**.

2.  **Run animations & gestures on UI thread**

*   Use **React Native Reanimated (worklets)** + **react-native-gesture-handler** so animations run on the **UI thread**, not JS.

3.  **Defer non‑critical work**

*   `InteractionManager.runAfterInteractions`, `requestIdleCallback`, `setTimeout(0)`, or `requestAnimationFrame` to yield back to the event loop.

4.  **Stream and chunk big tasks**

*   Avoid huge `JSON.stringify`, massive loops, or processing large arrays synchronously. **Chunk it** or **stream**.

5.  **Avoid synchronous bridge calls**

*   Don’t do chatty sync calls (e.g., reading hundreds of keys one by one). Batch, use **JSI-backed storage** like **MMKV**, or fetch in bulk.

6.  **Use virtualization & memoization**

*   `FlatList` with proper props (`windowSize`, `getItemLayout`, `removeClippedSubviews`), memoize item rows, throttle expensive callbacks.

7.  **Use background services for I/O**

*   Downloads/uploads, file I/O → native/background (e.g., background fetch, download managers). Only signal completion to JS.

***

## 📦 Library Choices that keep JS thread light

*   **Reanimated 2/3**: UI thread animations via **worklets**
*   **react-native-gesture-handler**: low-latency gestures off JS
*   **react-native-mmkv**: JSI storage, very fast & minimal JS involvement
*   **react-native-multithreading**: run JS functions on worker threads
*   **TurboModules/JSI**: write your heavy logic in native C++/Kotlin/Swift
*   **react-native-blob-util** (or native download manager): background file work

***

## 🧩 Code Patterns

### 1) **Defer non‑critical work**

```ts
import { InteractionManager } from 'react-native';

// Defer until after animations & gestures settle
InteractionManager.runAfterInteractions(() => {
  // low priority: preload, warm caches, analytics, etc.
});

// Yield rendering to next frame
requestAnimationFrame(() => {
  // safe to do small work here
});

// Idle time (polyfilled in many RN setups)
requestIdleCallback?.(() => {
  // run only when JS is idle
});
```

***

### 2) **Run animations & gestures off JS (Reanimated + RNGH)**

```ts
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';

const x = useSharedValue(0);

const style = useAnimatedStyle(() => ({
  transform: [{ translateX: x.value }],
}));

// This runs on UI thread (worklet), not JS thread
function onDrag(distance: number) {
  'worklet';
  x.value = withSpring(distance);
}
```

***

### 3) **Move heavy JS to a worker thread (react-native-multithreading)**

```ts
import { spawnThread } from 'react-native-multithreading';

// Heavy pure JS function
function expensiveCompute(data: number[]) {
  'worklet'; // required by multithreading
  let sum = 0;
  for (let i = 0; i < data.length; i++) sum += Math.sqrt(data[i]);
  return sum;
}

const sumPromise = spawnThread(expensiveCompute, bigArray);
sumPromise.then(result => setState(result));
```

> Keeps the **main JS thread** free. Ideal for CPU loops, parsing, transforms.

***

### 4) **Batch/JSI storage instead of chatty bridge**

```ts
// Bad: multiple async bridge round-trips
for (const k of keys) {
  const v = await AsyncStorage.getItem(k);
  // ...
}

// Better: MMKV (JSI) – sync & fast without blocking UI
import { MMKV } from 'react-native-mmkv';
const storage = new MMKV();

storage.set('session', JSON.stringify(sessionObj));
const session = JSON.parse(storage.getString('session') ?? '{}');
```

***

### 5) **Chunk large work to avoid long blocks**

```ts
// Break 1M operations into time-sliced chunks
function processInChunks(items: any[], chunk = 500) {
  let i = 0;
  function step() {
    const end = Math.min(i + chunk, items.length);
    for (; i < end; i++) {
      // process items[i]
    }
    if (i < items.length) {
      setTimeout(step, 0); // yield back to event loop between chunks
    }
  }
  step();
}
```

***

### 6) **Virtualized lists tuned to avoid JS pressure**

```tsx
<FlatList
  data={data}
  renderItem={MemoizedRow}
  keyExtractor={(item) => item.id}
  initialNumToRender={8}
  windowSize={5}
  maxToRenderPerBatch={8}
  updateCellsBatchingPeriod={50}
  removeClippedSubviews
  getItemLayout={(data, index) => ({ length: ROW_H, offset: ROW_H * index, index })}
/>
```

```ts
const MemoizedRow = React.memo(({ item }) => <Row item={item} />);
```

***

### 7) **Defer navigation heavy-lifting**

```ts
// Example: precompute routes after first paint
useEffect(() => {
  requestAnimationFrame(() => {
    // build search indexes, preload icons, etc.
  });
}, []);
```

***

### 8) **Use native modules for crypto/compression/imagery**

*   Prefer native libs (via **TurboModule/JSI**) for:
    *   **AES/RSA** encryption
    *   **Gzip/Brotli** compression
    *   **Image resizing/thumbnailing**
*   Expose a thin async API to JS; do the heavy CPU work **off the main threads**.

***

## 🚦 What to watch in profiling

*   **Flipper**: JS CPU usage, UI thread stalls, React DevTools “Commit” times
*   **Hermes Profiling**: sampling profiler to find long JS frames
*   Long frames (>16ms) → stutters; identify functions creating **>5–10 ms** blocks and move/defer them.

***

## 🧠 Banking‑app specifics

*   OTP/login screens must feel instant → keep JS “cold path” minimal
*   Masking/formatting on inputs (PAN, account numbers) must be **cheap** → memoize & defer heavy validation
*   Secure storage reads on launch: use **MMKV**/**Keychain** through native/JSI, batch where possible
*   Charts/Statements: render summary first; lazy-load heavy charting libs and compute datasets off-thread

***

## 📌 Short summary (to say in interview)

> **Keep the JS thread free** by running animations/gestures on the **UI thread** (Reanimated), offloading CPU work to **native/JSI or worker threads**, deferring non‑critical tasks with **InteractionManager**/**rAF**, chunking large loops, batching storage/bridge calls, and tuning virtualized lists. Profile with **Flipper** and **Hermes** to catch long JS frames and move those operations off the hot path.

  </details>

  <details><summary>86. Image optimization techniques.</summary>

Here’s a **clean, concise, and interview‑ready** answer on:

# **86. Image Optimization Techniques in React Native**

Well‑optimized images improve **performance, memory usage, and startup time**—critical for banking apps that display statements, cards, QR codes, KYC photos, etc.

Below are the **most practical techniques** + short examples you can mention in interviews.

***

# ✅ **1. Use the correct image formats**

| Format   | Best For                | Benefit                       |
| -------- | ----------------------- | ----------------------------- |
| **WebP** | UI icons, illustrations | Smaller than PNG/JPG (30–80%) |
| **PNG**  | Transparent icons       | Lossless clarity              |
| **JPEG** | Photos                  | Small file • high compression |
| **SVG**  | Simple icons            | Resolution independent        |

👉 **WebP gives the biggest impact** in RN apps.

```jsx
<Image source={require('./assets/card.webp')} />
```

***

# ✅ **2. Resize / compress assets before bundling**

Never include 2000×2000 images when displaying at 200×200.

Use tools like:

*   TinyPNG
*   Squoosh
*   ImageMagick
*   RN asset plugins

> Banking apps often reduce bundle size by **30–50%** by pre‑optimizing icon sets.

***

# ✅ **3. Use `react-native-fast-image`**

FastImage handles:

*   Aggressive caching
*   Priority loading
*   Better decoding
*   Avoids JS‑side delays

```jsx
import FastImage from 'react-native-fast-image';

<FastImage
  source={{ uri: imageUrl }}
  style={{ width: 100, height: 100 }}
  resizeMode={FastImage.resizeMode.cover}
/>;
```

***

# ✅ **4. Use correct `resizeMode`**

Improves performance by reducing unnecessary GPU work.

```jsx
<Image
  source={...}
  resizeMode="contain"   // Avoids extra scaling
/>
```

Common optimal choices:

*   **cover** for banners
*   **contain** for logos
*   **center** for icons

***

# ✅ **5. Lazy load images (show placeholder first)**

```jsx
const [loaded, setLoaded] = useState(false);

<Image
  source={{ uri: url }}
  onLoadEnd={() => setLoaded(true)}
  style={{ opacity: loaded ? 1 : 0 }}
/>

{!loaded && <ActivityIndicator />}
```

👉 Prevents blocking UI when loading heavy resources.

***

# ✅ **6. Cache remote images**

Use FastImage (best) or manual caching.

FastImage auto-caches:

*   Disk cache
*   Memory cache
*   Priority + preload

```jsx
FastImage.preload([{ uri: userProfilePic }]);
```

***

# ✅ **7. Use correct image densities (Android/iOS)**

Place images appropriately:

    /android/app/src/main/res/drawable-hdpi
    /android/app/src/main/res/drawable-xhdpi
    /ios/Images.xcassets/...

RN auto‑selects the right resolution → prevents scaling cost.

***

# ✅ **8. Use CDN with automatic resizing**

When displaying cards, statements, user photos:

    https://cdn.mybank.com/photo?id=123&width=400&quality=70

Server sends only required resolution → big performance win.

***

# ✅ **9. Avoid inline base64 images**

Why?

*   Adds huge strings to JS bundle
*   Slower decoding
*   Blocks JS thread

Bad ❌

```jsx
<Image source={{ uri: 'data:image/png;base64,...' }} />
```

Prefer remote URL or asset file.

***

# ✅ **10. Prefetch / preload important images**

Useful for splash → login → dashboard flow.

```jsx
Image.prefetch('https://....logo.webp');
```

Or with FastImage:

```jsx
FastImage.preload([
  { uri: dashboardImage },
  { uri: offerBanner },
]);
```

***

# 🔥 Bonus: High-Impact Banking Use Cases

### 1) **QR Code images**

Generate via native modules or cached base64 → avoid regenerate on each render.

### 2) **KYC document photos**

*   Compress to **<300 KB**
*   Downscale on device before upload (RN Image Resizer)

```jsx
import ImageResizer from 'react-native-image-resizer';

const resized = await ImageResizer.createResizedImage(uri, 1024, 1024, 'JPEG', 80);
```

### 3) **Card images in dashboard**

*   Serve via CDN at 2–3 separate resolutions (small/medium/large)
*   Preload on login for smooth scroll

***

# 🎯 **Short Interview‑Ready Summary**

> Use WebP/SVG, compress & resize assets before bundling, use FastImage for caching, lazy-load heavy images, use proper resizeModes, avoid base64 inline images, and downscale KYC/large images using native image manipulation. Also use CDN-resized images to send minimal payload. These techniques significantly reduce memory usage, startup time, and UI jank.

  </details>

  <details><summary>87. Jank-free animations using Reanimated.</summary>

Here’s a **concise, interview‑ready** guide with **practical patterns + code** to build **jank‑free animations** in React Native using **Reanimated (v2/v3)**.

***

## 🎯 Core Principle

Reanimated runs animations on the **UI thread** via **worklets**, keeping them independent of the JS thread. That’s how you avoid dropped frames during heavy JS work.

> TL;DR: **Use shared values + worklets (`'worklet'`) + RNGH** so gestures & animations never wait on JS.

***

## ✅ Key Building Blocks

### 1) **Shared Values** (mutable state on UI thread)

```ts
import { useSharedValue } from 'react-native-reanimated';
const progress = useSharedValue(0); // Lives on UI thread
```

### 2) **Worklets** (code executed on UI thread)

```ts
function onDrag(dx: number) {
  'worklet';
  progress.value = dx; // instant, no JS bridge roundtrip
}
```

### 3) **Animated Styles**

```ts
import { useAnimatedStyle, withSpring } from 'react-native-reanimated';

const style = useAnimatedStyle(() => ({
  transform: [{ translateX: withSpring(progress.value) }],
}));
```

### 4) **Gesture Handler Integration (RNGH)**

```tsx
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const pan = Gesture.Pan()
  .onChange((e) => {
    'worklet';
    progress.value = e.translationX;
  })
  .onFinalize(() => {
    'worklet';
    progress.value = withSpring(0);
  });

<GestureDetector gesture={pan}>
  <Animated.View style={[styles.box, style]} />
</GestureDetector>
```

**Why this is jank‑free:** Pan updates and the spring run **entirely on the UI thread**.

***

## 🛠️ Patterns for Smoothness (60 FPS)

### A) Avoid JS work during animations

*   Don’t compute heavy things in React renders or effects that run during gestures.
*   Keep expensive logic **inside worklets** or **off‑thread** (e.g., parsing on a worker or native).

### B) Eliminate re-renders

*   Keep React component render cheap; move animation logic to **shared values + animated styles**.
*   Memoize props passed to large animated trees.

```ts
const MemoizedItem = React.memo(Item); // especially in lists
```

### C) Use **derived values** for chained animations

```ts
import { useDerivedValue } from 'react-native-reanimated';

const clamped = useDerivedValue(() => {
  'worklet';
  return Math.max(0, Math.min(progress.value, 100));
});
```

### D) Use **`withTiming`/`withSpring`/`withDecay`** with proper configs

```ts
x.value = withSpring(target, {
  damping: 15,
  stiffness: 120,
  mass: 1,
  overshootClamping: true, // stable feel for banking UIs
});
```

### E) Cancel / sequence animations correctly

```ts
import { cancelAnimation, withSequence } from 'react-native-reanimated';

cancelAnimation(x); // stop ongoing animation if gesture restarts
x.value = withSequence(
  withTiming(1, { duration: 120 }),
  withTiming(0, { duration: 120 })
);
```

### F) Use **Layout Animations** for mounts/unmounts

```ts
import { Layout, FadeIn, FadeOut } from 'react-native-reanimated';

<Animated.View
  entering={FadeIn.duration(150)}
  exiting={FadeOut.duration(120)}
  layout={Layout.springify().damping(15).stiffness(120)}
/>
```

Great for list insertions/removals **without JS**.

***

## 📦 Gesture + Physics Example (Bottom Sheet)

```tsx
const translateY = useSharedValue(HEIGHT);

const pan = Gesture.Pan()
  .onStart(() => {
    'worklet';
    cancelAnimation(translateY);
  })
  .onChange((e) => {
    'worklet';
    translateY.value = Math.max(0, translateY.value + e.changeY);
  })
  .onEnd((e) => {
    'worklet';
    const shouldOpen = translateY.value < HEIGHT * 0.4 || e.velocityY < -800;
    translateY.value = withSpring(shouldOpen ? 0 : HEIGHT, {
      damping: 18,
      stiffness: 220,
      mass: 1,
      velocity: e.velocityY,
    });
  });

const style = useAnimatedStyle(() => ({
  transform: [{ translateY: translateY.value }],
}));

return (
  <GestureDetector gesture={pan}>
    <Animated.View style={[styles.sheet, style]} />
  </GestureDetector>
);
```

**Notes:**

*   **`cancelAnimation`** avoids fighting springs.
*   Uses velocity for natural snap.

***

## 🧩 React State ↔ Worklets (Use `runOnJS` sparingly)

Only jump back to JS if absolutely needed (e.g., analytics, React state).

```ts
import { runOnJS } from 'react-native-reanimated';

function onSnapEndJS(state: 'open' | 'closed') {
  setSnap(state); // React state
}

.onEnd(() => {
  'worklet';
  const state = translateY.value === 0 ? 'open' : 'closed';
  runOnJS(onSnapEndJS)(state); // use sparingly; it costs a hop
});
```

***

## 🧠 Performance Tips

*   **Keep worklets pure**: no closures over big objects; pass primitives or use **`useSharedValue`**.
*   **Avoid creating new objects in worklets every frame** (e.g., new arrays). Compute scalars, reuse objects in UI styles cautiously.
*   **Batch UI updates**: update multiple shared values in a single worklet.
*   **Throttle gesture callbacks** only if necessary; RNGH+Reanimated is already frame‑synced.

***

## 📈 Profiling & Debugging

*   **Reanimated DevTools**: inspect shared values and animations (enable in Babel plugin if needed).
*   **Flipper**:
    *   React DevTools → check commit times.
    *   Perf monitor → watch FPS (UI/JS). UI should stay \~60.
*   **Hermes Profiling**: find any long JS frames (those won’t affect UI‑thread animations, but can affect events).

***

## 🛡️ Banking App Specifics

*   Use **snappy, predictable physics** (low overshoot) for money‑related interactions (card carousel, sheet, OTP keypad).
*   Keep animations subtle and fast (120–200ms timings, or spring damping).
*   Ensure **accessibility** (reduce motion setting → offer `withTiming` short fades instead of large translations).
*   Avoid running encryption/network calls in gesture handlers; kick them **after** animations settle.

***

## 🔎 Minimal Template (Card Flip)

```tsx
const rotate = useSharedValue(0);

const frontStyle = useAnimatedStyle(() => ({
  transform: [{ rotateY: `${rotate.value}deg` }],
  backfaceVisibility: 'hidden',
}));

const backStyle = useAnimatedStyle(() => ({
  transform: [{ rotateY: `${rotate.value + 180}deg` }],
  backfaceVisibility: 'hidden',
}));

const flip = () => {
  rotate.value = withTiming(rotate.value >= 90 ? 0 : 180, { duration: 180 });
};

<TouchableOpacity onPress={flip}>
  <View style={{ width: 300, height: 180 }}>
    <Animated.View style={[StyleSheet.absoluteFill, frontStyle]}>{/* front */}</Animated.View>
    <Animated.View style={[StyleSheet.absoluteFill, backStyle]}>{/* back */}</Animated.View>
  </View>
</TouchableOpacity>
```

***

## 📝 Quick Interview Sound‑Bite

> “I use **Reanimated worklets + shared values** with **RNGH** so gestures and animations run on the **UI thread**. I keep React re-renders minimal, use **derived values**, cancel/sequence animations properly, and rely on **Layout Animations** for list transitions. I avoid `runOnJS` except for side effects and profile with **Flipper/Hermes** to ensure 60 FPS.”

  </details>

  <details><summary>88. Memory leaks debugging tools (Flipper/Instruments).</summary>

Here’s a **short, interview‑ready** answer for:

# **88. Memory Leaks Debugging Tools (Flipper / Instruments)**

These are the **two most commonly used** tools to detect and fix memory leaks in React Native apps.

***

# ✅ **A) Flipper – Android & iOS (React Native)**

Flipper gives a **JS + RN + Native** view of memory usage.

## **1. Flipper Debugging Tools for Memory Leaks**

### **1) React DevTools → Profiler**

*   Detects unnecessary renders
*   Identifies components staying in memory due to closure leaks or stale refs

### **2) Hermes Debugger → Memory Profiling**

(Enable Hermes to get full memory profiling)

You can:

*   Track **JS heap usage**
*   Take **heap snapshots**
*   Inspect uncollected objects
*   Detect closures/memoization leaks

### **3) Flipper “Memory” Plugin**

Shows:

*   Total memory usage over time
*   Native heap vs JS heap
*   Leaks when memory **keeps growing after GC**

👉 **What to look for:**

*   JS heap not dropping after navigation (common leak)
*   Components not unmounted
*   Event listeners/timers staying alive
*   Large objects retained by closures

***

## **2. Flipper Workflow (Step-by-Step)**

### **Step 1: Enable Hermes (required for JS heap snapshot)**

`android/app/build.gradle`

```gradle
hermesEnabled: true
```

### **Step 2: Open Flipper → “Hermes Debugger” → Memory Graph**

*   Start recording
*   Navigate screens
*   Stop recording
*   Look for "Detached" objects
*   Inspect references → find what’s holding them

### **Step 3: Check React Render Flamegraph**

Look for:

*   Components re-rendering unintentionally
*   Props causing re-renders
*   Missing memoization (`React.memo`, `useCallback`)

***

# 🧠 Examples of issues Flipper helps catch

### ❌ Forgotten timers

```js
useEffect(() => {
  const interval = setInterval(fetch, 1000);
  return () => clearInterval(interval);  // missing cleanup = leak
}, []);
```

### ❌ Event listeners never removed

```js
BackHandler.addEventListener('hardwareBackPress', handler);
// cleanup needed!
```

### ❌ Large object inside closure

```js
useEffect(() => {
  function doSomething() {
    console.log(bigObject); // stays in memory
  }
}, [bigObject]);
```

***

# ✅ **B) Instruments (iOS)**

Most accurate tool for iOS native memory leaks.

***

## **1. Useful Instruments Tools**

### **1) Allocations Profiler**

Shows:

*   Memory allocations over time
*   Leaks
*   Retain cycles
*   RN Views, UIKit Views, Images, JS runtime objects

### **2) Leaks Instrument**

Detects:

*   Retain cycles (Objective‑C & Swift)
*   Native views not released
*   RN components causing native views to remain mounted

### **3) Time Profiler**

Helps detect:

*   Heavy JS → causing native memory pressure
*   Long-running UI operations

***

## **2. Instruments Workflow**

### **Step 1: Open Xcode → Product → Profile**

Choose:

*   **Leaks**
*   **Allocations**

### **Step 2: Capture allocations**

*   Navigate through screens
*   Check if memory drops after leaving screens

### **Step 3: Fix retain cycles**

Look for:

*   Views held by other views
*   Event handlers not removed
*   Objective‑C blocks capturing `self` strongly

***

# 🧪 iOS Example: Retain Cycle in Native Module

```objc
@property (nonatomic, strong) SomeManager *manager;

self.manager.callback = ^{
    // capturing self strongly = retain cycle
};
```

Fix:

```objc
__weak typeof(self) weakSelf = self;
self.manager.callback = ^{
    typeof(self) strongSelf = weakSelf;
};
```

Instruments detects such cycles instantly.

***

# 🚀 Bonus: Common Memory Leaks in React Native Apps

### **1) Uncleaned listeners**

*   AppState
*   BackHandler
*   DeviceEventEmitter
*   Keyboard events

### **2) Navigation leaks**

*   Screens holding large states
*   Not removing subscriptions when screen unmounts

### **3) Non-disposed animations**

*   Reanimated animations staying alive
*   Native driver animations without cleanup

### **4) Large images in memory**

*   Full resolution KYC photos
*   Card images not resized

***

# 🎯 Final Interview‑Ready Summary

> I use **Flipper** to debug JS and RN memory issues—especially JS heap snapshots via Hermes, checking component retain cycles, unmounted screens still in memory, and leaked listeners or timers. For iOS‑native memory debugging, I use **Instruments (Leaks + Allocations)** to detect retain cycles, view leaks, and native modules holding references. Combining Flipper + Instruments gives full visibility into both JS and native memory leaks.

  </details>

  <details><summary>89. Performance budgets & CI enforcement.</summary>

Here’s a **clean, short, interview‑ready** answer for:

# **89. Performance Budgets & CI Enforcement (React Native)**

*with practical examples used in real banking production pipelines.*

***

# ✅ **What are Performance Budgets?**

Performance budgets are **numeric limits** that your app must not exceed — used to prevent regressions.

Common budgets in React Native apps:

| Budget Type            | Typical Values                             |
| ---------------------- | ------------------------------------------ |
| **JS bundle size**     | e.g., `< 1.5 MB` (Hermes bytecode)         |
| **Startup Time (TTI)** | e.g., `< 2.5 seconds` on mid‑range devices |
| **Memory usage**       | e.g., `< 250 MB` peak for dashboard screen |
| **FPS/Frame Drops**    | no long (>16ms) UI thread stalls           |
| **Navigation latency** | screen open < 200–300ms                    |
| **Network payload**    | compressed API response < 400KB            |

***

# ✅ **Why Banking Apps Use Performance Budgets**

*   Mandatory for **security, compliance & service availability**
*   Strict performance SLAs (Login, Card List, Statement Viewer must load instantly)
*   Prevent regressions caused by new features or junior dev changes

***

# ✅ **CI Enforcement — How to Enforce Budgets Automatically**

### 🔥 Most teams enforce budgets in **CI (GitHub Actions / Jenkins / Bitrise)** using scripts that fail the pipeline when limits exceed.

***

## **1) Enforce JS Bundle Size Limit (CI script)**

Example: detect if bundle size grew >10% or crosses threshold.

```bash
yarn react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output build/index.android.bundle

MAX_SIZE=1700000     # 1.7 MB

ACTUAL_SIZE=$(wc -c < build/index.android.bundle)

echo "Bundle Size: $ACTUAL_SIZE bytes"

if [ $ACTUAL_SIZE -gt $MAX_SIZE ]; then
  echo "❌ Bundle size exceeded budget!"
  exit 1
fi

echo "✅ Bundle size within budget."
```

Add this step into your CI pipeline.

***

## **2) Enforce Startup Time / TTI Budget**

Use **E2E test automation** + performance markers.

### Track startup time (JS):

```ts
global.performanceStart = Date.now();

// In App.tsx
useEffect(() => {
  const tti = Date.now() - global.performanceStart;
  console.log('TTI:', tti);
});
```

### CI script parses logs:

```bash
TTI=$(adb logcat | grep "TTI:" | awk '{print $3}')

if [ "$TTI" -gt 2500 ]; then
  echo "❌ Startup time regression!"
  exit 1
fi
```

Used in **BrowserStack / Firebase Test Lab** devices.

***

## **3) Enforce Memory Budgets**

Use `adb shell dumpsys meminfo` in CI:

```bash
MEM=$(adb shell dumpsys meminfo com.mybank.app | grep "TOTAL" | awk '{print $2}')

if [ $MEM -gt 250000 ]; then
  echo "❌ Memory budget exceeded!"
  exit 1
fi
```

***

## **4) Enforce FPS / No Jank (UI Thread Budget)**

Use **Flipper Performance Plugin** programmatically:

*   CI collects UI thread frame drops
*   Threshold example: `< 5 dropped frames during navigation`

Automation tools:

*   Maestro
*   Detox Performance Plugin
*   Firebase Test Lab + Traceview

***

## **5) Enforce Network Payload Size**

Add API response size checks:

```ts
axios.interceptors.response.use(resp => {
  const bytes = new TextEncoder().encode(JSON.stringify(resp.data)).length;
  if (bytes > 400000) {
    throw new Error("Payload exceeds performance budget");
  }
  return resp;
});
```

Used in **pre-prod builds** only.

***

## **6) Integrate With GitHub Actions (Example)**

```yaml
name: Performance Budget Check

jobs:
  perf-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: yarn install
      - run: ./scripts/check-bundle-size.sh
      - run: ./scripts/check-startup-time.sh
      - run: ./scripts/check-memory.sh
```

Fails PR if budgets exceed.

***

# 🎯 **Real-World Banking Example**

Performance budgets typically enforced:

✔ Login TTI < 2.0 sec  
✔ Dashboard memory usage < 220MB  
✔ Bundle size < 1.8 MB  
✔ Navigation latency < 250ms  
✔ No JS frame > 20ms  
✔ No native frame > 16ms

Any breach → CI failure → PR blocked.

***

# 📌 **Short Interview‑Ready Summary**

> Performance budgets define strict limits for bundle size, startup time, memory usage, and frame drops. In CI, we enforce these using bundle size scripts, startup-time log parsing, memory checks, and automated device tests. If any metric exceeds its threshold, CI fails, preventing regressions and ensuring consistent performance—critical for banking apps.

  </details>

  <details><summary>90. Avoiding unnecessary re-renders in complex forms.</summary>

Here’s a **short, crisp, interview‑ready answer** with **practical patterns + code** for:

# **90. Avoiding Unnecessary Re-renders in Complex Forms**

Complex forms (KYC forms, loan applications, onboarding) often suffer from **slow typing, lag, and wasted renders**. The key is to isolate components, avoid prop changes, and prevent React from re-rendering the entire form on each keystroke.

Below are the **most effective strategies** with examples.

***

# ✅ **1. Split Form Into Smaller Memoized Components**

Instead of one giant form, break it into fields or sections:

```tsx
const TextField = React.memo(({ value, onChange, label }) => {
  return <TextInput value={value} onChangeText={onChange} placeholder={label} />;
});
```

> **React.memo** prevents re-renders unless props change.

***

# ✅ **2. Use `useCallback` for stable handlers**

Without `useCallback`, every keystroke creates a new function → triggers re-renders.

```tsx
const onNameChange = useCallback((text) => setValue('name', text), []);
```

***

# ✅ **3. Use `useMemo` for derived values**

Example: validating PAN, Aadhaar, card number.

```tsx
const isValidPan = useMemo(() => validatePan(values.pan), [values.pan]);
```

Avoids recomputing expensive logic every render.

***

# ✅ **4. Avoid storing each field in global state**

❌ **Bad**  
Every keystroke re-renders the entire form:

```tsx
const [form, setForm] = useState({ name: '', age: '' });
```

✔️ **Better**  
Use **multiple independent state slices**:

```tsx
const [name, setName] = useState('');
const [age, setAge] = useState('');
```

✔️ **Best**  
Use a form library.

***

# ✅ **5. Use a Form Library Built for Performance**

Top pick: **React Hook Form (RHF)** – extremely fast

*   Uses **uncontrolled inputs**
*   Isolates re-renders
*   Excellent for large banking/KYC forms

```tsx
const { control } = useForm();

<Controller
  control={control}
  name="email"
  render={({ field: { onChange, value } }) => (
    <TextInput value={value} onChangeText={onChange} />
  )}
/>
```

Only the field being edited re-renders — **not the entire form**.

***

# ✅ **6. Use `React.memo` + stable references for dropdowns & lookup data**

```tsx
const countries = useMemo(() => COUNTRY_LIST, []);

<CountrySelect data={countries} />
```

***

# ✅ **7. Avoid Inline Functions / Objects / Styles**

Inline objects cause prop changes → re-render.

❌ Bad

```tsx
<TextInput style={{ margin: 10 }} />
```

✔️ Good

```tsx
const styles = StyleSheet.create({
  input: { margin: 10 },
});
```

***

# ✅ **8. Debounce validations / API checks**

Avoid validating on every keypress.

```tsx
const debouncedValidate = useCallback(
  debounce((value) => validatePan(value), 400),
  []
);
```

***

# ✅ **9. Use `useRef` for non-rendering state**

For things like timers, flags, previous values:

```tsx
const panTouchedRef = useRef(false);
```

Does **not** trigger re-renders.

***

# ✅ **10. Virtualize long dynamic lists**

If your form includes long lists (e.g., transactions, address search suggestions):

Use:

```tsx
<FlatList ... />
```

Avoid:

```tsx
{items.map(...)}
```

***

# 🚀 Banking App Example — KYC Form Optimization

**Before (slow):**

*   One giant form component
*   Stored full form object in state
*   Validations running on every field change
*   Several dropdowns re-rendering unnecessarily

**After (fast):**

*   Split form into memoized field components
*   React Hook Form
*   Lookup lists memoized
*   PAN & Aadhaar validations debounced
*   Navigation transitions no longer lagging

Memory usage ↓ | Re-renders ↓ | Fast typing ↑

***

# 🎯 **Short Interview Answer**

> For complex forms, I prevent unnecessary re-renders by splitting the form into memoized components (`React.memo`), using stable handlers (`useCallback`), memoizing heavy computations (`useMemo`), and avoiding inline objects. I use React Hook Form because it isolates re-renders using uncontrolled inputs. I also debounce validations, use refs for non-rendering state, and optimize dropdown/lookup lists with memoization.

  </details>

  <details><summary>91. List virtualization strategies.</summary>

Here’s a **clean, interview‑ready answer** with **practical list virtualization strategies** used in real React Native banking apps (transactions, statements, offers, notifications, etc.).

***

# **91. List Virtualization Strategies**

In React Native, virtualization means **rendering only the items visible on screen**, instead of rendering the entire list. This keeps memory low and prevents jank during scroll.

React Native’s **FlatList**, **SectionList**, and **VirtualizedList** already support this, but you must configure them correctly.

***

# ✅ **1. Use FlatList Instead of ScrollView**

❌ **ScrollView**  
Renders *everything*, leading to:

*   High memory usage
*   Slow scroll
*   Poor performance on long data (like 5,000+ transactions)

✔️ **FlatList**  
Renders only **visible + buffer** items.

***

# ✅ **2. Key Prop Settings for Virtualization**

Below are the **most impactful props** for performance:

```tsx
<FlatList
  data={transactions}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  windowSize={5}
  removeClippedSubviews={true}
  getItemLayout={getItemLayout} // when possible
/>
```

### Explanation:

*   **initialNumToRender**  
    render only initial visible items (avoid huge initial loads)

*   **maxToRenderPerBatch**  
    how many items are rendered per batch when scrolling

*   **updateCellsBatchingPeriod**  
    delay between render batches → smooth scrolling

*   **windowSize**  
    how many screens worth of items to keep in memory  
    e.g., 5 → 2 above, 2 below, 1 visible

*   **removeClippedSubviews**  
    HUGE win for Android – unmounts off-screen items

*   **getItemLayout**  
    If all rows have fixed height, provides precise measurement → zero lag.

***

# ✅ **3. Memoize Row Components**

Each row should be **pure** and memoized:

```tsx
const TransactionRow = React.memo(({ item }) => {
  return <Row item={item} />;
});
```

Also use stable props:

```tsx
const renderItem = useCallback(({ item }) => {
  return <TransactionRow item={item} />;
}, []);
```

Prevents re-renders when scrolling.

***

# ✅ **4. Avoid Inline Functions & Inline Styles**

Inline props = new objects = re-renders.

✔️ Move to `useCallback` & `StyleSheet.create()`.

***

# ✅ **5. Use `getItemLayout` Where Possible**

If item height is predictable:

```tsx
const ROW_HEIGHT = 72;

const getItemLayout = (data, index) => ({
  length: ROW_HEIGHT,
  offset: ROW_HEIGHT * index,
  index,
});
```

Benefits:

*   Instant scroll-to-index
*   No measuring
*   Zero layout calculations during scroll

Perfect for banking transaction rows.

***

# ✅ **6. Use `VirtualizedList` for Fully Dynamic Data**

If you have:

*   Paginated lists
*   Giant datasets (10k+ rows)
*   Data not available at once

```tsx
<VirtualizedList
  data={data}
  initialNumToRender={10}
  getItemCount={() => data.length}
  getItem={(data, index) => data[index]}
/>
```

Allows complete control over virtualization.

***

# ✅ **7. Use Pagination + Infinite Scroll**

Load in chunks rather than entire dataset.

```tsx
onEndReached={fetchMore}
onEndReachedThreshold={0.4}
```

Prevents memory explosion.

***

# ✅ **8. Avoid Heavy RenderItem Logic**

Keep `renderItem` tiny:

*   Precompute expensive values outside list
*   Cache formatted dates, amounts
*   Avoid heavy string operations inside row render

***

# ✅ **9. Use RecyclerListView for Extremely Large Lists**

For huge datasets (10k–100k rows), use:

    npm install recyclerlistview

Benefits:

*   Highly optimized recycler
*   Predictive layout
*   Lowest memory footprint

Great for:

*   Transaction history
*   Statements
*   Messages

***

# ✅ **10. Remove Hidden Items from Memory (Android)**

`removeClippedSubviews` gives a major boost:

```tsx
removeClippedSubviews={true}
```

Improves:

*   Memory
*   Scroll performance
*   Off-screen cleanup

***

# 🚀 **Banking App Real-World Example: 5,000 Transactions Screen**

**Before** (ScrollView):

*   5–7 seconds load
*   App froze during scroll
*   High memory (600MB+)

**After** (Optimized FlatList):

*   Loads instantly (10 rows only)
*   Smooth scrolling
*   Memory <200MB
*   No dropped frames

***

# 🎯 **Short Interview Answer**

> To virtualize lists, I use FlatList/SectionList with correct props like `initialNumToRender`, `windowSize`, `maxToRenderPerBatch`, and `removeClippedSubviews`. I memoize row components, avoid inline functions, and use `getItemLayout` when row sizes are fixed. For huge datasets, I switch to VirtualizedList or RecyclerListView. This ensures smooth, memory-efficient lists even with thousands of items, which is critical in banking apps.

  </details>

  <details><summary>92. Hermes bytecode preloading advantages.</summary>

Here’s a **short, crisp, interview‑ready answer** on:

# **92. Hermes Bytecode Preloading — Advantages**

Hermes bytecode preloading is one of the **biggest React Native performance improvements** introduced in RN 0.70+ and refined in later versions. It dramatically improves **startup time**, **memory usage**, and **bundle efficiency**, especially important for **banking apps**.

***

# ✅ **What is Hermes Bytecode Preloading?**

Normally, React Native ships a **JavaScript bundle (.js)**, and Hermes has to **parse + compile it into bytecode during startup**.

With **bytecode preloading**, Hermes compiles the JS bundle into **.hbc (Hermes ByteCode)** **at build time**, not at runtime.

📌 Result → The app loads precompiled bytecode directly → **no JS parsing during startup**.

***

# 🚀 **Advantages**

## **1️⃣ Huge Reduction in Startup Time (TTI / Cold Start)**

When you preload bytecode:

*   No need to parse JS
*   No need to compile JS to bytecode
*   Directly executes bytecode

🔥 Real apps see **20–40% faster cold start**.

For banking apps:

*   Login screen loads instantly
*   Faster biometrics initialization
*   Faster dashboard initial render

***

## **2️⃣ Smaller JS Bundle Size**

Hermes bytecode (`.hbc`) is:

*   Smaller than raw `.js` bundles
*   Better optimized
*   Often compresses better in APK/IPA

Typical savings: **15–30%**.

Smaller bundle → faster OTA delivery via CodePush or custom OTA.

***

## **3️⃣ Lower Memory Usage**

Hermes bytecode:

*   Has a **smaller in-memory footprint**
*   Avoids storing both JS source + compiled output
*   Minimizes JS heap allocation during startup

Particularly useful for:

*   Low-memory Android devices
*   Older iPhones
*   Budget devices used in Indian markets

***

## **4️⃣ Faster Execution (Less JIT Overhead)**

Hermes bytecode uses an **ahead-of-time compilation model**, resulting in:

*   Faster function execution
*   Less interpreter overhead
*   More deterministic performance

This removes a major performance spike during early screen navigation.

***

## **5️⃣ Reduces "JS Parsing Overload" Spikes**

Without preloading, JS parsing can cause:

*   UI thread pauses
*   Jank during startup
*   Unresponsiveness under heavy JS load

With preloading → **zero parsing** → smoother startup.

***

## **6️⃣ Improves CI / Release Reliability**

Precompiled bytecode means:

*   Build-time errors occur earlier
*   JS syntax errors visible before runtime
*   Better reproducibility across environments

CI can enforce:

```gradle
enableHermesBytecodePrecompilation true
```

***

## **7️⃣ Perfect for CodePush / OTA Updates**

When delivering OTA updates:

*   Bytecode is significantly smaller
*   Installs faster
*   No runtime compilation

Delivering faster patches is crucial in banking apps for:

*   Regulatory changes
*   UPI rule updates
*   Feature flags and A/B testing

***

# 🧩 **How to Enable Hermes Bytecode Preloading**

### **Android**

```gradle
project.ext.react = [
  enableHermes: true,
  enableHermesBytecodePrecompilation: true
]
```

### **iOS (`Podfile`)**

```ruby
hermes_enabled => true,
hermes_bytecode_precompile => true
```

***

# 🎯 **Short Interview Answer**

> Hermes bytecode preloading compiles JS into Hermes bytecode at build time, so the app doesn’t need to parse or compile JS during startup. This results in **much faster cold start**, **smaller bundle size**, **lower memory usage**, and **smoother TTI**. It also improves CI reliability and speeds up OTA updates. It’s one of the most effective performance gains in modern React Native apps, especially for banking-grade applications.

  </details>

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
