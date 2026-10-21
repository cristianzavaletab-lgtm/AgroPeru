import { Customer, Sale } from '../../types';

const escapeHtml = (value: unknown) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const money = (value: number) => value.toLocaleString('es-PE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const date = (value: string) => {
  const [year, month, day] = value.split('-');
  return year && month && day ? `${day}/${month}/${year}` : value;
};

export const printSaleDocument = (sale: Sale, customer?: Customer): boolean => {
  const popup = window.open('', '_blank', 'width=980,height=820');
  if (!popup) return false;

  const kind = sale.documentType === 'FACTURA' ? 'FACTURA ELECTRÓNICA'
    : sale.documentType === 'BOLETA' ? 'BOLETA DE VENTA ELECTRÓNICA'
      : sale.documentType === 'PROFORMA' ? 'PROFORMA COMERCIAL' : 'DETALLE INTERNO DE VENTA';
  const documentNumber = sale.documentNumber || sale.proformaNumber;
  const isTaxDocument = sale.documentType === 'FACTURA' || sale.documentType === 'BOLETA';
  const notice = isTaxDocument
    ? 'DOCUMENTO DE PRUEBA · SIN VALIDEZ TRIBUTARIA · NO ENVIADO A SUNAT'
    : sale.documentType === 'PROFORMA'
      ? 'PROFORMA REFERENCIAL · NO ES COMPROBANTE DE PAGO'
      : 'DOCUMENTO INTERNO · VENTA REGISTRADA SIN COMPROBANTE';
  const grossAmount = sale.items.reduce((sum, item) => sum + item.total, 0);
  const adjustment = sale.totalAmount - grossAmount;
  const taxableAmount = sale.totalAmount / 1.18;
  const taxAmount = sale.totalAmount - taxableAmount;
  const rows = sale.items.map((item, index) => `
    <tr>
      <td class="center">${index + 1}</td>
      <td><strong>${escapeHtml(item.productName)}</strong><small>${escapeHtml(item.lotNumber ? `Lote: ${item.lotNumber}` : 'Salida FIFO')}</small></td>
      <td class="number">${money(item.quantity)}</td>
      <td class="number">S/ ${money(item.unitPrice)}</td>
      <td class="number strong">S/ ${money(item.total)}</td>
    </tr>`).join('');

  popup.document.write(`<!doctype html>
  <html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(kind)} ${escapeHtml(documentNumber)}</title>
  <style>
    :root{--green:#087a4f;--green-dark:#064c36;--lime:#35ae45;--ink:#152238;--muted:#607089;--line:#dce5e1;--soft:#f3f8f5}
    *{box-sizing:border-box}body{margin:0;background:#e8eeeb;color:var(--ink);font:13px Inter,Arial,sans-serif}.sheet{position:relative;width:210mm;min-height:297mm;margin:18px auto;background:#fff;padding:15mm 17mm 13mm;box-shadow:0 20px 55px #10251d25;overflow:hidden}.sheet:before{content:"";position:absolute;left:0;top:0;width:100%;height:7px;background:linear-gradient(90deg,var(--green-dark),var(--green),var(--lime))}.top{display:flex;justify-content:space-between;gap:26px;align-items:center;padding-bottom:15px;border-bottom:1px solid var(--line)}.brand{flex:1}.brand img{display:block;width:275px;max-width:100%;max-height:105px;object-fit:contain;object-position:left center}.company{margin-top:7px;color:var(--muted);font-size:11px;line-height:1.45}.doc{width:285px;border:2px solid var(--green);border-radius:14px;overflow:hidden;text-align:center}.doc .kind{padding:12px;background:var(--green);color:#fff;font-size:16px;font-weight:800;letter-spacing:.04em}.doc .number{padding:15px;font:800 21px ui-monospace,Consolas,monospace;color:var(--green-dark)}.notice{margin:16px 0;border:1px solid #e8b84c;background:#fff9e8;color:#855b08;border-radius:9px;padding:9px 13px;text-align:center;font-size:11px;font-weight:800;letter-spacing:.035em}.meta{display:grid;grid-template-columns:1.4fr 1fr;gap:12px;margin:15px 0}.box{border:1px solid var(--line);border-radius:10px;padding:12px 14px;min-height:92px}.label{font-size:9px;color:var(--green);text-transform:uppercase;font-weight:800;letter-spacing:.1em;margin-bottom:6px}.value{font-size:15px;font-weight:800;line-height:1.35}.detail{margin-top:4px;color:var(--muted);line-height:1.5}table{width:100%;border-collapse:separate;border-spacing:0;margin-top:16px;border:1px solid var(--line);border-radius:11px;overflow:hidden}th{background:var(--soft);color:#456055;font-size:9px;text-transform:uppercase;text-align:left;padding:11px 10px;border-bottom:1px solid var(--line);letter-spacing:.06em}td{padding:12px 10px;border-bottom:1px solid #e8eeeb}tbody tr:last-child td{border-bottom:0}td small{display:block;color:#7a897f;margin-top:4px;font-size:10px}.number{text-align:right}.center{text-align:center}.strong{font-weight:800}.bottom{display:flex;align-items:flex-start;justify-content:space-between;gap:25px;margin-top:18px}.payment{flex:1;border-left:4px solid var(--green);background:var(--soft);border-radius:7px;padding:11px 13px;color:#486056;line-height:1.55}.summary{width:305px}.summary div{display:flex;justify-content:space-between;padding:6px 2px}.summary .adjustment{color:#8b5d09}.summary .total{border-top:2px solid var(--green-dark);margin-top:5px;padding-top:11px;color:var(--green-dark);font-size:18px;font-weight:900}.notes{margin-top:25px;border-top:1px solid var(--line);padding-top:13px;color:var(--muted);font-size:11px;line-height:1.6}.signatures{display:grid;grid-template-columns:1fr 1fr;gap:80px;margin-top:55px}.signature{border-top:1px solid #82908a;padding-top:6px;text-align:center;color:var(--muted);font-size:10px}.footer{position:absolute;left:17mm;right:17mm;bottom:10mm;display:flex;justify-content:space-between;border-top:1px solid var(--line);padding-top:8px;color:#718078;font-size:9px}.actions{position:fixed;right:24px;bottom:24px}.actions button{border:0;border-radius:11px;background:var(--green);color:#fff;font-weight:800;padding:13px 19px;box-shadow:0 8px 24px #087a4f40;cursor:pointer}@media(max-width:850px){.sheet{width:100%;min-height:100vh;margin:0;padding:25px 18px}.top,.bottom{flex-direction:column}.doc,.summary{width:100%}.meta{grid-template-columns:1fr}.footer{position:static;margin-top:45px}.actions{right:12px;bottom:12px}}@media print{body{background:#fff}.sheet{margin:0;box-shadow:none;width:auto;min-height:297mm;padding:10mm 13mm}.actions{display:none}.footer{left:13mm;right:13mm;bottom:7mm}@page{size:A4;margin:0}}
  </style></head><body>
    <main class="sheet">
      <section class="top"><div class="brand"><img src="${window.location.origin}/logo-agroimportadora.png" alt="Agroimportadora Perú E.I.R.L."><div class="company">Fertilizantes y agroquímicos · Gestión comercial e inventario</div></div><div class="doc"><div class="kind">${escapeHtml(kind)}</div><div class="number">${escapeHtml(documentNumber)}</div></div></section>
      <div class="notice">${escapeHtml(notice)}</div>
      <section class="meta">
        <div class="box"><div class="label">Cliente</div><div class="value">${escapeHtml(sale.customerName)}</div><div class="detail">${escapeHtml(customer ? `${customer.docType}: ${customer.docNumber}` : 'Documento no registrado')}<br>${escapeHtml(customer?.address || 'Dirección no registrada')}</div></div>
        <div class="box"><div class="label">Datos de operación</div><div class="detail"><strong>Fecha:</strong> ${escapeHtml(date(sale.saleDate))}<br><strong>Forma de pago:</strong> ${escapeHtml(sale.paymentMethod || sale.status)}<br><strong>Operación:</strong> ${escapeHtml(sale.proformaNumber)}</div></div>
      </section>
      <table><thead><tr><th class="center">Ítem</th><th>Descripción</th><th class="number">Cantidad</th><th class="number">Precio unit.</th><th class="number">Importe</th></tr></thead><tbody>${rows}</tbody></table>
      <section class="bottom"><div class="payment"><strong>Estado de pago</strong><br>Cobrado: S/ ${money(sale.paidAmount)}<br>Saldo: S/ ${money(Math.max(0, sale.totalAmount - sale.paidAmount))}</div><div class="summary"><div><span>Subtotal de productos</span><strong>S/ ${money(grossAmount)}</strong></div>${Math.abs(adjustment) > 0.009 ? `<div class="adjustment"><span>Ajuste comercial</span><strong>S/ ${money(adjustment)}</strong></div>` : ''}${isTaxDocument ? `<div><span>Op. gravada referencial</span><strong>S/ ${money(taxableAmount)}</strong></div><div><span>IGV referencial (18%)</span><strong>S/ ${money(taxAmount)}</strong></div>` : ''}<div class="total"><span>Total</span><span>S/ ${money(sale.totalAmount)}</span></div></div></section>
      <section class="notes"><strong>Observaciones:</strong> ${escapeHtml(sale.notes || 'Sin observaciones.')}${isTaxDocument ? '<br>Los importes tributarios son referenciales mientras se completa la integración con SUNAT.' : ''}</section>
      <section class="signatures"><div class="signature">Entregado por</div><div class="signature">Recibido conforme</div></section>
      <footer class="footer"><span>Agroimportadora Perú E.I.R.L.</span><span>Documento generado por el sistema ERP</span></footer>
    </main>
    <div class="actions"><button onclick="window.print()">Imprimir / Guardar PDF</button></div>
  </body></html>`);
  popup.document.close();
  popup.focus();
  return true;
};
