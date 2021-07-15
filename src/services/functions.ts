import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import moment = require('moment');

@Injectable()
export class FunctionsService {
  diacriticSensitiveRegex(value = '') {
    return value
    .replace(/a/g, '[a,á,à,ä]')
    .replace(/e/g, '[e,é,ë]')
    .replace(/i/g, '[i,í,ï]')
    .replace(/o/g, '[o,ó,ö,ò]')
    .replace(/u/g, '[u,ü,ú,ù]')
    .replace(/A/g, '[a,á,à,ä]')
    .replace(/E/g, '[e,é,ë]')
    .replace(/I/g, '[i,í,ï]')
    .replace(/O/g, '[o,ó,ö,ò]')
    .replace(/U/g, '[u,ü,ú,ù]');
  }
  returnPaginado(request, cantidadTotal, cantidadPorPagina) {
    let next;
    let previus;
    const query = request.query;
    const current = parseInt(query.page ? query.page : '1');
    const cantidadPaginas = (Math.ceil(cantidadTotal / cantidadPorPagina));
    if (current === 1) {
      previus = null;
    } else {
      previus = request.protocol + '://' + request.get('host') + request.route.path + '?page=' + (current - 1);
    }
    if (cantidadPaginas > current) {
      next = request.protocol + '://' + request.get('host') + request.route.path + '?page=' + (current + 1);
    } else {
      next = null;
    }
    return {count: cantidadTotal, current, next, previus, page_size: cantidadPorPagina, total_pages: cantidadPaginas};
  }
  getArrayRegex(array, field) {
    const arrayConverted = [];
    array.forEach(element => {
      arrayConverted.push({ [field]: { $regex: element, $options: 'i' } });
    });
    return arrayConverted;
  }
  returnDateStringFormatDjango(date) {
    return date
      .toISOString()
      .replace(/T/, ' ')
      .replace(/\..+/, '');
  }
  hasTurnos(turnoArray, FechaStringPosition) {
    let fecha = null;
    let TurnoString = 'No Disponibles';
    let codigoTurno = 0;
    if (turnoArray.length > 0) {
      const minfecha = turnoArray.reduce(function(prev, current) {
        return prev[FechaStringPosition] > current[FechaStringPosition]
          ? prev
          : current;
      });
      fecha = minfecha[FechaStringPosition];
      TurnoString = 'Disponibles';
      codigoTurno = 1;
    }
    return { Turnos: TurnoString, cod: codigoTurno, Turno: { Fecha: fecha } };
  }
  errorPriority(priorityResource, priorityExecutor) {
    if (priorityResource < priorityExecutor) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Esta accion requiere un rol con mas accesos',
        },
        400,
      );
    }
  }
  returnUniques(array, object) {
    const returnUniques = [...new Set(array.map(item => item[object]))];
    return returnUniques;
  }
  returnUniquesArray(array) {
    const returnUniques = [...new Set(array.map(item => item))];
    return returnUniques;
  }
  titleCase(str) {
    return str
      .toLowerCase()
      .split(' ')
      .map(function(word) {
        try {
          return word.replace(word[0], word[0].toString().toUpperCase());
        } catch (error) {
          return word;
        }
      })
      .join(' ');
  }
  returnRegex(str) {
    return new RegExp(this.diacriticSensitiveRegex(str), 'i');
  }
  orderArray(array, object) {
    const ordered = array.sort(
      (n1, n2) =>
        new Date(n1[object]).getTime() - new Date(n2[object]).getTime(),
    );
    return ordered;
  }
  arrayMax(arr, object) {
    if (arr.length > 0) {
      const max = arr
        .map(el => this.returnHora(el[object]))
        .reduce((n1, n2) => (n1 > n2 ? n1 : n2));
      return max;
    }
    return '';
  }
  arrayMin(arr, object) {
    if (arr.length > 0) {
      const min = arr
        .map(el => this.returnHora(el[object]))
        .reduce((n1, n2) => (n1 < n2 ? n1 : n2));
      return min;
    }
    return '';
  }
  returnHora(fecha) {
    return moment(fecha, 'YYYY-MM-DD HH:mm').format('HH:mm');
  }
  returnFecha(fecha) {
    return moment(fecha).format('YYYY-MM-DD HH:mm');
  }
  returnDate(fecha) {
    return moment(fecha).format('YYYY-MM-DD');
  }
  returnDateFormat2(fecha) {
    return moment(fecha).format('YYYY/MM/DD');
  }
  returnDateFormat3(fecha) {
    return moment(fecha).format('YYYYMMDD');
  }
  returnDateFormatFrom(fecha) {
    return moment(fecha, 'YYYY-MM-DD HH:mm:ss').format('YYYYMMDD');
  }
  returnBoolean(value) {
    if (value === null) {
      return false;
    } else {
      return value;
    }
  }
}
