import assert from "assert";
import distributedDebounce from "../src";
import redis from "redis";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
test("atomicity", async () => {
  const redisclient = redis.createClient();
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
  await sleep(1300);
  assert(counter === 1);
});

test("debounce", async () => {
  const redisclient = redis.createClient();
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
    await sleep(10);
  }
  await sleep(1300);
  assert(lastExecuted === 29);
  assert(counter === 1);
});

test("key", async () => {
  const redisclient = redis.createClient();
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
    await sleep(10);
  }
  await sleep(1300);
  assert(counter === 10);
});
