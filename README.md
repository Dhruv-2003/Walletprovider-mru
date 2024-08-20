# Integration Guide: Wallet Providers (Dynamic, Privy, & Web3Auth) with Stackr Micro Rollups

## Overview

This guide walks you through the process of integrating popular wallet providers with Stackr Micro Rollups (MRU). By following these steps, you'll enable users to interact with the rollup using their preferred wallet provider.

## Prerequisites

- Basic understanding of Stackr Micro Rollups.
- Familiarity with frontend development (React, Vue, etc.).
- Installed dependencies for interacting with the Stackr MRU and the chosen wallet providers.


## How to build ?

### Step 1: Initialize the Rollup

1. Initialise an MRU: Start by initialising MRU using the `@stackr/cli` and selecting the template of your choice, and adding a name for your project.

```bash
$ npx @stackr/cli@latest init

        _             _                        _ _
    ___| |_ __ _  ___| | ___ __            ___| (_)
   / __| __/ _` |/ __| |/ / '__|  _____   / __| | |
   \__ \ || (_| | (__|   <| |    |_____| | (__| | |
   |___/\__\__,_|\___|_|\_\_|             \___|_|_|
 

? Pick a template > token-transfer
? Project Name > token-transfer


$ cd token-transfer
```

2. Configure the State & Implement the required STF: Modify the state of the MRU file to include variables for your project and implement transition functions as required

3. The MRU needs to have express server attached to it , to expose the endpoints for submitting the actions from the frontend to the MRU. `token-transfer` template comes by default with the express app endpoints. 

```bash
npm install express
```

```typescript
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors())
app.use(express.json())

app.post("/:reducerName", async (req: Request, res: Response) => {
  const { reducerName } = req.params;
  const actionReducer = transitions[reducerName];

  if (!actionReducer) {
    res.status(400).send({ message: "No reducer for action" });
    return;
  }
  const action = reducerName as keyof typeof schemas;

  const { msgSender, signature, inputs } = req.body;

  const schema = schemas[action];

  try {
    const newAction = schema.actionFrom({ msgSender, signature, inputs });
    const ack = await mru.submitAction(reducerName, newAction);
    res.status(201).send({ ack });
  } catch (e: any) {
    res.status(400).send({ error: e.message });
  }
  return;
});

app.get("/getEIP712Types/:reducerName", (req: Request, res: Response) => {
  // @ts-ignore
  const { reducerName } = req.params;
  console.log(reducerName);

  const action = reducerName as keyof typeof schemas;
  console.log(action);

  const schema = schemas[action];
  console.log(schema);
  if (!schema) {
    res.status(400).send({ error: "no schema for action" });
    return;
  }
  try {
    const eip712Types = schema.EIP712TypedData.types;
    const domain = schema.domain;

    return res.send({ eip712Types, domain });
  } catch (e: any) {
    res.status(400).send({ error: e.message });
  }
});

app.listen(5050, () => console.log('Server running on port 5050'));
```

### Step 2 Add Wallet Providers to the Frontend

According to your choice of Wallet providers , you can follow the docs to install the required dependencies , setup the providers & add login options as required.

Follow the docs for your type of application

Dynamic : https://docs.dynamic.xyz/quickstart

Privy : https://docs.privy.io/guide/react/quickstart

Web3 Auth : https://web3auth.io/docs/quick-start


### Step 3 Interaction with the MRU using Wallet Providers

1. Prepare the Action: Define the action that needs to be signed by the user before sending it to the MRU.

```typescript
const actionName = "create";

const response = await fetch(
    `http://localhost:5050/getEIP712Types/${actionName}`
);

const data = await response.json();
const eip712Types = data.eip712Types;

const domain = data.domain;
const payload = {
   address: address,
};
```

2. Get User’s Signature: Use the wallet provider to get the user’s signature over the action. Wallet connect from viem linked to wallet provider instance is being used to sign

```typescript
 const signature = await walletClient.signTypedData({
    account: address,
    domain: domain,
    primaryType: "createAccount",
    types: eip712Types,
    message: payload,
  });
```

3. Send Action to Backend: After obtaining the signature, send the action to the backend for processing.

```typescript
const body = JSON.stringify({
    msgSender: address,
    signature,
    inputs: payload,
});

const res = await fetch(`http://localhost:5050/${actionName}`, {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json",
    },
});
```

## Project Structure 

```
│ 
├── token-rollup
│   ├──  src
│   │   ├── stackr
│   │   │   ├── machine.ts
│   │   │   ├── actions.ts
│   │   │   ├── transitions.ts
│   │   ├── index.ts
│   │── stackr.config.ts
│   │── deployment.json
│
├── frontend
│   ├──  src
│   │   ├── app
│   │   │   ├── dynamic/page.tsx
│   │   │   ├── privy/page.tsx
│   │   │   ├── web3auth/page.tsx
│   │   │
│   │   ├── components
│   │   │   ├── Provider.tsx
│   │   │
│   │   ├── layout.tsx

```

## How to run frontend ?

### Run using command :

```bash
npm start
```

## How to run MRU ?

### Run using Node.js :rocket:

```bash
npm start
```

### Run using Docker :whale:

- Build the image using the following command: (make sure you replace \`<NPM_TOKEN>\` with the actual value)

```bash
# For Linux
docker build -t Oracle:latest . --build-arg NPM_TOKEN=<NPM_TOKEN>

# For Mac with Apple Silicon chips
docker buildx build --platform linux/amd64,linux/arm64 -t Oracle:latest . --build-arg NPM_TOKEN=<NPM_TOKEN>
```

- Run the Docker container using the following command:

```bash
# If using SQLite as the datastore
docker run -v ./db.sqlite:/app/db.sqlite -p <HOST_PORT>:<CONTAINER_PORT> --name=Oracle -it Oracle:latest

# If using other URI based datastores
docker run -p <HOST_PORT>:<CONTAINER_PORT> --name=Oracle -it Oracle:latest
```
