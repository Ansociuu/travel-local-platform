const http = require('http');

const payload = {
  "gateway": "MBBank",
  "transactionDate": "2026-05-29 17:42:00",
  "accountNumber": "0365820731",
  "subAccount": null,
  "code": null,
  "content": "SHOPEEPAY CHUYEN TIEN 2060310812296867840 Scan QR MTPH2IMJ",
  "transferType": "in",
  "description": "BankAPINotify SHOPEEPAY CHUYEN TIEN 2060310812296867840 Scan QR MTPH2IMJ",
  "transferAmount": 2000,
  "referenceCode": "FT26149055105401",
  "accumulated": 0,
  "id": 60982124
};

const data = JSON.stringify(payload);

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/payments/sepay/webhook',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'Authorization': 'Apikey MoodTravelSecretToken2026'
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('BODY:', body);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();
