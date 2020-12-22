# node-dsitributed-debounce

## Installation

```sh
$ npm i -S node-distributed-debounce
```

## Usave

example:

```ts
import distributedDebounce from 'node-distributed-debounce';
import redis from 'redis';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const redisclient = redis.createClient();

function debouncedCall() {
  distributedDebounce(() => {
    console.log('called');
  }, {
    wait: 5, // sec
    key: 'dist:debounce:call', // key for debounce
    redisclient,
  }).catch(e => console.error(e));
}

function main() {
  for (let i = 0; i < 10; i++) {
    debouncedCall();
    wait(100);
  }
}

```

output:

```
called
```


## QA

- Q: Is it works with redis cluster?
- A: Yes, it is.

## Algorithm

```
FUNCTION DISTRIBUTED_DEBOUCE(key, wait, callback)

currentCounter = MULTI
  INCR(key)
  EXPRE(key, wait)
EXEC

SLEEP(wait)

counter = GET(key)
IF currentCounter != counter
  EXIT
END

IF SET(key_lock, '', NX, PX, 100) != OK
  EXIT
END

callback()
```


