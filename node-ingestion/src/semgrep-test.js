const express = require("express");
const app = express();

app.get("/test", (req, res) => {
  eval(req.query.code); // semgrep should flag this
});
