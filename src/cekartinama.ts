import express from "express";
import axios from "axios";
import cheerio from "cheerio";

const router = express.Router();

// mengambil data dari tabel cekartinama.com
const getFromCekArtiNama = async (nama: string) => {
  const namaString = nama.toLowerCase().replace(/ /gi, "-");

  const response = await axios(
    `https://cekartinama.com/cari-arti-nama/${namaString}.html`
  );
  const $ = cheerio.load(response.data);
  let items: any[] = [];

  $(".table_wrap.table_ind > table.elements_table tbody tr").each(
    (i, parent) => {
      if (i > 0) {
        let th: {
          nama?: string;
          gender?: string;
          asal?: string;
          arti?: string;
        } = {};
        $(parent)
          .children()
          .each((j, children) => {
            if (j == 1) {
              th.nama = $(children).text();
            }
            if (j == 2) {
              th.gender = $(children).text();
            }
            if (j == 3) {
              th.asal = $(children).text();
            }
            if (j == 4) {
              th.arti = $(children).text();
            }
          });

        if (!!th.nama) {
          items.push(th);
        }
      }
    }
  );

  return items;
};

router.get("/", async (req, res) => {
  const nama: string | null = req.query["nama"] as string;

  if (!nama) {
    return res.status(400).send({
      message: "nama tidak diketahui",
    });
  }

  const items = await getFromCekArtiNama(nama);

  res.send({
    success: true,
    items,
  });
});

export default router;
