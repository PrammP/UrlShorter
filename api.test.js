const {
  generateKey,
  insertData,
  fetchData,
  db,
  isValidYouTubeUrl,
} = require("./api");

afterAll(() => {
  db.close();
});

test("Key length = 5", () => {
  const key = generateKey();
  expect(key.length).toBe(5);
});
test("Key and value should be linked after insertion and short URL generated", async () => {
  const originalUrl = "https://www.youtube.com/watch?v=H_U2yoiT6os";
  const { shortUrl, key } = await insertData(originalUrl);

  const rows = await fetchData();
  const insertedRow = rows.find((row) => row.key === key);

  expect(insertedRow).toBeDefined();
  expect(insertedRow.original_Url).toBe(originalUrl);

  const expectedShortUrl = `https://www.youtube.com/${key}`;
  expect(insertedRow.short_Url).toBe(expectedShortUrl);
  expect(shortUrl).toBe(expectedShortUrl);
});

test("value shouldn't be different than a Youtube URL", () => {
  const URL = "https://www.yo.com/channel/UCeWmlEby64lJUiDJDQ3Y8Dw";
  expect(isValidYouTubeUrl(URL)).toBe(false);
});
