import Link from 'next/link'

export default function Error500(): JSX.Element {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
      padding: '4rem 1.5rem',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 600, color: '#111827', marginBottom: '1.5rem' }}>
        Une erreur inattendue est survenue
      </h1>
      <p style={{ fontSize: '1rem', color: '#4b5563', maxWidth: 560 }}>
        Nous travaillons à résoudre ce problème. Veuillez rafraîchir la page ou revenir à l&apos;accueil.
      </p>
      <Link
        href="/"
        style={{
          marginTop: '2rem',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 9999,
          backgroundColor: '#111827',
          color: '#ffffff',
          padding: '0.75rem 2.5rem',
          fontSize: '0.75rem',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          textDecoration: 'none'
        }}
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  )
}
