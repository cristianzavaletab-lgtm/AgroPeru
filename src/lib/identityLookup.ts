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
  const expectedLength = kind === 'dni' ? 8 : 11;
  if (digits.length !== expectedLength) {
    throw new Error(`El ${kind.toUpperCase()} debe tener ${expectedLength} dígitos.`);
  }

  const clientToken = (import.meta.env.VITE_DNIRUC_API_TOKEN || '').trim();

  let payload: any = null;
  let serverErrorMessage = '';

  // 1. Intentar primero con el servidor backend / proxy (/api/identity/...)
  try {
    const response = await fetch(`/api/identity/${kind}/${digits}`, {
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      payload = await response.json().catch(() => null);
    } else if (response.status !== 404) {
      const errData = await response.json().catch(() => ({}));
      serverErrorMessage = errData?.message || '';
    }
  } catch {
    // Si falla la red local o /api no existe
  }

  // 2. Si /api dio 404 (ej. Sitio Estático en Render) o no respondió, recurrir a consulta directa con el token
  if (!payload && clientToken) {
    try {
      const directUrl = `https://dniruc.apisperu.com/api/v1/${kind}/${digits}?token=${encodeURIComponent(clientToken)}`;
      const directResponse = await fetch(directUrl, {
        headers: { Accept: 'application/json' },
      });
      const directData = await directResponse.json().catch(() => null);

      if (directData && (directData.dni || directData.ruc || directData.razonSocial || directData.nombres)) {
        payload = directData;
      } else if (directData && (directData.message || directData.error)) {
        throw new Error(directData.message || directData.error);
      }
    } catch (err: any) {
      if (err?.message && !err.message.includes('fetch')) {
        throw err;
      }
    }
  }

  if (!payload) {
    if (serverErrorMessage) {
      throw new Error(serverErrorMessage);
    }
    if (!clientToken) {
      throw new Error('La consulta DNI/RUC requiere configurar el token en el servidor o en la variable VITE_DNIRUC_API_TOKEN.');
    }
    throw new Error(`No se encontró información para el ${kind.toUpperCase()} ${digits}.`);
  }

  const raw = (payload.data?.data || payload.data || payload || {}) as Record<string, unknown>;
  const text = (...keys: string[]) => {
    const value = keys.map(key => raw[key]).find(item => typeof item === 'string' || typeof item === 'number');
    return value == null ? '' : String(value).trim();
  };

  if (kind === 'dni') {
    const nombres = text('nombres', 'nombre');
    const apellidoPaterno = text('apellidoPaterno', 'apellido_paterno');
    const apellidoMaterno = text('apellidoMaterno', 'apellido_materno');

    if (!nombres && !apellidoPaterno) {
      const msg = typeof raw.message === 'string' ? raw.message : `No se encontró información para el DNI ${digits}.`;
      throw new Error(msg);
    }

    return {
      dni: text('dni', 'numeroDocumento', 'numero_documento') || digits,
      nombres,
      apellidoPaterno,
      apellidoMaterno,
      codVerifica: text('codVerifica', 'cod_verifica') || undefined,
    };
  }

  const razonSocial = text('razonSocial', 'razon_social', 'nombreRazonSocial', 'nombre__razonsocial');
  if (!razonSocial) {
    const msg = typeof raw.message === 'string' ? raw.message : `No se encontró información para el RUC ${digits}.`;
    throw new Error(msg);
  }

  const rawPhones = raw.telefonos ?? raw.telefono;
  const telefonos = Array.isArray(rawPhones)
    ? rawPhones.map(String).map(phone => phone.trim()).filter(Boolean)
    : typeof rawPhones === 'string'
    ? rawPhones.split(/[,/]/).map(phone => phone.trim()).filter(Boolean)
    : [];

  return {
    ruc: text('ruc', 'numeroRuc', 'numero_ruc', 'numeroruc') || digits,
    razonSocial,
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
