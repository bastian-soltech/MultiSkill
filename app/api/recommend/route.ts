import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { skill, roadmap } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `
      You are an elite learning coach. The user is learning "${skill}".
      Current roadmap milestones: ${JSON.stringify(roadmap)}.
      
      Provide 3 specific, high-impact recommendations to accelerate their learning or fill gaps in their roadmap.
      Format the output as a JSON array of objects with an 'advice' field.
      Example: [{"advice": "Build a portfolio project using X"}, {"advice": "Focus on mastery of Y before moving to Z"}]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from potentially markdown-wrapped response
    const jsonMatch = text.match(/\[.*\]/s);
    const recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return NextResponse.json({ recommendations });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ recommendations: [{ advice: "Keep practicing and documenting your journey daily." }] }, { status: 200 });
  }
}
