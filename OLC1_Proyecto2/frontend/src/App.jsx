import { useEffect, useRef, useState } from 'react'
import { instance } from '@viz-js/viz'

// Debe coincidir con el puerto del backend (PORT en backend/src/index.ts)
const API_URL = 'http://localhost:8081/api/execute'

const EJEMPLO = `server backend {
    cpu = 4;
    memory = 8;
    disk = 100;
    os = "ubuntu";
}

database postgres {
    engine = "postgresql";
    version = "16";
    port = 5432;
}

service api {
    port = 8080;
    replicas = 2;
    dependsOn = [postgres];
}

task production {
    start(postgres);
    start(backend);
    install(backend, "docker");
    deploy(backend, api);
    scale(api, 3);
    print("API en el puerto " + api.port);
}

main {
    run production;
}`

const estilos = {
    tabla: { borderCollapse: 'collapse', width: '100%', fontSize: 12, color: '#c9ced8' },
    celda: { border: '1px solid #2a2d36', padding: '7px 9px', textAlign: 'left' },
    caja: { background: '#07090d', color: '#d8dee9', padding: 14, borderRadius: 10, whiteSpace: 'pre-wrap', minHeight: 170, fontSize: 12, fontFamily: 'var(--mono)', overflow: 'auto' },
}

function Tabla({ columnas, filas, vacio }) {
    if (!filas?.length) return <p className="empty-state">{vacio}</p>
    return (
        <div style={{ maxHeight: 420, overflow: 'auto' }}>
            <table style={estilos.tabla}>
                <thead><tr>{columnas.map(c => <th key={c} style={{ ...estilos.celda, background: '#242730', position: 'sticky', top: 0 }}>{c}</th>)}</tr></thead>
                <tbody>{filas.map((f, i) => <tr key={i}>{f.map((v, j) => <td key={j} style={estilos.celda}>{v}</td>)}</tr>)}</tbody>
            </table>
        </div>
    )
}

export function ConsolaPanel({ lineas }) {
    return (
        <div style={estilos.caja}>
            {lineas?.length ? lineas.map((l, i) => (
                <div key={i} style={{ color: l.startsWith('[OK]') ? '#7ee787' : l.startsWith('[WARN]') ? '#e3b341' : '#ddd' }}>{l}</div>
            )) : <span className="empty-state">(sin salida)</span>}
        </div>
    )
}

export function ErroresPanel({ errores, irA }) {
    if (!errores?.length) return <p className="success-message">✔ Sin errores</p>
    return (
        <Tabla columnas={['#', 'Tipo', 'Código', 'Descripción', 'Línea', 'Columna']}
            filas={errores.map((e, i) => [i + 1, e.tipo, e.codigo ?? '', (
                <span style={{ cursor: irA ? 'pointer' : 'default', textDecoration: irA ? 'underline dotted' : 'none' }}
                    onClick={() => irA?.(e.linea, e.columna)} title="Ir a la línea">{e.descripcion}</span>), e.linea, e.columna])} />
    )
}

export function TokensTable({ tokens }) {
    return <Tabla columnas={['#', 'Lexema', 'Token', 'Línea', 'Columna']} vacio="Sin tokens"
        filas={tokens?.map(t => [t.n, <code>{t.lexema}</code>, t.token, t.linea, t.columna])} />
}

export function SimbolosTable({ simbolos }) {
    return <Tabla columnas={['Identificador', 'Categoría', 'Tipo', 'Ámbito', 'Valor / Estado']} vacio="Sin símbolos (la tabla se llena al ejecutar sin errores léxicos ni sintácticos)"
        filas={simbolos?.map(s => [s.identificador, s.categoria, s.tipo, s.ambito, Array.isArray(s.valor) ? `[${s.valor.join(', ')}]` : String(s.valor)])} />
}

const colorEstado = { running: '#137333', stopped: '#b3261e', undeployed: '#8a6d00', failed: '#b3261e', degraded: '#8a6d00' }

function Tarjeta({ r, tipo }) {
    const { name, status, connections, ...props } = r
    return (
        <div className="resource-card">
            <strong>{name}</strong> <small style={{ color: '#777' }}>{tipo}</small>
            <div style={{ color: colorEstado[status] ?? '#333', fontWeight: 'bold' }}>● {status}</div>
            <div className="resource-details">
                {Object.entries(props).map(([k, v]) => <div key={k}>{k}: {Array.isArray(v) ? `[${v.join(', ')}]` : String(v)}</div>)}
                {connections?.length > 0 && <div>connections: [{connections.join(', ')}]</div>}
            </div>
        </div>
    )
}

