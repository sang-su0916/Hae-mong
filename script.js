document.addEventListener('DOMContentLoaded', () => {
    const dreamInput = document.getElementById('dream-input');
    const interpretButton = document.getElementById('interpret-button');
    const errorMessage = document.getElementById('error-message');
    const interpretationSection = document.getElementById('interpretation-section');
    const loaderIcon = interpretButton.querySelector('.loader-icon');
    const buttonText = interpretButton.querySelector('span');

    interpretButton.addEventListener('click', interpretDream);

    async function interpretDream() {
        const dreamText = dreamInput.value.trim();

        if (!dreamText) {
            showError('해석할 꿈 내용을 입력해주세요.');
            return;
        }

        setLoading(true);
        interpretationSection.style.display = 'none';
        interpretationSection.innerHTML = '';

        try {
            const response = await fetch('/.netlify/functions/interpret', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ dreamText }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'API 요청에 실패했습니다.');
            }

            const interpretation = await response.json();
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