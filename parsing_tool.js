import OpenAI from "openai";

const openai = new OpenAI();

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [{"role": "system", "content": "parse the next prompt a json object with parameters (due date, time for completion, title, and importance on a scale of 1-10)"},
    {"role": "user", "content": "i have an eecs281 project 4 due on dec 5th it will take me 10 hours to complete and its extremely important"}
  ],
    model: "gpt-4-1106-preview",
  });

  console.log(completion.choices[0]);
}

main();