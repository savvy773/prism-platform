import type { Metadata } from "next";
import "@prism/ui/tokens.css";
import "./globals.css";
export const metadata: Metadata={title:"Prism · 함께 일하는 공간",description:"주간 업무, 일정, 프로젝트, 위키, 인수인계를 한곳에서."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ko"><body>{children}</body></html>;}
