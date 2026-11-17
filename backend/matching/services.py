import math
import os
import json
import logging
from PIL import Image
import numpy as np

logger = logging.getLogger(__name__)

# Global singleton cache for CLIP model & processor to prevent reloading on each request
_CLIP_MODEL = None
_CLIP_PROCESSOR = None
_MODEL_INIT_ATTEMPTED = False
_MODEL_INIT_ERROR = None

def get_clip_engine():
    """
    Initializes and caches the pretrained CLIP model and processor.
    Uses 'openai/clip-vit-base-patch32' for high-accuracy multimodal visual embeddings.
    """
    global _CLIP_MODEL, _CLIP_PROCESSOR, _MODEL_INIT_ATTEMPTED, _MODEL_INIT_ERROR
    if _CLIP_MODEL is not None and _CLIP_PROCESSOR is not None:
        return _CLIP_MODEL, _CLIP_PROCESSOR

    if _MODEL_INIT_ATTEMPTED and _MODEL_INIT_ERROR is not None:
        return None, None

    _MODEL_INIT_ATTEMPTED = True
    try:
        from transformers import CLIPProcessor, CLIPModel
        import torch

        model_id = os.getenv("CLIP_MODEL_NAME", "openai/clip-vit-base-patch32")
        logger.info(f"Loading pretrained CLIP model: {model_id}...")
        
        processor = CLIPProcessor.from_pretrained(model_id)
        model = CLIPModel.from_pretrained(model_id)
        model.eval()

        _CLIP_MODEL = model
        _CLIP_PROCESSOR = processor
        logger.info("Pretrained CLIP model loaded successfully.")
        return _CLIP_MODEL, _CLIP_PROCESSOR
    except Exception as exc:
        _MODEL_INIT_ERROR = str(exc)
        logger.warning(f"CLIP pretrained model loading notice: {exc}. Using robust visual perceptual feature extractor.")
        return None, None

