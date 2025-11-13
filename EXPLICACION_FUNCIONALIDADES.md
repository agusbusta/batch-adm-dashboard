# Explicación de Funcionalidades - Admin Dashboard

## 🔐 Autenticación (Login)

**¿Qué hace?** Página de inicio de sesión que protege el acceso al dashboard.

**Lógica de negocio:** 
- Valida credenciales antes de permitir acceso
- Genera token JWT para mantener sesión activa
- Redirige automáticamente si ya estás autenticado

**Botones:**
- **Sign in:** Valida email/password y genera token de sesión

---

## 📊 Dashboard (Página Principal)

**¿Qué hace?** Vista general del sistema con métricas clave.

**Lógica de negocio:** 
- Muestra estado general del pipeline de procesamiento
- Identifica problemas rápidamente (jobs fallidos, GPUs ocupadas)
- Permite navegación rápida a secciones críticas

**Elementos:**
- **Active Jobs:** Jobs en procesamiento actual (tendencia 7 días)
- **Completed Jobs:** Jobs completados exitosamente (tendencia 7 días)
- **Jobs by Status:** Distribución visual (donut chart)
- **Failed Jobs:** Cantidad de fallos
- **Queued Jobs:** Jobs esperando GPU
- **Total Clients:** Total de clientes registrados
- **Available GPUs:** GPUs disponibles para procesar
- **Quick Actions:**
  - **View All Jobs:** Ir a lista completa de jobs
  - **Manage Clients:** Ir a gestión de clientes
  - **View Reports:** Ir a reportes y analytics

**¿Por qué?** Dashboard operativo para monitoreo en tiempo real y toma de decisiones rápidas.

---

## 📋 Jobs (Lista de Trabajos)

**¿Qué hace?** Lista todos los jobs de procesamiento de video con filtros y búsqueda.

**Lógica de negocio:**
- Monitoreo centralizado de todos los trabajos
- Identificación rápida de jobs con problemas
- Seguimiento de progreso por módulo

**Filtros:**
- **Search Bar:** Busca por Job ID o Client ID
- **Status Filter:** Filtra por estado (pending, queued, processing, completed, failed)
- **Clear Filters:** Limpia todos los filtros

**Columnas de la tabla:**
- **Job ID:** Identificador único (clickeable → detalle)
- **Client:** Cliente que solicitó el job
- **Status:** Estado actual (badge de color)
- **Module:** Módulo actual en ejecución (M1, M2, M3)
- **Progress:** Barra de progreso visual
- **Created:** Fecha de creación

**Acciones:**
- **Click en fila:** Abre detalle completo del job

**Paginación:** Navega entre páginas (10 jobs por página)

**¿Por qué?** Control operativo: ver qué está procesando, qué falló, qué está en cola.

---

## 🔍 Job Detail (Detalle de Job)

**¿Qué hace?** Vista detallada de un job específico con toda su información.

**Lógica de negocio:**
- Diagnóstico completo de un job
- Auditoría de cambios de estado
- Revisión de logs para debugging
- Verificación de archivos procesados

**Secciones:**

### General Information
- **Job ID, Client ID, Status, Progress:** Info básica
- **Created/Started/Completed At:** Timestamps para auditoría
- **Current Module:** Módulo en ejecución

### Module Progress
- **Module 1 (RAW→ProRes):** Estado, progreso, tiempos
- **Module 2 (ML Processing):** Estado, progreso, tiempos
- **Module 3 (Format Conversion):** Estado, progreso, tiempos

**¿Por qué?** Identificar en qué módulo falló o se atascó un job.

### Files
- **Input Files:** Archivos originales recibidos
- **Output Files:** Archivos generados por el pipeline

**¿Por qué?** Verificar qué archivos se procesaron y su tamaño.

### Status History
- Timeline cronológico de cambios de estado
- Muestra transiciones: pending → queued → processing → completed/failed

**¿Por qué?** Auditoría: saber cuándo y por qué cambió el estado.

### Logs
- Logs específicos del job filtrados por nivel (info, warning, error, debug)

**¿Por qué?** Debugging: encontrar errores específicos del job.

### Metadata
- JSON con información adicional del job

**Botones:**
- **← Back to Jobs:** Volver a la lista

**¿Por qué?** Diagnóstico completo para resolver problemas o verificar procesamiento exitoso.

---

## 👥 Clients (Lista de Clientes)

**¿Qué hace?** Gestión de clientes con sus créditos y jobs asociados.

**Lógica de negocio:**
- Administración centralizada de cuentas de clientes
- Monitoreo de créditos disponibles
- Control de actividad por cliente

**Filtros:**
- **Search Bar:** Busca por nombre o email

