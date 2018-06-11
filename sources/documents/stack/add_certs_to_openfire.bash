#!/bin/bash

###############################################################################
# Environment
###############################################################################
export KEYSTORE_PASS="changeit"
ROOTDIR=../
KEYDIR=${ROOTDIR}stack/certs/keys/

if [ "$UID" == "" ]; then
  UID=`id -u`
fi


###############################################################################
# Functions & Aliases
###############################################################################
header() {
    echo -e "\n\033[1m"
    echo "$1"
    echo "====================================================================="
    echo -e -n "\033[0m"
}

alias keytool="docker run -i --entrypoint keytool --volume ${ROOTDIR}:/mnt/ --workdir /mnt --user $UID openjdk:8-jdk-alpine"

deleteAliasFrom() {
  keytool -delete -keystore $2 -storepass "${KEYSTORE_PASS}" -alias "$1" || echo "Note: There was no key named '$1' in '$2'."
}

setupOpenfire() {
  OPENFIRE_CONF=$1

  header "Import CA in ${OPENFIRE_CONF}client.truststore"
  deleteAliasFrom "testca" ${OPENFIRE_CONF}client.truststore
  keytool -importcert -storepass "${KEYSTORE_PASS}" -keystore ${OPENFIRE_CONF}client.truststore -alias testca -file ${KEYDIR}ca-fullchain.pem


  header "Clean out old host certificates in ${OPENFIRE_CONF}keystore"
  for name in openfire openfire_rsa openfire_dsa rsa dsa; do
    deleteAliasFrom "$name" ${OPENFIRE_CONF}keystore
  done


  header "Import new host certificates to ${OPENFIRE_CONF}keystore"
  keytool -importkeystore -deststorepass "${KEYSTORE_PASS}" \
    -destkeypass "${KEYSTORE_PASS}" -destkeystore ${OPENFIRE_CONF}keystore\
    -srckeystore ${KEYDIR}host/openfire/full.p12 -srcstoretype PKCS12 -srcstorepass "${KEYSTORE_PASS}"\
    -alias openfire
}

###############################################################################
# Main Script
###############################################################################

header "Convert host certificate"
openssl pkcs12 -export -in ${KEYDIR}host/openfire/fullchain.pem -inkey ${KEYDIR}host/openfire/privkey.pem\
  -out ${KEYDIR}host/openfire/full.p12 -name "openfire" -passout "pass:${KEYSTORE_PASS}"\
  -CAfile ${KEYDIR}ca-fullchain.pem -caname root && echo "Success!"

setupOpenfire "${ROOTDIR}stack/openfire/conf/security/"
setupOpenfire "${ROOTDIR}e2e/stack/openfire/conf/security/"
