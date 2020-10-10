var assert  = require('assert');

var db = require('../')('mongodb://localhost/testdb');
var ready = db.ready();
var cleanC = db.cleanCollections(['coll1', 'coll2']);
var drop = db.drop();
var close = db.close();

suite('MochaMongo', function() {

    suite('.ready()', function() {

        test('use db in tests directly', ready(function(db, done) {

            assert.ok(db);
            done();
        }));
    });

    suite('.cleanCollections()', function() {

        test('add some data to the collections', ready(function(db, done) {

            db.collection('coll1').insertOne({type: 'a'}, function(err) {

                assert.ifError(err);
                db.collection('coll2').insertOne({type: 'b'}, afterInserted);
            });

            function afterInserted(err) {

                assert.ifError(err);
                done();
            }
        }));

        test('clean collection', cleanC(function(db, done) {

            db.collection('coll1').find().count(function(err, cnt) {

                assert.ifError(err);
                assert.equal(cnt, 0);
                db.collection('coll2').find().count(afterCountFound);
            });

            function afterCountFound(err, cnt) {

                assert.ifError(err);
                assert.equal(cnt, 0);
                done();
            }
        }));
    });

    suite('.drop()', function() {

        test('add some data to the collections', ready(function(db, done) {

            db.collection('coll1').insertOne({type: 'a'}, function(err) {

                assert.ifError(err);
                db.collection('coll2').insertOne({type: 'b'}, afterInserted);
            });

            function afterInserted(err) {

                assert.ifError(err);
                done();
            }
        }));

        test('clean db', drop(function(db, done) {

            db.collection('coll1').find().count(function(err, cnt) {

                assert.ifError(err);
                assert.equal(cnt, 0);
                db.collection('coll2').find().count(afterCountFound);
            });

            function afterCountFound(err, cnt) {

                assert.ifError(err);
                assert.equal(cnt, 0);
                db.close(); // Close the mongodb service through db handle
                done();
            }
        }));
        test('close connection',close(function(db,done){
            db.close();  // should work even if mondogb connection already closed.
            done();
        }));
    });
});

//---------------------------------------------------------------------------
// Change Notes:
//
// mongo-client: now has support for v3.x by adding "db.close()" to the db object.
// allowing the mongodb@3.x client service connection to be closed.
// This works even after the testdb database has been removed from mongodb.
//
// Version should become MochaMongo 2.0.0
// - Supports mongodb@^3.0.0

