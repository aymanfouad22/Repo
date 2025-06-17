const Sequelize = require('sequelize');

const isTest = process.env.NODE_ENV === 'test';
const isDocker = process.env.DB_HOST === 'postgres';

const sequelize = new Sequelize(
    isTest ? 'test_db' : (process.env.DB_SCHEMA || 'postgres'),
    isTest ? 'postgres' : (process.env.DB_USER || 'postgres'),
    isTest ? 'postgres' : (process.env.DB_PASSWORD || ''),
    {
        host: isDocker ? 'postgres' : (isTest ? '127.0.0.1' : (process.env.DB_HOST || '127.0.0.1')),
        port: isTest ? 5432 : (process.env.DB_PORT || 5432),
        dialect: 'postgres',
        dialectOptions: {
            ssl: process.env.DB_SSL == "true"
        },
        logging: isTest ? false : console.log,
        // Add retry logic for tests
        retry: {
            max: 3,
            match: [/Deadlock/i, /Connection refused/i, /ECONNREFUSED/i]
        }
    }
);

const Person = sequelize.define('Person', {
    firstName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    lastName: {
        type: Sequelize.STRING,
        allowNull: true
    },
});

module.exports = {
    sequelize: sequelize,
    Person: Person
};