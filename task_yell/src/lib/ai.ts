import OpenAI from 'openai';
import { WantTodo } from './types';
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const TasksScheme = z.object({
  tasks: z.array(z.object({
    content: z.string()
  }))
});

const prompt = `
ユーザーがやりたいことを送信するのでそれを実現するためにタスクに分割してください。
出力は元の言語である日本語で出力してください。
`;

export async function splitWantToDo(wantTodo: WantTodo): Promise<WantTodo[] | null> {
  try {
    const result = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: prompt },
        {
          role: 'user', content: `
          {
            "content": "${wantTodo.title}"
            }
            `
        }
      ],
      response_format: zodResponseFormat(TasksScheme, 'tasks')
    });

    console.log(result.choices[0].message.content);
    const content = result.choices[0].message.content;
    if (content) {
      return JSON.parse(content).tasks.map((item: { content: string }) => ({ title: item.content }));
    }
  } catch (e: unknown) {
    console.error(e);
  }
  return null;
}