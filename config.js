'use strict'

//Load Environment Variable
exports.PORT =
    process.env.PORT || 8080;
exports.DATABASE_URL =
    process.env.DATABASE_URL || "mongodb://localhost/test-database";