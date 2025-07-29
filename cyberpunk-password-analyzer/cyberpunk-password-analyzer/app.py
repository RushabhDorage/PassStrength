from flask import Flask, render_template, request, jsonify
import math
import re
from collections import Counter

app = Flask(__name__)

# Simulated common passwords database
COMMON_PASSWORDS = {
    'password', '123456', '123456789', 'guest', 'qwerty', 
    '12345678', '111111', '12345', 'col123456', '123123',
    'password1', '1234567', '1234567890', 'admin', 'welcome'
}

# Keyboard adjacency graph
KEYBOARD_GRAPH = {
    'q': ['w', 'a', 's'], 'w': ['q', 'e', 'a', 's', 'd'], 
    'e': ['w', 'r', 's', 'd', 'f'], 'r': ['e', 't', 'd', 'f', 'g'],
    # ... (full keyboard adjacency would go here)
    '1': ['2', 'q'], '2': ['1', '3', 'w', 'q'], 
    # ... (add all keyboard keys and their neighbors)
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    password = request.json.get('password', '')
    
    analysis = {
        'length': len(password),
        'upper': sum(1 for c in password if c.isupper()),
        'lower': sum(1 for c in password if c.islower()),
        'number': sum(1 for c in password if c.isdigit()),
        'symbol': sum(1 for c in password if not c.isalnum()),
        'strength': 0,
        'complexity': 0,
        'entropy': 0,
        'common': False,
        'patterns': [],
        'dictionary_words': [],
        'reuse_risk': False
    }
    
    if password:
        # Character type complexity
        analysis['complexity'] = sum([
            analysis['upper'] > 0,
            analysis['lower'] > 0,
            analysis['number'] > 0,
            analysis['symbol'] > 0,
            len(password) >= 12
        ])
        
        # Entropy calculation
        analysis['entropy'] = calculate_entropy(password)
        
        # Common password check
        analysis['common'] = password.lower() in COMMON_PASSWORDS
        
        # Pattern detection
        analysis['patterns'] = detect_patterns(password)
        
        # Dictionary words detection
        analysis['dictionary_words'] = find_dictionary_words(password)
        
        # Simulated reuse detection (in real app, would check databases)
        analysis['reuse_risk'] = len(password) < 8 or analysis['common']
        
        # Calculate comprehensive strength score (0-100)
        analysis['strength'] = calculate_comprehensive_strength(analysis)
    
    return jsonify(analysis)

def calculate_entropy(password):
    """Calculate password entropy in bits"""
    if not password:
        return 0
    
    # Count character frequency
    freq = Counter(password)
    length = len(password)
    
    # Calculate entropy
    entropy = 0
    for count in freq.values():
        p = count / length
        entropy -= p * math.log2(p)
    
    # Adjust for character space
    char_space = 0
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_symbol = any(not c.isalnum() for c in password)
    
    if has_upper: char_space += 26
    if has_lower: char_space += 26
    if has_digit: char_space += 10
    if has_symbol: char_space += 32  # Common symbols
    
    # Theoretical maximum entropy for this character space
    max_entropy = math.log2(char_space ** len(password))
    
    # Combine actual and theoretical entropy
    return min(entropy * len(password), max_entropy)

def detect_patterns(password):
    """Detect common patterns in passwords"""
    patterns = []
    lower_pwd = password.lower()
    
    # Check for sequences
    if is_sequence(lower_pwd):
        patterns.append("sequential_chars")
    
    # Check for repeated characters
    if len(set(lower_pwd)) < len(lower_pwd) / 2:
        patterns.append("repeated_chars")
    
    # Check keyboard patterns
    if is_keyboard_pattern(lower_pwd):
        patterns.append("keyboard_pattern")
    
    # Check for years
    if re.search(r'(19|20)\d{2}', password):
        patterns.append("contains_year")
    
    return patterns

def is_sequence(s):
    """Check if string is a sequence (like 12345 or abcde)"""
    # Check numerical sequences
    if s.isdigit():
        return (s in '1234567890' or s in '9876543210')
    
    # Check alphabetical sequences
    if s.isalpha():
        return (s in 'abcdefghijklmnopqrstuvwxyz' or 
                s in 'zyxwvutsrqponmlkjihgfedcba')
    
    return False

def is_keyboard_pattern(s):
    """Check for keyboard adjacent patterns"""
    if len(s) < 3:
        return False
    
    # Check for adjacent keys
    for i in range(len(s) - 2):
        a, b, c = s[i], s[i+1], s[i+2]
        if (b in KEYBOARD_GRAPH.get(a, []) and 
            c in KEYBOARD_GRAPH.get(b, [])):
            return True
    
    return False

def find_dictionary_words(password):
    """Find dictionary words in password (simplified)"""
    # In a real app, this would use a proper dictionary
    words = []
    lower_pwd = password.lower()
    
    # Check for common words
    common_words = {'admin', 'password', 'welcome', 'login', 'secret'}
    for word in common_words:
        if word in lower_pwd:
            words.append(word)
    
    # Check for long enough substrings that might be words
    for i in range(len(password) - 3):
        substr = password[i:i+4]
        if substr.isalpha() and substr.lower() in common_words:
            words.append(substr)
    
    return words

def calculate_comprehensive_strength(analysis):
    """Calculate overall password strength (0-100)"""
    score = 0
    
    # Length score (max 30)
    score += min(30, analysis['length'] * 2)
    
    # Character variety (max 20)
    score += analysis['complexity'] * 4
    
    # Entropy contribution (max 30)
    score += min(30, analysis['entropy'] / 2)
    
    # Penalties
    if analysis['common']:
        score = max(0, score - 30)
    
    if analysis['patterns']:
        score = max(0, score - len(analysis['patterns']) * 10)
    
    if analysis['dictionary_words']:
        score = max(0, score - len(analysis['dictionary_words']) * 5)
    
    if analysis['reuse_risk']:
        score = max(0, score - 10)
    
    # Normalize to 0-100
    return min(100, max(0, score))

if __name__ == '__main__':
    app.run(debug=True)