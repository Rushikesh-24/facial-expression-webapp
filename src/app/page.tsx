"use client";
import DashBoard from '@/components/DashBoard';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';


export default function Home() {
  const router = useRouter();
const [code, setcode] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const code = new URLSearchParams(window.location.search).get('code');
      if (!code) {
        router.push('/login');
      }
      else{
        setcode(code)
        console.log(code)
      }
    }
  }, [router]);

  return ( <>
     <DashBoard code={code}/>
    </>
  )
}
