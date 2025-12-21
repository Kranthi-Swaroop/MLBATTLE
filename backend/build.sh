#!/usr/bin/env bash
# Install Python and Kaggle CLI
pip install kaggle

# Create Kaggle config directory and credentials
mkdir -p ~/.kaggle
echo "{\"username\":\"$KAGGLE_USERNAME\",\"key\":\"$KAGGLE_KEY\"}" > ~/.kaggle/kaggle.json
chmod 600 ~/.kaggle/kaggle.json

# Install Node dependencies
npm install
