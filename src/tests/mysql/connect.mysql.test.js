const mysql = require("mysql2");

// Create a new connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "lehiep",
  password: "123456",
  database: "ecommerce",
  port: 8811,
});
// pool.query("SELECT * from users", function (err, result) {
//   if (err) throw err;
//   console.log("Connected to the database");
//   console.log("query result", result);
//   pool.end((err) => {
//     if (err) throw err;
//     console.log("Connection closed");
//   });
// });

const batchSize = 10000; // adjust batch size
const totalSize = 10000000; // adjust total size
let currentId = 1;
console.time("::::::TIMER:::");
const insertBatch = async () => {
  const values = [];
  for (let i = 0; i < batchSize && currentId <= totalSize; i++) {
    const name = `name-${currentId}`;
    const age = currentId;
    const address = `address-${currentId}`;
    values.push([currentId, name, age, address]);
    currentId++;
  }
  if (!values.length) {
    console.timeEnd("::::::TIMER:::");
    pool.end((err) => {
      if (err) {
        console.log(`error occurred while running batch`);
      } else {
        console.log("Connection pool closed success");
      }
    });
    return;
  }
  const sql = `INSERT INTO test_table (id, name, age, address) VALUES ?`;
  pool.query(sql, [values], async function (err, results) {
    if (err) throw err;
    console.log(`Inserted ${results.affectedRows} records`);
    await insertBatch();
  });
};
// };
insertBatch().catch((err) => console.log(err));
