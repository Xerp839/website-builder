import Anthropic from "@anthropic-ai/sdk";

const OpenAI = require('openai');

const openai = new Anthropic({ 
  apiKey: process.env.OPENAI_API_KEY
});

function extractPartialCode(content, language) {
  const regex = new RegExp(`\`\`\`${language}\\s*([\\s\\S]*?)(\`\`\`|$)`, 'i');
  const match = content.match(regex);
  return match ? match[1] : '';
}

async function generateWebsite(description) {
  try {
    const stream = await openai.messages.create({
      model: "claude-3-5-sonnet-20240620",
      system: "You are an expert web developer. Generate HTML and CSS code based on the given description. Respond with HTML code first, followed by CSS code. Use ```html and ```css code blocks to enclose the respective code.",
      messages: [
        { "role": "user", "content": `Create a website with the following description: ${description}. Return the HTML and CSS separately, enclosed in code blocks.` }
      ],
      stream: true,
    });

    return stream;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw new Error('Failed to generate website: ' + error.message);
  }
}

async function modifyWebsite(modificationDescription, currentHtml, currentCss) {
  try {
    const stream = await openai.messages.create({
      model: "claude-3-5-sonnet-20240620",
      messages: [
        { "role": "system", "content": "You are an expert web developer. Modify the given HTML and CSS code based on the provided modification description. Respond with the updated HTML code first, followed by the updated CSS code. Use ```html and ```css code blocks to enclose the respective code." },
        { "role": "user", "content": `
Current HTML:
\`\`\`html
${currentHtml}
\`\`\`

Current CSS:
\`\`\`css
${currentCss}
\`\`\`

Modification description: ${modificationDescription}

Please update the HTML and CSS based on the modification description. Return the complete updated HTML and CSS separately, enclosed in code blocks.
        ` }
      ],
      stream: true,
    });

    return stream;
  } catch (error) {
    console.error('Error calling OpenAI API for modification:', error);
    throw new Error('Failed to modify website: ' + error.message);
  }
}

module.exports = { generateWebsite, modifyWebsite, extractPartialCode };