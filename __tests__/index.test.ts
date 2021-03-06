import assert from "assert";
import { distributedDebounce, wait } from "../src";
import redis from "redis";

const redisclient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
});

test("atomicity", async () => {
  let counter = 0;
  const key = `dist:debounce:call:atomicity:${Math.random()}`;
  for (let i = 0; i < 50; i++) {
    distributedDebounce(
      () => {
        counter++;
      },
      {
        wait: 1,
        key,
        redisclient,
      }
    );
  }
  await wait(1300);
  assert(counter === 1);
});

test("debounce", async () => {
  let lastExecuted = -1;
  let counter = 0;
  const key = `dist:debounce:call:debounce:${Math.random()}`;
  for (let i = 0; i < 30; i++) {
    distributedDebounce(
      () => {
        lastExecuted = i;
        counter++;
      },
      {
        wait: 1,
        key,
        redisclient,
      }
    );
    await wait(10);
  }
  await wait(1300);
  assert(lastExecuted === 29);
  assert(counter === 1);
});

test("key", async () => {
  let counter = 0;
  for (let i = 0; i < 10; i++) {
    distributedDebounce(
      () => {
        counter++;
      },
      {
        wait: 1,
        key: `dist:debounce:call:key-${Math.random()}`,
        redisclient,
      }
    );
    await wait(10);
  }
  await wait(1300);
  assert(counter === 10);
});
