import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { fieldType, currentText, contextData } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Create context-aware system prompts based on field type
    const getSystemPrompt = (fieldType: string, contextData: any) => {
      const baseContext = `You are an AI assistant helping manufacturers create professional batch registration forms for NeevTrace, a supply chain traceability platform. 

Context:
- Product Name: ${contextData.productName || 'Not specified'}
- Product Code: ${contextData.productCode || 'Not specified'}
- Quantity: ${contextData.quantity || 0} ${contextData.unit || ''}
- Quality Grade: ${contextData.qualityGrade || 'Not specified'}
- Industry: Manufacturing & Supply Chain

CRITICAL INSTRUCTIONS:
- You must respond ONLY with a JSON object in this exact format: {"enhancedText": "your enhanced text here"}
- Do not include any other text, explanations, or formatting outside the JSON
- The enhanced text should be professional, concise, and industry-appropriate
- Keep the enhanced text between 50-200 words maximum
- Focus on technical accuracy and supply chain relevance`;

      switch (fieldType) {
        case 'description':
          return `${baseContext}

Task: Enhance the product description to be professional, detailed, and suitable for supply chain documentation.

STRICT REQUIREMENTS:
- Focus ONLY on the product itself - its physical characteristics, composition, and key features
- Do NOT mention "batch registration", "product codes", or manufacturing processes
- Keep it informative and professional (2-3 sentences maximum)
- Include key product characteristics: materials, packaging, form factor, intended use
- Focus on features relevant to suppliers and logistics providers (size, weight, fragility, etc.)
- Avoid marketing language, focus on technical/functional aspects
- Use industry-standard terminology for packaging and materials
- Be specific about physical properties, dimensions, or packaging if relevant
- Describe the product as it would appear in a supply chain context

Current text: "${currentText}"

Example of good format: "Carbonated energy beverage in 250ml aluminum cans with protective polymer coating. Packaged in 24-unit cardboard display cases with reinforced corners for retail stacking. Shelf-stable formulation requires ambient temperature storage."

Respond with JSON only: {"enhancedText": "your enhanced description"}`;

        case 'handlingNotes':
          return `${baseContext}
${contextData.storageTemp ? `- Storage Temperature: ${contextData.storageTemp}` : ''}

Task: Create or enhance handling notes that ensure product safety and quality during transport and storage.

STRICT REQUIREMENTS:
- Focus on safety and quality preservation
- Include temperature, humidity, or environmental requirements if relevant
${contextData.storageTemp ? `- MUST incorporate the specified storage temperature (${contextData.storageTemp}) into handling instructions` : ''}
- Mention fragility, orientation, or special care instructions
- Keep it concise but comprehensive (2-4 bullet points maximum)
- Use industry-standard terminology
- Be specific about storage conditions and handling precautions

Current text: "${currentText}"

Respond with JSON only: {"enhancedText": "your enhanced handling notes"}`;

        case 'specifications':
          return `${baseContext}

Task: Create detailed technical specifications for material requests that suppliers can understand and quote against.

STRICT REQUIREMENTS:
- Be specific about technical requirements and measurable criteria
- Include dimensions, quality standards, certifications if relevant
- Use industry-standard terminology and specifications
- Structure information clearly with bullet points or numbered lists
- Focus on measurable, quantifiable criteria
- Include compatibility requirements if applicable
- Keep it technical and precise

Current text: "${currentText}"

Respond with JSON only: {"enhancedText": "your enhanced specifications"}`;

        case 'materialDescription':
          return `${baseContext}

Task: Create a clear description for the material request that helps suppliers understand exactly what is needed.

STRICT REQUIREMENTS:
- Be specific about the material type and intended use
- Include relevant quality or performance requirements
- Mention compatibility requirements with the main product
- Keep it professional and technical (2-3 sentences maximum)
- Focus on functional requirements and end-use application
- Include any industry standards or certifications required

Current text: "${currentText}"

Respond with JSON only: {"enhancedText": "your enhanced material description"}`;

        default:
          return `${baseContext}

Task: Enhance the provided text to be more professional and suitable for supply chain documentation.

STRICT REQUIREMENTS:
- Keep it professional and clear
- Improve grammar and structure
- Make it more informative and specific
- Use industry-appropriate language
- Keep it concise (2-3 sentences maximum)

Current text: "${currentText}"

Respond with JSON only: {"enhancedText": "your enhanced text"}`;
      }
    };

    const prompt = getSystemPrompt(fieldType, contextData);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawResponse = response.text().trim();

    // Parse and sanitize JSON response
    let enhancedText: string;
    try {
      // Remove any markdown formatting or extra characters
      const cleanedResponse = rawResponse.replace(/```json\n?|\n?```/g, '').trim();
      
      // Parse JSON
      const jsonResponse = JSON.parse(cleanedResponse);
      
      // Validate JSON structure
      if (!jsonResponse || typeof jsonResponse !== 'object' || !jsonResponse.enhancedText) {
        throw new Error('Invalid JSON structure');
      }
      
      // Sanitize the enhanced text
      enhancedText = jsonResponse.enhancedText
        .toString()
        .trim()
        .replace(/^\"|\"$/g, '') // Remove wrapping quotes
        .replace(/\\n/g, '\n') // Convert escaped newlines
        .replace(/\\/g, '') // Remove unnecessary escapes
        .substring(0, 1000); // Limit length for safety
      
      // Validate that we have meaningful content
      if (!enhancedText || enhancedText.length < 10) {
        throw new Error('Enhanced text too short or empty');
      }
      
    } catch (parseError) {
      console.error('JSON parsing error:', parseError, 'Raw response:', rawResponse);
      
      // Fallback: extract text between quotes if JSON parsing fails
      const quotedText = rawResponse.match(/"enhancedText":\s*"([^"]+)"/);
      if (quotedText && quotedText[1]) {
        enhancedText = quotedText[1].trim();
      } else {
        // Last resort: use the raw response if it looks like clean text
        if (rawResponse.length > 10 && !rawResponse.includes('{') && !rawResponse.includes('}')) {
          enhancedText = rawResponse.substring(0, 500);
        } else {
          throw new Error('Unable to parse AI response');
        }
      }
    }

    return NextResponse.json({ 
      enhancedText,
      success: true 
    });

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return NextResponse.json(
      { error: 'Failed to enhance text. Please try again.' },
      { status: 500 }
    );
  }
}