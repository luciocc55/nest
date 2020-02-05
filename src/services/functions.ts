import { Injectable } from '@nestjs/common';

@Injectable()
export class FunctionsService {
  diacriticSensitiveRegex(value = '') {
    return value
      .replace(/a/g, '[a,á,à,ä]')
      .replace(/e/g, '[e,é,ë]')
      .replace(/i/g, '[i,í,ï]')
      .replace(/o/g, '[o,ó,ö,ò]')
      .replace(/u/g, '[u,ü,ú,ù]');
  }

  getArrayRegex(array, field) {
    const arrayConverted = [];
    array.forEach(element => {
      arrayConverted.push({ [field]: { $regex: element, $options: 'i' } });
    });
    return arrayConverted;
  }
}
