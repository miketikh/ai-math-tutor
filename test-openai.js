require('dotenv').config({ path: '.env.local' });
const OpenAI = require('openai').default;

console.log('Testing OpenAI API Key...');
console.log('Key exists:', !!process.env.OPENAI_API_KEY);
console.log('Key starts with:', process.env.OPENAI_API_KEY?.substring(0, 20));
console.log('Key length:', process.env.OPENAI_API_KEY?.length);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testOpenAI() {
  try {
    console.log('\nMaking test API call...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'user', content: 'Say "API key works!" if you can read this.' }
      ],
      max_tokens: 20,
    });

    console.log('\n✅ SUCCESS!');
    console.log('Response:', response.choices[0].message.content);
  } catch (error) {
    console.error('\n❌ ERROR:');
    console.error('Status:', error.status);
    console.error('Message:', error.message);
  }
}

testOpenAI();
