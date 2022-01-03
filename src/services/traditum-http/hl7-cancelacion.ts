export const hl7Cancelacion = {
    "format": "hl7-2.4",
    "adapter": "default",
    "mapping": {
        "msa": {
            "values": [
                { "field": "msa.procesado", "component": [1, 1] },
                { "field": "msa.transaccion", "component": [2, 1] },
                { "field": "msa.codigoEstado", "component": [6, 1] },
                { "field": "msa.estado", "component": [6, 2] },
            ]
        },
    }
}