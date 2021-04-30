const fs = require('fs');
const axios = require('axios');
const searchNames = require('./searchNames');

// CREDS
const clientId = process.env.CLIENT_ID;
const apiKey = process.env.API_KEY;
const token = Buffer.from(`${clientId}:${apiKey}`).toString('base64');

const BASE_URL = 'https://api.mx.com';
const SLEEP_MS_PER_REQUEST = 800;

async function getInstitutionsByName(name) {
  const response = { searchName: name, data: null, error: false, message: null };

  try {
    response.data = (await axios({
      url: `${BASE_URL}/institutions?name=${name}`,
      method: 'GET',
      headers: { 'Accept': 'application/vnd.mx.api.v1+json', 'Authorization': `Basic ${token}` },
    })).data;
  } catch (error) {
    console.log(error);
    response.error = true;
    response.message = error.message;
  }

  return response;
}

// Main
(async () => {
  console.log('Starting');

  const results = [];
  const distinctNames = Array.from(new Set(searchNames));

  for (const name of distinctNames) {
    console.log(`[${results.length + 1}/${distinctNames.length}] Searching:`, name);
    results.push(await getInstitutionsByName(name));

    // Docs rate limit = 100 reqs/min
    await new Promise(resolve => setTimeout(resolve, SLEEP_MS_PER_REQUEST));
  }

  // Write to file
  console.log('Writing data to: ./data.json');
  fs.writeFileSync('./data.json', JSON.stringify(results, null, 2));

  console.log('🎉 Done 🎉');
})();
