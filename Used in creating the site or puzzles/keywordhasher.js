const crypto = require('crypto');

const keywords = {
    1: 'whispers',
    2: 'fletchling',
    3: 'dithed',
    4: 'nullskin',
    5: 'echoes',
    6: 'unbirth',
};

const salt = "REDACTED";

const hashes = {};
for (const [key, value] of Object.entries(keywords)) {
    hashes[key] = crypto.createHmac('sha256', salt).update(value).digest('hex');
}

console.log('const knownKeywordHashes: string[] = ' + JSON.stringify(Object.values(hashes), null, 4) + ';');
