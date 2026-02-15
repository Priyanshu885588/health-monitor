// node-ingestion/test.js
const { exec } = require("child_process");
exec(req.query.cmd); // vulnerable
