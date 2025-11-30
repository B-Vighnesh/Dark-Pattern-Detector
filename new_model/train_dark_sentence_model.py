import os
import json
import random
from typing import List, Tuple

import numpy as np
import pandas as pd
from tqdm import tqdm
from sklearn.model_selection import train_test_split
from sklearn.utils.class_weight import compute_class_weight
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    precision_recall_fscore_support
)

import torch
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    get_linear_schedule_with_warmup
)

# ===================== CONFIG =====================

SEED = 42
MODEL_NAME = "roberta-base"   # stronger than distilbert-base-uncased
MAX_LEN = 256
BATCH_SIZE = 8
EPOCHS = 4
LR = 2e-5
WARMUP_RATIO = 0.1
DATA_PATH = "dataset.csv"
OUTPUT_DIR = "better_dark_pattern_model"

# ==================================================
# Reproducibility
# ==================================================

def set_seed(seed: int = 42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False


set_seed(SEED)
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", DEVICE)

# ==================================================
# Data loading helpers
# ==================================================

def detect_text_column(df: pd.DataFrame) -> str:
    if "text" in df.columns:
        return "text"
    candidates = [c for c in df.columns
                  if any(k in c.lower() for k in ["text", "body", "content", "sentence"])]
    if not candidates:
        raise ValueError(
            "Could not find a text column. Please ensure you have a column "
            "named 'text' or something like '*text*', '*body*', '*content*', '*sentence*'."
        )
    print(f"[INFO] Using '{candidates[0]}' as text column.")
    return candidates[0]


def detect_binary_label_column(df: pd.DataFrame) -> str:
    """
    Try to detect the binary dark-pattern label column (is_dark vs not).
    Similar idea to your previous trainer.
    """
    if "is_dark" in df.columns:
        return "is_dark"

    # Candidate names
    for col in df.columns:
        low = col.lower()
        if low in ("is_dark", "isdark", "dark", "binary_label", "label", "target"):
            print(f"[INFO] Using '{col}' as binary label column.")
            return col

    # Fallback: numeric column with exactly 2 unique values
    for col in df.columns:
        if df[col].nunique() == 2 and np.issubdtype(df[col].dtype, np.number):
            print(f"[INFO] Using '{col}' as binary label column (numeric 2 classes).")
            return col

    raise ValueError(
        "Could not detect a binary label column. "
        "Please add 'is_dark' or a 0/1 column indicating dark vs not dark."
    )


def load_dataset(path: str):
    if not os.path.exists(path):
        raise FileNotFoundError(f"Could not find {path} in working directory.")

    print(f"[INFO] Loading dataset from {path}")
    df = pd.read_csv(path)
    print(f"[INFO] Columns: {df.columns.tolist()}")
    print(f"[INFO] Rows: {len(df)}")

    text_col = detect_text_column(df)
    label_col = detect_binary_label_column(df)

    # Normalize text column name
    if text_col != "text":
        df = df.rename(columns={text_col: "text"})

    # Build is_dark = 0/1 column
    if label_col != "is_dark":
        if df[label_col].dtype == object:
            # Map textual labels to 0/1 (try best effort)
            mapping = {}
            for v in df[label_col].astype(str).str.lower().unique():
                if any(k in v for k in ["not dark", "no dark", "no", "none", "normal", "clean"]):
                    mapping[v] = 0
                else:
                    mapping[v] = 1
            df["is_dark"] = df[label_col].astype(str).str.lower().map(mapping).astype(int)
        else:
            # numeric – assume already 0/1
            df["is_dark"] = df[label_col].astype(int)

    # Ensure only 0/1
    unique_vals = sorted(df["is_dark"].unique())
    if unique_vals != [0, 1]:
        raise ValueError(f"is_dark must be 0/1 only, got values: {unique_vals}")

    print("[INFO] is_dark distribution:", df["is_dark"].value_counts().to_dict())
    print("[INFO] Sample examples:")
    print(df[["text", "is_dark"]].head(5))

    return df


# ==================================================
# Dataset & Dataloader
# ==================================================

class DarkPatternDataset(Dataset):
    def __init__(self, texts: List[str], labels: List[int]):
        self.texts = [str(t) for t in texts]
        self.labels = [int(l) for l in labels]

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        return {
            "text": self.texts[idx],
            "label": self.labels[idx],
        }


def make_dataloaders(df: pd.DataFrame, tokenizer, max_len: int, batch_size: int):
    train_df, val_df = train_test_split(
        df,
        test_size=0.15,
        random_state=SEED,
        stratify=df["is_dark"]
    )

    print(f"[INFO] Train rows: {len(train_df)}, Val rows: {len(val_df)}")

    train_dataset = DarkPatternDataset(train_df["text"], train_df["is_dark"])
    val_dataset = DarkPatternDataset(val_df["text"], val_df["is_dark"])

    def collate_fn(batch):
        texts = [b["text"] for b in batch]
        labels = torch.tensor([b["label"] for b in batch], dtype=torch.long)
        enc = tokenizer(
            texts,
            truncation=True,
            padding=True,
            max_length=max_len,
            return_tensors="pt"
        )
        return {
            "input_ids": enc["input_ids"],
            "attention_mask": enc["attention_mask"],
            "labels": labels
        }

    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,
        collate_fn=collate_fn
    )

    val_loader = DataLoader(
        val_dataset,
        batch_size=batch_size,
        shuffle=False,
        collate_fn=collate_fn
    )

    return train_loader, val_loader, train_df, val_df


