import { NextResponse } from 'next/server';
import axios from 'axios';

// Convert base64 data to Blob
const base64ToBlob = async (base64Data: string) => {
  const response = await fetch(`data:image/jpeg;base64,${base64Data}`);
  return await response.blob();
};

export async function POST(request: Request) {
  try {
    // Get the image source from the request body
    const { imageSrc } = await request.json();

    if (!imageSrc) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const base64Data = imageSrc.split(',')[1];
    const blob = await base64ToBlob(base64Data);

    const formData = new FormData();
    formData.append('image', blob, 'webcam.jpg');

    const externalApiResponse = await axios.post(
      'http://127.0.0.1:5000/predict',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    return NextResponse.json(externalApiResponse.data);
  } catch (error) {
    console.error('Backend error:', error);
    return NextResponse.json({ error: 'An error occurred on the server.' }, { status: 500 });
  }
}
