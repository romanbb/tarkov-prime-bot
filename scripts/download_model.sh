#!/bin/bash
# download and unzip https://alphacephei.com/vosk/models/vosk-model-en-us-0.22.zip to vosk-model-en-us-0.22

# Download and unzip the Vosk model
wget https://alphacephei.com/vosk/models/vosk-model-en-us-0.22.zip
unzip vosk-model-en-us-0.22.zip -d vosk-model-en-us-0.22

# Clean up the downloaded zip file
rm vosk-model-en-us-0.22.zip



