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

        prompt = ("Analyze this medical report and provide a user-friendly summary. "
                  "If the situation is serious, mention it clearly; otherwise, state it as normal. "
                  "Provide do's and don'ts in simple language.\n" + transcription)

        # Try direct API call to Groq using requests
        try:
            headers = {
                "Authorization": f"Bearer {groq_api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": "llama3-8b-8192",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.7,
                "max_tokens": 1024,
                "top_p": 1
            }
            
            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=payload
            )
            
            print(f"Groq API Response Status: {response.status_code}")
            print(f"Groq API Response: {response.text}")
            
            if response.status_code == 200:
                response_json = response.json()
                if 'choices' in response_json and len(response_json['choices']) > 0:
                    if 'message' in response_json['choices'][0]:
                        message = response_json['choices'][0]['message']
                        if 'content' in message:
                            modified_text = message['content']
                            return jsonify({'summary': modified_text})
            
            # If we get here, something went wrong with Groq API
            print("Failed to get valid response from Groq API")
            
            # Try OpenAI as fallback if key is available
            if openai_api_key:
                headers = {
                    "Authorization": f"Bearer {openai_api_key}",
                    "Content-Type": "application/json"
                }
                
                payload = {
                    "model": "gpt-3.5-turbo",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.7,
                    "max_tokens": 1024,
                    "top_p": 1
                }
                
                response = requests.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers=headers,
                    json=payload
                )
                
                print(f"OpenAI API Response Status: {response.status_code}")
                
                if response.status_code == 200:
                    response_json = response.json()
                    if 'choices' in response_json and len(response_json['choices']) > 0:
                        if 'message' in response_json['choices'][0]:
                            message = response_json['choices'][0]['message']
                            if 'content' in message:
                                modified_text = message['content']
                                return jsonify({'summary': modified_text})
            
            # If all else fails
            return jsonify({'summary': "Could not generate summary from API."})
            
        except Exception as api_error:
            print(f"API error: {api_error}")
            return jsonify({'summary': f"API error: {str(api_error)}"})

    except Exception as e:
        print(f"Error occurred in modify_text: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port, debug=True)