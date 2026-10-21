export interface DniLookupResult {
  dni: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  codVerifica?: string;
}

export interface RucLookupResult {
  ruc: string;
  razonSocial: string;
  nombreComercial?: string;
  telefonos?: string[];
  estado?: string;
  condicion?: string;
  direccion?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  ubigeo?: string;
}

export async function lookupIdentity(kind: 'dni', number: string): Promise<DniLookupResult>;
export async function lookupIdentity(kind: 'ruc', number: string): Promise<RucLookupResult>;
export async function lookupIdentity(kind: 'dni' | 'ruc', number: string): Promise<DniLookupResult | RucLookupResult> {
  const digits = number.replace(/\D/g, '');
  const response = await fetch(`/api/identity/${kind}/${digits}`, { headers: { Accept: 'application/json' } });
  const payload = await response.json().catch(() => ({ message: 'Respuesta inválida del servicio.' }));
  if (!response.ok) throw new Error(payload.message || 'No se pudo realizar la consulta.');
  const raw = (payload.data?.data || payload.data || {}) as Record<string, unknown>;
  const text = (...keys: string[]) => {
    const value = keys.map(key => raw[key]).find(item => typeof item === 'string' || typeof item === 'number');
    return value == null ? '' : String(value).trim();
  };

  if (kind === 'dni') {
    return {
      dni: text('dni', 'numeroDocumento', 'numero_documento') || digits,
      nombres: text('nombres', 'nombre'),
      apellidoPaterno: text('apellidoPaterno', 'apellido_paterno'),
      apellidoMaterno: text('apellidoMaterno', 'apellido_materno'),
      codVerifica: text('codVerifica', 'cod_verifica') || undefined,
    };
  }

  const rawPhones = raw.telefonos ?? raw.telefono;
  const telefonos = Array.isArray(rawPhones)
    ? rawPhones.map(String).map(phone => phone.trim()).filter(Boolean)
    : typeof rawPhones === 'string' ? rawPhones.split(/[,/]/).map(phone => phone.trim()).filter(Boolean) : [];
  return {
    ruc: text('ruc', 'numeroRuc', 'numero_ruc', 'numeroruc') || digits,
    razonSocial: text('razonSocial', 'razon_social', 'nombreRazonSocial', 'nombre__razonsocial'),
    nombreComercial: text('nombreComercial', 'nombre_comercial') || undefined,
    telefonos,
    estado: text('estado', 'estadoContribuyente', 'estado_del_contribuyente') || undefined,
    condicion: text('condicion', 'condicionContribuyente', 'condicion_del_contribuyente') || undefined,
    direccion: text('direccion', 'direccionFiscal', 'direccion_fiscal') || undefined,
    departamento: text('departamento') || undefined,
    provincia: text('provincia') || undefined,
    distrito: text('distrito') || undefined,
    ubigeo: text('ubigeo') || undefined,
  };
}
