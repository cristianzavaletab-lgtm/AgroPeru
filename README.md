# AgroPerú — gestión comercial e inventario

Sistema web para administrar compras, proveedores, inventario, mezclas, ventas, clientes, bolsas vacías, caja y resultados. Puede ejecutarse como PWA y trabajar localmente; la sincronización con Supabase es opcional.

## Inicio rápido

Requisitos: Node.js 22 o superior y npm.

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Abre `http://localhost:5173`. El comando inicia la interfaz y el servidor privado necesario para consultar DNI/RUC.

## Configuración DNI/RUC

1. Revoca cualquier token que se haya compartido en un chat, captura o repositorio y genera uno nuevo.
2. Copia `.env.example` como `.env`.
3. Guarda el token nuevo únicamente en la variable del servidor:

```dotenv
DNIRUC_API_TOKEN=tu-token-nuevo
API_PORT=3001
```

Nunca agregues el prefijo `VITE_` al token. Las variables `VITE_*` se incorporan al JavaScript público del navegador. El archivo `.env` está ignorado por Git.

Desde **Clientes**, el botón **Consultar DNI/RUC** completa los datos disponibles. Desde **Proveedores**, **Consultar RUC** completa razón social, dirección, teléfono y estado tributario. Las consultas pasan por `/api/identity/*`, donde se validan los documentos, se limita la frecuencia y se aplica un tiempo máximo de espera.

## Flujo operativo

1. Registra al proveedor con nombre, DNI/RUC, teléfono y dirección. El tipo se detecta por la longitud del documento y se reutilizan primero los datos ya guardados en Clientes o Proveedores; correo, teléfono alternativo, web y notas son opcionales.
2. Registra la compra y sus productos. Los fletes pueden agregarse por separado y la mercadería puede permanecer pendiente de recojo, en tránsito o recibida.
3. Revisa el Kardex o crea mezclas; ambos movimientos actualizan las existencias.
4. Crea una proforma o venta con cantidad, descripción y precio. El pago puede ser efectivo, Yape, transferencia o crédito.
5. Después de guardar la venta, selecciona si corresponde emitir boleta, factura o ningún comprobante.
6. Controla ingresos, egresos, créditos, gastos de bolsas y fletes desde Caja y Estado de resultados, con filtros por día, semana, mes o rango personalizado.

## SUNAT

El modelo de venta conserva tipo, serie, número y estado del comprobante para una futura integración. La emisión electrónica real requiere credenciales SOL o un proveedor autorizado, certificado y ambiente de homologación/producción. El sistema no simula una aceptación de SUNAT cuando esas credenciales aún no existen.

## Comandos de calidad y producción

```powershell
npm test
npm run lint
npm run build
npm start
```

`npm start` sirve la compilación desde `dist` y expone el proxy DNI/RUC en el puerto indicado por `PORT`, `API_PORT` o, en su defecto, `3000`.

Para validar el esquema Prisma también debes definir `DATABASE_URL`:

```powershell
npx prisma validate
```

## Variables opcionales

La aplicación funciona sin Supabase. Para habilitar sincronización remota configura:

```dotenv
VITE_ENABLE_SUPABASE_SYNC=true
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-publica-anon
VITE_APP_STATE_ID=agroperu-main
DATABASE_URL=postgresql://usuario:clave@localhost:5432/agroperu
```

Antes del primer despliegue, abre el editor SQL de Supabase y ejecuta `supabase/setup.sql`.
La tabla `app_state` conserva en un único registro todos los módulos del sistema y los
sincroniza entre navegadores. En Render, estas variables deben existir durante el build;
después de cambiarlas ejecuta **Save, rebuild, and deploy**.

La clave anónima de Supabase puede ser pública si las políticas RLS están configuradas correctamente; `DATABASE_URL` y `DNIRUC_API_TOKEN` siempre deben permanecer en el servidor.
