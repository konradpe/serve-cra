const fs = require('fs');
const path = require('path');
const express = require('express');
const compression = require('compression');

/** Handle Ctrl-C */
process.on('SIGINT', function() {
  process.exit();
});

const app = express();

const {
  SC_ROOT_PATH = '/opt/cra',
  SC_WINDOW_EXPORT = 'CRA_ENV',
  SC_TEMP_FILE = '/tmp/serve-cra_index.html',
  SC_PORT = '3000'
} = process.env;

/**
 * Read all environment variables and filter out the ones starting
 * with CRA_ */
const craEnv = {};
for (const envKey in process.env) {
  if (/^CRA_.+/.test(envKey)) {
    craEnv[envKey.substring(4)] = process.env[envKey];
  }
}

const indexHtml = fs
  .readFileSync(path.join(SC_ROOT_PATH, 'index.html'), 'utf8')
  .replace(
    '<body>',
    `<body><script>window.${SC_WINDOW_EXPORT}=${JSON.stringify(
      craEnv
    )}</script>`
  );

fs.writeFileSync(SC_TEMP_FILE, indexHtml, { encoding: 'utf8' });

/** GZIP middleware */
app.use(compression());

/**
 * Prevent sending of original index.html
 *
 * Use `sendFile` to get correct headers for free
 */
app.get('/index.html?', (req, res) => res.sendFile(SC_TEMP_FILE));

/** Built in static middleware */
app.use(express.static(SC_ROOT_PATH, { index: false }));

/** Let the SPA router do it's magic */
app.get('*', async (req, res) => {
  res.sendFile(SC_TEMP_FILE);
});

app.listen(SC_PORT, err => {
  if (err) {
    throw err;
  }

  // eslint-disable-next-line no-console
  console.log('Listening on port 3000.');
});
