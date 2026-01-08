
import { GoogleGenAI, Type } from "@google/genai";
import { AppState, ServiceRecord, Material } from "../types.ts";

export const generateFinancialInsight = async (state: AppState) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Como um consultor financeiro de negócios, analise os seguintes dados de uma empresa de prestação de serviços:
    
    Materiais em estoque: ${JSON.stringify(state.materials)}
    Serviços realizados: ${JSON.stringify(state.services)}
    
    Por favor, forneça um resumo executivo que inclua:
    1. Faturamento Total.
    2. Lucro Bruto estimado (considerando Valor Venda - Valor Compra dos materiais + Mão de obra).
    3. Margem de lucro média.
    4. Sugestões de melhoria (ex: materiais com baixa margem, clientes frequentes).
    
    Responda em Português com um tom profissional e encorajador.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Erro na análise da IA:", error);
    return "Não foi possível gerar a análise no momento. Verifique sua conexão ou tente mais tarde.";
  }
};
