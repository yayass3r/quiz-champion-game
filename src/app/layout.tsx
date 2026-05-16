import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "بطل الأسئلة - لعبة تحدي الأسئلة والأجوبة",
  description: "أقوى لعبة أسئلة وتحديات عربية! تنافس مع أصدقائك، اكشف مستوى ذكاءك، واحصل على المركز الأول في المتصدرين! 6 أنماط لعب، 17 تصنيف، إنجازات ومكافآت يومية.",
  keywords: ["أسئلة", "تحدي", "لعبة", "ثقافة عامة", "مسابقات", "ألعاب ذكاء", "quiz", "trivia", "بطل الأسئلة"],
  icons: {
    icon: "/icon-512.png",
    apple: "/icon-512.png",
  },
  openGraph: {
    title: "بطل الأسئلة - Quiz Champion",
    description: "أقوى لعبة أسئلة وتحديات عربية! 6 أنماط لعب، 17 تصنيف، إنجازات ومكافآت يومية.",
    images: ["/feature-graphic.png"],
    type: "website",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="antialiased bg-gray-950 text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
