from google.protobuf import empty_pb2 as _empty_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class AccountRequest(_message.Message):
    __slots__ = ("id",)
    ID_FIELD_NUMBER: _ClassVar[int]
    id: int
    def __init__(self, id: _Optional[int] = ...) -> None: ...

class AccountResponse(_message.Message):
    __slots__ = ("id", "client", "key", "balance")
    ID_FIELD_NUMBER: _ClassVar[int]
    CLIENT_FIELD_NUMBER: _ClassVar[int]
    KEY_FIELD_NUMBER: _ClassVar[int]
    BALANCE_FIELD_NUMBER: _ClassVar[int]
    id: int
    client: int
    key: str
    balance: float
    def __init__(self, id: _Optional[int] = ..., client: _Optional[int] = ..., key: _Optional[str] = ..., balance: _Optional[float] = ...) -> None: ...

class CreateAccountRequest(_message.Message):
    __slots__ = ("client", "key", "balance")
    CLIENT_FIELD_NUMBER: _ClassVar[int]
    KEY_FIELD_NUMBER: _ClassVar[int]
    BALANCE_FIELD_NUMBER: _ClassVar[int]
    client: int
    key: str
    balance: float
    def __init__(self, client: _Optional[int] = ..., key: _Optional[str] = ..., balance: _Optional[float] = ...) -> None: ...

class UpdateAccountRequest(_message.Message):
    __slots__ = ("id", "client", "key", "balance")
    ID_FIELD_NUMBER: _ClassVar[int]
    CLIENT_FIELD_NUMBER: _ClassVar[int]
    KEY_FIELD_NUMBER: _ClassVar[int]
    BALANCE_FIELD_NUMBER: _ClassVar[int]
    id: int
    client: int
    key: str
    balance: float
    def __init__(self, id: _Optional[int] = ..., client: _Optional[int] = ..., key: _Optional[str] = ..., balance: _Optional[float] = ...) -> None: ...

class SendMoneyRequest(_message.Message):
    __slots__ = ("from_account", "to_account", "amount")
    FROM_ACCOUNT_FIELD_NUMBER: _ClassVar[int]
    TO_ACCOUNT_FIELD_NUMBER: _ClassVar[int]
    AMOUNT_FIELD_NUMBER: _ClassVar[int]
    from_account: int
    to_account: str
    amount: float
    def __init__(self, from_account: _Optional[int] = ..., to_account: _Optional[str] = ..., amount: _Optional[float] = ...) -> None: ...

class TransactionResponse(_message.Message):
    __slots__ = ("id", "from_account", "to_account", "amount", "timestamp")
    ID_FIELD_NUMBER: _ClassVar[int]
    FROM_ACCOUNT_FIELD_NUMBER: _ClassVar[int]
    TO_ACCOUNT_FIELD_NUMBER: _ClassVar[int]
    AMOUNT_FIELD_NUMBER: _ClassVar[int]
    TIMESTAMP_FIELD_NUMBER: _ClassVar[int]
    id: int
    from_account: int
    to_account: str
    amount: float
    timestamp: str
    def __init__(self, id: _Optional[int] = ..., from_account: _Optional[int] = ..., to_account: _Optional[str] = ..., amount: _Optional[float] = ..., timestamp: _Optional[str] = ...) -> None: ...