export function InfraView({ infra }) {
    const grupos = [['servers', 'server'], ['services', 'service'], ['databases', 'database']]
    if (!grupos.some(([k]) => infra?.[k]?.length)) return <p className="empty-state">No hay recursos</p>
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {grupos.flatMap(([k, tipo]) => (infra[k] ?? []).map(r => <Tarjeta key={`${tipo}-${r.name}`} r={r} tipo={tipo} />))}
        </div>
    )
}

let vizPromise = null
const getViz = () => (vizPromise ??= instance())

function descargar(nombre, contenido, tipo) {
    const url = URL.createObjectURL(new Blob([contenido], { type: tipo }))
    const a = Object.assign(document.createElement('a'), { href: url, download: nombre })
    a.click()
    URL.revokeObjectURL(url)
}

export function AstView({ ast }) {
    const [svg, setSvg] = useState('')
    const [fallo, setFallo] = useState(null)
    const [zoom, setZoom] = useState(1)

    useEffect(() => {
        let vivo = true
        setFallo(null)
        if (!ast?.dot) { setSvg(''); return }
        // El árbol lo genera el backend (formato DOT); aquí solo se dibuja con Graphviz
        getViz().then(viz => { if (vivo) setSvg(viz.renderString(ast.dot, { format: 'svg' })) })
                .catch(e => vivo && setFallo(e.message))
        return () => { vivo = false }
    }, [ast])

    if (!ast) return <p className="empty-state">Sin AST (el parser no pudo construirlo)</p>
    return (
        <div>
            <p>
                <button onClick={() => setZoom(z => Math.min(z + 0.25, 4))}>＋</button>{' '}
                <button onClick={() => setZoom(z => Math.max(z - 0.25, 0.25))}>－</button>{' '}
                <button onClick={() => setZoom(1)}>100%</button>{' '}
                <button onClick={() => descargar('ast.dot', ast.dot, 'text/plain')}>Descargar .dot</button>{' '}
                <button onClick={() => descargar('ast.svg', svg, 'image/svg+xml')} disabled={!svg}>Descargar .svg</button>
                {ast.truncado && <span style={{ color: '#8a6d00', marginLeft: 8 }}>⚠ árbol recortado</span>}
            </p>
            {fallo && <p style={{ color: 'crimson' }}>No se pudo dibujar el AST: {fallo}</p>}
            <div style={{ overflow: 'auto', border: '1px solid #ccc', maxHeight: 520, background: '#fff' }}>
                <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: 'max-content' }} dangerouslySetInnerHTML={{ __html: svg }} />
            </div>
        </div>
    )
}

export function Resultados({ res, irA }) {
    const [pestana, setPestana] = useState('consola')
    const nErr = res.errors?.length ?? 0
    const pestanas = [
        ['consola', 'Consola'], ['errores', `Errores (${nErr})`], ['tokens', `Tokens (${res.tokens?.length ?? 0})`],
        ['simbolos', 'Símbolos'], ['ast', 'AST'], ['infra', 'Infraestructura'],
    ]
    return (
        <div>
            <div className="result-tabs">
                {pestanas.map(([k, t]) => (
                    <button key={k} onClick={() => setPestana(k)}
                        className={`${pestana === k ? 'active' : ''} ${k === 'errores' && nErr ? 'has-errors' : ''}`}>{t}</button>
                ))}
            </div>
            {pestana === 'consola' && <ConsolaPanel lineas={res.console} />}
            {pestana === 'errores' && <ErroresPanel errores={res.errors} irA={irA} />}
            {pestana === 'tokens' && <TokensTable tokens={res.tokens} />}
            {pestana === 'simbolos' && <SimbolosTable simbolos={res.symbols} />}
            {pestana === 'ast' && <AstView ast={res.ast} />}
            {pestana === 'infra' && <InfraView infra={res.infrastructure} />}
        </div>
    )
}

