import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "بطل الأسئلة - لعبة تحدي الأسئلة والأجوبة",
  description: "أقوى لعبة أسئلة وتحديات عربية! تنافس مع أصدقائك، اكشف مستوى ذكاءك، واحصل على المركز الأول في المتصدرين!",
  keywords: ["أسئلة", "تحدي", "لعبة", "ثقافة عامة", "مسابقات", "ألعاب ذكاء"],
  icons: {
    icon: "🏆",
  },
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
