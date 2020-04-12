#! /usr/bin/env node
'use strict';

const os = require('os');
const iFaces = os.networkInterfaces();
const net = require('net');
const FgRed = "\x1b[1m\x1b[31m%s\x1b[0m";
const FgGreen = "\x1b[1m\x1b[32m%s\x1b[0m";
const FgCyan = "\x1b[1m\x1b[36m%s\x1b[0m";

// check network connectivity
// https://paulgalow.com/how-to-check-for-internet-connectivity-node

function checkTCP(host = "1.1.1.1", port = 53) {
    return new Promise((resolve, reject) => {
        const client = net.createConnection({ host, port }, () => {
            client.end();
            resolve();
        });

        client.setTimeout(3000);

        client.on("timeout", err => {
            client.destroy();
            reject(err);
        });

        client.on("error", err => {
            reject(err);
        });
    });
}

let isOnline;

checkTCP()
    .then(() => (isOnline = true))
    .catch(() => (isOnline = false))
    .then(() => console.log(`Connected to Internet: ${isOnline ? FgGreen : FgRed}`, `${isOnline}`));

let requiredAddr = [];

for (const iFace in iFaces) {
    if (iFaces.hasOwnProperty(iFace)) {
        const interfaceDetails = iFaces[iFace];
        requiredAddr = [...(interfaceDetails.filter(ifaceDetail => ifaceDetail.family !== 'IPv6' || ifaceDetail.internal === true))];
    }
}
requiredAddr.forEach((addr) => console.log(`${FgCyan}`, `address: ${addr.address}
netmask : ${addr.netmask}
mac addr: ${addr.mac}`))

const portRangeEnd = 65534;
const portRangeStart = 3000;
const getFreePorts = (portNumber) => {
    let port = +portNumber;
    if (portNumber < portRangeStart && portNumber > portRangeEnd) {
        return;
    }
    const server = net.createServer();
    server.listen(port, (err) => {
        server.once('close', () => {
            // do nothing
            console.log(`${FgGreen}`, `Port Number: ${port}: available`);
        })
        server.close();
    })
    server.on('error', (err) => {
        console.log(`${FgRed}`, `Port Number ${port} is not available`);
        getFreePorts(port + 1);
    })
}

const portNumberFromArgs = process.argv.slice(2);
getFreePorts(portNumberFromArgs[0] || portRangeStart);