# ==================================================
# Training
# ==================================================

def train_model():
    df = load_dataset(DATA_PATH)

    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    train_loader, val_loader, train_df, val_df = make_dataloaders(
        df, tokenizer, MAX_LEN, BATCH_SIZE
    )

    # class weights for imbalance
    class_weights_arr = compute_class_weight(
        class_weight="balanced",
        classes=np.array([0, 1]),
        y=df["is_dark"].values
    )
    class_weights = torch.tensor(class_weights_arr, dtype=torch.float32).to(DEVICE)
    print(f"[INFO] Class weights: {class_weights_arr}")

    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels=2
    )
    model.to(DEVICE)

    optimizer = torch.optim.AdamW(model.parameters(), lr=LR)
    total_steps = len(train_loader) * EPOCHS
    warmup_steps = int(total_steps * WARMUP_RATIO)
    scheduler = get_linear_schedule_with_warmup(
        optimizer,
        num_warmup_steps=warmup_steps,
        num_training_steps=total_steps
    )

    best_val_f1 = 0.0
    best_state_dict = None

    for epoch in range(1, EPOCHS + 1):
        print(f"\n========== Epoch {epoch}/{EPOCHS} ==========")
        model.train()
        running_loss = 0.0

        pbar = tqdm(train_loader, desc="Training", leave=False)
        for batch in pbar:
            input_ids = batch["input_ids"].to(DEVICE)
            attention_mask = batch["attention_mask"].to(DEVICE)
            labels = batch["labels"].to(DEVICE)

            optimizer.zero_grad()

            outputs = model(
                input_ids=input_ids,
                attention_mask=attention_mask
            )
            logits = outputs.logits
            loss = F.cross_entropy(logits, labels, weight=class_weights)

            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            scheduler.step()

            running_loss += loss.item()
            pbar.set_postfix({"loss": f"{loss.item():.4f}"})

        avg_loss = running_loss / len(train_loader)
        print(f"[INFO] Train loss: {avg_loss:.4f}")

        # Validation (threshold = 0.5 for now)
        val_loss, val_report, val_f1 = evaluate(model, val_loader, class_weights)
        print("[INFO] Validation loss:", f"{val_loss:.4f}")
        print("[INFO] Validation report (thr=0.5):")
        print(val_report)

        if val_f1 > best_val_f1:
            best_val_f1 = val_f1
            best_state_dict = model.state_dict()
            print(f"[INFO] New best F1: {best_val_f1:.4f}")

    # Load best weights
    if best_state_dict is not None:
        model.load_state_dict(best_state_dict)
    else:
        print("[WARN] No best_state_dict saved; using last epoch model.")

    # After training, search for a stricter threshold to reduce false positives
    best_threshold, thr_metrics = find_best_threshold(model, val_loader)
    print("\n========== Threshold search summary ==========")
    for row in thr_metrics:
        print(
            f"thr={row['thr']:.2f} | prec={row['precision']:.3f} "
            f"rec={row['recall']:.3f} f1={row['f1']:.3f} "
            f"FP={row['fp']} FN={row['fn']}"
        )
    print(f"\n[INFO] Selected best threshold (high precision target): {best_threshold:.3f}")

    # Save model, tokenizer, and meta info
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    model.save_pretrained(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)

    meta = {
        "model_name": MODEL_NAME,
        "max_len": MAX_LEN,
        "label2id": {"not_dark": 0, "dark": 1},
        "id2label": {0: "not_dark", 1: "dark"},
        "decision_threshold": float(best_threshold)
    }
    with open(os.path.join(OUTPUT_DIR, "meta.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)

    print(f"[INFO] Saved model + tokenizer + meta to '{OUTPUT_DIR}'.")


def evaluate(model, val_loader, class_weights):
    model.eval()
    all_labels = []
    all_logits = []
    total_loss = 0.0

    with torch.no_grad():
        for batch in tqdm(val_loader, desc="Validating", leave=False):
            input_ids = batch["input_ids"].to(DEVICE)
            attention_mask = batch["attention_mask"].to(DEVICE)
            labels = batch["labels"].to(DEVICE)

            outputs = model(
                input_ids=input_ids,
                attention_mask=attention_mask
            )
            logits = outputs.logits
            loss = F.cross_entropy(logits, labels, weight=class_weights)

            total_loss += loss.item()
            all_labels.append(labels.cpu().numpy())
            all_logits.append(logits.cpu().numpy())

    avg_loss = total_loss / len(val_loader)
    all_labels = np.concatenate(all_labels, axis=0)
    all_logits = np.concatenate(all_logits, axis=0)

    probs = torch.softmax(torch.tensor(all_logits), dim=-1).numpy()[:, 1]
    preds = (probs >= 0.5).astype(int)

    report = classification_report(
        all_labels,
        preds,
        digits=4,
        target_names=["not_dark", "dark"]
    )
    _, _, f1, _ = precision_recall_fscore_support(
        all_labels,
        preds,
        average="binary",
        pos_label=1
    )

    return avg_loss, report, f1


def find_best_threshold(model, val_loader):
    """
    Search for a threshold that tries to get:
      - 0 false positives if possible, OR
      - otherwise, highest precision, then best F1.

    This is to match your requirement "false detection must be null" as closely
    as possible in practice.
    """
    model.eval()
    all_labels = []
    all_logits = []

    with torch.no_grad():
        for batch in val_loader:
            input_ids = batch["input_ids"].to(DEVICE)
            attention_mask = batch["attention_mask"].to(DEVICE)
            labels = batch["labels"].to(DEVICE)

            outputs = model(
                input_ids=input_ids,
                attention_mask=attention_mask
            )
            logits = outputs.logits

            all_labels.append(labels.cpu().numpy())
            all_logits.append(logits.cpu().numpy())

    all_labels = np.concatenate(all_labels, axis=0)
    all_logits = np.concatenate(all_logits, axis=0)
    probs = torch.softmax(torch.tensor(all_logits), dim=-1).numpy()[:, 1]

    thresholds = np.linspace(0.5, 0.99, 20)
    best_thr = 0.5
    best_score = -1.0
    rows = []

    for thr in thresholds:
        preds = (probs >= thr).astype(int)
        tn, fp, fn, tp = confusion_matrix(all_labels, preds, labels=[0, 1]).ravel()
        precision, recall, f1, _ = precision_recall_fscore_support(
            all_labels, preds, average="binary", pos_label=1, zero_division=0
        )
        rows.append({
            "thr": float(thr),
            "precision": float(precision),
            "recall": float(recall),
            "f1": float(f1),
            "fp": int(fp),
            "fn": int(fn)
        })

    # 1) Prefer thresholds with fp == 0, choose highest recall among them
    zero_fp = [r for r in rows if r["fp"] == 0]
    if zero_fp:
        zero_fp_sorted = sorted(zero_fp, key=lambda r: (-r["recall"], -r["f1"], -r["thr"]))
        best_thr = zero_fp_sorted[0]["thr"]
        return best_thr, rows

    # 2) Otherwise: highest precision, then best F1, then highest threshold
    rows_sorted = sorted(
        rows,
        key=lambda r: (r["precision"], r["f1"], r["thr"]),
        reverse=True
    )
    best_thr = rows_sorted[0]["thr"]
    return best_thr, rows


# ==================================================
# Sentence-level detection utilities
# ==================================================

import re


def split_into_sentences(text: str) -> List[str]:
    """
    Very simple rule-based splitter.
    You can replace this with a more advanced NLP splitter if needed.
    """
    text = text.strip()
    if not text:
        return []
    # Split on punctuation followed by space.
    sentences = re.split(r'(?<=[.!?])\s+', text)
    # Clean & remove empties
    sentences = [s.strip() for s in sentences if s.strip()]
    return sentences


def load_trained_model(model_dir: str):
    tokenizer = AutoTokenizer.from_pretrained(model_dir)
    model = AutoModelForSequenceClassification.from_pretrained(model_dir)
    model.to(DEVICE)
    model.eval()

    with open(os.path.join(model_dir, "meta.json"), "r", encoding="utf-8") as f:
        meta = json.load(f)
    threshold = float(meta.get("decision_threshold", 0.5))
    return model, tokenizer, threshold, meta


def detect_dark_sentences(
    text: str,
    model,
    tokenizer,
    threshold: float,
    max_len: int
) -> List[Tuple[str, float]]:
    """
    Returns list of (sentence, probability) for sentences classified as dark
    with probability >= threshold.
    This is what you can call from your browser extension.
    """
    sentences = split_into_sentences(text)
    if not sentences:
        return []

    dark_results = []

    for sent in sentences:
        enc = tokenizer(
            sent,
            truncation=True,
            padding="max_length",
            max_length=max_len,
            return_tensors="pt"
        )
        input_ids = enc["input_ids"].to(DEVICE)
        attention_mask = enc["attention_mask"].to(DEVICE)

        with torch.no_grad():
            outputs = model(input_ids=input_ids, attention_mask=attention_mask)
            logits = outputs.logits
            probs = torch.softmax(logits, dim=-1).cpu().numpy()[0]
            dark_prob = float(probs[1])  # index 1 = dark

        if dark_prob >= threshold:
            dark_results.append((sent, dark_prob))

    return dark_results


if __name__ == "__main__":
    # 1) Train model & save artifacts
    train_model()

    # 2) OPTIONAL quick demo after training
    #    You can comment this out later and just import detect_dark_sentences
    print("\n========== Quick demo ==========")
    demo_text = (
        "Continue to your free trial! You will be charged automatically "
        "each month unless you cancel within 24 hours. "
        "We respect your privacy and never misuse your data."
    )

    model, tokenizer, thr, meta = load_trained_model(OUTPUT_DIR)
    results = detect_dark_sentences(
        demo_text,
        model,
        tokenizer,
        threshold=thr,
        max_len=meta["max_len"]
    )

    print(f"Decision threshold used: {thr:.3f}")
    print("Input text:")
    print(demo_text)
    print("\nDetected dark sentences:")
    for s, p in results:
        print(f"- [{p:.3f}] {s}")
