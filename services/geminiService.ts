import { GoogleGenAI } from "@google/genai";
import { Habit, DailyMetric, Status } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getHabitAnalysis = async (
  habits: Habit[],
  logs: Record<string, Record<string, Status>>,
  metrics: DailyMetric[]
): Promise<string> => {
  
  if (!process.env.API_KEY) {
    return "API Key missing. Please configure your environment.";
  }

  // Format data for the prompt
  const habitsList = habits.map(h => `- ${h.name} (${h.type === 'break' ? 'To Break' : 'To Build'})`).join('\n');
  
  // Calculate simple stats to feed the AI
  let completed = 0;
  let missed = 0;
  Object.values(logs).forEach(dayLog => {
    Object.values(dayLog).forEach(status => {
      if (status === Status.Done) completed++;
      if (status === Status.Missed) missed++;
    });
  });

  const prompt = `
    You are a strict, stoic, and motivational habit coach. 
    Analyze the user's data below for the month.
    
    HABITS TRACKED:
    ${habitsList}
    
    PERFORMANCE SUMMARY:
    Total Successful Reps: ${completed}
    Total Misses: ${missed}
    
    METRICS TRENDS:
    The user is also tracking Sleep, Mood, and Satisfaction on a scale of 1-10.
    Latest Sleep: ${metrics[metrics.length - 1]?.sleep || 'N/A'}
    Latest Mood: ${metrics[metrics.length - 1]?.mood || 'N/A'}

    TASK:
    1. Give a 2-sentence analysis of their discipline.
    2. Identify one area of weakness based on the "break" habits vs "build" habits.
    3. End with a short, powerful quote about consistency or discipline.
    
    Tone: Professional, direct, slightly dark/stoic (like the visual style of the app).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Keep pushing. Consistency is key.";
  } catch (error) {
    console.error("AI Error", error);
    return "Unable to generate analysis at this moment. Stay focused.";
  }
};