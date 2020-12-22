# node-dsitributed-debounce

debounce function for distributed system with redis and nodejs.

## Installation

```sh
$ npm i -S node-distributed-debounce
```

and install redis

```sh
$ npm i -S redis
$ npm i -D @types/redis
```

## Usage

example:

```ts
import { distributedDebounce } from 'node-distributed-debounce';
// const { distributedDebounce } = require('node-distributed-debounce');
import redis from 'redis';

const redisclient = redis.createClient();

function debouncedCall(index: number) {
  distributedDebounce(() => {
    console.log('called', index);
  }, {
    wait: 5, // sec
    key: 'dist:debounce:call', // key for debounce
    redisclient,
  }).catch(e => console.error(e));
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
function main() {
  for (let i = 0; i < 10; i++) {
    debouncedCall(i);
    await wait(100);
  }
}

```

output:

```
called 9
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