def extract_image_embedding(image_path):
    """
    Extracts a normalized image feature vector from an uploaded image.
    Uses pretrained CLIP if available; falls back to 512-dim perceptual color-spatial vector.
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found at {image_path}")

    model, processor = get_clip_engine()

    if model is not None and processor is not None:
        try:
            import torch
            image = Image.open(image_path).convert("RGB")
            inputs = processor(images=image, return_tensors="pt")
            with torch.no_grad():
                image_features = model.get_image_features(**inputs)
                # L2 normalize
                image_features = image_features / image_features.norm(p=2, dim=-1, keepdim=True)
                vector = image_features[0].cpu().numpy().tolist()
                return vector, "openai/clip-vit-base-patch32", len(vector)
        except Exception as e:
            logger.error(f"Error during CLIP inference: {e}. Falling back to visual perceptual extraction.")

    # High-precision visual perceptual feature vector (512 dimensions)
    try:
        image = Image.open(image_path).convert("RGB")
        # Resize to standard 224x224
        img_resized = image.resize((224, 224))
        arr = np.array(img_resized, dtype=np.float32) / 255.0

        # 1. 3D Color distribution histograms (8x8x8 = 512 bins)
        r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
        hist, _ = np.histogramdd(
            (r.ravel(), g.ravel(), b.ravel()),
            bins=(8, 8, 8),
            range=((0, 1), (0, 1), (0, 1))
        )
        vector = hist.flatten().astype(np.float32)

        # L2 Normalization
        norm = np.linalg.norm(vector)
        if norm > 0:
            vector = vector / norm
        return vector.tolist(), "perceptual-visual-v1", 512
    except Exception as e:
        logger.error(f"Failed to generate perceptual embedding: {e}")
        # Return neutral unit vector
        neutral = [0.0] * 512
        neutral[0] = 1.0
        return neutral, "neutral-fallback", 512

def calculate_cosine_similarity(vec_a, vec_b):
    """
    Calculates cosine similarity between two normalized vectors.
    Returns percentage score between 0.0 and 100.0.
    """
    if not vec_a or not vec_b:
        return 0.0
    a = np.array(vec_a, dtype=np.float32)
    b = np.array(vec_b, dtype=np.float32)

    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)

    if norm_a == 0 or norm_b == 0:
        return 0.0

    dot = np.dot(a, b) / (norm_a * norm_b)
    # Clamp between -1.0 and 1.0, map to 0..100
    dot = max(min(float(dot), 1.0), -1.0)
    score = max(0.0, dot * 100.0)
    return round(score, 2)

def calculate_category_similarity(cat_lost, cat_found):
    """Calculates category match score (0 - 100%)."""
    if not cat_lost or not cat_found:
        return 0.0
    if cat_lost.lower() == cat_found.lower():
        return 100.0
    
    # Related categories mapping
    related_groups = [
        {'electronics', 'phones', 'laptops'},
        {'wallets', 'documents', 'bags'},
        {'jewelry', 'clothing'},
    ]
    for group in related_groups:
        if cat_lost.lower() in group and cat_found.lower() in group:
            return 60.0
    return 10.0

def calculate_color_similarity(lost_p_color, lost_s_color, found_p_color, found_s_color):
    """Calculates color match score based on primary and secondary colors."""
    lost_colors = {c.strip().lower() for c in [lost_p_color, lost_s_color] if c}
    found_colors = {c.strip().lower() for c in [found_p_color, found_s_color] if c}

    if not lost_colors or not found_colors:
        return 50.0

    intersection = lost_colors.intersection(found_colors)
    if lost_p_color and found_p_color and lost_p_color.strip().lower() == found_p_color.strip().lower():
        return 100.0
    elif intersection:
        return 75.0
    return 20.0

def calculate_text_similarity(desc_lost, desc_found, title_lost, title_found):
    """Calculates text token overlap and keyword similarity."""
    text_lost = f"{title_lost} {desc_lost}".lower()
    text_found = f"{title_found} {desc_found}".lower()

    words_lost = set([w for w in text_lost.replace(',', ' ').replace('.', ' ').split() if len(w) > 2])
    words_found = set([w for w in text_found.replace(',', ' ').replace('.', ' ').split() if len(w) > 2])

    if not words_lost or not words_found:
        return 50.0

    intersection = words_lost.intersection(words_found)
    union = words_lost.union(words_found)
    jaccard = len(intersection) / len(union) if union else 0.0
    return round(min(100.0, jaccard * 200.0 + (30.0 if intersection else 0.0)), 2)

def haversine_distance_km(lat1, lon1, lat2, lon2):
    """Calculates great-circle distance between two points in km."""
    R = 6371.0 # Earth's radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def calculate_location_similarity(lost_item, found_item):
    """Calculates geographical proximity score (0 - 100%)."""
    # If coordinates are present on both items
    if (lost_item.latitude and lost_item.longitude and
        found_item.latitude and found_item.longitude):
        try:
            dist = haversine_distance_km(
                float(lost_item.latitude), float(lost_item.longitude),
                float(found_item.latitude), float(found_item.longitude)
            )
            if dist <= 2.0:
                return 100.0
            elif dist <= 5.0:
                return 90.0
            elif dist <= 15.0:
                return 75.0
            elif dist <= 30.0:
                return 60.0
            elif dist <= 60.0:
                return 40.0
            else:
                return max(10.0, 100.0 - (dist * 1.5))
        except Exception:
            pass

    # City match check
    if lost_item.city and found_item.city:
        if lost_item.city.strip().lower() == found_item.city.strip().lower():
            if lost_item.area and found_item.area and lost_item.area.strip().lower() == found_item.area.strip().lower():
                return 90.0
            return 75.0
        return 20.0
    return 50.0

def compute_combined_matching_score(lost_item, found_item, image_sim=None):
    """
    Computes weighted combined matching score.
    Default Configurable Weights:
      - Image similarity: 60% (0.60)
      - Category similarity: 15% (0.15)
      - Colour similarity: 10% (0.10)
      - Description similarity: 10% (0.10)
      - Location proximity: 5% (0.05)
    """
    W_IMAGE = float(os.getenv("MATCH_WEIGHT_IMAGE", 0.60))
    W_CATEGORY = float(os.getenv("MATCH_WEIGHT_CATEGORY", 0.15))
    W_COLOR = float(os.getenv("MATCH_WEIGHT_COLOR", 0.10))
    W_DESC = float(os.getenv("MATCH_WEIGHT_DESC", 0.10))
    W_LOCATION = float(os.getenv("MATCH_WEIGHT_LOCATION", 0.05))

    cat_score = calculate_category_similarity(lost_item.category, found_item.category)
    color_score = calculate_color_similarity(
        lost_item.primary_color, lost_item.secondary_color,
        found_item.primary_color, found_item.secondary_color
    )
    desc_score = calculate_text_similarity(
        lost_item.description, found_item.description,
        lost_item.title, found_item.title
    )
    loc_score = calculate_location_similarity(lost_item, found_item)

    if image_sim is None:
        image_sim = 0.0

    combined = (
        (image_sim * W_IMAGE) +
        (cat_score * W_CATEGORY) +
        (color_score * W_COLOR) +
        (desc_score * W_DESC) +
        (loc_score * W_LOCATION)
    )

    combined = round(min(max(combined, 0.0), 100.0), 2)

    if combined >= 75.0:
        confidence = 'high'
    elif combined >= 50.0:
        confidence = 'medium'
    else:
        confidence = 'low'

    return {
        'image_similarity': image_sim,
        'category_similarity': cat_score,
        'color_similarity': color_score,
        'description_similarity': desc_score,
        'location_similarity': loc_score,
        'combined_score': combined,
        'confidence_level': confidence
    }

def get_or_create_item_embedding(item, is_lost=True):
    """Retrieves or creates embedding for LostItem or FoundItem."""
    from matching.models import ItemEmbedding

    field = 'lost_item' if is_lost else 'found_item'
    lookup = {field: item}
    existing = ItemEmbedding.objects.filter(**lookup).first()
    if existing:
        return existing

    if not item.image:
        return None

    try:
        vector, model_name, dim = extract_image_embedding(item.image.path)
        record = ItemEmbedding.objects.create(
            **lookup,
            model_name=model_name,
            embedding_dim=dim,
            embedding=vector
        )
        return record
    except Exception as e:
        logger.error(f"Failed to generate embedding for item {item.id}: {e}")
        return None

def run_match_for_lost_item(lost_item):
    """
    Compares a lost item against all available found items,
    computes scores, records matches, and sends notifications.
    """
    from items.models import FoundItem
    from matching.models import MatchRecord
    from notifications.services import create_match_notification

    lost_emb_rec = get_or_create_item_embedding(lost_item, is_lost=True)
    lost_vector = lost_emb_rec.embedding if lost_emb_rec else None

    # Filter found items (same category or close categories)
    found_candidates = FoundItem.objects.filter(status__in=['available', 'claimed'])
    matches_created = []

    for found_item in found_candidates:
        found_emb_rec = get_or_create_item_embedding(found_item, is_lost=False)
        found_vector = found_emb_rec.embedding if found_emb_rec else None

        img_sim = calculate_cosine_similarity(lost_vector, found_vector) if (lost_vector and found_vector) else 0.0
        scores = compute_combined_matching_score(lost_item, found_item, img_sim)

        # Record match if score meets baseline threshold (e.g., 35%)
        if scores['combined_score'] >= 35.0:
            match_record, created = MatchRecord.objects.update_or_create(
                lost_item=lost_item,
                found_item=found_item,
                defaults=scores
            )
            matches_created.append(match_record)

            # If confidence is high or medium, update lost item status and notify
            if scores['confidence_level'] in ['high', 'medium']:
                if lost_item.status == 'reported':
                    lost_item.status = 'matched'
                    lost_item.save(update_fields=['status'])
                create_match_notification(match_record)

    return matches_created

def run_match_for_found_item(found_item):
    """
    Compares a newly reported found item against all active lost items.
    """
    from items.models import LostItem
    from matching.models import MatchRecord
    from notifications.services import create_match_notification

    found_emb_rec = get_or_create_item_embedding(found_item, is_lost=False)
    found_vector = found_emb_rec.embedding if found_emb_rec else None

    lost_candidates = LostItem.objects.filter(status__in=['reported', 'matched'])
    matches_created = []

    for lost_item in lost_candidates:
        lost_emb_rec = get_or_create_item_embedding(lost_item, is_lost=True)
        lost_vector = lost_emb_rec.embedding if lost_emb_rec else None

        img_sim = calculate_cosine_similarity(lost_vector, found_vector) if (lost_vector and found_vector) else 0.0
        scores = compute_combined_matching_score(lost_item, found_item, img_sim)

        if scores['combined_score'] >= 35.0:
            match_record, created = MatchRecord.objects.update_or_create(
                lost_item=lost_item,
                found_item=found_item,
                defaults=scores
            )
            matches_created.append(match_record)

            if scores['confidence_level'] in ['high', 'medium']:
                if lost_item.status == 'reported':
                    lost_item.status = 'matched'
                    lost_item.save(update_fields=['status'])
                create_match_notification(match_record)

    return matches_created
