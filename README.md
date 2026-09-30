# 📖 Guía de Operación Humana & Manual Completo - AgroPerú

Este documento es tu **Manual de Usuario y Guía de Operación Paso a Paso** para entender exactamente cómo funciona el negocio de AgroPerú en el sistema web y cómo operarlo sin complicaciones.

---

## 📌 1. ¿Por qué este sistema reemplaza al Excel?

Antes, en las hojas de Excel de Agosto y Septiembre, tenías que restar manualmente las ventas de una columna a otra y calcular las mezclas a mano. Eso provocaba celdas corruptas como `#DIV/0!` o `#VALUE!`.

Con este sistema **todo está automatizado y conectado**:
* Cuando compras $\rightarrow$ **Aumenta** el stock del Kardex.
* Cuando vendes $\rightarrow$ **Disminuye** el stock del Kardex y se calcula el cobro.
* Cuando formulas una mezcla $\rightarrow$ El sistema **descuenta las materias primas** (Urea, Sulfato, Cloruro) y **suma la mezcla producida**, consumiendo también los sacos vacíos de empaque.

---

## 🔄 2. Flujo de Trabajo Recomendado (Paso a Paso)

Para llevar un control perfecto de tu negocio, sigue este orden operativo diario:

```text
┌───────────────────────────────────────────────────────────────────────────┐
│ 1. COMPRAS    ➜  2. MEZCLAS    ➜  3. VENTAS    ➜  4. AUDITORÍA ➜ 5. CAJAS │
│ (Ingresar TM)    (Formular NPK)   (Proformas)    (Conteo Cel)  (Utilidad) │
└───────────────────────────────────────────────────────────────────────────┘
```

---

### 🚛 PASO 1: Registrar Compras e Importaciones
**Módulo:** `Compras`
* **¿Cuándo usarlo?:** Cada vez que llegue un camión con fertilizantes desde el puerto o proveedor (INTI, Fertilizantes del Perú, Molinos & Cía).
* **¿Cómo usarlo?:**
  1. Entra a la pestaña **Compras** y presiona **`+ Nueva Compra`**.
  2. Selecciona el Proveedor (ej. INTI Agroquímicos) e ingresa la Guía o Factura (ej. `F001-130579`).
  3. Ingresa las Toneladas Métricas (TM) compradas de cada producto y el **Costo de Flete/Envío**.
  4. Presiona **`Guardar & Aumentar Stock`**.
* **¿Qué hace el sistema por ti?:** El sistema suma automáticamente las TM y sacos a tu inventario Kardex y registra el egreso de dinero.

---

### 🧪 PASO 2: Formular & Producir Mezclas NPK
**Módulo:** `Mezclas & Formulación`
* **¿Cuándo usarlo?:** Cuando vayas a preparar combinaciones especiales de fertilizantes (ej. *Molimax Papa Sierra*, *Mezcla NPK Intermedia*).
* **¿Cómo usarlo?:**
  1. Entra a la pestaña **Mezclas & Formulación**.
  2. Selecciona la Receta (ej. *Formulación Mezcla NPK Intermedia*).
  3. Ingresa la cantidad en Toneladas (TM) que vas a producir en la planta (ej. `10 TM`).
  4. Revisa el cuadro de insumos a la derecha: verás exactamente cuántas TM de Urea, Sulfato Blanco y KCl se consumirán.
  5. Presiona **`Ejecutar Lote de Mezcla`**.
* **¿Qué hace el sistema por ti?:** Resta las materias primas del Kardex, suma las 10 TM de mezcla lista a tu stock y descuenta los sacos vacíos de empaque.

---

### 🧾 PASO 3: Registrar Ventas y Emitir Proformas
**Módulo:** `Ventas & Proformas`
* **¿Cuándo usarlo?:** Cada vez que atiendas a un cliente por mostrador o emitas una proforma.
* **¿Cómo usarlo?:**
  1. Entra a la pestaña **Ventas & Proformas** y presiona **`+ Registrar Venta`**.
  2. Selecciona el Cliente (o créalo al instante con `+ Nuevo Cliente`).
  3. Agrega los fertilizantes o mezclas vendidas y la cantidad en bolsas o TM.
  4. Elige la **Forma de Pago**:
     * **`PAGADO`**: Si el cliente te paga al contado (Efectivo, Yape o BCP).
     * **`CRÉDITO`**: Si el cliente se lleva el producto y te pagará después.
  5. Presiona **`Registrar & Descontar Kardex`**.
* **¿Qué hace el sistema por ti?:** Descuenta el producto vendido de tu almacén. Si fue a Crédito, guarda la deuda en la ficha del cliente; si fue al Contado, suma el dinero a tu Caja 1.
* **Imprimir Proforma:** Puedes presionar el icono de impresora en cualquier venta para generar la proforma digital con el **logo oficial de AgroPerú**.

---

### 📋 PASO 4: Auditoría de Almacén & Conteo Físico
**Módulo:** `Conteo Físico` y `Bolsas Vacías`
* **¿Cuándo usarlo?:** Al final de la semana o cuando el almacenero haga inventario.
* **¿Cómo usarlo?:**
  1. El encargado entra a **Conteo Físico** desde su celular o tablet.
  2. Ingresa la cantidad de TM reales que contó físicamente en el almacén.
  3. El sistema resaltará en amarillo las diferencias (+/- TM).
  4. Presiona **`Conciliar Diferencias en Kardex`** para ajustar el inventario automáticamente.

---

### 💰 PASO 5: Resultados Económicos & Control de Cajas
**Módulo:** `Finanzas & Caja`
* **¿Cuándo usarlo?:** Para consultar cuánto dinero está ingresando y cuál es tu ganancia neta.
* **¿Qué información te da?:**
  * **Utilidad por Bolsa:** Te dice exactamente cuántos Soles ganas netos por cada bolsa de Urea, Sulfato o Yaramila vendida.
  * **Caja 1 (Principal BCP/Yape):** Todo el dinero recaudado por ventas al contado.
  * **Caja 2 (Caja Chica Almacén):** Dinero en efectivo para gastos diarios (estiba, cintas, fletes cortos).
  * Presiona **`+ Nuevo Movimiento de Caja`** si necesitas anotar un gasto extra.

---

## ⚡ 3. Comandos para Ejecutar la Aplicación en Localhost

Para encender el sistema en tu computadora y verlo en el navegador:

1. Abre tu consola (PowerShell o CMD) e ingresa a la carpeta del proyecto:
   ```powershell
   cd d:\Descargas\AgroPeru
   ```

2. Ejecuta el servidor local:
   ```powershell
   npm run dev
   ```

3. Abre tu navegador (Chrome, Edge, Brave) en la dirección:
   👉 **`http://localhost:5173`**

---

## 📱 4. ¿Cómo instalarlo como App en Celulares (PWA)?

1. Conecta tu celular al mismo WiFi que la computadora.
2. Ingresa desde Chrome en tu celular a la dirección de red local que te muestra la consola (ejemplo: `http://192.168.1.15:5173`).
3. En el menú de Chrome del celular (3 puntos arriba a la derecha), selecciona **"Instalar Aplicación"** o **"Agregar a Pantalla de Inicio"**.
4. ¡Listo! Se creará el icono oficial de **AgroPerú** en tu celular para usarlo como una aplicación nativa.
