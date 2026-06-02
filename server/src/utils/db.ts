import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createPool({
    uri: process.env.DATABASE_URI,
    ssl: {
        minVersion: 'TLSv1.2',
    },
});

export default db;