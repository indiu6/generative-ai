// // Sequelize ORM을 사용하여 MySQL 데이터베이스와 연동된 User 모델을 정의하는 코드입니다. 또한, bcrypt 라이브러리를 사용해 비밀번호를 암호화

// import { Sequelize, DataTypes, Model } from 'sequelize';
// import bcrypt from 'bcryptjs';
// import dotenv from 'dotenv';

// dotenv.config();

// // PostgreSQL 데이터베이스 연결
// const sequelize = new Sequelize(
//     process.env.POSTGRES_DB as string, // PostgreSQL 데이터베이스 이름
//     process.env.POSTGRES_USER as string, // PostgreSQL 사용자 이름
//     process.env.POSTGRES_PASSWORD as string, // PostgreSQL 비밀번호
//     {
//         host: process.env.POSTGRES_DB_HOST || 'localhost', // PostgreSQL 호스트
//         dialect: 'postgres', // PostgreSQL을 사용하기 위한 dialect 설정
//     }
// );

// class User extends Model {
//     public id!: number;
//     public username!: string;
//     public password!: string;

//     public async validatePassword(password: string): Promise<boolean> {
//         return bcrypt.compare(password, this.password);
//     }
// }

// // User 모델 초기화 (테이블 스키마 정의)
// User.init(
//     {
//         id: {
//             type: DataTypes.INTEGER,
//             autoIncrement: true,
//             primaryKey: true,
//         },
//         username: {
//             type: DataTypes.STRING,
//             allowNull: false,
//             unique: true,
//         },
//         password: {
//             type: DataTypes.STRING,
//             allowNull: false,
//         },
//     },
//     {
//         sequelize,
//         modelName: 'User',
//     }
// );

// // beforeCreate는 Sequelize의 Hook으로, User가 데이터베이스에 저장되기 전 호출됩니다.
// // 사용자 생성 전에 bcrypt.hash를 사용하여 비밀번호를 해싱(암호화)하고, 해시된 비밀번호를 user.password에 저장합니다.
// // 해싱 강도를 나타내는 10은 보통 권장되는 값이며, 값이 높을수록 보안이 강해지지만 암호화 속도가 느려집니다.
// User.beforeCreate(async (user: User) => {
//     user.password = await bcrypt.hash(user.password, 10);
// });

// // User 모델과 데이터베이스를 동기화하여 테이블이 생성되도록 합니다. 만약 테이블이 존재하지 않으면 새로 생성됩니다.
// sequelize.sync();

// export default User;
