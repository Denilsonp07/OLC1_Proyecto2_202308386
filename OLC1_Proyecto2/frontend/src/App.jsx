import { useState } from 'react'

// Debe coincidir con el puerto del backend (PORT en backend/src/index.ts)
const API_URL = 'http://localhost:8081/api/execute'

const EJEMPLO = `server web {
  cpu = 2;
  memory = 4;
  disk = 50;
  os = "ubuntu";
}

int cost = web.cpu * 10 + web.memory * 5;
print("Costo: " + cost);
print("Estado: " + web.status);`

export default function App() {
  const [source, setSource] = useState(EJEMPLO)
  const [res, setRes] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [errorRed, setErrorRed] = useState(null)

  async function ejecutar() {
    setCargando(true)
    setErrorRed(null)
    try {
      const r = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source }),
      })
      setRes(await r.json())
    } catch (e) {
      setErrorRed(e.message)   // fallo de RED, distinto de un error del lenguaje
    } finally {
      setCargando(false)
    }
  }

  const caja = { background: '#111', color: '#ddd', padding: 12, borderRadius: 6, whiteSpace: 'pre-wrap', minHeight: 40 }

  return (
    <div style={{ fontFamily: 'monospace', padding: 20, maxWidth: 960, margin: '0 auto', textAlign: 'left' }}>
      <h1>AutoInfra</h1>
      <textarea value={source} onChange={(e) => setSource(e.target.value)} rows={14}
        style={{ width: '100%', fontFamily: 'monospace', fontSize: 14, boxSizing: 'border-box' }} />
      <p>
        <button onClick={ejecutar} disabled={cargando}>{cargando ? 'Ejecutando...' : 'Ejecutar'}</button>
        {res && <strong style={{ marginLeft: 12, color: res.success ? 'green' : 'crimson' }}>
          {res.success ? '✔ Ejecución exitosa' : '✘ Ejecución con errores'}</strong>}
      </p>

      {errorRed && <p style={{ color: 'crimson' }}>No se pudo contactar al backend: {errorRed}. ¿Está corriendo en {API_URL}?</p>}

      {res && (<>
        <h3>Consola</h3>
        <div style={caja}>{res.console?.join('\n')}</div>

        <h3>Errores ({res.errors?.length ?? 0})</h3>
        <table border="1" cellPadding="4" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead><tr><th>Tipo</th><th>Descripción</th><th>Línea</th><th>Columna</th></tr></thead>
          <tbody>{res.errors?.map((e, i) => (
            <tr key={i}><td>{e.tipo}</td><td>{e.descripcion}</td><td>{e.linea}</td><td>{e.columna}</td></tr>))}</tbody>
        </table>

        <h3>Tabla de símbolos</h3>
        <table border="1" cellPadding="4" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead><tr><th>Identificador</th><th>Tipo</th><th>Valor / Estado</th></tr></thead>
          <tbody>{res.symbols?.map((s, i) => (
            <tr key={i}><td>{s.identificador}</td><td>{s.tipo}</td><td>{String(s.valor)}</td></tr>))}</tbody>
        </table>

        <h3>Infraestructura</h3>
        <div style={caja}>{JSON.stringify(res.infrastructure, null, 2)}</div>
      </>)}
    </div>
  )
}