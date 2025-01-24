# `avocet-sdk`

JavaScript SDK for fetching feature flags from [Avocet](https://avocet-experimentation.github.io), an open-source feature flagging and software experimentation platform.

## Setup

1. From the Avocet dashboard, create an SDK connection to generate an API key, or select an existing one.
2. Install the package: `npm install @avocet/sdk`.
3. Initialize the SDK in the application in which you wish to add feature flags:

```ts
import { AvocetClient } from '@avocet/sdk';
import { Span } from '@opentelemetry/api'; // we use OpenTelemetry as an example, but other providers work

const avocetClient = AvocetClient.start({
  apiKey: '', // replace with API key from an SDK connection
  apiUrl: '', // public endpoint of the flagging API
  attributeAssignmentCb: (attributes: Record<string, string>, span: Span) => {
    span.setAttributes(attributes);
  }, // an optional callback defining how to save flag attributes onto telemetry data
  autoRefresh: true, // if true, periodically fetches data for all flags in the environment
  refreshIntervalInSeconds: 300, // defaults to 300 seconds (5 minutes)
  useStale: true, // defaults to true. If set to true, cached flag data will be retained when refreshing
  clientProps: {
    // client properties will be formatted and included in the attributes argument to the assignment callback
    id: 'my-user-id'
  }
});

export default avocetClient;
```

## Usage

1. Define flags in the Avocet dashboard.
2. Use them to guide control flow, either with synchronous checks:

```ts
import avocetClient from './feature-flagging.ts';

if (avocetClient.get('my-boolean-flag') === true) {
  // feature logic
} else {
  // fallback logic
}
```

or asynchronous checks, fetching the most up-to-date value of the flag:

```ts
const flagValue = await avocetClient.getLive('my-number-flag');
if (flagValue === 2) {
  // logic for first version of the feature
} else if (flagValue === 1) {
  // logic for second version of the feature
} else {
  // fallback logic
}
```

If the SDK was initialized with an attribute assignment callback, you have the option to pass telemetry data into `.get`, which triggers the callback:

```ts
if (avocetClient.get('my-boolean-flag', currentSpan) === true) {
  // feature logic
} else {
  // fallback logic
}
```

Enable or disable flag refreshing:

```ts
avocetClient.startPolling();
avocetClient.stopPolling();
```

Instead of using the attribute assignment callback, you can get attribute data directly:

```ts
const { value, attributes } = avocetClient.getWithAttributes('my-string-flag');
```
