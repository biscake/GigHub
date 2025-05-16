const express = require('express');
const app = express();

//import .env
require('dotenv').config();

// Middleware for parsing form data
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// Use PORT provided in environment or default to 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
