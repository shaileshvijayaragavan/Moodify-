
import { GoogleGenAI, Type } from '@google/genai';
import type { Language, Playlist, Emotion } from '../types';
import { EMOTIONS } from '../constants';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function base64ToGenerativePart(base64: string, mimeType: string) {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
}

export const detectEmotionFromImage = async (imageDataUrl: string): Promise<Emotion> => {
    const base64String = imageDataUrl.split(',')[1];
    const mimeType = imageDataUrl.split(';')[0].split(':')[1];

    if (!base64String || !mimeType) {
        throw new Error("Invalid image data URL.");
    }
    
    const imagePart = base64ToGenerativePart(base64String, mimeType);
    
    const prompt = `Analyze the facial expression in this image and identify the primary emotion. Choose the most fitting emotion from this list: ${EMOTIONS.join(', ')}. Respond with ONLY the single word for the emotion from the list.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, { text: prompt }] },
    });

    const detectedEmotion = response.text.trim();
    
    if (EMOTIONS.includes(detectedEmotion as Emotion)) {
        return detectedEmotion as Emotion;
    }
    
    throw new Error("Could not determine a valid emotion from the image.");
};


export const generatePlaylists = async (emotion: Emotion, languages: Language[]): Promise<Playlist[]> => {
    const prompt = `Generate a list of 3 diverse song playlists for someone feeling ${emotion}. The songs should be in the following languages: ${languages.join(', ')}. The songs must be real and popular if possible. Each playlist should have a creative name and contain 3 songs.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                description: "A list of playlists.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        playlistName: {
                            type: Type.STRING,
                            description: "Creative name for the playlist."
                        },
                        songs: {
                            type: Type.ARRAY,
                            description: "A list of songs in the playlist.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: {
                                        type: Type.STRING,
                                        description: "The title of the song."
                                    },
                                    artist: {
                                        type: Type.STRING,
                                        description: "The artist of the song."
                                    },
                                    album: {
                                        type: Type.STRING,
                                        description: "The album of the song."
                                    }
                                },
                                required: ["title", "artist", "album"]
                            }
                        }
                    },
                    required: ["playlistName", "songs"]
                }
            }
        }
    });

    try {
        const jsonText = response.text.trim();
        const playlists = JSON.parse(jsonText);
        return playlists as Playlist[];
    } catch (e) {
        console.error("Failed to parse Gemini response:", response.text);
        throw new Error("Received an invalid format from the playlist generator.");
    }
};
