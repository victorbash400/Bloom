

**3. Basic Embedding Usage in Python**

```python
from google import genai

client = genai.Client()  # You may need to pass `api_key=YOUR_API_KEY`

result = client.models.embed_content(
    model="gemini-embedding-001",
    contents="What is the meaning of life?"
)
print(result.embeddings)
```

***

**4. Embed Multiple Texts**

```python
from google import genai

client = genai.Client()

texts = [
    "What is the meaning of life?",
    "What is the purpose of existence?",
    "How do I bake a cake?"
]
result = client.models.embed_content(
    model="gemini-embedding-001",
    contents=texts
)
for embedding in result.embeddings:
    print(embedding)
```

***

**5. Specify Task Type (e.g. Semantic Similarity)**

```python
from google import genai
from google.genai import types
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

client = genai.Client()
texts = [
    "What is the meaning of life?",
    "What is the purpose of existence?",
    "How do I bake a cake?"
]
embeddings_obj = client.models.embed_content(
    model="gemini-embedding-001",
    contents=texts,
    config=types.EmbedContentConfig(task_type="SEMANTIC_SIMILARITY")
).embeddings

embeddings_matrix = np.array([np.array(e.values) for e in embeddings_obj])
similarity_matrix = cosine_similarity(embeddings_matrix)
print(similarity_matrix)
```

***

**6. Control Embedding Size**

```python
from google import genai
from google.genai import types

client = genai.Client()
result = client.models.embed_content(
    model="gemini-embedding-001",
    contents="What is the meaning of life?",
    config=types.EmbedContentConfig(output_dimensionality=768)
)
embedding_obj = result.embeddings[0]
print(f"Length of embedding: {len(embedding_obj.values)}")
```

***

**7. Embedding Normalization (for sizes other than 3072)**

```python
import numpy as np
embedding_values_np = np.array(embedding_obj.values)
normed_embedding = embedding_values_np / np.linalg.norm(embedding_values_np)
print(f"Normed embedding length: {len(normed_embedding)}")
print(f"Norm of normed embedding: {np.linalg.norm(normed_embedding):.6f}")
```
