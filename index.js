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




app.get('/helloWorld',(req,res) => {
  res.send('Hello World from Udit')
})

app.get('/cicd',(req,res) => {
  res.send('CD  working, ROcks!')
})

//pura memory me hai 
productTagMap = {}
productsData = {}
tagNamesToIdMap = {}
tagIdToNamesMap = {}

const loadTagMaps = ()=> {
  connection.query('SELECT tagId,tagName FROM Tags', (error, results, fields) => {
    if (error) {
      console.error('Error querying database:', error);
    }
    results.forEach(item => {
      tagNamesToIdMap[item.tagName] = item.tagId
      tagIdToNamesMap[item.tagId] = item.tagName
    })
  });
}

// Function to query ProductTags and return a promise
function queryTagMaps() {
  return new Promise((resolve, reject) => {
    connection.query('SELECT tagId,tagName FROM Tags', (error, results, fields) => {
      if (error) {
        console.error('Error querying database:', error);
        reject(error); // Rejects the promise if there's an error
      } else {
        resolve(results); // Resolves the promise with the results
      }
    });
  });
}

// Function to query ProductTags and return a promise
function queryProductTagMaps() {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * from ProductTags',(error,results,fields) => {
      if (error) {
        console.error('Error querying database:', error);
        reject(error); // Rejects the promise if there's an error
      } else {
        resolve(results); // Resolves the promise with the results
      }
    });
  });
}


// Function to query ProductTags and return a promise
function queryProducts() {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM Products', (error, results, fields) => {
      if (error) {
        console.error('Error querying database:', error);
        reject(error); // Rejects the promise if there's an error
      } else {
        resolve(results); // Resolves the promise with the results
      }
    });
  });
}



async function getProductTagData(res){
  if(Object.keys(tagNamesToIdMap).length == 0){
    try {
      const dbTagData = await queryTagMaps();
      dbTagData.forEach(item => {
        tagNamesToIdMap[item.tagName] = item.tagId
        tagIdToNamesMap[item.tagId] = item.tagName
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  
  return Object.keys(tagNamesToIdMap)
}


async function populateProductTagMap(res){
  try {
    const dbData = await queryProductTagMaps();
    dbData.forEach(col => {
      if(!(col.productId in productTagMap) ) {productTagMap[col.productId] = [col.tagId]}
      else {productTagMap[col.productId].push(col.tagId)}
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}


async function populateProductsData(res){

  try {
    const dbData = await queryProducts();
    dbData.forEach(item => {
      productsData[item.productId] = {'brandProductId':item.brandProductId,'imageUrl':item.imageUrl,'purchaseLink':item.purchaseLink,'productDescription':item.productDescription}
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getTopProductMatchesBasedOnTags(inputTagNames,res){

  if(Object.keys(productTagMap).length == 0){
    await populateProductTagMap(res);
  }

  if(Object.keys(productsData).length == 0){
   await populateProductsData(res);
  }

  await getProductTagData(res)

  console.log(tagNamesToIdMap['Versatile'])
  console.log(inputTagNames)
  inputTagIds = inputTagNames.map(item => tagNamesToIdMap[item])

  console.log('inputTagid = '+inputTagIds.join(','))
  //top 10 products find out karte hai chalo
  matchCountArr = []
  for (const key in productTagMap){
    matchingCount = productTagMap[key].filter(item => inputTagIds.includes(item)).length;
    matchCountArr.push({productId:key,matchCount:matchingCount})
  }

  matchCountArr.sort((a,b) => b.matchCount-a.matchCount)
  
  console.log(matchCountArr)

  resultArray = []
  for(let i = 0;i<10;i++){
    if(matchCountArr[i].matchCount==0)
    break;
    curProductId = matchCountArr[i].productId;
    resultArray.push({productId: curProductId,tags:productTagMap[curProductId].map(tagId => tagIdToNamesMap[tagId]),productDescription:productsData[curProductId].productDescription,imageUrl:productsData[curProductId].imageUrl,purchaseLink:productsData[curProductId].purchaseLink})
  }
  
  return resultArray;

}

app.get('/getProductTags', (req, res) => {

  //if tagNamesToIdMap not loaded, load it. 
  getProductTagData(res).then((data) => {
    console.log(data)
    res.json(data).end();
  });
});

app.get('/getTopProductMatchesBasedOnTags',(req,res) => {
  tagString = req.query.tags;
  var inputTagNames = null;
  if (tagString) {
    // Split the values into an array using the comma as a delimiter
    inputTagNames = tagString.split(',');

    // Now, valuesArray contains the values as an array
    console.log('Received values:', inputTagNames);
  }
  else {
    return res.send('No values provided in the query parameter.');
  }
  console.log(inputTagNames)
  getTopProductMatchesBasedOnTags(inputTagNames,res).then((result) => {
    console.log(result)
    res.json(result).end();
  })
})

// Catch all handler for all other request.
app.use('*', (req, res) => {
  res.json({ msg: 'no route handler found' }).end()
})

// Start the server
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`index.js listening on ${port}`)
})


