import axios from "axios";
import cheerio from "cheerio";
import express from "express";

const router = express.Router();

const getFromPrimbon = async (props: {
  nama1: string;
  nama2: string;
  tgl1: number;
  tgl2: number;
  bln1: number;
  bln2: number;
  thn1: number;
  thn2: number;
}): Promise<{
  identitas: any;
  primbon: any;
}> => {
  const data = { ...props, submit: 1 };
  const response = await axios.post(
    "https://www.primbon.com/ramalan_jodoh.php",
    data,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const $ = cheerio.load(response.data);

  let nama = [];
  let tanggalLahir = [];

  const body = $("#body").html();
  const content = body
    .slice(body.indexOf("begitu pula sebaliknya."))
    .replace("begitu pula sebaliknya.", "")
    .replace("<br><br>", "")
    .split("*Jangan mudah")[0];

  $("#body b").each((i, el) => {
    if (i < 2) {
      nama.push($(el).text());
    }
  });

  $("#body i").each((i, el) => {
    if (i < 2) {
      tanggalLahir.push($(el).text().split(": ")[1]);
    }
  });

  const identitas = {
    nama1: nama[0],
    nama2: nama[1],
    tanggal_lahir1: tanggalLahir[0],
    tanggal_lahir2: tanggalLahir[1],
  };

  const listprimbon = content.split("<b><i>").filter((item, i) => {
    if (i > 0) {
      return true;
    }
    return false;
  });

  const primbon = listprimbon.map((item) => {
    const list = item.slice(item.indexOf("Berdasarkan")).split("</i></b><br>");

    return {
      pasaran: list[0],
      detail: list[1].replace("<br><br>", "").replace("<i>", ""),
    };
  });

  return {
    identitas,
    primbon,
  };
};

const getPerjalananHidup = async (props: {
  nama1: string;
  tgl1: number;
  bln1: number;
  thn1: number;
  nama2: string;
  tgl2: number;
  bln2: number;
  thn2: number;
}) => {
  const data = { ...props, submit: 1 };
  const response = await axios.post(
    "https://www.primbon.com/suami_istri.php",
    data,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const $ = cheerio.load(response.data);

  let perjalanan_hidup = [];

  $("#body table tr").each((i, el) => {
    const text = $(el).text().split(" Thn :");
    if (text[1]) {
      perjalanan_hidup.push({
        tahun: text[0].replace("\n", ""),
        detail: text[1],
      });
    }
  });

  return perjalanan_hidup;
};

const getRamalan = async (props: {
  nama1: string;
  tanggal1: number;
  bulan1: number;
  tahun1: number;
  nama2: string;
  tanggal2: number;
  bulan2: number;
  tahun2: number;
}) => {
  const data = { ...props, submit: 1 };
  const response = await axios.post(
    "https://www.primbon.com/ramalan_cinta.php",
    data,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const $ = cheerio.load(response.data);

  const body = $("#body").html();
  const text = $("body").text();
  const sisi_positif = body
    .split("Sisi Positif Anda:")[1]
    .split("<br>")[0]
    .replace("</b> ", "");
  const sisi_negatif = body
    .split("Sisi Negatif Anda:")[1]
    .split("<br>")[0]
    .replace("</b> ", "");
  const nilai = parseInt(
    body.split('src="ramalan_kecocokan_cinta')[1].split(".png")[0] || "0"
  );
  const nilai_detail = `${nilai}/5`;

  return {
    sisi_positif,
    sisi_negatif,
    nilai,
    nilai_detail,
  };
};

router.post("/", async (req, res) => {
  const nama1: string | null = req.body?.nama1;
  const nama2: string | null = req.body?.nama2;
  const tanggalLahir1: string | null = req.body?.tanggal_lahir1;
  const tanggalLahir2: string | null = req.body?.tanggal_lahir2;

  if (!nama1 || !tanggalLahir1) {
    return res.status(400).send({
      message: "data diri anda tidak lengkap",
    });
  }

  if (!nama2 || !tanggalLahir2) {
    return res.status(400).send({
      message: "data diri pasangan anda tidak lengkap",
    });
  }

  const date1 = new Date(tanggalLahir1);
  const date2 = new Date(tanggalLahir2);

  const { identitas, primbon } = await getFromPrimbon({
    nama1,
    nama2,
    tgl1: date1.getDate(),
    bln1: date1.getMonth() + 1,
    thn1: date1.getFullYear(),
    tgl2: date2.getDate(),
    bln2: date2.getMonth() + 1,
    thn2: date2.getFullYear(),
  });

  const perjalanan_hidup = await getPerjalananHidup({
    nama1,
    nama2,
    tgl1: date1.getDate(),
    bln1: date1.getMonth() + 1,
    thn1: date1.getFullYear(),
    tgl2: date2.getDate(),
    bln2: date2.getMonth() + 1,
    thn2: date2.getFullYear(),
  });

  const ramalan = await getRamalan({
    nama1,
    nama2,
    tanggal1: date1.getDate(),
    bulan1: date1.getMonth() + 1,
    tahun1: date1.getFullYear(),
    tanggal2: date2.getDate(),
    bulan2: date2.getMonth() + 1,
    tahun2: date2.getFullYear(),
  });

  return res.send({
    success: true,
    identitas,
    primbon,
    perjalanan_hidup,
    ramalan,
    primbon_nb:
      "Hasil ramalan primbon perjodohan bagi kedua pasangan yang dihitung berdasarkan 6 petung perjodohan dari kitab primbon Betaljemur Adammakna yang disusun oleh Kangjeng Pangeran Harya Tjakraningrat. Hasil ramalan bisa saja saling bertentangan pada setiap petung. Hasil ramalan yang positif (baik) dapat mengurangi pengaruh ramalan yang negatif (buruk), begitu pula sebaliknya.",
    perjalanan_hidup_nb:
      "Hasil ramalan tentu saja ada yang baik, ada yang buruk. Bagi yang kebetulan berada disituasi yang buruk atau kurang baik, disarankan untuk tetap berusaha menjaga keutuhan rumah tangga atau keluarga anda. Jalin komunikasi yang baik, perbanyak amal, rajin berdoa, tetap optimis dan tetap semangat dalam menjalani hidup. Hal tersebut akan memperbaiki karma anda.",
  });
});

export default router;
