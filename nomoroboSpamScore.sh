curl -XGET "https://lookups.twilio.com/v1/PhoneNumbers/+$PHONE_NUMBER/?AddOns=nomorobo_spamscore" -u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN
