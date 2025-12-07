import http from 'k6/http'

import { check, sleep } from 'k6'

export const options = {
  vus: 100,
  duration: '10m',
}

const BASE_URL = 'http://localhost:30080'


function createStaticRecipient(url, key) {
  const clientPayload = JSON.stringify({
    name: `Static Recipient`,
    email: `static_recipient@test.com`,
    password: "password",
  });
  const clientRes = http.post(`${url}/clients/`, clientPayload, {
    headers: { "Content-Type": "application/json" },
  });
  const clientData = JSON.parse(clientRes.body);
  const clientId = clientData.id;

  const accountPayload = JSON.stringify({
    client: clientId,
    key: key,
    balance: 1000,
  });
  const accountRes = http.post(`${url}/accounts/`, accountPayload, {
    headers: { "Content-Type": "application/json" },
  });
  const accountData = JSON.parse(accountRes.body);
  const accountId = accountData.id;

  return {
    recipientKey: JSON.parse(accountRes.body).key,
    recipientClientId: clientId,
    recipientAccountId: accountId,
  };
}

export function setup() {
  const STATIC_KEY = "static_recipient_key";
  console.log(`Setting up static recipient with key: ${STATIC_KEY}`);

  return createStaticRecipient(BASE_URL, STATIC_KEY);
}

export default function (data) {

  const RECIPIENT_KEY = data.recipientKey;

  /* Create Client */
  const client = JSON.stringify({
    name: `User ${__VU} ${__ITER}`,
    email: `user${__VU}${__ITER}@gmail.com`,
    password: "password",
  });

  const createRes = http.post(`${BASE_URL}/clients/`, client, {
    headers: { "Content-Type": "application/json" },
  });
  check(createRes, {
    "create client status is 200": (r) => r.status === 200,
    "create client body has id": (r) => JSON.parse(r.body).id !== undefined,
  });

  /* Get Client */
  const clientId = JSON.parse(createRes.body).id;
  const getRes = http.get(`${BASE_URL}/clients/${clientId}`);
  check(getRes, {
    "get client status is 200": (r) => r.status === 200,
    "get client body has correct id": (r) => JSON.parse(r.body).id === clientId,
  });

  /* Create Account and Recipient Account */
  const account = JSON.stringify({
    client: clientId,
    key: `user${__VU}${__ITER}`,
    balance: 1000,
  });

  const accountRes = http.post(`${BASE_URL}/accounts/`, account, {
    headers: { "Content-Type": "application/json" },
  });

  check(accountRes, {
    "create account status is 200": (r) => r.status === 200,
    "create account body has id": (r) => JSON.parse(r.body).id !== undefined,
  });

  /* Get Account */
  const accountId = JSON.parse(accountRes.body).id;
  const getAccountRes = http.get(`${BASE_URL}/accounts/${accountId}`);
  check(getAccountRes, {
    "get account status is 200": (r) => r.status === 200,
    "get account body has correct id": (r) =>
      JSON.parse(r.body).id === accountId,
  });

  /* Login */
  const loginPayload = JSON.stringify({
    email: `user${__VU}${__ITER}@gmail.com`,
    password: "password",
  });

  const loginRes = http.post(`${BASE_URL}/login/`, loginPayload, {
    headers: { "Content-Type": "application/json" },
  });
  check(loginRes, {
    "login status is 200": (r) => r.status === 200,
    "login body has id and account": (r) => {
      const body = JSON.parse(r.body);
      return body.id !== undefined && body.account !== undefined;
    },
  });

  /* Create Transaction */
  const transaction = JSON.stringify({
    from_account: accountId,
    to_account: RECIPIENT_KEY,
    amount: 100,
  });

  const transactionRes = http.post(`${BASE_URL}/transactions/`, transaction, {
    headers: { "Content-Type": "application/json" },
  });
  check(transactionRes, {
    "create transaction status is 200": (r) => r.status === 200,
    "create transaction body has id": (r) =>
      JSON.parse(r.body).id !== undefined,
  });

  /* Get Transactions By Account */
  const getTransactionsRes = http.get(
    `${BASE_URL}/accounts/${accountId}/transactions`
  );
  check(getTransactionsRes, {
    "get transactions status is 200": (r) => r.status === 200,
    "get transactions body is array": (r) => Array.isArray(JSON.parse(r.body)),
  });

  /* Delete Account */
  const deleteAccountRes = http.del(`${BASE_URL}/accounts/${accountId}`);
  check(deleteAccountRes, {
    "delete account status is 200": (r) => r.status === 200,
  });

  /* Delete Client */
  const deleteClientRes = http.del(`${BASE_URL}/clients/${clientId}`);
  check(deleteClientRes, {
    "delete client status is 200": (r) => r.status === 200,
  });

  /* Wait between iterations */
  sleep(1);
}

export function teardown(data) {
  const { recipientAccountId, recipientClientId } = data;

  console.log("Starting teardown: Deleting static recipient data...");

  const deleteAccountRes = http.del(
    `${BASE_URL}/accounts/${recipientAccountId}`
  );

  if (deleteAccountRes.status === 200) {
    console.log(
      `Successfully deleted recipient account ID: ${recipientAccountId}`
    );
  } else {
    console.error(
      `Failed to delete recipient account ID ${recipientAccountId}. Status: ${deleteAccountRes.status}`
    );
  }

  const deleteClientRes = http.del(`${BASE_URL}/clients/${recipientClientId}`);

  if (deleteClientRes.status === 200) {
    console.log(
      `Successfully deleted recipient client ID: ${recipientClientId}`
    );
  } else {
    console.error(
      `Failed to delete recipient client ID ${recipientClientId}. Status: ${deleteClientRes.status}`
    );
  }
}