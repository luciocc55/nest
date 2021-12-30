export const hl7Autorizacion = {
    "format": "hl7-2.4",
    "adapter": "default",
    "mapping": {
      "msa": {
        "values": [
          { "field": "msa.procesado", "component": [1,1] },
          { "field": "msa.codigoEstado", "component": [6,1] },
          { "field": "msa.estado", "component": [6,2] },
        ]
      },
      "zau": {
        "values": [
          { "field": "zau.id", "component": [2,1] },
          { "field": "zau.codigoEstado", "component": [3,1] },
          { "field": "zau.estado", "component": [3,2] },
          { "field": "zau.copago", "component": [6,1] },
        ]
      },
      "pid": {
        "values": [
          { "field": "pid.nroAfiliado", "component": [3,1] },
          { "field": "pid.nombreAfiliado", "component": [5,1] },
          { "field": "pid.apellidoAfiliado", "component": [5,2] },
        ]
      },
      "in1": {
        "values": [
          { "field": "in1.plan", "component": [2,1] },
        ]
      },
      "zin": {
        "values": [
          { "field": "zin.gravado", "component": [2,1] },
          { "field": "zin.gravadoDesc", "component": [2,2] },
        ]
      },
      "pr1": {
        "values": [
          { "field": "pr1.prestacion", "component": [3,1] },
        ]
      }
    }
  }