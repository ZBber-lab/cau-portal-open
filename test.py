import sys

from openai import OpenAI

sys.stdout.reconfigure(encoding="utf-8")

API_KEY = "sk-5c716f2bea2d45cdbb7a42f22aef645a"
MODEL = "deepseek-v4-flash"  # 想用推理模型就改成 deepseek-reasoner
PROMPT = "什么是claude code"

client = OpenAI(api_key=API_KEY, base_url="https://api.deepseek.com")

response = client.chat.completions.create(
    model=MODEL,
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": PROMPT},
    ],
)

print(response.choices[0].message.content)
