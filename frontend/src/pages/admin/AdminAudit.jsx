import { useState, useEffect, useMemo } from 'react';
import { adminAPI } from '../../api/api';

const timeCutoff = (range) => {
  const now = Date.now();
  if (range === '24h') return now - 24 * 60 * 60 * 1000;
  if (range === '7d') return now - 7 * 24 * 60 * 60 * 1000;
  if (range === '30d') return now - 30 * 24 * 60 * 60 * 1000;
  return 0; // all time
};

const formatPrice = (v) => {
  if (v === null || v === undefined || v === '') return '—';
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return `₱${n.toFixed(2)}`;
};

const AuditBadge = ({ action }) => {
  const a = (action || '').toLowerCase();
  let cls = 'info';
  if (a.includes('price')) cls = 'price';
  else if (a.includes('stock')) cls = 'stock';
  
  return <span className={`audit-badge badge-${cls}`}>{action.replace(/_/g, ' ')}</span>;
};

const AdminAudit = () => {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [range, setRange] = useState('30d');
  const [productNames, setProductNames] = useState({});
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const fetchAudits = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAudit({ limit: 1000 });
      setAudits(res.data || []);
    } catch (e) {
      console.error('fetch audits', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAudits(); }, []);

  // Fetch product names for audit rows that only include entity_id
  useEffect(() => {
    if (!audits || audits.length === 0) return;
    const idsToFetch = new Set();
    audits.forEach((a) => {
      if (!a) return;
      const et = (a.entity_type || '').toLowerCase();
      const id = a.entity_id;
      if (!id) return;
      // only target product entity types and when details lack a name
      if (et.includes('product')) {
        let details = {};
        try { details = a.details ? (typeof a.details === 'string' ? JSON.parse(a.details) : a.details) : {}; } catch { details = {}; }
        const hasName = details.product_name || details.product_title || details.name || details.title;
        if (!hasName && !productNames[id]) idsToFetch.add(id);
      }
    });

    if (idsToFetch.size === 0) return;

    let cancelled = false;
    (async () => {
      for (const id of idsToFetch) {
        try {
          const res = await adminAPI.getProduct(id);
          // adminAPI.getProduct may return product object directly or in `data`
          const prod = res && res.product_id ? res : (res && res.data ? res.data : res);
          const name = prod?.product_name || prod?.product_title || prod?.name || prod?.title || `Product #${id}`;
          if (!cancelled) setProductNames((p) => ({ ...p, [id]: name }));
        } catch (e) {
          // ignore failures; leave fallback as Product #id
        }
      }
    })();

    return () => { cancelled = true; };
  }, [audits]);

  const stats = useMemo(() => {
    const total = audits.length;
    const price = audits.filter(a => (a.action || '').toLowerCase().includes('price')).length;
    const stock = audits.filter(a => (a.action || '').toLowerCase().includes('stock')).length;
    return { total, price, stock };
  }, [audits]);

  const filtered = useMemo(() => {
    const cutoff = timeCutoff(range);
    return audits.filter((a) => {
      if (!a) return false;
      
      // Time Filter
      if (cutoff && a.created_at) {
        const t = new Date(a.created_at).getTime();
        if (t < cutoff) return false;
      }
      
      // Event Type Filter
      if (eventFilter !== 'all') {
        const act = (a.action || '').toLowerCase();
        if (eventFilter === 'price' && !act.includes('price')) return false;
        if (eventFilter === 'stock' && !act.includes('stock')) return false;
      }
      
      // Search Filter
      if (q && q.trim()) {
        const s = q.trim().toLowerCase();
        let detailsStr = '';
        try { 
            detailsStr = a.details ? JSON.stringify(typeof a.details === 'string' ? JSON.parse(a.details) : a.details) : ''; 
        } catch { 
            detailsStr = String(a.details || ''); 
        }
        // include resolved product name (from details or cached productNames) in the search haystack
        let detailsObj = {};
        try { detailsObj = a.details ? (typeof a.details === 'string' ? JSON.parse(a.details) : a.details) : {}; } catch { detailsObj = {}; }
        const resolvedProductName = detailsObj.product_name || detailsObj.product_title || detailsObj.name || detailsObj.title || productNames[a.entity_id] || '';
        const hay = `${a.actor_email || ''} ${a.entity_type || ''} ${a.entity_id || ''} ${resolvedProductName} ${detailsStr}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    }).sort((x,y)=> new Date(y.created_at) - new Date(x.created_at));
  }, [audits, q, eventFilter, range, productNames]);

  // reset to first page whenever filters/search change
  useEffect(() => {
    setPage(1);
  }, [q, eventFilter, range, audits]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className="container admin-audit-page" style={{ paddingBottom: '80px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}></div>
      <h2>Audit Logs</h2>
      {/* Stats Row */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-icon audit-total">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M2 12h20"/></svg>
          </div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Events</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon audit-price">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>
          </div>
          <div className="stat-info">
            <h3>{stats.price}</h3>
            <p>Price Changes</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon audit-stock">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          </div>
          <div className="stat-info">
            <h3>{stats.stock}</h3>
            <p>Stock Adjustments</p>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="audit-controls">
        <div className="audit-search-wrapper">
          <input 
            className="main-search-input" 
            style={{ width: '100%', maxWidth: '100%', margin: 0, padding: '10px 15px', fontSize: '0.9rem' }}
            placeholder="Search by SKU, Product Name, or User Email..." 
            value={q} 
            onChange={e=>setQ(e.target.value)} 
          />
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select className="audit-filter-select" value={eventFilter} onChange={e=>setEventFilter(e.target.value)}>
            <option value="all">All Event Types</option>
            <option value="price">Price Changes</option>
            <option value="stock">Stock Updates</option>
          </select>

          <div className="time-filter-group" style={{ display: 'flex' }}>
            {['24h','7d','30d','all'].map(r=> (
              <button 
                key={r} 
                className={`time-filter-btn ${range===r? 'active':''}`} 
                onClick={()=>setRange(r)}
              >
                {r==='all'?'All Time':r.toUpperCase()}
              </button>
            ))}
          </div>

          <button className="btn btn-secondary btn-small" onClick={fetchAudits} style={{ marginLeft: 10 }}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Table Data */}
      <div className="audit-table-wrapper">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>Loading audit logs...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>No audit records found matching your criteria.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="dali-audit-table">
              <thead>
                <tr>
                  <th style={{ width: '15%' }}>Timestamp</th>
                  <th style={{ width: '20%' }}>User</th>
                  <th style={{ width: '10%' }}>Action</th>
                  <th style={{ width: '25%' }}>Product / SKU</th>
                  <th style={{ width: '10%' }}>Before</th>
                  <th style={{ width: '10%' }}>After</th>
                  <th style={{ width: '10%' }}>Delta</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((a) => {
                  let details = {};
                  try { 
                    details = a.details ? (typeof a.details === 'string' ? JSON.parse(a.details) : a.details) : {}; 
                  } catch { 
                    details = { raw: a.details }; 
                  }
                  
                  const actor = details.actor_name || a.actor_email || 'System';
                  const isOrder = (a.entity_type || '').toLowerCase().includes('order');
                  const productFromDetails = details.product_name || details.product_title || details.name || details.product || details.title || details.sku;
                  const orderLabel = isOrder ? `Order #${a.entity_id || ''}` : '';
                  const product = productFromDetails || orderLabel || productNames[a.entity_id] || `${a.entity_type || 'Item'} ${a.entity_id? `#${a.entity_id}`:''}`;
                  
                  // Extract values based on naming conventions (support several key names)
                  const actionLower = (a.action || '').toLowerCase();
                  let before;
                  let after;
                  if (isOrder) {
                    // For orders, show status changes
                    before = details.old_status || details.before || '';
                    after = details.new_status || details.after || '';
                  } else if (actionLower.includes('create')) {
                    // New product: before defaults to 0, after should prefer created quantity
                    before = details.old_quantity ?? details.old_qty ?? details.old_value ?? details.old_price ?? 0;
                    after = details.new_quantity ?? details.quantity ?? details.product_quantity ?? details.new_value ?? details.new_price ?? details.price ?? '';
                  } else if (actionLower.includes('discount')) {
                    // For discount updates, use old_discount/new_discount or before/after
                    before = details.before ?? details.old_discount ?? details.old_value ?? '';
                    after = details.after ?? details.new_discount ?? details.new_value ?? '';
                  } else {
                    before = details.before ?? details.old_value ?? details.old_price ?? details.old_stock ?? details.old_quantity ?? details.old_qty ?? details.price ?? details.quantity ?? '';
                    after = details.after ?? details.new_value ?? details.new_price ?? details.new_stock ?? details.new_quantity ?? details.new_qty ?? details.price ?? details.quantity ?? '';
                  }
                  const isPrice = actionLower.includes('price') || actionLower.includes('discount');
                  const isStock = actionLower.includes('stock');

                  const delta = (()=>{
                    if (before === '' || after === '') return '';
                    const nb = Number(before); const na = Number(after);
                    if (!Number.isNaN(nb) && !Number.isNaN(na)) return (na - nb);
                    return '';
                  })();

                  return (
                    <tr key={a.audit_id}>
                      <td style={{ color: '#666', fontSize: '0.85rem' }}>
                        {a.created_at ? new Date(a.created_at).toLocaleString('en-PH', { 
                          timeZone: 'Asia/Manila',
                          year: 'numeric', month: 'short', day: 'numeric', 
                          hour: '2-digit', minute: '2-digit' 
                        }) : ''}
                      </td>
                      <td>
                        <div className="audit-user-cell">
                          <div className="audit-avatar">
                            {(actor||'S').charAt(0).toUpperCase()}
                          </div>
                          <div className="audit-user-info">
                             <div>{actor.split('@')[0]}</div>
                             {a.actor_email && <div>{a.actor_email}</div>}
                          </div>
                        </div>
                      </td>
                      <td><AuditBadge action={a.action || ''} /></td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#333' }}>{product}</div>
                        {details.sku && <div style={{ fontSize: '0.75rem', color: '#888', fontFamily: 'monospace' }}>SKU: {details.sku}</div>}
                      </td>
                      <td className="diff-val">
                        {before === '' || before === null || before === undefined ? '—' : isPrice ? formatPrice(before) : String(before)}
                      </td>
                      <td className="diff-val">
                        {after === '' || after === null || after === undefined ? '—' : isPrice ? formatPrice(after) : String(after)}
                      </td>
                      <td className="diff-val">
                        {delta !== '' && !Number.isNaN(delta) ? (
                          <span className={delta > 0 ? 'diff-up' : delta < 0 ? 'diff-down' : 'diff-neutral'}>
                            {delta > 0 ? '↑ ' : delta < 0 ? '↓ ' : ''}
                            {isPrice ? formatPrice(Math.abs(delta)) : Math.abs(delta)}
                          </span>
                        ) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
{/* Pagination Controls */}
<div style={{ 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  padding: '10px 24px 24px 24px', // Top, Right, Bottom, Left
  marginTop: '12px'
}}>
  <div style={{ color: '#606770', fontSize: '0.95rem' }}>
    Showing {(filtered.length === 0) ? 0 : ( (page - 1) * itemsPerPage + 1 )} - {Math.min(page * itemsPerPage, filtered.length)} of {filtered.length}
  </div>
  
  <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
    <button 
      className="btn" 
      style={{
        padding: '8px 24px',
        borderRadius: '30px',
        border: 'none',
        backgroundColor: '#f8f9fa',
        color: page <= 1 ? '#bfc4c9' : '#444',
        cursor: page <= 1 ? 'not-allowed' : 'pointer',
        fontSize: '0.9rem',
        fontWeight: '500'
      }}
      disabled={page <= 1} 
      onClick={() => setPage(p => Math.max(1, p - 1))}
    >
      Prev
    </button>

    <div style={{ fontSize: '0.95rem', color: '#1c1e21' }}>
      Page {page} of {totalPages}
    </div>

    <button 
      className="btn" 
      style={{
        padding: '8px 24px',
        borderRadius: '30px',
        border: 'none',
        backgroundColor: '#f8f9fa',
        color: page >= totalPages ? '#bfc4c9' : '#000',
        fontWeight: 'bold',
        cursor: page >= totalPages ? 'not-allowed' : 'pointer',
        fontSize: '0.9rem'
      }}
      disabled={page >= totalPages} 
      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
    >
      Next
    </button>
  </div>
  </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAudit;