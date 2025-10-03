
import { GoogleGenAI, Type } from "@google/genai";
import { Level, ExerciseData, ExamQuestion, Skill } from '../types';

if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const exerciseSchema = {
    type: Type.OBJECT,
    properties: {
        sentence: {
            type: Type.STRING,
            description: "La frase, text, o situació de l'exercici. Pot contenir un '[BLANK]' per a exercicis d'omplir buits, o pot ser una pregunta o un text per a altres tipus d'exercicis."
        },
        options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Un array de quatre possibles respostes en format de text."
        },
        correctAnswer: {
            type: Type.STRING,
            description: "El text exacte de l'opció correcta entre les quatre proporcionades."
        },
        explanation: {
            type: Type.STRING,
            description: "Una explicació clara i concisa de per què la resposta correcta és correcta, enfocada en la regla gramatical, lèxica o pragmàtica que s'està avaluant."
        }
    },
    required: ['sentence', 'options', 'correctAnswer', 'explanation']
};


export const generateExercise = async (level: Level, skill: Skill, historySentences: string[] = []): Promise<ExerciseData> => {
    let skillInstruction = "";

    switch (skill) {
        case 'Comprensió':
            skillInstruction = "Presenta un text curt (2-4 frases) i després una pregunta d'opció múltiple sobre la informació o la inferència del text. La pregunta ha de ser clara i les opcions han de ser plausibles. El camp 'sentence' del JSON ha d'incloure tant el text com la pregunta.";
            break;
        case 'Estructures Lingüístiques':
            skillInstruction = "Genera un exercici d'omplir buits. Proporciona una única frase amb un espai en blanc marcat com a '[BLANK]'. Ofereix quatre opcions de resposta possibles, de les quals només una ha de ser correcta, i una explicació detallada de per què la resposta és correcta.";
            break;
        case 'Expressió Escrita':
            skillInstruction = "Genera una pregunta d'opció múltiple sobre un aspecte pràctic de l'expressió escrita en valencià. Per exemple, sobre l'inici d'una carta formal, l'ús d'un connector adequat, o la frase més adient per a un context específic. El camp 'sentence' ha de contenir la situació o la pregunta.";
            break;
        case 'Expressió Oral':
            skillInstruction = "Genera una pregunta d'opció múltiple sobre un aspecte pràctic de l'expressió oral en valencià. Pot ser sobre una fórmula de cortesia, com respondre a una pregunta en una entrevista, o l'expressió més adient per a una situació comunicativa concreta. El camp 'sentence' ha de contenir la situació o la pregunta.";
            break;
        default:
            skillInstruction = "Genera un exercici d'omplir buits. Proporciona una única frase amb un espai en blanc marcat com a '[BLANK]'. Ofereix quatre opcions de resposta possibles, de les quals només una ha de ser correcta, i una explicació detallada de per què la resposta és correcta.";
    }

    let historyInstruction = "";
    if (historySentences && historySentences.length > 0) {
        const sentenceList = historySentences.map(s => `- "${s}"`).join('\n');
        historyInstruction = ` IMPORTANT: L'usuari ja ha vist els següents exercicis recentment. Per a garantir la varietat, genera un exercici completament nou que no siga una repetició o una variació propera d'aquests:\n${sentenceList}`;
    }
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Ets un expert en la llengua valenciana i un examinador oficial de la JQCV. Genera un exercici d'opció múltiple de nivell ${level} de valencià, enfocat en l'àrea de '${skill}'. ${skillInstruction} L'exercici ha de ser útil per a preparar un examen oficial. La frase ha de ser natural i representativa de l'ús del valencià a aquest nivell per a l'àrea especificada. Retorna el resultat exclusivament en format JSON seguint l'esquema proporcionat.${historyInstruction}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: exerciseSchema
            }
        });

        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        return data as ExerciseData;
    } catch (error) {
        console.error("Error generating exercise:", error);
        throw new Error("No s'ha pogut generar l'exercici. Intenta-ho de nou.");
    }
};

export const generateExam = async (level: Level, numQuestions: number): Promise<ExamQuestion[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Ets un expert en la llengua valenciana i un examinador oficial de la JQCV. Genera un mini-simulacre d'examen de nivell ${level} de valencià amb ${numQuestions} preguntes d'opció múltiple. Cada pregunta ha de ser del tipus 'omplir el buit' i ha de tenir una frase amb un espai marcat com '[BLANK]', quatre opcions de resposta, la indicació de la resposta correcta i una explicació detallada de la resposta correcta. Les preguntes han de cobrir diferents aspectes de la gramàtica i el vocabulari corresponents al nivell ${level}. Retorna el resultat com un array d'objectes JSON, seguint l'esquema proporcionat per a cada objecte.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: exerciseSchema
                }
            }
        });
        
        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        return data as ExamQuestion[];
    } catch (error) {
        console.error("Error generating exam:", error);
        throw new Error("No s'ha pogut generar el simulacre d'examen. Intenta-ho de nou.");
    }
};

export const generateNivelTest = async (): Promise<ExamQuestion[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Ets un expert en la llengua valenciana. Genera un test de nivell de 10 preguntes per a determinar si un usuari té un nivell B1, B2, C1 o C2 de valencià. Les preguntes han de ser d'opció múltiple del tipus 'omplir el buit'. La dificultat ha de ser progressiva: 2 preguntes de nivell B1, 3 de B2, 3 de C1 i 2 de C2. Cada pregunta ha de tindre una frase amb un espai marcat com '[BLANK]', quatre opcions, la resposta correcta i una explicació. Retorna el resultat com un array de 10 objectes JSON, seguint l'esquema proporcionat.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: exerciseSchema
                }
            }
        });
        
        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        return data as ExamQuestion[];
    } catch (error) {
        console.error("Error generating nivel test:", error);
        throw new Error("No s'ha pogut generar el test de nivell. Intenta-ho de nou.");
    }
};
