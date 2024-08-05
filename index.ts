import express from "express";
import cekArtiNama from "./src/cekartinama";
import jodoh from "./src/jodoh";
import cors from "cors";
import primbon from "./src/primbon";

const app = express();
app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("It's worked");
});

app.use("/arti-nama", cekArtiNama);
app.use("/primbon", primbon);
app.use("/jodoh", jodoh);

app.listen(8080, () => {
  console.log("Server berjalan di port 8080");
});
