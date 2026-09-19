---
title: "Abbas-odo — Day 2: First end-to-end path"
date: 2026-09-17T11:05:00Z
project: Abbas-odo
---

Got the first end-to-end path working. Input goes in, result comes out. It's ugly, but it runs.

## Embeds test

A bare link on its own line becomes a preview card:

https://developer.mozilla.org/en-US/docs/Web/JavaScript

A YouTube link becomes an embedded player:

https://www.youtube.com/watch?v=dQw4w9WgXcQ

## Alignment test

This paragraph is centered. {.center}

This one is right-aligned. {.right}

And a JavaScript snippet for syntax highlighting:

```js
const pipeline = async (input) => {
  const parsed = parse(input);      // step 1
  const result = await run(parsed); // step 2
  return format(result);
};
```
