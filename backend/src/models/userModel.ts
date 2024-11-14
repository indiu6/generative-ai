import { Sequelize, DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
    process.env.MYSQL_DB_NAME as string,
    process.env.MYSQL_DB_USER as string,
    process.env.MYSQL_DB_PASSWORD as string,
    {
        host: process.env.MYSQL_DB_HOST,
        dialect: process.env.MYSQL_DB_DIALECT as 'mysql' | 'mariadb',
    }
);

class User extends Model {
    public id!: number;
    public username!: string;
    public password!: string;

    public async validatePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'User',
    }
);

User.beforeCreate(async (user: User) => {
    user.password = await bcrypt.hash(user.password, 10);
});

sequelize.sync();
export default User;
