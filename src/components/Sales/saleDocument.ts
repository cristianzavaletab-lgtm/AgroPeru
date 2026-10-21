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
  const popup = window.open('', '_blank', 'width=920,height=760');
  if (!popup) return false;

  const kind = sale.documentType === 'FACTURA' ? 'FACTURA ELECTRÓNICA'
    : sale.documentType === 'BOLETA' ? 'BOLETA DE VENTA ELECTRÓNICA'
      : sale.documentType === 'PROFORMA' ? 'PROFORMA' : 'DETALLE DE VENTA';
  const documentNumber = sale.documentNumber || sale.proformaNumber;
  const taxableAmount = sale.totalAmount / 1.18;
  const taxAmount = sale.totalAmount - taxableAmount;
  const rows = sale.items.map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${escapeHtml(item.productName)}<small>${escapeHtml(item.lotNumber ? `Lote: ${item.lotNumber}` : 'Salida FIFO')}</small></td>
      <td class="number">${money(item.quantity)}</td>
      <td class="number">S/ ${money(item.unitPrice)}</td>
      <td class="number strong">S/ ${money(item.total)}</td>
    </tr>`).join('');

  popup.document.write(`<!doctype html>
  <html lang="es"><head><meta charset="utf-8"><title>${escapeHtml(kind)} ${escapeHtml(documentNumber)}</title>
  <style>
    *{box-sizing:border-box} body{margin:0;background:#eef2f6;color:#172033;font:14px Arial,sans-serif}.sheet{width:210mm;min-height:297mm;margin:18px auto;background:#fff;padding:18mm;box-shadow:0 18px 50px #17203322}.top{display:flex;justify-content:space-between;gap:28px;align-items:flex-start}.brand img{width:210px;max-height:78px;object-fit:contain;object-position:left}.brand p{margin:8px 0 0;color:#526078;line-height:1.5}.doc{width:310px;border:2px solid #078a63;border-radius:14px;padding:18px;text-align:center}.doc .kind{font-weight:800;font-size:18px;color:#056b4f}.doc .number{font:800 22px monospace;margin-top:10px}.test{margin:22px 0 16px;border:1px solid #f59e0b;background:#fffbeb;color:#92400e;border-radius:10px;padding:10px 14px;text-align:center;font-weight:700}.meta{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:18px 0}.box{border:1px solid #d9e1ea;border-radius:10px;padding:12px}.label{font-size:10px;color:#66758d;text-transform:uppercase;font-weight:700;letter-spacing:.06em;margin-bottom:5px}.value{font-weight:700;line-height:1.4}table{width:100%;border-collapse:collapse;margin-top:18px}th{background:#f3f6f8;color:#526078;font-size:10px;text-transform:uppercase;text-align:left;padding:11px;border-bottom:1px solid #d9e1ea}td{padding:12px 11px;border-bottom:1px solid #e7ecf1}td small{display:block;color:#7b8798;margin-top:4px}.number{text-align:right}.strong{font-weight:800}.summary{margin:18px 0 0 auto;width:310px}.summary div{display:flex;justify-content:space-between;padding:7px 2px}.summary .total{border-top:2px solid #172033;margin-top:5px;padding-top:12px;font-size:18px;font-weight:800}.notes{margin-top:28px;border-top:1px solid #d9e1ea;padding-top:16px;color:#526078;line-height:1.6}.footer{margin-top:45px;text-align:center;color:#7b8798;font-size:11px}.actions{position:fixed;right:24px;bottom:24px}.actions button{border:0;border-radius:10px;background:#078a63;color:#fff;font-weight:700;padding:12px 18px;cursor:pointer}@media print{body{background:#fff}.sheet{margin:0;box-shadow:none;width:auto;min-height:auto;padding:10mm}.actions{display:none}@page{size:A4;margin:0}}
  </style></head><body>
    <main class="sheet">
      <section class="top"><div class="brand"><img src="${window.location.origin}/logo-agroperu.png" alt="AgroPerú"><p>Gestión comercial e inventario agrícola<br>Documento generado por AgroPerú ERP</p></div><div class="doc"><div class="kind">${escapeHtml(kind)}</div><div class="number">${escapeHtml(documentNumber)}</div></div></section>
      <div class="test">DOCUMENTO DE PRUEBA · SIN VALIDEZ TRIBUTARIA · NO ENVIADO A SUNAT</div>
      <section class="meta">
        <div class="box"><div class="label">Cliente</div><div class="value">${escapeHtml(sale.customerName)}</div><div>${escapeHtml(customer ? `${customer.docType}: ${customer.docNumber}` : 'Documento no registrado')}</div><div>${escapeHtml(customer?.address || '')}</div></div>
        <div class="box"><div class="label">Datos de operación</div><div><strong>Fecha:</strong> ${escapeHtml(date(sale.saleDate))}</div><div><strong>Pago:</strong> ${escapeHtml(sale.paymentMethod || sale.status)}</div><div><strong>Operación:</strong> ${escapeHtml(sale.proformaNumber)}</div></div>
      </section>
      <table><thead><tr><th>Ítem</th><th>Descripción</th><th class="number">Cantidad</th><th class="number">Precio unit.</th><th class="number">Importe</th></tr></thead><tbody>${rows}</tbody></table>
      <section class="summary"><div><span>Op. gravada referencial</span><strong>S/ ${money(taxableAmount)}</strong></div><div><span>IGV referencial (18%)</span><strong>S/ ${money(taxAmount)}</strong></div><div class="total"><span>Total</span><span>S/ ${money(sale.totalAmount)}</span></div></section>
      <section class="notes"><strong>Observaciones:</strong> ${escapeHtml(sale.notes || 'Sin observaciones.')}<br>Los importes tributarios son referenciales mientras se completa la integración con SUNAT.</section>
      <footer class="footer">Gracias por su compra · AgroPerú ERP</footer>
    </main>
    <div class="actions"><button onclick="window.print()">Imprimir / Guardar PDF</button></div>
  </body></html>`);
  popup.document.close();
  popup.focus();
  return true;
};
