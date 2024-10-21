import { NextRequest, NextResponse } from "next/server";
import SpotifyWebApi from "spotify-web-api-node";
export async function POST(request: NextRequest) {
//   console.log(
//     process.env.NEXT_PUBLIC_CLIENT_ID +
//       " " +
//       process.env.NEXT_PUBLIC_CLIENT_SECRET
//   );
  const { code } = await request.json();
//   console.log(code);
  const spotifyApi = new SpotifyWebApi({
    redirectUri: "http://localhost:3000/",
    clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
    clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
  });
  try {
    if (!code) {
      return NextResponse.json(
        { error: "Code not found in the request" },
        { status: 400 }
      );
    }
    const data = await spotifyApi.authorizationCodeGrant(code);
    return NextResponse.json({
      accessToken: data.body.access_token,
      refreshToken: data.body.refresh_token,
      expiresIn: data.body.expires_in,
    });
  } catch (err) {
    console.log(err)
    return NextResponse.json(
      { error: "Error getting the tokens", details: err },
      { status: 500 }
    );
  }
}
