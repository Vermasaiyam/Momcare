from flask import Flask, render_template, request, jsonify
import os
import pytesseract
from PIL import Image
from flask_cors import CORS
from dotenv import load_dotenv
import requests
import json

app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()

# API keys
groq_api_key = os.getenv('GROQ_API_KEY')
openai_api_key = os.getenv('OPENAI_API_KEY')  # Optional fallback

UPLOADS_DIR = "uploads"
if not os.path.exists(UPLOADS_DIR):
    os.makedirs(UPLOADS_DIR)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/transcribe', methods=['POST'])
def transcribe():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        file_path = os.path.join(UPLOADS_DIR, file.filename)
        file.save(file_path)

        # Extract text using OCR
        text = pytesseract.image_to_string(Image.open(file_path))
        
        return jsonify({'transcription': text.strip()})
    except Exception as e:
        print("Error occurred:", e)
        return jsonify({'error': str(e)}), 500

@app.route('/modify', methods=['POST'])
def modify_text():
    try:
        data = request.json
        transcription = data.get("transcription")

        if not transcription:
            return jsonify({'error': 'No transcription provided'}), 400

        prompt = (
            "Analyze this medical report and provide structured details strictly in JSON format:\n"
            "```json\n"
            "{\n"
            "  \"summary\": \"<User-friendly summary of the condition>\",\n"
            "  \"condition\": \"<Serious/Mild/Normal>\",\n"
            "  \"dos\": [\"<Do's for the patient>\", \"...\"],\n"
            "  \"donts\": [\"<Don'ts for the patient>\", \"...\"]\n"
            "}\n"
            "```\n"
            f"\nMedical Report:\n{transcription}\n"
            "Ensure the response is **ONLY** in JSON format, with no additional text."
        )

        def fetch_summary(api_url, headers, model_name):
            payload = {
                "model": model_name,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.3,  # Reduced for deterministic response
                "max_tokens": 1500,  # Increased to avoid cut-off responses
                "top_p": 1
            }

            response = requests.post(api_url, headers=headers, json=payload)
            print(f"API ({model_name}) Response Status: {response.status_code}")

            if response.status_code == 200:
                response_json = response.json()
                if 'choices' in response_json and response_json['choices']:
                    message = response_json['choices'][0].get('message', {})
                    if 'content' in message:
                        return message['content']
            return None

        headers = {
            "Authorization": f"Bearer {groq_api_key}",
            "Content-Type": "application/json"
        }
        summary_text = fetch_summary("https://api.groq.com/openai/v1/chat/completions", headers, "llama3-8b-8192")

        print("Raw API response:", summary_text)

        # If Groq fails, try OpenAI API as fallback
        if not summary_text and openai_api_key:
            headers["Authorization"] = f"Bearer {openai_api_key}"
            summary_text = fetch_summary("https://api.openai.com/v1/chat/completions", headers, "gpt-3.5-turbo")

        if summary_text:
            try:
                # Extract JSON output from the response using regex
                import re
                json_match = re.search(r'\{.*\}', summary_text, re.DOTALL)
                if json_match:
                    summary_text = json_match.group()

                response_data = json.loads(summary_text)

                return jsonify({
                    'summary': response_data.get('summary', 'Summary not available'),
                    'condition': response_data.get('condition', 'Unknown'),
                    'dos': response_data.get('dos', []),
                    'donts': response_data.get('donts', [])
                })
            except Exception as parse_error:
                print(f"Error parsing API response: {parse_error}")
                return jsonify({'error': 'Failed to parse API response. Please check format.'}), 500

        return jsonify({'error': 'Could not generate summary from API.'}), 500

    except Exception as e:
        print(f"Error in modify_text: {e}")
        return jsonify({'error': str(e)}), 500



if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port, debug=True)