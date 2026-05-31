#!/bin/bash
LOGIN_RES=$(curl -s -X POST http://127.0.0.1:5001/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@ppcc.co.th","password":"password123"}')
TOKEN=$(echo $LOGIN_RES | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
echo "Token: $TOKEN"
curl -s -w "\nHTTP_CODE: %{http_code}\n" http://127.0.0.1:5001/api/customers -H "Authorization: Bearer $TOKEN"
