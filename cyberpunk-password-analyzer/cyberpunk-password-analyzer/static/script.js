document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const passwordInput = document.getElementById('passwordInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const toggleVisibility = document.getElementById('toggleVisibility');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.getElementById('strengthText');
    const crackTime = document.getElementById('crackTime');
    const recommendation = document.getElementById('recommendation');
    
    // Basic Stats Elements
    const stats = {
        length: document.getElementById('lengthStat'),
        upper: document.getElementById('upperStat'),
        lower: document.getElementById('lowerStat'),
        number: document.getElementById('numberStat'),
        symbol: document.getElementById('symbolStat'),
        complexity: document.getElementById('complexityStat')
    };
    
    // Advanced Stats Elements
    const advancedStats = {
        entropy: document.getElementById('entropyStat'),
        common: document.getElementById('commonStat'),
        patterns: document.getElementById('patternsStat'),
        dictionary: document.getElementById('dictionaryStat'),
        reuse: document.getElementById('reuseStat'),
        entropyScore: document.getElementById('entropyScoreStat')
    };
    
    // Stat Containers for styling
    const statItems = {
        entropy: document.getElementById('entropyItem'),
        common: document.getElementById('commonItem'),
        patterns: document.getElementById('patternsItem'),
        dictionary: document.getElementById('dictionaryItem'),
        reuse: document.getElementById('reuseItem'),
        entropyScore: document.getElementById('entropyScoreItem')
    };
    
    let isVisible = false;
    
    // Toggle password visibility
    toggleVisibility.addEventListener('click', function() {
        isVisible = !isVisible;
        passwordInput.type = isVisible ? 'text' : 'password';
        toggleVisibility.textContent = isVisible ? 'HIDE' : 'SHOW';
    });
    
    // Analyze password on input or button click
    analyzeBtn.addEventListener('click', analyzePassword);
    passwordInput.addEventListener('input', analyzePassword);
    
    function analyzePassword() {
        const password = passwordInput.value;
        
        // Client-side basic analysis for immediate feedback
        const basicAnalysis = calculatePasswordStrength(password);
        updateBasicUI(basicAnalysis);
        
        // Send to server for advanced analysis
        fetch('/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password: password })
        })
        .then(response => response.json())
        .then(data => {
            updateAdvancedUI(data);
            // Combine basic and advanced analysis for final strength
            const combinedAnalysis = {
                ...basicAnalysis,
                ...data,
                strength: data.strength  // Use server-calculated strength
            };
            updateStrengthMeter(combinedAnalysis);
            updateCrackTime(combinedAnalysis.entropy);
        })
        .catch(error => {
            console.error('Error:', error);
            recommendation.textContent = "// SYSTEM ERROR: ANALYSIS MODULE OFFLINE";
        });
    }
    
    function calculatePasswordStrength(password) {
        const analysis = {
            length: password.length,
            upper: 0,
            lower: 0,
            number: 0,
            symbol: 0,
            strength: 0,
            complexity: 0
        };
        
        if (password.length === 0) {
            return analysis;
        }
        
        // Count character types
        for (const char of password) {
            if (/[A-Z]/.test(char)) analysis.upper++;
            else if (/[a-z]/.test(char)) analysis.lower++;
            else if (/[0-9]/.test(char)) analysis.number++;
            else analysis.symbol++;
        }
        
        // Calculate complexity (number of character types present, max 5)
        analysis.complexity = [
            analysis.upper > 0,
            analysis.lower > 0,
            analysis.number > 0,
            analysis.symbol > 0,
            password.length >= 12
        ].filter(Boolean).length;
        
        // Calculate basic strength (0-100)
        const lengthScore = Math.min(40, password.length * 3);
        const upperScore = analysis.upper > 0 ? 10 : 0;
        const lowerScore = analysis.lower > 0 ? 10 : 0;
        const numberScore = analysis.number > 0 ? 10 : 0;
        const symbolScore = analysis.symbol > 0 ? 10 : 0;
        const complexityScore = analysis.complexity * 5;
        
        analysis.strength = Math.min(100, 
            lengthScore + 
            upperScore + 
            lowerScore + 
            numberScore + 
            symbolScore + 
            complexityScore
        );
        
        return analysis;
    }
    
    function updateBasicUI(analysis) {
        // Update basic stats
        stats.length.textContent = analysis.length;
        stats.upper.textContent = analysis.upper;
        stats.lower.textContent = analysis.lower;
        stats.number.textContent = analysis.number;
        stats.symbol.textContent = analysis.symbol;
        stats.complexity.textContent = analysis.complexity;
        
        // Update stat bars
        document.documentElement.style.setProperty('--length-width', `${Math.min(100, analysis.length * 5)}%`);
        document.documentElement.style.setProperty('--upper-width', `${analysis.upper * 25}%`);
        document.documentElement.style.setProperty('--lower-width', `${analysis.lower * 25}%`);
        document.documentElement.style.setProperty('--number-width', `${analysis.number * 25}%`);
        document.documentElement.style.setProperty('--symbol-width', `${analysis.symbol * 25}%`);
        document.documentElement.style.setProperty('--complexity-width', `${analysis.complexity * 20}%`);
    }
    
    function updateAdvancedUI(analysis) {
        // Update advanced stats
        advancedStats.entropy.textContent = analysis.entropy.toFixed(1);
        advancedStats.common.textContent = analysis.common ? 'YES' : 'NO';
        advancedStats.patterns.textContent = analysis.patterns.length > 0 ? 
            analysis.patterns.join(', ') : 'None';
        advancedStats.dictionary.textContent = analysis.dictionary_words.length > 0 ? 
            analysis.dictionary_words.join(', ') : 'None';
        advancedStats.reuse.textContent = analysis.reuse_risk ? 'HIGH' : 'LOW';
        advancedStats.entropyScore.textContent = `${Math.min(100, Math.floor(analysis.entropy))}%`;
        
        // Update stat bars
        document.documentElement.style.setProperty('--entropy-width', `${Math.min(100, analysis.entropy)}%`);
        document.documentElement.style.setProperty('--entropy-score-width', `${Math.min(100, analysis.entropy)}%`);
        
        // Style warnings
        if (analysis.common) {
            statItems.common.classList.add('critical');
            advancedStats.common.style.color = 'var(--terminal-red)';
        } else {
            statItems.common.classList.remove('critical');
            advancedStats.common.style.color = 'var(--terminal-green)';
        }
        
        if (analysis.patterns.length > 0) {
            statItems.patterns.classList.add('warning');
            advancedStats.patterns.style.color = 'var(--terminal-yellow)';
        } else {
            statItems.patterns.classList.remove('warning');
            advancedStats.patterns.style.color = 'white';
        }
        
        if (analysis.dictionary_words.length > 0) {
            statItems.dictionary.classList.add('warning');
            advancedStats.dictionary.style.color = 'var(--terminal-yellow)';
        } else {
            statItems.dictionary.classList.remove('warning');
            advancedStats.dictionary.style.color = 'white';
        }
        
        if (analysis.reuse_risk) {
            statItems.reuse.classList.add('critical');
            advancedStats.reuse.style.color = 'var(--terminal-red)';
        } else {
            statItems.reuse.classList.remove('critical');
            advancedStats.reuse.style.color = 'var(--terminal-green)';
        }
        
        // Update recommendation
        recommendation.textContent = getRecommendation(analysis);
    }
    
    function updateStrengthMeter(analysis) {
        // Update strength meter
        const strengthPercentage = analysis.strength;
        document.documentElement.style.setProperty('--strength-width', `${strengthPercentage}%`);
        strengthText.textContent = `PASSWORD STRENGTH: ${strengthPercentage}%`;
        
        // Update color based on strength
        let strengthColor;
        if (strengthPercentage < 30) {
            strengthColor = 'var(--terminal-red)';
        } else if (strengthPercentage < 70) {
            strengthColor = 'var(--terminal-yellow)';
        } else {
            strengthColor = 'var(--terminal-green)';
        }
        strengthText.style.color = strengthColor;
    }
    
    function updateCrackTime(entropy) {
        // Estimate crack time based on entropy
        let time;
        let color;
        
        if (entropy <= 28) {
            time = "INSTANT";
            color = "var(--terminal-red)";
        } else if (entropy <= 35) {
            time = "SECONDS";
            color = "var(--terminal-red)";
        } else if (entropy <= 45) {
            time = "MINUTES";
            color = "var(--terminal-yellow)";
        } else if (entropy <= 55) {
            time = "HOURS";
            color = "var(--terminal-yellow)";
        } else if (entropy <= 65) {
            time = "DAYS";
            color = "var(--terminal-green)";
        } else if (entropy <= 75) {
            time = "YEARS";
            color = "var(--terminal-green)";
        } else {
            time = "CENTURIES";
            color = "var(--terminal-green)";
        }
        
        crackTime.textContent = `CRACK TIME: ${time}`;
        crackTime.style.color = color;
    }
    
    function getRecommendation(analysis) {
        if (analysis.length === 0) {
            return "// PASSWORD ANALYSIS READY. ENTER PASSWORD TO BEGIN.";
        }
        
        const recommendations = [];
        
        // Length recommendations
        if (analysis.length < 8) {
            recommendations.push("INCREASE LENGTH TO AT LEAST 8 CHARACTERS");
        } else if (analysis.length < 12) {
            recommendations.push("CONSIDER USING 12+ CHARACTERS FOR BETTER SECURITY");
        }
        
        // Character type recommendations
        if (analysis.upper === 0) {
            recommendations.push("ADD UPPERCASE LETTERS FOR COMPLEXITY");
        }
        
        if (analysis.lower === 0) {
            recommendations.push("ADD LOWERCASE LETTERS FOR COMPLEXITY");
        }
        
        if (analysis.number === 0) {
            recommendations.push("INCLUDE NUMBERS TO IMPROVE STRENGTH");
        }
        
        if (analysis.symbol === 0) {
            recommendations.push("ADD SYMBOLS FOR MAXIMUM SECURITY");
        }
        
        // Advanced recommendations
        if (analysis.common) {
            recommendations.push("AVOID COMMON PASSWORDS - TOO EASY TO GUESS");
        }
        
        if (analysis.patterns.length > 0) {
            recommendations.push("AVOID PATTERNS LIKE SEQUENCES OR KEYBOARD WALKS");
        }
        
        if (analysis.dictionary_words.length > 0) {
            recommendations.push("AVOID USING DICTIONARY WORDS WITHOUT MODIFICATION");
        }
        
        if (analysis.reuse_risk) {
            recommendations.push("AVOID REUSING PASSWORDS ACROSS DIFFERENT SITES");
        }
        
        if (analysis.entropy < 40) {
            recommendations.push("INCREASE RANDOMNESS FOR BETTER ENTROPY");
        }
        
        if (recommendations.length === 0) {
            return "// PASSWORD STRENGTH: EXCELLENT. THIS PASSWORD MEETS ALL SECURITY CRITERIA.";
        }
        
        return "// SECURITY RECOMMENDATIONS: " + recommendations.join(" | ");
    }
    
    // Initial analysis with empty password
    analyzePassword();
});