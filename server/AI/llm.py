import sys

prompt = sys.argv[1]

# Simulazione risposta LLM
def consiglia(prompt):
    return f"Con '{prompt}', consiglio jeans chiari e una giacca beige."

risposta = consiglia(prompt)
print(risposta)
