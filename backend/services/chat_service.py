from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

class AIAssistant:
    """Groq-powered AI assistant for conversational interface"""
    
    def __init__(self):
        """Initialize Groq client"""
        # Ensure your .env has GROQ_API_KEY
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.model = "llama-3.3-70b-versatile" # Optimized for natural language understanding
        self.conversation_history = []
        self.max_history = 10 # Keep last 10 exchanges for context
        self.system_prompt = "You are Drishyamitra, an intelligent AI assistant for photo management."

    def get_response(self, user_query):
        """Processes query and extracts intent before generating responses"""
        try:
            # Maintain context by appending history
            messages = [{"role": "system", "content": self.system_prompt}]
            messages.extend(self.conversation_history[-self.max_history:])
            messages.append({"role": "user", "content": user_query})

            completion = self.client.chat.completions.create(
                model=self.model,
                messages=messages
            )

            response_text = completion.choices[0].message.content
            
            # Update history
            self.conversation_history.append({"role": "user", "content": user_query})
            self.conversation_history.append({"role": "assistant", "content": response_text})

            return {"status": "success", "response": response_text}
        
        except Exception as e:
            # Fallback mechanism for unrecognized queries or API errors
            print(f"Groq API Error: {e}")
            return {"status": "error", "response": "I'm having trouble connecting to my brain. Please try again later."}