**Columnas:**
- **Name:** Nombre del cliente
- **Email:** Email de contacto
- **Credits:** Balance de créditos (formato moneda)
- **Jobs:** Cantidad de jobs del cliente
- **Created:** Fecha de registro

**Acciones:**
- **View:** Abre detalle del cliente
- **Credits:** Va directo a gestión de créditos del cliente

**Botones:**
- **Create New Client:** Crea nuevo cliente

**Paginación:** 10 clientes por página

**¿Por qué?** Gestión de cuentas: ver quién tiene créditos, quién está activo, crear nuevos clientes.

---

## 👤 Client Detail (Detalle de Cliente)

**¿Qué hace?** Vista completa de un cliente con 3 pestañas: información, jobs, créditos.

**Lógica de negocio:**
- Gestión integral de cuenta de cliente
- Control de créditos y transacciones
- Seguimiento de actividad (jobs)

### Pestaña: Information
- **Client Information:** Nombre, email, fechas
- **MASV Portal Config:** Configuración JSON del portal MASV

**Botón:**
- **Edit Client:** Abre modal para editar nombre/email/config

**¿Por qué?** Actualizar datos del cliente o su configuración.

### Pestaña: Jobs
- Lista todos los jobs del cliente
- Muestra status, progreso, fechas

**¿Por qué?** Ver historial de procesamiento del cliente.

### Pestaña: Credits
- **Credit Balance:** Muestra balance actual con alerta si está bajo (< $100)
- **Add Credits:** Botón para agregar créditos
- **Subtract Credits:** Botón para restar créditos
- **Transaction History:** Historial completo de transacciones

**Filtros en Transaction History:**
- **Date Range:** Filtrar por rango de fechas
- **Type Filter:** Filtrar por tipo (add, subtract, usage)

**¿Por qué?** 
- **Add Credits:** Cliente compra créditos o se le otorgan
- **Subtract Credits:** Ajuste manual o corrección
- **Transaction History:** Auditoría de movimientos de créditos

**Botones:**
- **← Back to Clients:** Volver a lista

**¿Por qué?** Gestión completa de cuenta: editar datos, ver actividad, administrar créditos.

---

## 💰 Credits (Vista General de Créditos)

**¿Qué hace?** Vista consolidada de todos los créditos de todos los clientes.

**Lógica de negocio:**
- Monitoreo global del sistema de créditos
- Identificación de clientes con balance bajo
- Resumen ejecutivo de salud financiera

**Summary Cards:**
- **Total Credits:** Suma de todos los créditos del sistema
- **Total Clients:** Cantidad de clientes
- **Low Balance Clients:** Clientes con < $100 (requieren atención)

**Tabla:**
- **Client:** Nombre y email
- **Balance:** Créditos disponibles (rojo si < $100)
- **Actions:**
  - **Manage:** Va a gestión de créditos del cliente

**Filtros:**
- **Search Bar:** Busca por nombre, email o ID

**Ordenamiento:** Automático por balance (mayor a menor)

**Paginación:** 10 clientes por página

**¿Por qué?** Vista ejecutiva: identificar clientes que necesitan recargar créditos, ver salud general del sistema.

---

## 🎮 GPU Resources (Recursos GPU)

**¿Qué hace?** Monitoreo de GPUs y gestión de cola de jobs.

**Lógica de negocio:**
- Control de recursos de procesamiento
- Gestión de prioridades en cola
- Optimización de uso de GPUs

**Summary Stats:**
- **Available:** GPUs disponibles
- **In Use:** GPUs procesando jobs
- **Maintenance:** GPUs en mantenimiento

**GPU Cards:**
- Cada GPU muestra:
  - **Name:** Identificador de GPU
  - **Status:** Badge de color (available/in_use/maintenance)
  - **Current Job:** Job en procesamiento (si aplica)
  - **Started At:** Cuándo empezó el job actual

**¿Por qué?** Ver qué GPUs están libres, cuáles ocupadas, cuánto tiempo llevan procesando.

**Job Queue:**
- Lista de jobs en cola esperando GPU
- **Drag & Drop:** Arrastra jobs para cambiar prioridad
- Columnas:
  - **Job ID:** Identificador
  - **Client:** Cliente
  - **Priority:** Prioridad numérica (mayor = primero)
  - **Queued At:** Cuándo entró a cola
  - **Estimate:** Tiempo estimado de espera

**¿Por qué?**
- **Drag & Drop:** Reordenar visualmente la cola según urgencia
- **Priority:** Jobs más importantes se procesan primero

**Botones:**
- **Refresh:** Actualiza datos manualmente

**Auto-refresh:** Se actualiza cada 30 segundos automáticamente

**¿Por qué?** Control operativo: gestionar recursos limitados (GPUs) y priorizar jobs según necesidad de negocio.

---

## 📝 System Logs (Logs del Sistema)

