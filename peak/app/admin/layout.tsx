export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <style>{`
        footer {
          display: none;
        }
      `}</style>
      {children}
    </>
  );
}
