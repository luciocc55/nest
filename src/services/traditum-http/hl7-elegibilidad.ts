export const hl7Elegibilidad = {
    "format": "hl7-2.4",
    "adapter": "default",
    "mapping": {
      "nte": {
        "values": [
          { "field": "nte.codigoRespuesta", "component": [1,1] },
          { "field": "nte.mensajeRespuesta", "component": [3,1] }
        ]
      },
      "zau":{
        "values":[
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
    }
  }