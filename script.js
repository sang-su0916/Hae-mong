document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('api-key-input');
    const dreamInput = document.getElementById('dream-input');
    const interpretButton = document.getElementById('interpret-button');
    const errorMessage = document.getElementById('error-message');
    const interpretationSection = document.getElementById('interpretation-section');
    const loaderIcon = interpretButton.querySelector('.loader-icon');
    const buttonText = interpretButton.querySelector('span');

    // Load API key from local storage if available
    const savedApiKey = localStorage.getItem('geminiApiKey');
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
    }

    interpretButton.addEventListener('click', interpretDream);

    async function interpretDream() {
        const apiKey = apiKeyInput.value.trim();
        const dreamText = dreamInput.value.trim();

        if (!apiKey) {
            showError('Gemini API 키를 입력해주세요.');
            return;
        }
        if (!dreamText) {
            showError('해석할 꿈 내용을 입력해주세요.');
            return;
        }

        // Save API key to local storage
        localStorage.setItem('geminiApiKey', apiKey);

        setLoading(true);
        interpretationSection.style.display = 'none';
        interpretationSection.innerHTML = '';

        try {
            const prompt = `
                당신은 심리학, 상징주의, 정서적 웰빙에 전문성을 가진 자비로운 꿈 해석가입니다. 
                다음 꿈을 분석하고 사려 깊은 해석을 제공해주세요.

                꿈: "${dreamText}"

                응답은 반드시 다음 구조의 JSON 객체로만 제공해주세요. 다른 설명은 절대 추가하지 마세요.
                {
                  "mainThemes": ["테마1", "테마2", "테마3"],
                  "emotionalTone": "감정적 분위기에 대한 상세한 설명",
                  "symbols": [
                    {"symbol": "상징1", "meaning": "상징1의 의미"},
                    {"symbol": "상징2", "meaning": "상징2의 의미"}
                  ],
                  "personalInsight": "이 꿈이 꿈꾸는 이에게 어떤 의미일 수 있는지에 대한 깊은 개인적 통찰",
                  "guidance": "성찰이나 행동을 위한 부드러운 조언"
                }
            `;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
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
                throw new Error(errorData.error?.message || 'API 요청에 실패했습니다.');
            }

            const data = await response.json();
            const interpretationText = data.candidates[0].content.parts[0].text;
            const interpretation = JSON.parse(interpretationText);
            
            displayInterpretation(interpretation);

        } catch (error) {
            console.error('Error interpreting dream:', error);
            showError(`해석 중 오류가 발생했습니다: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }

    function displayInterpretation(interpretation) {
        interpretationSection.style.display = 'flex';
        
        const { mainThemes, emotionalTone, symbols, personalInsight, guidance } = interpretation;

        // Main Themes
        if (mainThemes && mainThemes.length > 0) {
            const themesHtml = mainThemes.map(theme => `<span class="tag">${theme}</span>`).join('');
            interpretationSection.innerHTML += `
                <div class="card">
                    <h2 class="card-title">주요 테마</h2>
                    <div class="tag-container">${themesHtml}</div>
                </div>`;
        }

        // Emotional Atmosphere
        if (emotionalTone) {
            interpretationSection.innerHTML += `
                <div class="card">
                    <h2 class="card-title">감정적 분위기</h2>
                    <p class="card-content">${emotionalTone}</p>
                </div>`;
        }

        // Dream Symbols
        if (symbols && symbols.length > 0) {
            const symbolsHtml = symbols.map(s => `
                <div class="symbol-item">
                    <div class="symbol-icon"><span>${s.symbol}</span></div>
                    <p class="card-content">${s.meaning}</p>
                </div>`).join('');
            interpretationSection.innerHTML += `
                <div class="card">
                    <h2 class="card-title">꿈의 상징</h2>
                    <div class="symbol-list">${symbolsHtml}</div>
                </div>`;
        }

        // Personal Insight
        if (personalInsight) {
            interpretationSection.innerHTML += `
                <div class="card">
                    <h2 class="card-title">개인적 통찰</h2>
                    <p class="card-content text-lg">${personalInsight}</p>
                </div>`;
        }

        // Guidance
        if (guidance) {
            interpretationSection.innerHTML += `
                <div class="card guidance-card">
                    <h2 class="card-title">성찰을 위한 조언</h2>
                    <p class="card-content">${guidance}</p>
                </div>`;
        }
    }

    function setLoading(isLoading) {
        if (isLoading) {
            interpretButton.disabled = true;
            loaderIcon.style.display = 'block';
            buttonText.textContent = '해석 중...';
            errorMessage.style.display = 'none';
        } else {
            interpretButton.disabled = false;
            loaderIcon.style.display = 'none';
            buttonText.textContent = '꿈 해석하기';
        }
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
});
