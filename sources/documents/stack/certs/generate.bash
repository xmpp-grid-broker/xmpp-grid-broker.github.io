#!/bin/bash
set -e
# Requirements: openssl
# Based on https://blog.josefsson.org/2015/05/12/certificates-for-xmpp-jabber/
# and https://developer.pidgin.im/wiki/Openfire%20Client%20SSL%20Authentication%20How-to

CONF="conf/"
KEYS="keys/"
SERIAL_FILE="${KEYS}serial"
KEY_VALIDITY=11147 #days ~30years
if [ -d "${KEYS}" ]; then
    read -p "The KEYS output directory named '${KEYS}' already exists. Continue and OVERWRITE any existing files)? [ENTER]"
else
    mkdir "${KEYS}"
fi


getserial() {
    if [ -f "$SERIAL_FILE" ]; then
        SERIAL=$((`cat ${SERIAL_FILE}`+1))
    else
        SERIAL=0
    fi
    echo -n ${SERIAL} > "${SERIAL_FILE}"
    echo $SERIAL
}

header() {
    echo -e "\n\033[1m"
    echo "$1"
    echo "====================================================================="
    echo -e -n "\033[0m"
}

###############################################################################
header "Generate Certificate Authority"
###############################################################################
CA_KEY="${KEYS}ca-privkey.pem"
CA_CRT="${KEYS}ca-fullchain.pem"
openssl genrsa -out "$CA_KEY" 3744
openssl req -x509 -set_serial `getserial` -new -days ${KEY_VALIDITY} -sha256 \
    -config "${CONF}ca-crt.conf" \
    -key "$CA_KEY" -out "$CA_CRT"

###############################################################################
find ${CONF}/host/ -mindepth 1 -maxdepth 1 -type d -printf '%P\n' | while read HOSTNAME; do
    header "Generate Server Certificate for ${HOSTNAME}"

    HOST_KEYS="${KEYS}host/${HOSTNAME}/"
    HOST_CONF="${CONF}host/${HOSTNAME}/"
    mkdir -p $HOST_KEYS

    openssl genrsa -out "${HOST_KEYS}privkey.pem" 3744

    openssl req -sha256 -new \
        -config "${HOST_CONF}csr.conf" \
        -nodes -days ${KEY_VALIDITY} \
        -key "${HOST_KEYS}privkey.pem" \
        -out "${HOST_KEYS}csr.pem"


    openssl x509 -sha256 -CA "$CA_CRT" -CAkey "$CA_KEY" \
        -set_serial  `getserial` -days ${KEY_VALIDITY} -req \
        -in "${HOST_KEYS}csr.pem" -out "${HOST_KEYS}fullchain.pem" \
        -extfile "${HOST_CONF}crt.conf"

done

###############################################################################
find ${CONF}/client/ -mindepth 1 -maxdepth 1 -type d -printf '%P\n' | while read CLIENT; do
    header "Generate Client Certificate and Keypair for ${CLIENT}"

    CLIENT_KEYS="${KEYS}client/${CLIENT}/"
    CLIENT_CONF="${CONF}client/${CLIENT}/"

    mkdir -p $CLIENT_KEYS

    openssl genrsa -out "${CLIENT_KEYS}privkey.pem" 3744

    openssl req -sha256 -new \
        -config "${CLIENT_CONF}csr.conf" \
        -nodes -days ${KEY_VALIDITY} \
        -key "${CLIENT_KEYS}privkey.pem" \
        -out "${CLIENT_KEYS}csr.pem"


    openssl x509 -sha256 -CA "$CA_CRT" -CAkey "$CA_KEY" \
        -set_serial `getserial` -days ${KEY_VALIDITY} -req \
        -in "${CLIENT_KEYS}csr.pem" -out "${CLIENT_KEYS}fullchain.pem"

    openssl pkcs12 -export -nodes -password 'pass:'\
        -inkey "${CLIENT_KEYS}privkey.pem" -in "${CLIENT_KEYS}fullchain.pem" \
        -out "${CLIENT_KEYS}${CLIENT}.p12"  -name "$CLIENT"

done

echo "===="
header "DONE! You can now configure your server and clients."
