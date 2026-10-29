import React, { useMemo, useState } from 'react';
import { Building2, Database, Edit3, Loader2, MapPin, Phone, Plus, Search, ShieldCheck, Trash2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DocumentType, Supplier } from '../../types';
import { lookupIdentity } from '../../lib/identityLookup';

const emptyForm: Omit<Supplier, 'id'> = {
  companyName: '', docType: 'RUC', ruc: '', contactName: '', phone: '', alternatePhone: '', address: '', email: '', website: '', notes: '', active: true
};

const detectDocumentType = (document: string): DocumentType | null => {
  if (document.length === 8) return 'DNI';
  if (document.length === 11) return 'RUC';
  return null;
};

const supplierToForm = (supplier: Supplier): Omit<Supplier, 'id'> => ({
  companyName: supplier.companyName,
  docType: supplier.docType || (supplier.ruc.length === 8 ? 'DNI' : 'RUC'),
  ruc: supplier.ruc,
  contactName: supplier.contactName || '',
  phone: supplier.phone || '',
  alternatePhone: supplier.alternatePhone || '',
  address: supplier.address || '',
  email: supplier.email || '',
  website: supplier.website || '',
  notes: supplier.notes || '',
  active: supplier.active !== false,
});

export const SupplierManager: React.FC = () => {
  const { suppliers, customers, purchases, addSupplier, updateSupplier, deleteSupplier } = useApp();
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [lookupState, setLookupState] = useState<{ status: 'idle' | 'loading' | 'success' | 'error'; message: string }>({ status: 'idle', message: '' });

  const rows = useMemo(() => suppliers.filter(s => {
    const text = `${s.companyName} ${s.ruc} ${s.contactName || ''} ${s.email || ''} ${s.phone || ''}`.toLowerCase();
    return text.includes(search.toLowerCase());
  }), [suppliers, search]);

  const openNew = () => { setEditingId(null); setForm(emptyForm); setLookupState({ status: 'idle', message: '' }); setIsOpen(true); };
  const openEdit = (supplier: Supplier) => {
    setEditingId(supplier.id);
    setLookupState({ status: 'idle', message: '' });
    setForm(supplierToForm(supplier));
    setIsOpen(true);
  };

  const loadFromStoredRecords = (document: string, docType: DocumentType): boolean => {
    const storedSupplier = suppliers.find(supplier => supplier.ruc === document && supplier.id !== editingId);
    if (storedSupplier) {
      if (editingId) {
        setLookupState({ status: 'error', message: 'Este documento ya pertenece a otro proveedor.' });
        return true;
      }
      setEditingId(storedSupplier.id);
      setForm(supplierToForm(storedSupplier));
      setLookupState({ status: 'success', message: 'Proveedor ya registrado. Se cargó su ficha para editarla sin consultar la API.' });
      return true;
    }

    const customer = customers.find(item => item.docNumber === document);
    if (!customer) return false;
    const fullName = `${customer.name} ${customer.lastName || ''}`.trim();
    setForm(current => ({
      ...current,
      docType,
      ruc: document,
      companyName: fullName || current.companyName,
      contactName: customer.contactName || current.contactName,
      phone: customer.phone || current.phone,
      alternatePhone: customer.alternatePhone || current.alternatePhone,
      email: customer.email || current.email,
      address: customer.address || customer.location || current.address,
      notes: customer.notes || current.notes,
    }));
    setLookupState({ status: 'success', message: 'Datos recuperados de Clientes. No se consumió una consulta de la API.' });
    return true;
  };

  const handleDocumentLookup = async () => {
    const document = form.ruc.replace(/\D/g, '');
    const docType = detectDocumentType(document);
    if (!docType) {
      setLookupState({ status: 'error', message: 'Ingresa un DNI de 8 dígitos o un RUC de 11 dígitos.' });
      return;
    }

    setForm(current => ({ ...current, ruc: document, docType }));
    if (loadFromStoredRecords(document, docType)) return;

    setLookupState({ status: 'loading', message: `Consultando ${docType} en el servicio externo…` });
    try {
      if (docType === 'DNI') {
        const data = await lookupIdentity('dni', document);
        const fullName = [data.nombres, data.apellidoPaterno, data.apellidoMaterno].filter(Boolean).join(' ').trim();
        if (!fullName) throw new Error('El servicio respondió, pero no devolvió el nombre del titular.');
        setForm(current => ({ ...current, docType, ruc: data.dni || document, companyName: fullName }));
        setLookupState({ status: 'success', message: 'Titular encontrado. Completa teléfono y dirección para guardar.' });
      } else {
        const data = await lookupIdentity('ruc', document);
        if (!data.razonSocial) throw new Error('El servicio respondió, pero no devolvió la razón social.');
        const location = [data.distrito, data.provincia, data.departamento].filter(Boolean).join(' · ');
        setForm(current => ({
          ...current,
          docType,
          ruc: data.ruc || document,
          companyName: data.razonSocial,
          address: data.direccion || location || current.address,
          phone: current.phone || data.telefonos?.[0] || '',
          notes: current.notes || [data.estado && `Estado: ${data.estado}`, data.condicion && `Condición: ${data.condicion}`].filter(Boolean).join(' · '),
        }));
        setLookupState({ status: 'success', message: 'Datos tributarios encontrados. Revisa teléfono y dirección antes de guardar.' });
      }
    } catch (error) {
      setLookupState({ status: 'error', message: error instanceof Error ? error.message : `No se pudo consultar el ${docType}.` });
    }
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const document = form.ruc.replace(/\D/g, '');
    const docType = detectDocumentType(document);
    if (!docType) {
      setLookupState({ status: 'error', message: 'El documento debe ser un DNI de 8 dígitos o un RUC de 11 dígitos.' });
      return;
    }
    if (suppliers.some(supplier => supplier.ruc === document && supplier.id !== editingId)) {
      setLookupState({ status: 'error', message: 'Ya existe un proveedor con este documento.' });
      return;
    }
    const cleanForm = {
      ...form,
      docType,
      ruc: document,
      companyName: form.companyName.trim(),
      phone: form.phone?.trim(),
      address: form.address?.trim(),
      email: form.email?.trim(),
    };
    if (editingId) {
      updateSupplier(editingId, cleanForm);
      setIsOpen(false);
      return;
    }

    setIsSaving(true);
    try {
      const saved = await addSupplier(cleanForm);
      if (saved) setIsOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const detectedType = detectDocumentType(form.ruc);

  return (
    <div className="space-y-5">
      <section className="page-header">
        <div>
          <div className="eyebrow">Directorio comercial</div>
          <h1 className="page-title"><Building2 className="h-5 w-5 text-emerald-600" /> Proveedores</h1>
          <p className="page-subtitle">Registra empresas o personas con DNI/RUC antes de ingresar sus compras.</p>
        </div>
        <button className="btn-primary" onClick={openNew}><Plus className="h-4 w-4" /> Nuevo proveedor</button>
      </section>

      <section className="card overflow-hidden">
        <div className="border-b border-slate-200 p-4 dark:border-slate-800">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input className="field pl-9" placeholder="Buscar por nombre, DNI/RUC o contacto" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Proveedor</th><th>Documento</th><th>Contacto</th><th>Ubicación</th><th>Compras</th><th className="text-right">Acciones</th></tr></thead>
            <tbody>
              {rows.map(s => {
                const count = purchases.filter(p => p.supplierId === s.id).length;
                return <tr key={s.id}>
                  <td><div className="font-semibold text-slate-900 dark:text-white">{s.companyName}</div><div className="text-[11px] text-slate-500">{s.email || 'Sin correo registrado'}</div></td>
                  <td><div className="text-[10px] font-bold text-slate-500">{s.docType || (s.ruc.length === 8 ? 'DNI' : 'RUC')}</div><div className="font-mono">{s.ruc}</div></td>
                  <td><div>{s.contactName || '—'}</div><div className="flex items-center gap-1 text-[11px] text-slate-500"><Phone className="h-3 w-3" />{s.phone || 'Sin teléfono'}{s.alternatePhone ? ` · ${s.alternatePhone}` : ''}</div></td>
                  <td><span className="flex items-center gap-1 text-slate-600 dark:text-slate-300"><MapPin className="h-3.5 w-3.5" />{s.address || 'No indicada'}</span></td>
                  <td><span className="badge-neutral">{count} compra{count === 1 ? '' : 's'}</span></td>
                  <td><div className="flex justify-end gap-1"><button className="icon-button" title="Editar" onClick={() => openEdit(s)}><Edit3 className="h-4 w-4" /></button><button className="icon-button danger" title="Eliminar" onClick={() => deleteSupplier(s.id)}><Trash2 className="h-4 w-4" /></button></div></td>
                </tr>;
              })}
              {!rows.length && <tr><td colSpan={6} className="empty-state">No hay proveedores que coincidan con la búsqueda.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {isOpen && <div className="modal-backdrop"><div className="modal-panel max-w-2xl">
        <div className="modal-header"><div><div className="eyebrow">Datos del proveedor</div><h2 className="text-lg font-bold">{editingId ? 'Editar proveedor' : 'Nuevo proveedor'}</h2></div><button className="icon-button" onClick={() => setIsOpen(false)}><X className="h-5 w-5" /></button></div>
        <form onSubmit={save} className="space-y-4 p-5">
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-[11px] text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">Nombre, documento, teléfono principal y dirección son obligatorios. Primero reutilizamos los datos ya guardados para evitar consultas duplicadas.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="form-label" htmlFor="supplier-ruc">Documento (DNI o RUC) *</label>
              <div className="mt-1 flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <input id="supplier-ruc" className="field mt-0 pr-20 font-mono" required inputMode="numeric" minLength={8} maxLength={11} placeholder="8 dígitos para DNI · 11 para RUC" value={form.ruc} onChange={e => { const document = e.target.value.replace(/\D/g, '').slice(0, 11); const type = detectDocumentType(document); setForm({ ...form, ruc: document, docType: type || form.docType }); setLookupState({ status: 'idle', message: '' }); }} />
                  {detectedType && <span className="absolute right-2 top-2 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">{detectedType}</span>}
                </div>
                <button type="button" className="btn-secondary shrink-0" onClick={handleDocumentLookup} disabled={lookupState.status === 'loading'}>
                  {lookupState.status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Buscar datos
                </button>
              </div>
              <p className={`mt-1.5 text-[11px] ${lookupState.status === 'error' ? 'text-rose-600' : lookupState.status === 'success' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500'}`}>
                {lookupState.message || 'Detectamos DNI/RUC. Primero buscamos en Clientes y Proveedores; la API se usa solo si no existe.'}
              </p>
            </div>
            <label className="form-label sm:col-span-2">Nombre completo / Razón social *<input className="field" required autoComplete="organization" value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} /></label>
            <label className="form-label">Persona de contacto <span className="font-normal text-slate-400">(opcional)</span><input className="field" value={form.contactName} onChange={e => setForm({ ...form, contactName: e.target.value })} /></label>
            <label className="form-label">Teléfono principal *<input className="field" required type="tel" autoComplete="tel" placeholder="Ej. 987 654 321" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></label>
            <label className="form-label sm:col-span-2">Dirección fiscal o de recojo *<input className="field" required autoComplete="street-address" placeholder="Av., calle, distrito y referencia" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></label>
            <div className="sm:col-span-2 flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-[11px] text-sky-800 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-300"><Database className="h-4 w-4 shrink-0" /> Los siguientes datos ayudan al seguimiento, pero no bloquean el registro.</div>
            <label className="form-label">Teléfono alternativo <span className="font-normal text-slate-400">(opcional)</span><input className="field" type="tel" value={form.alternatePhone} onChange={e => setForm({ ...form, alternatePhone: e.target.value })} /></label>
            <label className="form-label">Correo <span className="font-normal text-slate-400">(opcional)</span><input className="field" type="email" autoComplete="email" placeholder="ventas@proveedor.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label>
            <label className="form-label sm:col-span-2">Sitio web <span className="font-normal text-slate-400">(opcional)</span><input className="field" type="url" placeholder="https://proveedor.com" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} /></label>
            <label className="form-label sm:col-span-2">Notas <span className="font-normal text-slate-400">(opcional)</span><textarea className="field min-h-20" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></label>
          </div>
          <div className="modal-actions"><button type="button" className="btn-secondary" onClick={() => setIsOpen(false)} disabled={isSaving}>Cancelar</button><button className="btn-primary" disabled={isSaving}>{isSaving ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando…</> : editingId ? 'Guardar cambios' : 'Crear proveedor'}</button></div>
        </form>
      </div></div>}
    </div>
  );
};
