const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const port = 3000;

const db = new sqlite3.Database("database.DB", (err) => {
  if (err) {
    console.error(
      "Erreur lors de la connexion à la base de données",
      err.message
    );
  } else {
    console.log("Connecté à la base de données SQLite");
  }
});

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS URLShort (
      key TEXT PRIMARY KEY,
      original_Url TEXT,
      short_Url TEXT
    )`,
    (err) => {
      if (err) {
        console.error("Erreur lors de la création de la table", err.message);
      }
    }
  );
});

function isValidYouTubeUrl(url) {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    if (
      hostname === "www.youtube.com" ||
      hostname === "youtube.com" ||
      hostname === "youtu.be"
    ) {
      if (
        hostname === "youtu.be" ||
        (hostname.includes("youtube.com") &&
          parsedUrl.pathname === "/watch" &&
          parsedUrl.searchParams.has("v"))
      ) {
        return true;
      }
    }
    return false;
  } catch (err) {
    return false;
  }
}

function generateKey() {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < 5) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

function generateShortUrl(baseUrl, key) {
  const url = new URL(baseUrl);
  return `${url.origin}/${key}`;
}

function insertData(value) {
  return new Promise((resolve, reject) => {
    if (!isValidYouTubeUrl(value)) {
      return reject(
        new Error("La valeur fournie n'est pas un lien YouTube valide.")
      );
    }

    const key = generateKey();
    const shortUrl = generateShortUrl(value, key);

    const sql =
      "INSERT INTO URLShort (key, original_Url, short_Url) VALUES (?, ?, ?)";
    db.run(sql, [key, value, shortUrl], function (err) {
      if (err) {
        reject(err);
      } else {
        console.log(`Une ligne a été insérée avec la clé : ${key}`);
        resolve({ shortUrl, originalUrl: value, key });
      }
    });
  });
}

function fetchData() {
  return new Promise((resolve, reject) => {
    const sql = "SELECT key, original_Url, short_Url FROM URLShort";
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        rows.forEach((row) => {
          console.log(
            `${row.key}: ${row.original_Url} -> http://localhost:3000/${row.key}`
          );
        });
        resolve(rows);
      }
    });
  });
}

app.get("/:key", (req, res) => {
  const key = req.params.key;

  const sql = "SELECT original_Url FROM URLShort WHERE key = ?";
  db.get(sql, [key], (err, row) => {
    if (err) {
      return res.status(500).send("Erreur interne du serveur.");
    }
    if (row) {
      res.redirect(row.original_Url);
    } else {
      res.status(404).send("URL non trouvée.");
    }
  });
});
insertData("https://www.youtube.com/watch?v=86gMD2OLiUg");
fetchData();
app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});

module.exports = { generateKey, insertData, fetchData, db, isValidYouTubeUrl };
