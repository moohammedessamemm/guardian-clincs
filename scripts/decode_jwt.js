const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indka2lkbm5pdHdsZHR0aWJsYm9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3ODA2ODcsImV4cCI6MjA4NTM1NjY4N30.lPpiavzgTkdNw1fcR0UMUGBaEjDiWMdArvDYcbOHMBc';
const parts = token.split('.');
const payload = Buffer.from(parts[1], 'base64').toString();
console.log(JSON.parse(payload));
