const MongoClient = require('mongodb').MongoClient;
const url = process.env.DB_URL || 'mongodb://localhost:27017/';
const dbName = 'CurrencyTrader'; //process.env.DB_NAME;
let db = null;

module.exports = (function() {
    MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
        if (err) {
            console.log(`An error occurred! ${err}`);
        }
        console.log('Connected successfully to server');
        
        db = client.db(dbName);
        
        //client.close();
    }); 

    const insert = (documents, collectionName) => {
        return new Promise((resolve, reject) => {
            const collection = db.collection(collectionName);
            collection.insertMany(documents, (err, result) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }

                resolve(result);
            });
        });
    };

    const findAll = (query, collectionName) => {
        return new Promise((resolve, reject) => {
            const collection = db.collection(collectionName);
            collection.find(query).toArray((err, docs) => {
                if (err) {
                    reject(err);
                }
                resolve(docs);
            });
        });
    };

    const update = (query, changes, collectionName) => {
        return new Promise((resolve, reject) => {
            const collection = db.collection(collectionName);
            collection.updateOne(query, changes, (err, result) => {
                if (err) {
                    reject(err);
                }
                
                resolve(result);
            });
        });
    };

    const remove = (query, collectionName) => {
        return new Promise((resolve, reject) => {
            const collection = db.collection(collectionName);
            collection.deleteOne(query, (err, result) => {
                if (err) {
                    reject(err);
                }
            
                resolve(result);
            });
        });
    };

    return {
        insert,
        findAll,
        update,
        remove
    };
})();


/* 
   "timestamp": "2020-03-30T22:31:20.518Z",
   "timestamp": "2020-03-30T22:31:20.518Z",
   "timestamp": "2020-03-30T22:31:20.518Z",
   "timestamp": "2020-03-30T22:31:20.518Z",
   "timestamp": "2020-03-30T22:31:20.518Z",
   "timestamp": "2020-03-30T22:31:20.518Z",
   "timestamp": "2020-03-30T22:31:20.518Z",
   "timestamp": "2020-03-30T22:31:20.518Z",
   "timestamp": "2020-03-30T22:31:20.518Z",
   "timestamp": "2020-03-30T22:31:20.518Z",
   "timestamp": "2020-03-30T22:31:20.518Z",
   "timestamp": "2020-03-30T22:31:20.518Z",
   "timestamp": "2020-03-30T22:31:20.518Z",
   "timestamp": "2020-03-30T22:31:20.518Z",
   "timestamp": "2020-03-30T22:31:20.518Z",
   "timestamp": "2020-03-30T22:31:20.518Z",
   "timestamp": "2020-03-30T22:31:20.518Z",
   "timestamp": "2020-03-30T22:31:20.518Z",
   "timestamp": "2020-03-30T22:31:20.518Z",
   "timestamp": "2020-03-30T22:31:20.518Z",
   "timestamp": "2020-03-30T22:31:20.518Z",

   300seg
   para cada x[n] = Apertura
   = Cierre
   = Maximo
   = Minimo
   para cada 5m >> x[0] >> +1


 */
