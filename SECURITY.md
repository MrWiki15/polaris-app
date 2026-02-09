# Política de Seguridad

## Reportar Vulnerabilidades de Seguridad

**IMPORTANTE:** No publiques vulnerabilidades en Issues públicos de GitHub.

### Cómo Reportar

Por favor reporta vulnerabilidades directamente a:

📧 **mrwiki@mail.kawi.life**

Incluye en tu reporte:

- **Descripción del problema:** explicación clara de la vulnerabilidad
- **Ubicación:** archivo(s) y línea(s) afectadas
- **Severity:** crítica, alta, media, baja
- **Pasos para reproducir:** instrucciones detalladas
- **Versión afectada:** qué versión tiene el problema
- **Solución sugerida** (opcional): si tienes una idea de fix

### Timeline de Respuesta

- **Día 1:** Confirmamos recepción
- **Día 7:** Confirmamos el problema o pedimos más info
- **Día 30:** Fix publicado o plan de mitigación
- **Día 60:** Divulgación pública (si aplica)

## Seguridad en el Desarrollo

### Principios Implementados

✅ **Encriptación Local:** Claves privadas cifradas con AES-GCM  
✅ **Sanitización de Input:** Validación con Zod y rehype-sanitize  
✅ **RLS en Supabase:** Políticas de seguridad a nivel de fila  
✅ **HTTPS Required:** Para PWA y service workers  
✅ **No hardcoding secrets:** Variables de entorno obligatorias

### Variables Sensibles

Las siguientes variables **NUNCA** deben commitearse:

- `.env` y archivos `.env.*`
- API keys (Supabase, Gemini, Pinata)
- Claves privadas (blockchain, operador Hedera)
- JWT tokens
- URLs sensibles

Ver `.env.example` para estructura sin valores reales.

## Dependencias Seguras

Mantenemos las dependencias actualizadas. Reporta vulnerabilidades de dependencias:

```bash
npm audit
npm update
```
