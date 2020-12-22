import type { RedisClient } from "redis";
export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * distributed debounce function using redis.
 *
 * more detail
 *  - https://github.com/plaidev/karte-io-systems/issues/24054
 */
async function distributedDebounce(
  callback: () => any,
  args: {
    /**
     * wait is seconds.
     */
    wait: number;
    /**
     * callback function will be called debouncely with each key.
     */
    key: string;
    redisclient: RedisClient;
  }
) {
  // incr counter
  const currentCount = await new Promise<number>((resolve, reject) => {
    args.redisclient
      .multi()
      .incr(args.key)
      .expire(args.key, args.wait)
      .exec((error, result) => {
        if (error) return reject(error);
        else return resolve(result[0]);
      });
  });

  // wait for ttl sec.
  await wait(args.wait * 1000);

  // check this counting is the latest.
  const counter = await new Promise<number>((resolve, reject) => {
    args.redisclient.get(args.key, (error, result) => {
      if (error) return reject(error);
      else if (!result) return resolve(currentCount);
      // when key expired.
      else return resolve(parseInt(result));
    });
  });
  if (currentCount !== counter) return;

  // lock for atomicity
  const ok = await new Promise<"OK" | undefined>((resolve, reject) => {
    args.redisclient.set(
      `${args.key}_lock`,
      "",
      "NX",
      "PX",
      100,
      (error, result) => {
        if (error) return reject(error);
        else return resolve(result);
      }
    );
  });
  if (!ok) return;

  // debouced call
  await callback();
}

export { distributedDebounce };
