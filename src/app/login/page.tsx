import React from "react";
import { Button } from "@/components/ui/button";
import { Music, Headphones } from "lucide-react";
import { NextPage } from "next";
import Link from "next/link";

const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&response_type=code&redirect_uri=http://localhost:3000/&scope=streaming%20user-read-email%20user-read-private%20user-library-read%20user-library-modify%20user-read-playback-state%20user-modify-playback-state`;

const Page: NextPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-green-600">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-center mb-6">
          <Music className="text-green-500 w-16 h-16" />
        </div>
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Welcome to Spotify
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Connect and enjoy your favorite music
        </p>
        <Link href={AUTH_URL}>
          <Button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-full transition duration-300 flex items-center justify-center">
            <Headphones className="mr-2" />
            Login with Spotify
          </Button>
        </Link>
        <p className="text-center text-gray-500 mt-6 text-sm">
          By logging in, you agree to Spotify's Terms of Service and Privacy
          Policy.
        </p>
      </div>
    </div>
  );
};

export default Page;
