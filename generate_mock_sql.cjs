const fs = require('fs');

const generateHex = (length) => [...Array(length)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

let sql = "INSERT INTO `transactions` (`txId`, `blockHeight`, `blockHash`, `from`, `to`, `contractName`, `method`, `status`, `timestamp`, `dateTime`, `gasUsed`, `createdAt`, `updatedAt`) VALUES\n";

const values = [];

for (let i = 0; i < 100; i++) {
    const txId = generateHex(64);
    const blockHeight = 1000000 + i;
    const blockHash = generateHex(64);
    const fromAddr = '0x' + generateHex(40);
    const toAddr = '0x' + generateHex(40);
    const status = Math.random() > 0.1 ? 'Success' : 'Failed'; // 90% success
    const timestamp = Date.now() - (i * 60000); // 1 minute apart
    const date = new Date(timestamp);
    const dateTime = date.toISOString().slice(0, 16).replace('T', ' '); // YYYY-MM-DD HH:mm
    const gasUsed = 21000 + Math.floor(Math.random() * 50000);
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    values.push(`('${txId}', ${blockHeight}, '${blockHash}', '${fromAddr}', '${toAddr}', 'TestContract', 'transfer', '${status}', ${timestamp}, '${dateTime}', ${gasUsed}, '${now}', '${now}')`);
}

sql += values.join(",\n") + ";\n";

fs.writeFileSync('mock_transactions.sql', sql);
console.log('mock_transactions.sql created');
