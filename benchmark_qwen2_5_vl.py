import os
import sys
import torch
from PIL import Image

def run_qwen_benchmark():
    print("=" * 65)
    print("🛰️ SatQuery AI - Qwen2.5-VL-3B-Instruct Benchmark Test")
    print("=" * 65)

    sample_image_path = "storage/sample_imagery/real_satellite_sample.jpg"
    if not os.path.exists(sample_image_path):
        print(f"Error: Sample image not found at {sample_image_path}")
        return

    # Check device (Metal MPS for Mac, CUDA for GPU, or CPU)
    if torch.cuda.is_available():
        device = "cuda"
    elif torch.backends.mps.is_available():
        device = "mps"
    else:
        device = "cpu"

    print(f"🖥️ Execution Hardware Device: {device.upper()}")

    try:
        from transformers import Qwen2_5_VLForConditionalGeneration, AutoProcessor
        from qwen_vl_utils import process_vision_info
    except ImportError as e:
        print(f"ImportError: Missing packages ({e}). Run: pip install qwen-vl-utils accelerate transformers")
        return

    model_id = "Qwen/Qwen2.5-VL-3B-Instruct"
    print(f"📥 Loading Model Checkpoint: {model_id}...")

    try:
        model = Qwen2_5_VLForConditionalGeneration.from_pretrained(
            model_id,
            torch_dtype=torch.float16 if device != "cpu" else torch.float32,
            low_cpu_mem_usage=True,
            device_map="auto" if device == "cuda" else None
        )
        if device == "mps":
            model = model.to("mps")

        processor = AutoProcessor.from_pretrained(model_id)
        print("✅ Model & Processor loaded successfully!")
    except Exception as err:
        print(f"❌ Failed to load model: {err}")
        return

    # Prepare Multimodal Prompt for Satellite Analysis
    prompt_text = "Analyze this remote-sensing satellite image. Identify the primary land cover, land use features, built-up structures, and provide normalized bounding boxes in [ymin, xmin, ymax, xmax] format for key ground features."

    messages = [
        {
            "role": "user",
            "content": [
                {"type": "image", "image": sample_image_path},
                {"type": "text", "text": prompt_text},
            ],
        }
    ]

    print("\n📸 Processing Satellite Input Image...")
    print(f"❓ Prompt: {prompt_text}")

    text = processor.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    vision_info = process_vision_info(messages)
    image_inputs = vision_info[0] if isinstance(vision_info, tuple) and len(vision_info) > 0 else None
    video_inputs = vision_info[1] if isinstance(vision_info, tuple) and len(vision_info) > 1 else None

    inputs = processor(
        text=[text],
        images=image_inputs,
        videos=video_inputs,
        padding=True,
        return_tensors="pt"
    )
    inputs = inputs.to(device)

    print("\n⏳ Generating Qwen2.5-VL-3B VLM Response...")
    with torch.inference_mode():
        generated_ids = model.generate(**inputs, max_new_tokens=300)

    generated_ids_trimmed = [
        out_ids[len(in_ids):] for in_ids, out_ids in zip(inputs.input_ids, generated_ids)
    ]
    output_text = processor.batch_decode(
        generated_ids_trimmed, skip_special_tokens=True, clean_up_tokenization_spaces=False
    )[0]

    print("\n" + "=" * 65)
    print("💬 Qwen2.5-VL-3B GENERATED ANSWER & GROUNDING OUTPUT:")
    print("=" * 65)
    print(output_text)
    print("=" * 65)

if __name__ == "__main__":
    run_qwen_benchmark()
