// netlify/functions/interpret.js

exports.handler = async function (event) {
    // POST 요청이 아니면 에러 처리
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    const { dreamText } = JSON.parse(event.body);
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'API key is not configured on the server.' }),
        };
    }

    if (!dreamText) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Dream text is required.' }),
        };
    }

    const prompt = `
        당신은 심리학, 상징주의, 정서적 웰빙에 전문성을 가진 자비로운 꿈 해석가입니다. 
        다음 꿈을 분석하고 사려 깊은 해석을 제공해주세요.

        꿈: "${dreamText}"

        응답은 반드시 다음 구조의 JSON 객체로만 제공해주세요. 다른 설명은 절대 추가하지 마세요.
        {
          "mainThemes": ["테��1", "테마2", "테마3"],
          "emotionalTone": "감정적 분위기에 대한 상세한 설명",
          "symbols": [
            {"symbol": "상징1", "meaning": "상징1의 의미"},
            {"symbol": "상징2", "meaning": "상징2의 의미"}
          ],
          "personalInsight": "이 꿈이 꿈꾸는 이에게 어떤 의미일 수 있는지에 대한 깊은 개인적 통찰",
          "guidance": "성찰이나 행동을 위한 부드러운 조언"
        }
    `;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    response_mime_type: "application/json",
                }
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Gemini API Error:', errorData);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: errorData.error?.message || 'Failed to get a response from Gemini API.' }),
            };
        }

        const data = await response.json();
        const interpretationText = data.candidates[0].content.parts[0].text;
        
        return {
            statusCode: 200,
            body: interpretationText,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            }
        };

    } catch (error) {
        console.error('Serverless function error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `An internal error occurred: ${error.message}` }),
        };
    }
};
