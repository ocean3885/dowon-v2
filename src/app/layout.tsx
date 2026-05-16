import type { Metadata } from "next";
import { Nanum_Myeongjo, Do_Hyeon } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import clsx from "clsx";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/utils/supabase/server";

// Pretendard (Local Font)
const pretendard = localFont({
  src: "../../public/fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "100 900",
  variable: "--font-pretendard",
});

// Nanum Myeongjo (Google Font - Korean support)
const myeongjo = Nanum_Myeongjo({
  weight: ['400', '700', '800'],
  variable: '--font-myeongjo',
  display: 'swap',
  subsets: ['latin'],
  preload: true,
});

// Do Hyeon (Google Font)
const dohyeon = Do_Hyeon({
  weight: ['400'],
  variable: '--font-dohyeon',
  display: 'swap',
  subsets: ['latin'],
  preload: true,
});

export const metadata: Metadata = {
  title: "도원작명철학원 | 사주 작명 궁합 전문",
  description: "김종찬 원장의 정통 명리학. 사주, 작명, 개명, 궁합, 신년운세 전문 상담.",
  keywords: ["작명", "철학원", "사주", "궁합", "개명", "도원작명철학원", "김종찬"],
  openGraph: {
    title: "도원작명철학원",
    description: "삶의 길을 밝히는 정통 명리학 상담",
    images: [{ url: "https://myungridan-gil.com/static/section/img/37.jpg" }],
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="ko" className="scroll-smooth" data-scroll-behavior="smooth">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --font-pretendard: ${pretendard.style.fontFamily};
            --font-myeongjo: ${myeongjo.style.fontFamily};
            --font-dohyeon: ${dohyeon.style.fontFamily};
          }
        `}} />
      </head>
      <body className="font-sans antialiased bg-stone-50 text-stone-900">
        <Header key={user?.id || 'guest'} initialUser={user} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
