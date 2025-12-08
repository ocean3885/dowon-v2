import type { Metadata } from "next";
import { Nanum_Myeongjo, Do_Hyeon } from "next/font/google";
import "./globals.css";
import clsx from "clsx";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const myeongjo = Nanum_Myeongjo({
  weight: ['400', '700', '800'],
  subsets: ["latin"],
  variable: '--font-myeongjo',
});

const dohyeon = Do_Hyeon({
  weight: ['400'],
  subsets: ["latin"],
  variable: '--font-dohyeon',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="scroll-smooth">
      <body className={clsx(myeongjo.variable, dohyeon.variable, "font-serif antialiased bg-stone-50 text-stone-900")}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
