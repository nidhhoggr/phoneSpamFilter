curl --silent -XGET "https://lookups.twilio.com/v1/PhoneNumbers/+$PHONE_NUMBER/?AddOns=$ADDON_NAME" -u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN
