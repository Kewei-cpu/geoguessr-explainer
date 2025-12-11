import { GoogleGenAI, Type } from "@google/genai";
import { GeoLocationResult } from "../types";

// Initialize the client using the environment variable
// Note: To use a custom API endpoint, add `baseUrl: process.env.API_BASE_URL` to the config object below.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
你是一位世界冠军级的 GeoGuessr 玩家和地理专家。
你的任务是分析街景图像并确定最可能的地理位置。

首先，输出你的“思考过程”（thoughtProcess）。进行详细的循序渐进的视觉分析，寻找：
- 植被（耐寒区，特定植物物种）
- 土壤颜色和质地
- 道路标线（线条颜色、样式、宽度）
- 建筑和基础设施（电线杆类型、护柱）
- 行驶侧（左行/右行）
- 太阳位置（半球）
- 标志上的语言和文字
- 相机代数或车辆元数据（如果可见/已知）

分析之后，提供精确的经纬度估算，以及最终的总结解释。
请确保所有输出均为中文（简体）。
`;

export const analyzeImageLocation = async (base64Image: string, mimeType: string): Promise<GeoLocationResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", 
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          },
          {
            text: "分析这张图片。这是哪里拍的？首先给出详细的循序渐进的思考过程。",
          },
        ],
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            thoughtProcess: { 
              type: Type.STRING, 
              description: "原始的逐步分析流。描述你看到的内容，你排除的内容，以及你如何在做出最终决定之前缩小位置范围。" 
            },
            latitude: { type: Type.NUMBER, description: "估计纬度" },
            longitude: { type: Type.NUMBER, description: "估计经度" },
            country: { type: Type.STRING, description: "国家名称" },
            region: { type: Type.STRING, description: "州、省或地区名称" },
            confidence: { type: Type.NUMBER, description: "置信度评分（0-100）" },
            explanation: { type: Type.STRING, description: "最终结论和关键推理的润色摘要。" },
            visualCues: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "发现的具体视觉线索列表（例如，'黄色车牌'，'桉树'）"
            }
          },
          required: ["thoughtProcess", "latitude", "longitude", "country", "explanation", "visualCues", "confidence"],
          // Important: Force thoughtProcess to be generated first to act as actual CoT
          propertyOrdering: ["thoughtProcess", "visualCues", "country", "region", "latitude", "longitude", "explanation", "confidence"]
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text received from Gemini.");
    }

    const result = JSON.parse(text) as GeoLocationResult;

    // Sanitize data to prevent crashes
    if (typeof result.latitude !== 'number' || isNaN(result.latitude)) {
      console.warn("Invalid latitude received, defaulting to 0");
      result.latitude = 0;
    }
    if (typeof result.longitude !== 'number' || isNaN(result.longitude)) {
      console.warn("Invalid longitude received, defaulting to 0");
      result.longitude = 0;
    }

    return result;
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    throw error;
  }
};