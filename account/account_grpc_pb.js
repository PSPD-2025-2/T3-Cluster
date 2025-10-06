// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var account_pb = require('./account_pb.js');
var google_protobuf_empty_pb = require('google-protobuf/google/protobuf/empty_pb.js');

function serialize_account_AccountRequest(arg) {
  if (!(arg instanceof account_pb.AccountRequest)) {
    throw new Error('Expected argument of type account.AccountRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_account_AccountRequest(buffer_arg) {
  return account_pb.AccountRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_account_AccountResponse(arg) {
  if (!(arg instanceof account_pb.AccountResponse)) {
    throw new Error('Expected argument of type account.AccountResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_account_AccountResponse(buffer_arg) {
  return account_pb.AccountResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_account_CreateAccountRequest(arg) {
  if (!(arg instanceof account_pb.CreateAccountRequest)) {
    throw new Error('Expected argument of type account.CreateAccountRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_account_CreateAccountRequest(buffer_arg) {
  return account_pb.CreateAccountRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_account_SendMoneyRequest(arg) {
  if (!(arg instanceof account_pb.SendMoneyRequest)) {
    throw new Error('Expected argument of type account.SendMoneyRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_account_SendMoneyRequest(buffer_arg) {
  return account_pb.SendMoneyRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_account_TransactionResponse(arg) {
  if (!(arg instanceof account_pb.TransactionResponse)) {
    throw new Error('Expected argument of type account.TransactionResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_account_TransactionResponse(buffer_arg) {
  return account_pb.TransactionResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_account_UpdateAccountRequest(arg) {
  if (!(arg instanceof account_pb.UpdateAccountRequest)) {
    throw new Error('Expected argument of type account.UpdateAccountRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_account_UpdateAccountRequest(buffer_arg) {
  return account_pb.UpdateAccountRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_google_protobuf_Empty(arg) {
  if (!(arg instanceof google_protobuf_empty_pb.Empty)) {
    throw new Error('Expected argument of type google.protobuf.Empty');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_google_protobuf_Empty(buffer_arg) {
  return google_protobuf_empty_pb.Empty.deserializeBinary(new Uint8Array(buffer_arg));
}


var AccountServiceService = exports.AccountServiceService = {
  getAccount: {
    path: '/account.AccountService/GetAccount',
    requestStream: false,
    responseStream: false,
    requestType: account_pb.AccountRequest,
    responseType: account_pb.AccountResponse,
    requestSerialize: serialize_account_AccountRequest,
    requestDeserialize: deserialize_account_AccountRequest,
    responseSerialize: serialize_account_AccountResponse,
    responseDeserialize: deserialize_account_AccountResponse,
  },
  listAccounts: {
    path: '/account.AccountService/ListAccounts',
    requestStream: false,
    responseStream: true,
    requestType: google_protobuf_empty_pb.Empty,
    responseType: account_pb.AccountResponse,
    requestSerialize: serialize_google_protobuf_Empty,
    requestDeserialize: deserialize_google_protobuf_Empty,
    responseSerialize: serialize_account_AccountResponse,
    responseDeserialize: deserialize_account_AccountResponse,
  },
  createAccount: {
    path: '/account.AccountService/CreateAccount',
    requestStream: false,
    responseStream: false,
    requestType: account_pb.CreateAccountRequest,
    responseType: account_pb.AccountResponse,
    requestSerialize: serialize_account_CreateAccountRequest,
    requestDeserialize: deserialize_account_CreateAccountRequest,
    responseSerialize: serialize_account_AccountResponse,
    responseDeserialize: deserialize_account_AccountResponse,
  },
  updateAccount: {
    path: '/account.AccountService/UpdateAccount',
    requestStream: false,
    responseStream: false,
    requestType: account_pb.UpdateAccountRequest,
    responseType: account_pb.AccountResponse,
    requestSerialize: serialize_account_UpdateAccountRequest,
    requestDeserialize: deserialize_account_UpdateAccountRequest,
    responseSerialize: serialize_account_AccountResponse,
    responseDeserialize: deserialize_account_AccountResponse,
  },
  deleteAccount: {
    path: '/account.AccountService/DeleteAccount',
    requestStream: false,
    responseStream: false,
    requestType: account_pb.AccountRequest,
    responseType: google_protobuf_empty_pb.Empty,
    requestSerialize: serialize_account_AccountRequest,
    requestDeserialize: deserialize_account_AccountRequest,
    responseSerialize: serialize_google_protobuf_Empty,
    responseDeserialize: deserialize_google_protobuf_Empty,
  },
  sendMoney: {
    path: '/account.AccountService/SendMoney',
    requestStream: false,
    responseStream: false,
    requestType: account_pb.SendMoneyRequest,
    responseType: account_pb.TransactionResponse,
    requestSerialize: serialize_account_SendMoneyRequest,
    requestDeserialize: deserialize_account_SendMoneyRequest,
    responseSerialize: serialize_account_TransactionResponse,
    responseDeserialize: deserialize_account_TransactionResponse,
  },
  listTransactions: {
    path: '/account.AccountService/ListTransactions',
    requestStream: false,
    responseStream: true,
    requestType: account_pb.AccountRequest,
    responseType: account_pb.TransactionResponse,
    requestSerialize: serialize_account_AccountRequest,
    requestDeserialize: deserialize_account_AccountRequest,
    responseSerialize: serialize_account_TransactionResponse,
    responseDeserialize: deserialize_account_TransactionResponse,
  },
};

exports.AccountServiceClient = grpc.makeGenericClientConstructor(AccountServiceService, 'AccountService');
