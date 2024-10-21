import { NextRequest, NextResponse } from "next/server";
import SpotifyWebApi from "spotify-web-api-node";

export async function POST(request: NextRequest) {
  const { refreshToken } = await request.json();
  if(!refreshToken){
    return NextResponse.json(
      { error: "Refresh token not found in the request" },
      { status: 400 }
    );
  }
  const spotifyApi = new SpotifyWebApi({
    redirectUri: "http://localhost:3000/",
    clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
    clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
    refreshToken,
  });

  try {
    const data = await spotifyApi.refreshAccessToken();
    console.log("Access token refreshed");
    spotifyApi.setAccessToken(data.body["access_token"]);
    return NextResponse.json({
      accessToken: data.body["access_token"],
      expiresIn: data.body["expires_in"],
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Error getting the tokens", details: err },
      { status: 500 }
    );
  }
}
