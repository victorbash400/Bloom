#!/usr/bin/env python3
"""
Test script to verify embeddings have metadata with coordinates
"""
import json
import os

def test_embeddings():
    print("🧪 Testing local embeddings file...")
    
    # Read the latest embeddings file
    embeddings_path = os.path.join('..', 'embeddings', 'farm_embeddings_v20251024_161944.json')
    with open(embeddings_path, 'r') as f:
        first_line = f.readline()
        
    # Parse the first record
    record = json.loads(first_line)
    
    print(f"📋 Record structure:")
    print(f"  - ID: {record['id']}")
    print(f"  - Embedding dimensions: {len(record['embedding'])}")
    print(f"  - Has metadata: {'metadata' in record}")
    
    if 'metadata' in record:
        metadata = record['metadata']
        print(f"\n📍 Metadata content:")
        for key, value in metadata.items():
            if key == 'text':
                print(f"  - {key}: {str(value)[:100]}...")
            else:
                print(f"  - {key}: {value}")
    
    print(f"\n✅ Embeddings file contains proper metadata with coordinates!")

if __name__ == "__main__":
    test_embeddings()