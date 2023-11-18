const express = require('express')
const app = express()
//const db = require('@cyclic.sh/dynamodb')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

require('dotenv').config()

const mysql = require('mysql2')
console.log(process.env.DATABASE_URL)

// const connection = mysql.createConnection({
//   host: 'aws.connect.psdb.cloud',
//   user: '1boi4w6svhu5q675qa4f',
//   password: 'pscale_pw_jHQ1aKwLo77WlpFabH59IPhDZehLpdRpTQXzZFEOZM',
//   database: 'aistylistdemo',
//   ssl: {
//     rejectUnauthorized: false, // This is set to false for demonstration purposes, but in a production environment, you should use a certificate and set this to true
//   },
// });

const connection = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  ssl: {
    rejectUnauthorized: false, // This is set to false for demonstration purposes, but in a production environment, you should use a certificate and set this to true
  },
});

// database: aistylistdemo
// username: 1boi4w6svhu5q675qa4f
// host: aws.connect.psdb.cloud
// password: pscale_pw_jHQ1aKwLo77WlpFabH59IPhDZehLpdRpTQXzZFEOZM





connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to the database');
});

// Create the connection to the database


// #############################################################################
// This configures static hosting for files in /public that have the extensions
// listed in the array.
// var options = {
//   dotfiles: 'ignore',
//   etag: false,
//   extensions: ['htm', 'html','css','js','ico','jpg','jpeg','png','svg'],
//   index: ['index.html'],
//   maxAge: '1m',
//   redirect: false
// }
// app.use(express.static('public', options))
// #############################################################################

// Create or Update an item
// app.post('/:col/:key', async (req, res) => {
//   console.log(req.body)

//   const col = req.params.col
//   const key = req.params.key
//   console.log(`from collection: ${col} delete key: ${key} with params ${JSON.stringify(req.params)}`)
//   const item = await db.collection(col).set(key, req.body)
//   console.log(JSON.stringify(item, null, 2))
//   res.json(item).end()
// })

// // Delete an item
// app.delete('/:col/:key', async (req, res) => {
//   const col = req.params.col
//   const key = req.params.key
//   console.log(`from collection: ${col} delete key: ${key} with params ${JSON.stringify(req.params)}`)
//   const item = await db.collection(col).delete(key)
//   console.log(JSON.stringify(item, null, 2))
//   res.json(item).end()
// })

//return all the tags
// app.get('/getProductTags', async(req,res) => {

//   const connection = mysql.createConnection(process.env.DATABASE_URL)
//   const items = await connection.query('select * from Tags')
//   console.log(JSON.stringify(items,null,2))
//   res.json(items).end()

// })

app.get('/helloWorld',(req,res) => {
  res.send('Hello World from Udit')
})

app.get('/cicd',(req,res) => {
  res.send('CD  working, ROcks!')
})


app.get('/getProductTags', (req, res) => {
  // Query the database
  connection.query('SELECT tagName FROM Tags', (error, results, fields) => {
    if (error) {
      console.error('Error querying database:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log(JSON.stringify(results,null,2))
    // Send the results back as JSON
    res.json(results).end();
  });
});


// app.get()

// Get a single item
// app.get('/:col/:key', async (req, res) => {
//   const col = req.params.col
//   const key = req.params.key
//   console.log(`from collection: ${col} get key: ${key} with params ${JSON.stringify(req.params)}`)
//   const item = await db.collection(col).get(key)
//   console.log(JSON.stringify(item, null, 2))
//   res.json(item).end()
// })

// // Get a full listing
// app.get('/:col', async (req, res) => {
//   const col = req.params.col
//   console.log(`list collection: ${col} with params: ${JSON.stringify(req.params)}`)
//   const items = await db.collection(col).list()
//   console.log(JSON.stringify(items, null, 2))
//   res.json(items).end()
// })

// Catch all handler for all other request.
app.use('*', (req, res) => {
  res.json({ msg: 'no route handler found' }).end()
})

// Start the server
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`index.js listening on ${port}`)
})