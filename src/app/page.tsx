'use client';
import React, { useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


interface InvestmentData {
  name: string;
  indicators: Record<string, string>;
}

async function getInvestmentData(type: string, ticker: string): Promise<InvestmentData | null> {
  try {
    const response = await fetch(`/api/statusinvest?type=${type}&ticker=${ticker}`);
    if (!response.ok) {
      console.error(`Erro ao buscar dados para ${type}/${ticker}:`, response.statusText);
      return null;
    }
    const data: InvestmentData = await response.json();
    return data;
  } catch (error) {
    console.error(`Erro ao buscar dados para ${type}/${ticker}:`, error);
    return null;
  }
}

function cleanData(data: InvestmentData): InvestmentData {
  const renameKeys: Record<string, string> = {
    'Val. patrim. p/cotaValor patrim. p/cotaVal. patrimonial p/cota': 'Val. patrim. cota',
    'REND. MÉD. (24M)RENDIM. MÉDIO (24M)RENDIMENTO MENSAL MÉDIO (24M)': 'REND. MÉD.',
    'PARTIC. NO IFIXPARTICIPAÇÃO NO IFIX': 'PARTIC. NO IFIX',
  };

  const cleanedIndicators = Object.entries(data.indicators).reduce<Record<string, string>>(
    (acc, [key, value]) => {
      // Limpa a chave removendo explicações ou elementos desnecessários
      const cleanedKey = key.replace(/\s+help_outline.*$/, '').trim();

      // Renomeia a chave, se aplicável
      const renamedKey = renameKeys[cleanedKey] || cleanedKey;

      // Verifica se a chave final é válida
      if (renamedKey && !renamedKey.includes('help_outline')) {
        acc[renamedKey] = value.trim();
      }

      return acc;
    },
    {}
  );

  return {
    name: data.name.trim(),
    indicators: cleanedIndicators,
  };
}


export default function Home() {
  const [acoesTicker, setAcoesTicker] = useState("BBDC4");
  const [fundosTicker, setFundosTicker] = useState("KNRI11");
  const [fiagrosTicker, setFiagrosTicker] = useState("HGAG11");

  const [acoesData, setAcoesData] = useState<InvestmentData | null>(null);
  const [fundosData, setFundosData] = useState<InvestmentData | null>(null);
  const [fiagrosData, setFiagrosData] = useState<InvestmentData | null>(null);

  const fetchData = async () => {
    const acoes = await getInvestmentData("acoes", acoesTicker);
    const fundos = await getInvestmentData("fundos-imobiliarios", fundosTicker);
    const fiagros = await getInvestmentData("fiagros", fiagrosTicker);
  
    if (!acoes) {
      toast.error(`O ticker de ações "${acoesTicker}" é inválido ou não foi encontrado.`);
    }
    if (!fundos) {
      toast.error(`O ticker de fundos imobiliários "${fundosTicker}" é inválido ou não foi encontrado.`);
    }
    if (!fiagros) {
      toast.error(`O ticker de fiagros "${fiagrosTicker}" é inválido ou não foi encontrado.`);
    }
  
    setAcoesData(acoes ? cleanData(acoes) : null);
    setFundosData(fundos ? cleanData(fundos) : null);
    setFiagrosData(fiagros ? cleanData(fiagros) : null);
  };
  
  

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <ToastContainer />
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-3xl font-bold text-blue-600 mb-8 text-center">
          Plataforma de Dados de Investimentos
        </h1>

        {/* Campos de busca */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Ticker de Ações
            </label>
            <input
              type="text"
              value={acoesTicker}
              onChange={(e) => setAcoesTicker(e.target.value)}
              className="border border-gray-300 rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500 text-gray-700"
              placeholder="Ex: BBDC4"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Ticker de Fundos Imobiliários
            </label>
            <input
              type="text"
              value={fundosTicker}
              onChange={(e) => setFundosTicker(e.target.value)}
              className="border border-gray-300 rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500 text-gray-700"
              placeholder="Ex: KNRI11"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Ticker de Fiagros
            </label>
            <input
              type="text"
              value={fiagrosTicker}
              onChange={(e) => setFiagrosTicker(e.target.value)}
              className="border border-gray-300 rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500 text-gray-700"
              placeholder="Ex: HGAG11"
            />
          </div>
        </div>

        <button
          onClick={fetchData}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Buscar Dados
        </button>

        {/* Resultados */}
        <div className="mt-10 space-y-8">
          {acoesData && (
            <div className="p-6 bg-blue-50 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-blue-600 mb-4">
                Ações - {acoesData.name}
              </h2>
              <ul className="space-y-2">
                {Object.entries(acoesData.indicators).map(([key, value]) => (
                  <li key={key} className="text-gray-700">
                    <strong className="font-semibold">{key}:</strong> {value}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {fundosData && (
            <div className="p-6 bg-green-50 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-green-600 mb-4">
                Fundos Imobiliários - {fundosData.name}
              </h2>
              <ul className="space-y-2">
                {Object.entries(fundosData.indicators).map(([key, value]) => (
                  <li key={key} className="text-gray-700">
                    <strong className="font-semibold">{key}:</strong> {value}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {fiagrosData && (
            <div className="p-6 bg-yellow-50 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-yellow-600 mb-4">
                Fiagros - {fiagrosData.name}
              </h2>
              <ul className="space-y-2">
                {Object.entries(fiagrosData.indicators).map(([key, value]) => (
                  <li key={key} className="text-gray-700">
                    <strong className="font-semibold">{key}:</strong> {value}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// import axios from 'axios';
// import * as cheerio from 'cheerio';
// import fs from 'fs';

// interface InvestmentData {
//   name: string;
//   indicators: Record<string, string>;
// }

// async function getInvestmentData(type: string, ticker: string): Promise<InvestmentData | null> {
//   try {
//     const url = `https://statusinvest.com.br/${type}/${ticker}`;
//     const { data: html } = await axios.get(url, {
//       headers: {
//         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
//         'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
//         'Referer': 'https://statusinvest.com.br/',
//       },
//     });

//     const $ = cheerio.load(html);
//     const data: InvestmentData = {
//       name: $('h1').text().trim(),
//       indicators: {},
//     };

//     $('.info').each((_, element) => {
//       const label = $(element).find('.title').text().trim();
//       const rawValue = $(element).find('.value').text().trim();
//       const cleanValue = rawValue.replace(/\n/g, '').replace(/\s+/g, ' ').trim();

//       if (label && cleanValue) {
//         data.indicators[label] = cleanValue;
//       }
//     });

//     const cleanedData = cleanData(data);
//     // const cleanedFileName = `public/StatusInvest/${type}_${ticker}_data_cleaned.json`;

//     // fs.writeFileSync(cleanedFileName, JSON.stringify(cleanedData, null, 2), 'utf-8');
//     // console.log(`Dados do tipo ${type} e ticker ${ticker} processados e salvos no arquivo: ${cleanedFileName}`);

//     return cleanedData;
//   } catch (error) {
//     console.error(`Erro ao buscar dados para ${type}/${ticker}:`, error);
//     return null;
//   }
// }

// function cleanData(data: InvestmentData): InvestmentData {
//   const renameKeys: Record<string, string> = {
//     'Val. patrim. p/cotaValor patrim. p/cotaVal. patrimonial p/cota': 'Val. patrim. cota',
//     'REND. MÉD. (24M)RENDIM. MÉDIO (24M)RENDIMENTO MENSAL MÉDIO (24M)': 'REND. MÉD.',
//     'PARTIC. NO IFIXPARTICIPAÇÃO NO IFIX': 'PARTIC. NO IFIX',
//   };

//   const cleanedIndicators = Object.entries(data.indicators).reduce<Record<string, string>>((acc, [key, value]) => {
//     const cleanedKey = key.replace(/\s+help_outline.*$/, '').trim();
//     const renamedKey = renameKeys[cleanedKey] || cleanedKey;

//     if (renamedKey && !renamedKey.includes('help_outline')) {
//       acc[renamedKey] = value.trim();
//     }

//     return acc;
//   }, {});

//   return {
//     name: data.name,
//     indicators: cleanedIndicators,
//   };
// }

// export default async function Home() {
//   const acoesData = await getInvestmentData('acoes', 'BBDC4');
//   const fundosData = await getInvestmentData('fundos-imobiliarios', 'KNRI11');
//   const fiagrosData = await getInvestmentData('fiagros', 'HGAG11');

//   return (
//     <div className="p-8">
//       <h1 className="text-2xl font-bold">Dados de Investimentos</h1>
//       <div className="mt-4">
//         {acoesData && (
//           <div>
//             <h2 className="text-xl font-semibold">Ações - {acoesData.name}</h2>
//             <ul>
//               {Object.entries(acoesData.indicators).map(([key, value]) => (
//                 <li key={key}>
//                   <strong>{key}:</strong> {value}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {fundosData && (
//           <div>
//             <h2 className="text-xl font-semibold">Fundos Imobiliários - {fundosData.name}</h2>
//             <ul>
//               {Object.entries(fundosData.indicators).map(([key, value]) => (
//                 <li key={key}>
//                   <strong>{key}:</strong> {value}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {fiagrosData && (
//           <div>
//             <h2 className="text-xl font-semibold">Fiagros - {fiagrosData.name}</h2>
//             <ul>
//               {Object.entries(fiagrosData.indicators).map(([key, value]) => (
//                 <li key={key}>
//                   <strong>{key}:</strong> {value}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }