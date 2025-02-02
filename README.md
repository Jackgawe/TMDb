# TMDb Project

A web application using TMDb API built with HTML, CSS, and JavaScript, styled with Tailwind CSS.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure API Key:
   - Copy `js/config.template.js` to `js/config.js`
   - Replace `YOUR_API_KEY_HERE` in `config.js` with your TMDb API key
   - Note: `config.js` is gitignored to keep your API key private

3. Run the development server:
```bash
npm run build
```

## Technologies Used
- HTML5
- Tailwind CSS
- JavaScript
- TMDb API

## Security Note
The `config.js` file containing your API key is excluded from git to maintain security. Never commit your API keys to version control.