**¿Qué hace?** Visualizador de logs del sistema con filtros avanzados.

**Lógica de negocio:**
- Debugging y troubleshooting
- Auditoría de eventos del sistema
- Monitoreo de salud del pipeline

**Filtros:**
- **Level:** info, warning, error, debug
- **Module:** Filtrar por módulo específico
- **Job ID:** Logs de un job específico
- **Date Range:** Rango de fechas
- **Search:** Búsqueda en mensajes
- **Clear Filters:** Limpia todos los filtros

**Tabla:**
- **Timestamp:** Cuándo ocurrió
- **Level:** Nivel de log (badge de color)
- **Module:** Módulo que generó el log
- **Job ID:** Job relacionado (si aplica)
- **Message:** Mensaje del log

**Ordenamiento:** Automático por fecha (más recientes primero)

**Botones:**
- **Export CSV:** Descarga logs en CSV
- **Export JSON:** Descarga logs en JSON

**Paginación:** 50 logs por página

**¿Por qué?** 
- **Filtros:** Encontrar logs específicos rápidamente
- **Export:** Compartir logs con equipo o análisis externo
- **Ordenamiento:** Ver eventos más recientes primero para debugging

---

## 📈 Reports (Reportes y Analytics)

**¿Qué hace?** Métricas y visualizaciones del rendimiento del sistema.

**Lógica de negocio:**
- Análisis de rendimiento del pipeline
- Identificación de tendencias
- Toma de decisiones basada en datos

**Date Range Filter:**
- Filtrar métricas por período específico

**Metrics Cards:**
- **Total Jobs:** Total en el período
- **Success Rate:** % de jobs completados exitosamente
- **Avg Processing Time:** Tiempo promedio de procesamiento (minutos)
- **Failure Rate:** % de jobs fallidos

**Charts:**

### Jobs by Status
- Gráfico de dona mostrando distribución de estados

**¿Por qué?** Ver proporción de jobs completados vs fallidos.

### Top Clients by Job Volume
- Gráfico de barras con top 10 clientes por cantidad de jobs

**¿Por qué?** Identificar clientes más activos.

### Jobs Over Time (Last 7 Days)
- Gráfico de líneas mostrando tendencia diaria
- Líneas: completed, failed, processing

**¿Por qué?** Ver tendencias: ¿aumentan los fallos? ¿hay picos de actividad?

**Botones:**
- **Export CSV:** Descarga métricas en CSV
- **Export JSON:** Descarga métricas en JSON

**¿Por qué?** 
- **Métricas:** Evaluar salud del sistema
- **Charts:** Visualizar patrones y tendencias
- **Export:** Compartir reportes con stakeholders

---

## 🎨 Sidebar (Navegación)

**¿Qué hace?** Menú lateral de navegación permanente.

**Elementos:**
- **Batch Admin:** Título del dashboard
- **User Info:** Nombre y email del usuario logueado
- **Menu Items:**
  - Dashboard
  - Jobs
  - Clients
  - Credits
  - GPU Resources
  - Logs
  - Reports
- **Logout:** Cierra sesión

**¿Por qué?** Navegación rápida entre secciones y control de sesión.

---

## 🔄 Flujos de Negocio Principales

### 1. Monitoreo de Jobs
**Flujo:** Dashboard → Jobs → Job Detail
**Propósito:** Ver estado general → Lista de jobs → Diagnóstico detallado

### 2. Gestión de Clientes
**Flujo:** Clients → Client Detail → Credits Tab → Add/Subtract Credits
**Propósito:** Lista → Detalle → Gestión de créditos → Transacción

### 3. Gestión de Recursos
**Flujo:** GPU Resources → Ver GPUs → Reordenar Queue
**Propósito:** Ver disponibilidad → Gestionar prioridades

### 4. Troubleshooting
**Flujo:** Jobs → Job Detail → Logs Tab → System Logs (filtrado)
**Propósito:** Identificar job problemático → Ver logs del job → Ver logs del sistema

### 5. Análisis y Reportes
**Flujo:** Reports → Filtrar por fecha → Export
**Propósito:** Ver métricas → Analizar período → Compartir datos

---

## 🎯 Resumen de Lógica de Negocio

**Propósito general:** Dashboard administrativo para gestionar un pipeline de procesamiento de video que:
1. Procesa videos en 3 módulos (RAW→ProRes, ML Processing, Format Conversion)
2. Usa GPUs como recurso limitado
3. Gestiona créditos de clientes
4. Requiere monitoreo y debugging constante

**Funciones clave:**
- **Monitoreo:** Ver qué está pasando en tiempo real
- **Gestión:** Controlar recursos (GPUs, créditos, prioridades)
- **Diagnóstico:** Encontrar y resolver problemas
- **Análisis:** Entender rendimiento y tendencias

