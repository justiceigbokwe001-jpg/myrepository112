export const metadata = { title: "MVP Prototype", description: "Demo MVP" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}</body></html>);
}
