# test_dark_pattern_model.py

import os
import json
import torch
from typing import List, Tuple
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import re

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# ------------------------------------------------------------
# Utility 1 — Sentence Splitter
# ------------------------------------------------------------
def split_into_sentences(text: str) -> List[str]:
    text = text.strip()
    if not text:
        return []
    sentences = re.split(r'(?<=[.!?])\s+', text)
    return [s.strip() for s in sentences if s.strip()]


# ------------------------------------------------------------
# Utility 2 — Load Model + Tokenizer + Meta (threshold)
# ------------------------------------------------------------
def load_model(model_dir: str):
    if not os.path.exists(model_dir):
        raise FileNotFoundError(f"Model directory '{model_dir}' not found")

    tokenizer = AutoTokenizer.from_pretrained(model_dir)
    model = AutoModelForSequenceClassification.from_pretrained(model_dir)
    model.to(DEVICE)
    model.eval()

    meta_path = os.path.join(model_dir, "meta.json")
    if not os.path.exists(meta_path):
        raise FileNotFoundError("meta.json not found. Did you run training script fully?")

    with open(meta_path, "r", encoding="utf-8") as f:
        meta = json.load(f)

    threshold = float(meta.get("decision_threshold", 0.5))
    max_len = meta.get("max_len", 256)

    return model, tokenizer, threshold, max_len, meta


# ------------------------------------------------------------
# Utility 3 — Predict Dark Score for a Single Sentence
# ------------------------------------------------------------
def predict_sentence(
    sentence: str,
    model,
    tokenizer,
    threshold: float,
    max_len: int
) -> Tuple[int, float]:
    """
    Returns:
        label (0/1), dark_probability
    """

    inputs = tokenizer(
        sentence,
        truncation=True,
        padding="max_length",
        max_length=max_len,
        return_tensors="pt"
    )

    with torch.no_grad():
        outputs = model(
            input_ids=inputs["input_ids"].to(DEVICE),
            attention_mask=inputs["attention_mask"].to(DEVICE)
        )
        logits = outputs.logits
        probs = torch.softmax(logits, dim=-1).cpu().numpy()[0]

    dark_prob = float(probs[1])
    label = 1 if dark_prob >= threshold else 0
    return label, dark_prob


# ------------------------------------------------------------
# Utility 4 — Detect Dark Sentences in a Paragraph
# ------------------------------------------------------------
def detect_dark_sentences(
    text: str,
    model,
    tokenizer,
    threshold: float,
    max_len: int
) -> List[Tuple[str, float]]:
    results = []
    sentences = split_into_sentences(text)

    for sent in sentences:
        label, prob = predict_sentence(sent, model, tokenizer, threshold, max_len)
        if label == 1:
            results.append((sent, prob))

    return results


# ------------------------------------------------------------
# Test Runner (manual)
# ------------------------------------------------------------
if __name__ == "__main__":
    MODEL_DIR = "model"   # Must match training script output folder

    print("Loading model...")
    model, tokenizer, threshold, max_len, meta = load_model(MODEL_DIR)

    print("\nModel loaded!")
    print(f"Decision threshold = {threshold}")
    print("--------------------------------------------")

    # ==========================================================
    # Test Example 1 — Single Sentence
    # ==========================================================
    test_sentence = "Click here to continue your free trial; you will be charged automatically."
    label, prob = predict_sentence(
        test_sentence,
        model,
        tokenizer,
        threshold,
        max_len
    )
    print("\nSingle Sentence Test")
    print("Sentence:", test_sentence)
    print("Prediction:", "DARK" if label == 1 else "NOT DARK")
    print(f"Probability: {prob:.4f}")

    # ==========================================================
    # Test Example 2 — Paragraph with Hidden Dark Sentences
    # ==========================================================
    test_paragraph = (
        "Welcome to our website. Continue to your free trial! "
        "Your card will be charged monthly unless you cancel. "
        "We value your privacy and will never share your data."
    )

    print("\nParagraph Test")
    results = detect_dark_sentences(
        test_paragraph,
        model,
        tokenizer,
        threshold,
        max_len
    )
    for sent, p in results:
        print(f"- DARK [{p:.4f}]: {sent}")

    # ==========================================================
    # Test Example 3 — JSON Output for Browser Extension
    # ==========================================================
    print("\nJSON Output Style for Extension")

    json_results = [
        {"sentence": sent, "probability": p, "type": "dark_pattern"}
        for sent, p in results
    ]
    print(json.dumps(json_results, indent=4))
