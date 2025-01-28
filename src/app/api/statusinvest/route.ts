import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const ticker = searchParams.get("ticker");

  // Validação de parâmetros obrigatórios
  if (!type || !ticker) {
    return NextResponse.json(
      { error: "Parâmetros 'type' e 'ticker' são obrigatórios." },
      { status: 400 }
    );
  }

  try {
    const url = `https://statusinvest.com.br/${type}/${ticker}`;
    const { data: html } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
        Referer: "https://statusinvest.com.br/",
      },
    });

    const $ = cheerio.load(html);
    const name = $("h1").text().trim();

    if (!name) {
      return NextResponse.json(
        { error: "Nenhum dado encontrado para o ticker informado." },
        { status: 404 }
      );
    }

    const indicators: Record<string, string> = {};
    $(".info").each((_, element) => {
      const label = $(element).find(".title").text().trim();
      const rawValue = $(element).find(".value").text().trim();
      const cleanValue = rawValue.replace(/\n/g, "").replace(/\s+/g, " ").trim();

      if (label && cleanValue) {
        indicators[label] = cleanValue;
      }
    });

    return NextResponse.json({ name, indicators });
  } catch (error: unknown) {
    console.error("Erro ao buscar dados:", {
      message: error instanceof Error ? error.message : "Erro desconhecido",
      stack: error instanceof Error ? error.stack : null,
      response: axios.isAxiosError(error) ? error.response?.data : null,
    });
  
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(
        {
          error: `Erro ao buscar dados externos: ${error.response.status} - ${error.response.statusText}`,
        },
        { status: error.response.status }
      );
    }
  
    return NextResponse.json(
      { error: "Erro interno ao buscar dados." },
      { status: 500 }
    );
  }
  
}