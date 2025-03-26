// 从环境变量中获取API配置
const config = require('../config');
const API_KEY = config.apiKey;
const API_URL = config.apiUrl;

// DOM元素
const englishNameInput = document.getElementById('englishName');
const generateBtn = document.getElementById('generateBtn');
const loadingDiv = document.getElementById('loading');
const resultsDiv = document.getElementById('results');

// 生成中文名字的系统提示词
const SYSTEM_PROMPT = `你是一个专业的克苏鲁风格中文取名专家。请根据用户提供的英文名、年代和性别，生成3个充满克苏鲁神话元素的中文名。
要求：
1. 理解英文名的含义和特点
2. 每个中文名都要融入克苏鲁神话元素（如深渊、远古、混沌等）
3. 名字要符合用户的年代特征和性别特点
4. 为每个名字提供详细的中英文解释，包括克苏鲁元素和文化内涵

请按以下JSON格式返回结果：
{
  "names": [
    {
      "chinese": "中文名",
      "explanation_cn": "中文解释",
      "explanation_en": "英文解释"
    }
  ]
}`;

// 生成名字的主函数
async function generateNames() {
    const englishName = englishNameInput.value.trim();
    const generation = document.getElementById('generation').value;
    const gender = document.getElementById('gender').value;

    if (!englishName) {
        alert('请输入你的英文名');
        return;
    }

    // UI状态更新
    generateBtn.disabled = true;
    loadingDiv.style.display = 'block';
    resultsDiv.innerHTML = '';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: config.model,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: `My English name is ${englishName}. I was born in 19${generation}s and my gender is ${gender}. Please help me generate Cthulhu-style Chinese names.` }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        // 解析API返回的JSON结果
        try {
            const result = JSON.parse(content);
            displayResults(result.names);
        } catch (e) {
            console.error('Failed to parse API response:', e);
            alert('抱歉，生成名字时出现错误，请重试。');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('抱歉，连接服务器时出现错误，请重试。');
    } finally {
        // 恢复UI状态
        generateBtn.disabled = false;
        loadingDiv.style.display = 'none';
    }
}

// 显示结果的函数
function displayResults(names) {
    resultsDiv.innerHTML = names.map(name => `
        <div class="name-card">
            <div class="chinese-name">${name.chinese}</div>
            <div class="meaning">
                <p><strong>中文解释：</strong>${name.explanation_cn}</p>
                <p><strong>English Meaning：</strong>${name.explanation_en}</p>
            </div>
        </div>
    `).join('');
}

// 事件监听器
generateBtn.addEventListener('click', generateNames);
englishNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        generateNames();
    }
});