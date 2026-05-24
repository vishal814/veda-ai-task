import OpenAI from 'openai';

let openai: OpenAI | null = null;

const getOpenAIClient = () => {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not defined in environment variables.');
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
};

export interface GeneratedPaperOutput {
  schoolName: string;
  subject: string;
  gradeClass: string;
  timeAllowedMinutes: number;
  sections: Array<{
    title: string;
    instruction: string;
    questions: Array<{
      text: string;
      difficulty: 'Easy' | 'Moderate' | 'Challenging';
      marks: number;
    }>;
  }>;
  answers: Array<{
    questionNumber: number;
    text: string;
  }>;
}

export const generateQuestionPaper = async (
  schoolName: string,
  subject: string,
  gradeClass: string,
  questionTypes: Array<{ type: string; count: number; marks: number }>,
  totalQuestions: number,
  totalMarks: number,
  additionalInstructions?: string,
  contextText?: string,
  base64Image?: string,
  imageMimeType?: string
): Promise<GeneratedPaperOutput> => {
  const client = getOpenAIClient();

  const typesSummary = questionTypes
    .map((q) => `- ${q.count} "${q.type}" style question(s) carrying ${q.marks} mark(s) each`)
    .join('\n');

  let prompt = `Generate a formal academic question paper and a corresponding detailed answer key.
School Name: ${schoolName}
Subject: ${subject}
Grade/Class: ${gradeClass}
Total Questions Required: ${totalQuestions}
Total Marks Required: ${totalMarks}

Question Types and Distribution requested:
${typesSummary}
`;

  if (additionalInstructions) {
    prompt += `\nAdditional Instructions:\n${additionalInstructions}`;
  }

  if (contextText) {
    prompt += `\n\nReference Material / Context for generating questions:\n\"\"\"\n${contextText}\n\"\"\"`;
  }

  prompt += `\n\nGuidelines:
1. Organize the questions logically into sections (e.g. Section A, Section B).
2. Assign difficulty levels ('Easy', 'Moderate', 'Challenging') to each question.
3. Make sure the total number of questions matches exactly ${totalQuestions}.
4. Make sure the sum of all marks matches exactly ${totalMarks}.
5. Provide a detailed answer key mapping to all generated questions in order.
6. Return the response strictly adhering to the JSON schema.`;

  const userContent: OpenAI.Chat.ChatCompletionContentPart[] = [
    {
      type: 'text',
      text: prompt
    }
  ];

  if (base64Image && imageMimeType) {
    userContent.push({
      type: 'image_url',
      image_url: {
        url: `data:${imageMimeType};base64,${base64Image}`
      }
    });
  }

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are an expert curriculum developer and academic examiner. You generate high-quality, professional exam papers and answer keys. You MUST output exactly in the structured JSON schema format provided.`,
      },
      {
        role: 'user',
        content: userContent
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'question_paper_schema',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            schoolName: { type: 'string' },
            subject: { type: 'string' },
            gradeClass: { type: 'string' },
            timeAllowedMinutes: { type: 'number' },
            sections: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  instruction: { type: 'string' },
                  questions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        text: { type: 'string' },
                        difficulty: {
                          type: 'string',
                          enum: ['Easy', 'Moderate', 'Challenging']
                        },
                        marks: { type: 'number' }
                      },
                      required: ['text', 'difficulty', 'marks'],
                      additionalProperties: false
                    }
                  }
                },
                required: ['title', 'instruction', 'questions'],
                additionalProperties: false
              }
            },
            answers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  questionNumber: { type: 'number' },
                  text: { type: 'string' }
                },
                required: ['questionNumber', 'text'],
                additionalProperties: false
              }
            }
          },
          required: [
            'schoolName',
            'subject',
            'gradeClass',
            'timeAllowedMinutes',
            'sections',
            'answers'
          ],
          additionalProperties: false
        }
      }
    }
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error('OpenAI returned empty content');
  }

  return JSON.parse(content) as GeneratedPaperOutput;
};
