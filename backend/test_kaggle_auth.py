import os
from kaggle.api.kaggle_api_extended import KaggleApi

os.environ["KAGGLE_USERNAME"] = "thedarkdevi1"
os.environ["KAGGLE_KEY"] = "KGAT_904ab47f206e9b7a821a342480de3466"

try:
    api = KaggleApi()
    api.authenticate()
    print("Authentication successful")
    competitions = api.competitions_list(sort_by="latestDeadline")
    print(f"Found {len(competitions)} competitions")
except Exception as e:
    print(f"Error: {e}")

