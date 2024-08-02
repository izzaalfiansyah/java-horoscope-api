import express from "express";
import cekArtiNama from "./src/cekartinama";
import primbon from "./src/primbon";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send({
    hello: "World",
  });
});

app.use("/arti-nama", cekArtiNama);
app.use("/primbon", primbon);

app.listen(8080, () => {
  console.log("Server berjalan di port 8080");
});
