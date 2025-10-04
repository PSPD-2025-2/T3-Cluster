// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var client_pb = require('./client_pb.js');
var google_protobuf_empty_pb = require('google-protobuf/google/protobuf/empty_pb.js');

function serialize_client_ClientRequest(arg) {
  if (!(arg instanceof client_pb.ClientRequest)) {
    throw new Error('Expected argument of type client.ClientRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_client_ClientRequest(buffer_arg) {
  return client_pb.ClientRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_client_ClientResponse(arg) {
  if (!(arg instanceof client_pb.ClientResponse)) {
    throw new Error('Expected argument of type client.ClientResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_client_ClientResponse(buffer_arg) {
  return client_pb.ClientResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_client_CreateClientRequest(arg) {
  if (!(arg instanceof client_pb.CreateClientRequest)) {
    throw new Error('Expected argument of type client.CreateClientRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_client_CreateClientRequest(buffer_arg) {
  return client_pb.CreateClientRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_client_UpdateClientRequest(arg) {
  if (!(arg instanceof client_pb.UpdateClientRequest)) {
    throw new Error('Expected argument of type client.UpdateClientRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_client_UpdateClientRequest(buffer_arg) {
  return client_pb.UpdateClientRequest.deserializeBinary(new Uint8Array(buffer_arg));
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


var ClientServiceService = exports.ClientServiceService = {
  getClient: {
    path: '/client.ClientService/GetClient',
    requestStream: false,
    responseStream: false,
    requestType: client_pb.ClientRequest,
    responseType: client_pb.ClientResponse,
    requestSerialize: serialize_client_ClientRequest,
    requestDeserialize: deserialize_client_ClientRequest,
    responseSerialize: serialize_client_ClientResponse,
    responseDeserialize: deserialize_client_ClientResponse,
  },
  listClients: {
    path: '/client.ClientService/ListClients',
    requestStream: false,
    responseStream: true,
    requestType: google_protobuf_empty_pb.Empty,
    responseType: client_pb.ClientResponse,
    requestSerialize: serialize_google_protobuf_Empty,
    requestDeserialize: deserialize_google_protobuf_Empty,
    responseSerialize: serialize_client_ClientResponse,
    responseDeserialize: deserialize_client_ClientResponse,
  },
  createClient: {
    path: '/client.ClientService/CreateClient',
    requestStream: false,
    responseStream: false,
    requestType: client_pb.CreateClientRequest,
    responseType: client_pb.ClientResponse,
    requestSerialize: serialize_client_CreateClientRequest,
    requestDeserialize: deserialize_client_CreateClientRequest,
    responseSerialize: serialize_client_ClientResponse,
    responseDeserialize: deserialize_client_ClientResponse,
  },
  updateClient: {
    path: '/client.ClientService/UpdateClient',
    requestStream: false,
    responseStream: false,
    requestType: client_pb.UpdateClientRequest,
    responseType: client_pb.ClientResponse,
    requestSerialize: serialize_client_UpdateClientRequest,
    requestDeserialize: deserialize_client_UpdateClientRequest,
    responseSerialize: serialize_client_ClientResponse,
    responseDeserialize: deserialize_client_ClientResponse,
  },
  deleteClient: {
    path: '/client.ClientService/DeleteClient',
    requestStream: false,
    responseStream: false,
    requestType: client_pb.ClientRequest,
    responseType: google_protobuf_empty_pb.Empty,
    requestSerialize: serialize_client_ClientRequest,
    requestDeserialize: deserialize_client_ClientRequest,
    responseSerialize: serialize_google_protobuf_Empty,
    responseDeserialize: deserialize_google_protobuf_Empty,
  },
};

exports.ClientServiceClient = grpc.makeGenericClientConstructor(ClientServiceService, 'ClientService');
