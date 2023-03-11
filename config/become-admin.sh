#!/bin/bash


# This script is used to elevate the current user to admin privileges.

INTERNAL_AUTH_TOKEN=""
USER_EMAIL=""
ADMIN=""
PROD_URL="https://midd.courses"
LOCAL_URL="http://localhost:3000"

echo "Do you want to change permissions locally or on the production server? (prod/dev)"
read PROD

if [ "$PROD" = "prod" ]; then
    URL=$PROD_URL
else
    URL=$LOCAL_URL
fi

echo -e "You are changing permissions on "$URL "\n"

echo "Enter the internal auth token: "
read INTERNAL_AUTH_TOKEN

echo "Enter your email: (%40 for @)"
read USER_EMAIL

echo "Promote or demote? (true/false)"
read ADMIN

FULL_URL=$URL"/api/users/"$USER_EMAIL"/admin"

BODY='{"admin":'$ADMIN'}'

echo Are you sure you want to change permissions for $USER_EMAIL to $ADMIN on $URL? \(y/n\)
read CONFIRM

if [ "$CONFIRM" = "y" ]; then
    echo "Changing permissions..."
else
    echo "Aborting..."
    exit 1
fi

res=$(curl "$FULL_URL" -X PUT -H "Authorization: Bearer $INTERNAL_AUTH_TOKEN" -H "Content-Type: application/json" -d "$BODY")

echo $res



