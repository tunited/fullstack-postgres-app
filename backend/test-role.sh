#!/bin/bash
LOGIN_RES=$(curl -s -X POST http://127.0.0.1:5001/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@ppcc.co.th","password":"password123"}')
TOKEN=$(echo $LOGIN_RES | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

# First create a role
CREATE_RES=$(curl -s -X POST http://127.0.0.1:5001/api/tickets/config/roles -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"name":"TestRole","base_role":"agent"}')
echo "Create Role: $CREATE_RES"

# Get role ID
ROLE_ID=$(echo $CREATE_RES | grep -o '"id":[0-9]*' | grep -o '[0-9]*$')
echo "Role ID: $ROLE_ID"

# Now try to edit it
EDIT_RES=$(curl -s -w "\nHTTP_CODE: %{http_code}\n" -X PUT http://127.0.0.1:5001/api/tickets/config/roles/$ROLE_ID -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"name":"TestRoleEdited","base_role":"admin"}')
echo "Edit Role: $EDIT_RES"

# Finally delete it
DELETE_RES=$(curl -s -X DELETE http://127.0.0.1:5001/api/tickets/config/roles/$ROLE_ID -H "Authorization: Bearer $TOKEN")
echo "Delete Role: $DELETE_RES"
