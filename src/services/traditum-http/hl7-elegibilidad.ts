export const hl7Elegibilidad = {
    "format": "hl7-2.4",
    "adapter": "default",
    "mapping": {
      "nte": {
        "values": [
          { "field": "nte.codigoRespuesta", "component": [1,1] },
          { "field": "nte.mensajeRespuesta", "component": [3,1] }
        ]
      }
    }
  }