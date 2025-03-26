/**
 *
 * @author nihalsheik
 * @author charles
 * @org Metron Consulting
 *
 */

(function (module) {

    var mysql = require('mysql2');
    var mongodb = require('mongodb');

    // ----------------------------------------------------------------------------------------------//
    /**
     *
     * DataSource
     *
     */
    var DataSource = function (host, port, user, password, database) {
        this.host = host;
        this.port = port;
        this.user = user;
        this.password = password;
        this.database = database;

        /**
         * Default Datasource. Let us assume MySql
         */
        this.type = 'mysql';

        this.getConnectionString = function () {
            switch (this.type) {
                case 'mysql':
                    break;
                case 'mongodb':
                    // mongodb://[username:password@]host1[:port1][,...hostN[:portN]][/[defaultauthdb][?options]]
                    return 'mongodb://' + this.user + ':' + this.password + '@' + this.host + ':' + this.port + '/' + this.database + "?authSource=admin";
                    break;
            }
        }

        this.toString = function () {
            return this.host + "," + this.port + "," + this.user + ","
                + this.password + "," + this.database;
        }
    }

    // ----------------------------------------------------------------------------------------------//
    /**
     *
     */

    var Mysql2Mongo = function (args) {
        this.config = null;
        this.source = null;
        this.tables = [];

        this.srcDB = null;
        this.destDB = null;

    }

    Mysql2Mongo.prototype.addTable = function (tableName) {
        this.tables.push(tableName);
    }

    Mysql2Mongo.prototype.setTables = function (tables) {
        this.tables = tables;
    }

    Mysql2Mongo.prototype.getTables = function () {
        return this.tables;
    }

    Mysql2Mongo.prototype.setSource = function (source) {
        this.source = source;
    };

    Mysql2Mongo.prototype.getSource = function () {
        return this.source;
    };

    Mysql2Mongo.prototype.connectSource = function (callback) {
        var cfg = this.source;
        var me = this;
        this.srcDB = mysql.createConnection({
            host: cfg.host,
            port: cfg.port,
            user: cfg.user,
            password: cfg.password,
            database: cfg.database
        });
        this.srcDB.connect(function (err) {
            _apply(callback, [err])
        });
    }

    Mysql2Mongo.prototype.setConfig = function (config) {
        this.config = config;
    };

    Mysql2Mongo.prototype.getConfig = function () {
        return this.config;
    };

    Mysql2Mongo.prototype.connectDestination = function (callback) {
        var cfg = this.config;
        var mongoClient = mongodb.MongoClient;
        var me = this;
        var url = cfg.getConnectionString();

        mongoClient.connect(url)
            .then(client => {
                me.destDB = client.db(cfg.database);
                callback.call(me, null); // 连接成功，传递 null 表示没有错误
            })
            .catch(err => {
                callback.call(me, err); // 连接失败，传递错误对象
            });
    };

    Mysql2Mongo.prototype.getSourceTables = function (callback) {
        if (this.srcDB == null) {
            return;
        }
        var me = this;
        console.log('Getting source tables');
        this.srcDB.query('SHOW TABLES', function (error, rows) {
            if (error) {
                console.log('get tables error ');
            }
            var tables = []
            for (var i = 0; i < rows.length; i++) {
                var data = rows[i]['Tables_in_' + me.getSource().database];
                tables.push(data);
            }
            callback.call(me, tables, error);
        });
    }

    Mysql2Mongo.prototype.migrate = function (callback) {
        console.log("Source : " + this.source.toString());
        console.log("Config : " + this.config.toString());
        console.log("Tables : ");
        var me = this;
        this.tables.forEach(function (table) {
            me.srcDB.query('SELECT * from ' + table, function (err, rec) {
                me.destDB.collection(table).drop();
                me.destDB.collection(table).insertMany(rec)
                    .then(result => {
                        console.log('Migrated table : ' + table);
                        _apply(callback, [table])
                    });
            });
        });
    };

    Mysql2Mongo.prototype.newDataSource = function (host, port, user, pass, database) {
        return new DataSource(host, port, user, pass, database);
    };

    // ----------------------------------------------------------------------------------------------//

    function _apply(callback, params) {
        callback.apply(m, params)
    }

    /**
     * Export module
     */
    var m = new Mysql2Mongo();
    module.exports = m;

})(module);