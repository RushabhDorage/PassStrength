 🧠⚡ PassStrength – Cyberpunk Password Strength Analyzer

PassStrength is a cyberpunk-styled, intelligent password analysis tool built using Flask. It goes beyond just checking password length — analyzing entropy, common patterns, dictionary words, and keyboard layouts to compute a comprehensive strength score from 0 to 100.


🔬 Key Features

- 🧮 Entropy Estimation – Shannon entropy calculated per character and adjusted for character space
- ⚔️ Common Password Detection – Blocks known weak inputs like `123456` or `password1`
- 🧠 Pattern Detection – Flags repeated characters, sequential inputs, years, and even keyboard adjacency (e.g., `qwerty`)
- 📚 Dictionary Word Check – Warns if your password contains dictionary-based substrings
- 💡 Score from 0 to 100 – Smart scoring combining length, complexity, randomness, and weaknesses
- 💅 Cyberpunk-Themed UI (optional if frontend is added)

 🛠️ Installation
 🔧 Requirements

- Python 3.7+
- Flask

 📦 Setup

1. Clone the repo:

git clone https://github.com/RushabhDorage/cyberpunk-password-analyzer.git
cd cyberpunk-password-analyzer


2. Install dependencies:

pip install flask


3. Run the app:

python app.py


Then visit:


http://127.0.0.1:5000/


 📡 API Usage

🔗 POST `/analyze`

Send JSON:

`
{
  "password": "Example123!"
}


Receive analysis:


{
  "length": 11,
  "upper": 1,
  "lower": 6,
  "number": 3,
  "symbol": 1,
  "strength": 78,
  "complexity": 5,
  "entropy": 45.8,
  "common": false,
  "patterns": ["contains_year"],
  "dictionary_words": [],
  "reuse_risk": false
}

 🔍 What Makes It Unique?

Unlike basic password checkers that only look for length or use vague "Strong/Weak" labels, **PassStrength**:

* Calculates bitwise entropy
* Analyzes keyboard adjacency
* Recognizes dictionary word injection
* Applies real-world penalties for bad practices


🧠 How It Works

* Entropy: Measures unpredictability
* Character space: Considers if your password uses symbols, digits, etc.
* Penalty System: Deductions for patterns and common strings
* Keyboard graph: Detects passwords like `asdf`, `qwe123`, etc.



 🔐 Security Notes

This app runs locally and performs all analysis client-side (in Flask), so your passwords are not logged, stored, or transmitted externally. For production-grade use, proper security audits and HTTPS deployment are essential.



📜 License

This project is licensed under the MIT License. See (./LICENSE) for details.

 ✨ Future Ideas

* 🔗 Integrate HaveIBeenPwned breach detection
* 🎨 Add neon UI feedback (score meter, glitch effects)
* 📱 Turn into a mobile app or browser extension
* 🧬 Add zxcvbn-style pattern matcher

 💻 Author

Made with 🔐 and ⚡ by [Rushabh Dorage](https://github.com/RushabhDorage)

 ⭐ Like it?

Give it a ⭐ on GitHub to show support!




MIT License

Copyright (c) 2025 [Rushabh Dorage]

