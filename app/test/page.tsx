export default function TestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Test Page - App is Working!</h1>
      <p>If you can see this, the app is deployed correctly.</p>
      <p>Environment check:</p>
      <ul>
        <li>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</li>
        <li>Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</li>
        <li>NextAuth URL: {process.env.NEXTAUTH_URL ? '✅ Set' : '❌ Missing'}</li>
        <li>NextAuth Secret: {process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing'}</li>
      </ul>
    </div>
  )
}

