> 👉 I recommend to use [temporal.io](https://temporal.io) to durably execute something in distributed systems. It's really flexible and useful.

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

- Q: Does it work with redis cluster?
- A: Yes.

## Algorithm

```
FUNCTION DISTRIBUTED_DEBOUNCE(key, wait, callback)

ticket = MULTI
  INCR(key)
  EXPRE(key, wait)
EXEC

SLEEP(wait)

currentTicket = GET(key)
IF currentTicket != ticket
  EXIT
END

IF SET(key_lock, '', NX, PX, 100) != OK
  EXIT
END

callback()
```


