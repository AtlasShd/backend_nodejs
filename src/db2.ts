import { Sequelize } from 'sequelize';

const database = {
  name: process.env.DB_NAME ? process.env.DB_NAME : 'nodejs_backend',
  user: process.env.DB_USER ? process.env.DB_USER : 'postgres',
  password: process.env.DB_PASSWORD ? process.env.DB_PASSWORD : '123123',
  host: process.env.DB_HOST ? process.env.DB_HOST : 'localhost',
  port:  Number.isInteger(Number(process.env.DB_PORT)) ? Number(process.env.DB_PORT) : 5432,
};

const sequelize = new Sequelize (
  database.name,
  database.user,
  database.password,
  {
    dialect: 'postgres',
    host: database.host,
    port: database.port,
  }
);

export default sequelize;