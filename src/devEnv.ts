export const devEnvironment = {
    secretKey: 'Autorizador Kozaca Secret Key',
    permissions: null,
    orignesPermissions: null,
    urlBaseRedI: 'https://weare.red-i.com.ar/apiRest/',
    urlBaseFederada: 'https://api-test.federada.com/validador/v1.5.3/',
    redis: '127.0.0.1',
    mongo: 'mongo:27017',
    mongoPassword: process.env.MONGO_INITDB_ROOT_PASSWORD,
    mongoUser: process.env.MONGO_INITDB_ROOT_USERNAME,
    urlBase: process.env.URL_BASE,
    dataBase: 'autorizador',
    rootAdmin: {
      name: 'Lucio',
      lastName: 'Cesolari',
      password: '515149lycc',
      user: 'ares',
    },
  };
