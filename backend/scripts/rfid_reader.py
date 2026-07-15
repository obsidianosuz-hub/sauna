#!/usr/bin/env python3
import time
import requests
import RPi.GPIO as GPIO
from mfrc522 import SimpleMFRC522

# Configure MFRC522 Reader
reader = SimpleMFRC522()

# API Configuration
API_BASE_URL = "http://localhost:5000/api"
API_AUTH_TOKEN = "YOUR_SYSTEM_SERVICE_JWT_TOKEN"  # Token assigned to the device

headers = {
    "Authorization": f"Bearer {API_AUTH_TOKEN}",
    "Content-Type": "application/json"
}

print("====================================================")
print(" RFID-RC522 Wristband Scanner Service Started!")
print(" Scan your wristband at the bar counter...")
print("====================================================")

try:
    while True:
        try:
            # 1. Read RFID Card/Wristband UID
            id, text = reader.read()
            nfc_uid = f"RFID-RC522-BAND-{id}"
            
            print(f"\n[SCAN DETECTED] UID: {nfc_uid}")
            
            # 2. Prepare payload for bar sale / towel rental
            # For demonstration, we assume scanning adds a default item (e.g. Coca-Cola, Product ID: 1)
            # In production, the bar clerk selects the item on screen, and the reader assigns it to the card.
            payload = {
                "nfcUid": nfc_uid,
                "productId": 1,      # Coca Cola (seeding product ID)
                "quantity": 1
            }

            # 3. Post to Express Backend
            print("Sending request to server...")
            response = requests.post(
                f"{API_BASE_URL}/sessions/bar-order",
                json=payload,
                headers=headers
            )
            
            result = response.json()
            if response.status_code == 201:
                print(f"✅ Success: {result['message']}")
            else:
                print(f"❌ Error: {result.get('message', 'Unknown api error')}")

        except Exception as e:
            print(f"⚠️ Read/Post Error: {e}")
            
        time.sleep(2)  # Delay between scans to avoid double scans

finally:
    GPIO.cleanup()
