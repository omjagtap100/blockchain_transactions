# Company API Documentation

Base URL: `/company`

## Authentication

All endpoints except `Access` routes require the following headers:

- `Authorization`: Bearer `<token>`
- `customerid`: `<customer_id>`

The API uses JWT for authentication.

## Response Format

All successful responses follow this structure:

```json
{
  "statusCode": 200,
  "data": { ... }, // Payload
  "message": "Success Message",
  "success": true
}
```

Error responses check for `ApiError` and return appropriate status codes.

---

## 1. Access (Authentication)

### Login
**POST** `/access/login`

Authenticate a user and retrieve a token.

**Request Body:**
```json
{
  "phone": "string (optional)",
  "email": "string (optional)",
  "password": "string (required)"
}
```
*Note: Either `phone` or `email` must be provided.*

**Response Data:**
```json
{
  "user": {
    "id": "integer",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "status": "string",
    "createdAt": "date-string",
    "updatedAt": "date-string"
  },
  "accessToken": "string"
}
```

### Create Dummy User
**POST** `/access/dummy-user`

Create a new user for testing purposes.

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "phone": "string",
  "email": "string",
  "password": "string"
}
```

**Response Data:**
Returns the complete User object created.

---

## 2. Transactions

### Get All Transactions
**GET** `/transactions`

Retrieve a paginated list of transactions.

**Query Parameters:**
- `page` (optional): Page number (default: 1).
- `pageSize` (optional): Number of items per page (default: 10).
- `contractName` (optional): Filter transactions by contract address/name.

**Response Data:**
```json
{
  "totalItems": "integer",
  "items": [
    {
      "txId": "string",
      "contractId": "integer | null",
      "blockHeight": "integer",
      "blockHash": "string",
      "from": "string",
      "to": "string",
      "contractName": "string",
      "method": "string",
      "status": "string",
      "timestamp": "bigint",
      "dateTime": "string",
      "gasUsed": "integer",
      "createdAt": "date-string",
      "updatedAt": "date-string"
    }
  ],
  "totalPages": "integer",
  "currentPage": "integer"
}
```

### Get Transaction by ID
**GET** `/transactions/:txId`

Retrieve details of a specific transaction.

**Path Parameters:**
- `txId`: The ID of the transaction to fetch.

**Response Data:**
Returns a single Transaction object (same fields as item in list above).

**Errors:**
- `404 Not Found`: If the transaction does not exist.

### Get Contracts
**GET** `/transactions/contracts`

Retrieve a list of contracts.

**Response Data:**
An array of Contract objects:
```json
[
  {
    "id": "integer",
    "name": "string",
    "address": "string",
    "cursor": "bigint",
    "createdAt": "date-string",
    "updatedAt": "date-string"
  }
]
```
