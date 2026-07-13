import fs from 'fs';
try {
  const content = fs.readFileSync('.env', 'utf8');
  console.log('--- RAW .env CONTENT ON DISK: ---');
  console.log(content);
  console.log('--- END RAW CONTENT ---');
} catch (err) {
  console.error('Error reading file: ' + err.stack);
}
