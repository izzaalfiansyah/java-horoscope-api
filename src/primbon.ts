import axios from "axios";
import cheerio from "cheerio";
import express from "express";

const router = express.Router();

const getPrimbon = async (props: { tgl: number; bln: number; thn: number }) => {
  const body = { ...props, ...{ submit: "1" } };
  const response = await axios.post(
    "https://www.primbon.com/horoskop.php",
    body,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  let keterangan: {
    [key: string]: string;
  } = {};

  const $ = cheerio.load(response.data);

  $("#body b:first i").each((i, el) => {
    const text: string[] = $(el).html()?.split("<br>") as string[];

    for (let j = 0; j < text.length; j++) {
      const element = text[j];
      if (j < 4) {
        const item = element.split(": ");
        keterangan[item[0].toLowerCase().replace(".", "").replace(" ", "_")] =
          item[1];
      }
    }
  });

  let sifat_weton: any;
  let sifat_wuku: any;
  let keadaan_umum: any;
  let keadaan_alam_semesta: any;
  let keadaan_fisik: any;
  let keadaan_masa_kanak_kanak: any;
  let keadaan_masa_remaja: any;
  let ciri_khas: any;
  let ikatan_persahabatan: any;
  let keadaan_kesehatan: any;
  let saat_yang_tepat: any;
  let jodoh: any;

  $("#body").each((i, el) => {
    sifat_weton = $(el)
      .html()
      ?.split("Weton tersebut, adalah:")[1]
      .split("2.")[0]
      .trim();

    sifat_wuku = $(el)
      .html()
      ?.split("Wuku tersebut, adalah:")[1]
      .split("Di bawah ini")[0]
      .split("Daftar ini")[0]
      .trim();

    keadaan_umum = $(el)
      .html()
      .split("KEADAAN UMUM")[1]
      ?.split("KEADAAN ALAM SEMESTA")[0]
      .split("ALAM SEMESTA")[0]
      .split("KEADAAN ALAM")[0]
      .split("KEADAAN FISIK")[0]
      .trim();

    keadaan_alam_semesta =
      (
        $(el).html()?.split("ALAM SEMESTA")[1] ||
        $(el).html()?.split("KEADAAN ALAM")[1]
      )
        ?.split("KEADAAN FISIK")[0]
        .split("POSTUR TUBUH")[0]
        .trim() || "<br/>Tidak diketahui";

    keadaan_fisik = (
      $(el).html()?.split("KEADAAN FISIK")[1] ||
      $(el).html().split("POSTUR TUBUH")[1]
    )
      .split("KEADAAN MASA KANAK-KANAK")[0]
      .trim();

    keadaan_masa_kanak_kanak = $(el)
      .html()
      .split("KEADAAN MASA KANAK-KANAK")[1]
      .split("KEADAAN MASA REMAJA")[0]
      .trim();

    keadaan_masa_remaja = (
      $(el).html()?.split("KEADAAN MASA REMAJA")[1] ||
      $(el).html().split("KEADAAN MASA DEWASA")[1]
    )
      .split("CIRI KHAS")[0]
      .trim();

    ciri_khas = (
      $(el).html()?.split("CIRI KHAS YANG MENCOLOK")[1] ||
      $(el).html().split("CIRI KHAS")[1]
    )
      .split("IKATAN PERSAHABATAN")[0]
      .trim();

    ikatan_persahabatan = $(el)
      .html()
      .split("IKATAN PERSAHABATAN")[1]
      .split("KEADAAN KESEHATAN")[0]
      .trim();

    keadaan_kesehatan =
      $(el)
        .html()
        ?.split("KEADAAN KESEHATAN")[1]
        ?.split("PEKERJAAN YANG COCOK")[0]
        .trim() || "<br/>Tidak diketahui";

    saat_yang_tepat = (
      $(el).html()?.split("SAAT YANG TEPAT")[1] ||
      $(el).html()?.split("SAAT YANG BAIK")[1] ||
      $(el).html()?.split("HARI JAYA")[1]
    )
      .split("HOBI")[0]
      .trim();

    jodoh = (
      $(el).html()?.split("JODOH")[1] || $(el).html().split("JODO PINASTI")[1]
    )
      .split("BATU PERMATA")[0]
      .trim();
  });

  return {
    ...keterangan,
    sifat_weton,
    sifat_wuku,
    keadaan_umum,
    keadaan_alam_semesta,
    keadaan_fisik,
    keadaan_masa_kanak_kanak,
    keadaan_masa_remaja,
    ciri_khas,
    ikatan_persahabatan,
    keadaan_kesehatan,
    saat_yang_tepat,
    jodoh,
  };
};

const getKarakter = async (props: {
  tanggal: number;
  bulan: number;
  tahun: number;
}) => {
  const body = { ...props, submit: 1 };
  const response = await axios.post(
    "https://www.primbon.com/sifat_karakter_tanggal_lahir.php",
    body,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const $ = cheerio.load(response.data);

  const bodyHTML = $("#body").html().split("GARIS HIDUP ")[1];
  const garis_hidup = bodyHTML.split("</b>")[0];
  const detail = bodyHTML.split("<i>")[1].split("</i>")[0];

  return {
    garis_hidup,
    detail,
  };
};

router.post("/", async (req, res) => {
  const tanggalLahir = req.body.tanggal_lahir;

  if (!tanggalLahir) {
    return res.status(400).send({
      message: "tanggal lahir tidak diketahui",
    });
  }

  const dates = new Date(tanggalLahir);
  const primbon = await getPrimbon({
    tgl: dates.getDate(),
    bln: dates.getMonth() + 1,
    thn: dates.getFullYear(),
  });
  const garis_hidup = await getKarakter({
    tanggal: dates.getDate(),
    bulan: dates.getMonth() + 1,
    tahun: dates.getFullYear(),
  });

  return res.send({
    success: true,
    primbon,
    garis_hidup,
  });
});

export default router;
