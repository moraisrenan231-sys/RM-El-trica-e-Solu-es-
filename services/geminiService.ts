
import { GoogleGenAI } from "@google/genai";
import { AppState } from "../types.ts";

export const generateFinancialInsight = async (state: AppState) => {
  // Verificação de segurança para evitar crash se a API_KEY estiver ausente
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.error("Configuração de IA: API_KEY não encontrada no ambiente.");
    return "A análise de IA requer uma chave de API configurada. Entre em contato com o suporte.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      Como um consultor financeiro de negócios, analise os seguintes dados de uma empresa de prestação de serviços elétricos:
      
      Materiais em estoque: ${JSON.stringify(state.materials)}
      Serviços realizados: ${JSON.stringify(state.services)}
      
      Por favor, forneça um resumo executivo que inclua:
      1. Faturamento Total.
      2. Lucro Bruto estimado (considerando Valor Venda - Valor Compra dos materiais + Mão de obra).
      3. Margem de lucro média do negócio.
      4. Sugestões práticas de melhoria (ex: materiais com baixa margem, clientes recorrentes, sugestões de preços).
      
      Responda em Português com um tom profissional, direto e encorajador para o empresário.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Erro na análise da IA:", error);
    return "Não foi possível gerar a análise no momento. Verifique sua conexão ou as permissões da sua chave de API.";
  }
};
