// This edit no longer supports mongodb v2.x // Use mongodb v3.x
// Mongodb 3.x separates the client connection handle from the database handle.
//
// Change in usage:
// After you .drop() the database
// You should db.close() to disconnect the mongodb client connection.

var util            = require('util');
var mongo           = require('mongodb');
var qbox            = require('qbox');

function MochaMongo(mongoUrl) {

    if(!(this instanceof MochaMongo)) {
        return new MochaMongo(mongoUrl);
    }

    var db = null;
    var $ = qbox.create();

// Changes from mongodb:
// v2 returns a merged db and client handle where mongoUrl contains a database name.
// v3 returns a client service handle only populated with a default database.
// v3 using client.db() without a database name will return the database handle.
// The client.close() method is being added to the db returned by MochaMongo.
// The db.close() works after the .drop() has been serviced.

    mongo.MongoClient.connect(mongoUrl, {useNewUrlParser: true}, function(err, client) {

        if(err) throw err;
        var _db = client.db(); // to accommodate mongodb v3.x
        db = _db;
//        Provide a means to close the mongodb-v3 client (change from mongodb-v2)
        db.close = client.close;
//debugger;
//console.log('QBOX Starting');
        $.start();
//console.log('QBOX Started...');
    });

    this.ready = function () {

        return function(callback) {

            return function mochaCallback(done) { 
//debugger;
//console.log('QBOX Ready(callback) Check');                
                $.ready(function() {
                    callback(db, done);
                });
            };
        };

    };

    this.cleanCollections = function (collectionList) {
//debugger;
//console.log('CollectionList = ' + collectionList);

        return function(callback) {

            return function mochaCallback(done) { 
//debugger;
//console.log('DONE content = ' + done);
                
                var cnt = 0;

//debugger;
//console.log('QBOX Ready(callback) Check'); 

                $.ready(function() {
//debugger;
//console.log('$.ready(function) - callback');
                    doCleanCollections(afterCleaned);
                });

                function afterCleaned() {
                    callback(db, done);
                }

                function doCleanCollections(cb) {
//debugger;
//console.log('CollectionList.length = ' + collectionList.length);

                    if(cnt < collectionList.length) {
                        var collName = collectionList[cnt++];
//                        db.collection(collName).remove(afterCollectionCleaned);
                        db.collection(collName).deleteMany({},{w:1},afterCollectionCleaned);
                    } else {
                        cb();
                    }

                    function afterCollectionCleaned(err) {

                        if(err) {
                            throw err;
                        }

                        doCleanCollections(cb);
                    }
                }
            };
        };


    };

    this.drop = function drop() {

        return function(callback) {

            return function mochaCallback(done) { 
                
                $.ready(function() {
                    db.dropDatabase(afterCleaned);
                });

                function afterCleaned(err) {

                    if(err) {
                        throw err;
                    }
                    callback(db, done);
                }
            };
        };

    };

// export a close() function - supporting mongodb 3.x for mocha tests

    this.close = function close() {
        return function(callback) {
            return function mochaCallback(done) {
                $.ready(function() {
                    db.close();

//debugger;
//console.log('QBOX $.reset()');

                    $.reset();
                    callback(db, done);
                });
            };
        };
    };
}

module.exports = MochaMongo;

