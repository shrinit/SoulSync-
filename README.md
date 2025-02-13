# SoulSync

SoulSync is a web application designed to guide you through various emotional states. It uses [Langflow](https://github.com/logspace-ai/langflow) under the hood to generate supportive, empathetic responses and actionable suggestions.

## Preview

**Home Screen (Emotion Selection)**  
![image](https://github.com/user-attachments/assets/76bd62bd-40ee-446e-bb36-6802591e9129)


**Response Screen (Example: Happy)**  
![image](https://github.com/user-attachments/assets/8f3ac7b3-7991-41ed-a977-706d2e2da0be)


---

## Features

1. **Emotion Tiles:** Quickly select your current emotion (e.g., Happy, Sad, Anxious) to receive tailored guidance.  
2. **Actionable Suggestions:** Each response includes tips, resources, or exercises to help you navigate or enhance your emotional state.  
3. **Langflow Integration:** Uses a Langflow client to communicate with an AI flow. This allows for flexible, easily updated conversation flows without needing to modify your front-end code heavily.

---

## Installation & Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/YourUsername/SoulSync-.git
   cd SoulSync-

## Using Langflow in SoulSync

1. **Langflow Flow URL**  
   The app communicates with a Langflow instance hosted at a specific endpoint. In this example, it's set to something like:
   ```js
   const LANGFLOW_API = 'https://api.langflow.astra.datastax.com/...';

You can change this URL to point to your own Langflow deployment if needed.

## API Key Setup

1. Open the `App.tsx` file (or wherever you handle the Langflow request).
2. Look for the `apiKey` variable:
   ```js
   const apiKey = 'YOUR_API_KEY';
3. Replace 'YOUR_API_KEY' with your actual token from Langflow. If you’re using Datastax Astra integration or a different hosting solution, ensure you paste the correct token.
   
## How it Works

- When you click an emotion tile, the app sends a `POST` request to your server at `/api/chat` with the chosen emotion.
- Your server proxies the request to Langflow, passing along your `apiKey`.
- Langflow returns a JSON response with text relevant to your selected emotion.
- The app displays that text in a friendly UI.

## License

This project is licensed under the MIT License. 
