// NEXUS — голосовой помощник с анализом голоса и улыбкой
// Работает на GitHub Pages, бесплатно

class NEXUS {
    constructor() {
        this.recognition = null;
        this.synth = window.speechSynthesis;
        this.isListening = false;
        this.currentMood = "neutral";
        
        this.initSpeechRecognition();
        this.bindEvents();
        this.updateStatus("🔴 NEXUS готов");
    }
    
    initSpeechRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.updateStatus("❌ Браузер не поддерживает голосовой ввод");
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'ru-RU';
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;
        
        this.recognition.onstart = () => {
            this.isListening = true;
            document.getElementById('listenBtn').classList.add('listening');
            this.updateStatus("🎤 Слушаю...");
            this.setMouth("🎧");
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            document.getElementById('listenBtn').classList.remove('listening');
            if (this.currentMood !== "smiling") {
                this.setMouth("😐");
            }
        };
        
        this.recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            const confidence = event.results[0][0].confidence;
            this.updateStatus(`✅ Распознано: "${text}"`);
            this.analyzeVoice(text, confidence);
            this.processCommand(text);
        };
        
        this.recognition.onerror = (event) => {
            console.error("Ошибка:", event.error);
            this.updateStatus(`❌ Ошибка: ${event.error}`);
            this.setMouth("😕");
        };
    }
    
    analyzeVoice(text, confidence) {
        const length = text.length;
        let emotion = "нейтральная";
        const wordCount = text.split(' ').length;
        
        if (length < 5) emotion = "короткая фраза (возможно неуверенность)";
        else if (length > 30) emotion = "длинная мысль (спокойствие или нервозность)";
        
        if (text.includes("?")) emotion += " / вопросительная интонация";
        if (text.includes("!")) emotion += " / восклицание";
        
        const analysisHTML = `
            📝 текст: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"<br>
            📏 длина: ${length} символов<br>
            🧠 уверенность: ${Math.round(confidence * 100)}%<br>
            🎭 эмоция: ${emotion}<br>
            ⚡ слов: ${wordCount}
        `;
        
        document.getElementById('analysisResult').innerHTML = analysisHTML;
        
        if (text.match(/улыбк|смех|хихи|smile/i)) {
            this.smile();
        }
    }
    
    processCommand(text) {
        const lowerText = text.toLowerCase();
        let response = "";
        
        if (lowerText.includes("привет") || lowerText.includes("здравствуй")) {
            response = "Привет, я NEXUS. Анализирую голос и улыбаюсь. Скажи 'улыбнись'.";
        } 
        else if (lowerText.includes("как дела") || lowerText.includes("как ты")) {
            response = "У меня всё стабильно. Работаю на GitHub Pages бесплатно. А у тебя?";
        }
        else if (lowerText.includes("анализируй") || lowerText.includes("голос")) {
            response = "Голос проанализирован. Смотри результаты на экране. Попробуй сказать 'улыбнись'.";
        }
        else if (lowerText.includes("улыбнись") || lowerText.includes("улыбку")) {
            response = "Лови улыбку NEXUS.";
            this.smile();
        }
        else if (lowerText.includes("пока") || lowerText.includes("выйти")) {
            response = "Пока! NEXUS улыбается тебе на прощание.";
            this.smile();
            setTimeout(() => this.setMouth("😐"), 2000);
        }
        else if (lowerText.includes("кто ты") || lowerText.includes("твоё имя")) {
            response = "Я NEXUS — голосовой ассистент с улыбкой и анализом голоса. Живу на GitHub Pages.";
        }
        else if (lowerText.includes("спасибо")) {
            response = "Пожалуйста! Обращайся, я всегда здесь.";
            this.smile();
        }
        else {
            response = `Слышу: «${text}». Скажи 'анализируй' или 'улыбнись'.`;
        }
        
        this.speak(response);
    }
    
    smile() {
        this.currentMood = "smiling";
        this.setMouth("😁");
        const face = document.getElementById('nexusFace');
        face.style.boxShadow = "0 0 30px #ffcc00";
        face.style.borderColor = "#ffcc00";
        
        setTimeout(() => {
            if (this.currentMood === "smiling") {
                this.currentMood = "neutral";
                this.setMouth("😐");
                face.style.boxShadow = "0 0 20px #00ccff";
                face.style.borderColor = "#00ccff";
            }
        }, 2000);
    }
    
    setMouth(emoji) {
        const mouthEl = document.getElementById('mouth');
        if (mouthEl) mouthEl.textContent = emoji;
    }
    
    speak(text) {
        document.getElementById('responseText').innerHTML = `💬 ${text}`;
        this.updateStatus("🗣️ NEXUS говорит...");
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ru-RU';
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        
        utterance.onend = () => {
            if (!this.isListening) {
                this.updateStatus("🔴 NEXUS ждёт");
            }
        };
        
        this.synth.cancel();
        this.synth.speak(utterance);
    }
    
    updateStatus(msg) {
        const statusDiv = document.getElementById('status');
        if (statusDiv) statusDiv.innerHTML = msg;
    }
    
    bindEvents() {
        document.getElementById('listenBtn').addEventListener('click', () => {
            if (this.recognition && !this.isListening) {
                try {
                    this.recognition.start();
                } catch(e) {
                    console.log("Ошибка:", e);
                }
            }
        });
        
        document.getElementById('smileBtn').addEventListener('click', () => {
            this.smile();
            this.speak("Вот моя улыбка специально для тебя");
        });
    }
}

window.addEventListener('load', () => {
    window.nexus = new NEXUS();
});
