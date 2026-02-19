export const metadata = {
  title: '患者の声 - Patient Voices',
  description: '患者とご家族の体験を共有するプラットフォーム',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: '#f5f5f5'
      }}>
        <header style={{
          backgroundColor: '#2c5282',
          color: 'white',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ margin: 0, fontSize: '28px' }}>患者の声</h1>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
            Patient Voices - 患者とご家族の体験を共有するプラットフォーム
          </p>
        </header>
        {children}
      </body>
    </html>
  )
}
