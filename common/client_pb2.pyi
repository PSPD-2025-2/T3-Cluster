from google.protobuf import empty_pb2 as _empty_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class ClientRequest(_message.Message):
    __slots__ = ("client_id",)
    CLIENT_ID_FIELD_NUMBER: _ClassVar[int]
    client_id: str
    def __init__(self, client_id: _Optional[str] = ...) -> None: ...

class ClientResponse(_message.Message):
    __slots__ = ("client_name", "client_email")
    CLIENT_NAME_FIELD_NUMBER: _ClassVar[int]
    CLIENT_EMAIL_FIELD_NUMBER: _ClassVar[int]
    client_name: str
    client_email: str
    def __init__(self, client_name: _Optional[str] = ..., client_email: _Optional[str] = ...) -> None: ...

class CreateClientRequest(_message.Message):
    __slots__ = ("client_name", "client_email")
    CLIENT_NAME_FIELD_NUMBER: _ClassVar[int]
    CLIENT_EMAIL_FIELD_NUMBER: _ClassVar[int]
    client_name: str
    client_email: str
    def __init__(self, client_name: _Optional[str] = ..., client_email: _Optional[str] = ...) -> None: ...

class UpdateClientRequest(_message.Message):
    __slots__ = ("client_id", "client_name", "client_email")
    CLIENT_ID_FIELD_NUMBER: _ClassVar[int]
    CLIENT_NAME_FIELD_NUMBER: _ClassVar[int]
    CLIENT_EMAIL_FIELD_NUMBER: _ClassVar[int]
    client_id: str
    client_name: str
    client_email: str
    def __init__(self, client_id: _Optional[str] = ..., client_name: _Optional[str] = ..., client_email: _Optional[str] = ...) -> None: ...
