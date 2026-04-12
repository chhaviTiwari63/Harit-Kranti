export async function runLocalMLModel(imageBase64) {
  // send to Python FastAPI server OR run TensorFlow.js in Node
  // Example: POST request to http://localhost:8000/predict
  const response = await fetch("http://localhost:8000/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: imageBase64 })
  });

  const result = await response.json();
  // Example result: { pest: "Aphid", confidence: 0.92 }
  return result;
}