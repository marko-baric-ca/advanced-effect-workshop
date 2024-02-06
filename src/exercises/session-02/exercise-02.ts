import { Deferred, Effect, Fiber, Queue, ReadonlyArray } from "effect"

// Exercise Summary:
//
// The following exercise will explore how we can distribute work between
// multiple fibers using Queue and gain access to the results of said work
// with Deferred. Our sample program will setup a classic producer / consumer
// relationship. Once completed we can tweak the concurrency of our program to
// demonstrate the flexibility of this pattern.

// The below function simulates performing some non-trivial work
const performWork = (value: number) =>
  Effect.log(`Consuming value: '${value}'`).pipe(
    Effect.delay("20 millis"),
    Effect.as(`Processed value: '${value}'`)
  )

const program = Effect.gen(function*(_) {
  // Our queue will contain pairs of (number, Deferred)
  const queue = yield* _(Queue.unbounded<[number, Deferred.Deferred<never, string>]>())

  const produceWork = (value: number): Effect.Effect<never, never, string> =>
    // Complete the implementation of `produceWork`. Your implementation should:
    //   - Offer entries of work into the Queue
    //   - Await the result of said work

  const consumeWork: Effect.Effect<never, never, void> =
    // Complete the implementation of `consumeWork`. Your implementation should:
    //   - Take entries of work from the Queue
    //   - Utilize `performWork` to perform some work on the value taken from the Queue
    //   - Communicate the result of `performWork` back to the producer
    //   - Work should be consumed continuously and with unbounded concurrency

  // The following fiber utilizes `consumeWork` to take entries from the Queue,
  // perform some work on the taken value, and communicate the result of the
  // work back to the producer
  const consumerFiber = yield* _(
    consumeWork,
    Effect.annotateLogs("role", "consumer"),
    Effect.fork
  )

  // The following Effect pipeline performs work on ten numbers and then logs
  // the result of the work to the console
  yield* _(
    Effect.forEach(ReadonlyArray.range(0, 10), (value) =>
      produceWork(value).pipe(
        Effect.flatMap((result) => Effect.log(result))
      )),
    Effect.annotateLogs("role", "producer")
  )

  yield* _(Fiber.join(consumerFiber))
})

program.pipe(
  Effect.tapErrorCause(Effect.logError),
  Effect.runFork
)
