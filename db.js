import pg  from "pg";

const db = new pg.Client({
    user : "postgres",
    host : "localhost",
    database : "postgres",
    password : "mohan",
    port : 5432
});

db.connect();




export default db;
