const { Client } = require('pg');

// Get host from environment variable, default to 'postgres' for Docker
const DB_HOST = process.env.DB_HOST || 'postgres';
const isDocker = DB_HOST === 'postgres';

async function waitForPostgres(retries = 5, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            const client = new Client({
                user: 'postgres',
                host: DB_HOST,
                password: 'postgres',
                port: 5432,
                // Force IPv4
                family: 4,
                // Add connection timeout
                connectionTimeoutMillis: 5000
            });
            await client.connect();
            await client.end();
            return true;
        } catch (err) {
            console.log(`Attempt ${i + 1}/${retries} failed. Retrying in ${delay/1000} seconds...`);
            console.log(`Error: ${err.message}`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    return false;
}

async function setupTestDatabase() {
    console.log(`Waiting for PostgreSQL to be ready at ${DB_HOST}...`);
    const isReady = await waitForPostgres();
    if (!isReady) {
        console.error('Could not connect to PostgreSQL after multiple attempts');
        process.exit(1);
    }

    const client = new Client({
        user: 'postgres',
        host: DB_HOST,
        password: 'postgres',
        port: 5432,
        // Force IPv4
        family: 4,
        // Add connection timeout
        connectionTimeoutMillis: 5000
    });

    try {
        console.log('Attempting to connect to PostgreSQL...');
        await client.connect();
        
        // Drop database if it exists
        console.log('Dropping test database if exists...');
        await client.query('DROP DATABASE IF EXISTS test_db');
        
        // Create fresh database
        console.log('Creating test database...');
        await client.query('CREATE DATABASE test_db');
        
        console.log('Test database created successfully');
    } catch (err) {
        console.error('Error setting up test database:', err);
        console.log('\nPlease ensure:');
        console.log('1. PostgreSQL is installed and running');
        console.log('2. PostgreSQL user "postgres" exists with password "postgres"');
        console.log('3. PostgreSQL is listening on port 5432');
        if (isDocker) {
            console.log('\nDocker environment detected:');
            console.log('1. Make sure the postgres container is running');
            console.log('2. Check if the containers are on the same network');
            console.log('3. Check Docker network configuration');
            console.log(`4. Current DB_HOST: ${DB_HOST}`);
        }
        process.exit(1);
    } finally {
        await client.end();
    }
}

setupTestDatabase(); 