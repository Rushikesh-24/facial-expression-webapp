# Emotion-Based Spotify Playlist Generator 🎶🎭

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technologies Used](#technologies-used)
- [Setup Instructions](#setup-instructions)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [How It Works](#how-it-works)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [License](#license)

## Overview

This project is a **mood-based playlist generator** that captures a user’s emotions in real-time using their webcam, identifies their current mood, and generates a personalized Spotify playlist based on the dominant emotion. By leveraging **TensorFlow** for emotion detection and **Spotify's Web API** for playlist generation, this app offers a seamless experience for users to discover music that matches their mood.

## Features

- Real-time emotion detection using a webcam.
- Backend processing with TensorFlow to classify emotions into categories such as happy, sad, angry, etc.
- Spotify OAuth login integration for personalized user playlists.
- Automatic playlist generation based on the user's average mood.
- Displays a list of 10 songs matching the user's emotional state with clickable links to play the tracks on Spotify.

## Architecture

1. **Frontend**: Built using Next.js, it captures webcam footage and handles the user interface, including displaying the playlist.
2. **Backend**: A Flask/TensorFlow-based API that processes the webcam data and classifies the user’s emotion every second.
3. **Spotify API**: Integrates with the Spotify Web API to authenticate users and generate mood-based playlists.

## Technologies Used

- **Next.js** (Frontend)
- **TensorFlow** (Backend for emotion recognition)
- **Flask** (Backend server)
- **Spotify Web API** (Playlist generation)
- **Webcam API** (Captures real-time video)
- **Axios** (For making HTTP requests)

## Setup Instructions

### Backend

1. Clone the repository:
   ```bash
   git clone https://github.com/Rushikesh-24/facial-expression-webapp
   cd emotion-based-spotify-playlist/backend
   ```
2. Install the required dependencies:

    ```bash
    pip install -r requirements.txt
    ```

3. Navigate to the frontend

    ```bash
    cd ../
    ```

4. Install the frontend dependencies:

    ```bash
    npm install
    ```

5. Create a .env.local file in the frontend directory and add your Spotify API credentials:.

    ```bash
    NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your-client-id
    NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET=your-client-secret
    NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=your-redirect-uri
    ```

6. Run the Next.js development server:

    ```bash
    npm run dev
    ```

## How It Works

1. **Emotion Detection**: The app captures an image from the webcam every second and sends it to the backend. The backend processes the image using a pre-trained TensorFlow model and returns the detected emotion with a confidence score.
2. **Spotify Integration**: After logging in to Spotify, the frontend calculates the average mood based on the detected emotions over time. The app sends the mood category to the Spotify API, which returns a list of 10 songs that fit the user’s mood.
3. **Playlist Display**: The playlist is displayed in the frontend, complete with clickable links for users to listen to the songs directly on Spotify.

## Future Improvements

- Improve emotion classification accuracy by using a larger dataset.
- Allow users to select the duration of mood tracking.
- Add more categories and personalize playlists based on the user’s Spotify history.
- Enable sharing of playlists via social media.

## Contributing

Feel free to contribute to the project by submitting a pull request. Please ensure all changes are thoroughly tested.