export default function App() {
    const [source, setSource] = useState(EJEMPLO)
    const [nombre, setNombre] = useState('sin_titulo.infra')
    const [modificado, setModificado] = useState(false)
    const [res, setRes] = useState(null)
    const [ms, setMs] = useState(null)
    const [cargando, setCargando] = useState(false)
    const [errorRed, setErrorRed] = useState(null)
    const editor = useRef(null)
    const abrirInput = useRef(null)

    const limpiar = () => { setRes(null); setMs(null); setErrorRed(null) }   // sin conservar reportes anteriores

    function nuevo() {
        if (modificado && !confirm('Hay cambios sin guardar. ¿Descartarlos?')) return
        setSource(''); setNombre('sin_titulo.infra'); setModificado(false); limpiar()
    }
    async function abrir(e) {
        const f = e.target.files?.[0]
        if (!f) return
        setSource(await f.text()); setNombre(f.name); setModificado(false); limpiar()
        e.target.value = ''
    }
    function guardar(como = false) {
        let n = nombre
        if (como) { n = prompt('Guardar como:', nombre); if (!n) return }
        if (!n.endsWith('.infra')) n += '.infra'
        descargar(n, source, 'text/plain'); setNombre(n); setModificado(false)
    }
    // Lleva el cursor del editor a la línea/columna de un error
    function irA(linea, columna) {
        const lineas = source.split('\n')
        const pos = lineas.slice(0, Math.max(linea - 1, 0)).reduce((a, l) => a + l.length + 1, 0) + Math.max(columna - 1, 0)
        editor.current?.focus()
        editor.current?.setSelectionRange(pos, pos + 1)
    }
    async function ejecutar() {
        setCargando(true); setErrorRed(null)
        const t0 = performance.now()
        try {
            const r = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ source }) })
            setRes(await r.json())
        } catch (e) {
            setErrorRed(e.message)   // fallo de RED (backend apagado, puerto equivocado, CORS...), distinto de un error del lenguaje
        } finally {
            setMs(Math.round(performance.now() - t0)); setCargando(false)
        }
    }

    return (
        <div className="app-shell">
            <header className="topbar">
                <div className="brand"><span className="brand-mark">⚡</span><div><strong>AutoInfra IDE</strong><small>Interpreter v1.0.0</small></div></div>
                <div className="toolbar">
                    <button className="button button-ghost" onClick={nuevo}>Nuevo</button>
                    <button className="button button-ghost" onClick={() => abrirInput.current?.click()}>↥ Abrir archivo</button>
                    <button className="button button-ghost" onClick={() => guardar(false)}>Guardar</button>
                    <button className="button button-primary" onClick={ejecutar} disabled={cargando}>
                        {cargando ? 'Ejecutando…' : '▶ Ejecutar'}
                    </button>
                </div>
                <input ref={abrirInput} type="file" accept=".infra,.txt" onChange={abrir} style={{ display: 'none' }} />
            </header>
            <main className="workspace">
                <section className="editor-column">
                    <div className="section-label"><span>&lt;/&gt;</span> SOURCE EDITOR <span className="file-name">{nombre}{modificado ? ' •' : ''}</span></div>
                    <div className="editor-frame">
                        <textarea ref={editor} value={source} onChange={e => { setSource(e.target.value); setModificado(true) }} spellCheck={false}
                            aria-label="Editor de código AutoInfra" />
                    </div>
                    {errorRed && <p className="network-error">No se pudo contactar al backend: {errorRed}. ¿Está corriendo en {API_URL}?</p>}
                </section>
                <aside className="results-column">
                    <div className="section-label"><span>›_</span> CONSOLE OUTPUT</div>
                    <div className="console-card">
                        {!res && !cargando && <span className="console-prompt">&gt; Waiting for execution...</span>}
                        {cargando && <span className="console-prompt">&gt; Running program...</span>}
                        {res && <ConsolaPanel lineas={res.console} />}
                    </div>
                    <div className="result-heading"><span>▦</span> SYMBOL TABLE / ERRORS</div>
                    {res ? <Resultados res={res} irA={irA} /> : <div className="empty-result">No data available</div>}
                </aside>
            </main>
            <footer className="statusbar">
                <span className="connected"><i /> backend connected: localhost:8081</span>
                <span>interpreter status: {cargando ? 'running' : 'ready'}</span>
                {res && <span className={res.success ? 'status-success' : 'status-error'}>{res.success ? '● execution successful' : `● ${res.errors?.length ?? 0} error(s)`}{ms != null && ` · ${ms} ms`}</span>}
                <span className="build-label">BUILD WITH REACT + VITE</span>
            </footer>
        </div>
    )
}