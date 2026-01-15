import { MODELS } from '../../sequelize.js';
import { generate_JWT } from '../../routes/helper/JWTHelper.js';
import { ApiError } from '../../helper/ApiError.js';
import { comparePassword, hashPassword } from '../../routes/helper/PasswordHelper.js';

export class CMAuth {

    static async login({ phone, email, password }) {
        if ((!phone && !email) || !password) {
            throw new ApiError(400, "Phone/Email and Password are required");
        }

        const { User, Jwt } = MODELS;
        let user;
        const whereClause = {};

        if (phone) whereClause.phone = phone;
        if (email) whereClause.email = email;

        user = await User.findOne({ where: whereClause });

        if (!user) {

            throw new ApiError(404, "Login failed: User not found");
        }


        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            throw new ApiError(401, "Login failed: Password Incorrect");
        }


        const { accessToken } = generate_JWT(user);


        const existingJwt = await Jwt.findOne({ where: { userId: user.id } });


        const expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 150);

        if (existingJwt) {
            await existingJwt.update({
                token: accessToken,
                expire: expireDate
            });
        } else {
            await Jwt.create({
                token: accessToken,
                userId: user.id,
                expire: expireDate,
                status: 'ACTIVE'
            });
        }

        return {
            user,
            accessToken
        };
    }

    static async createDummyUser({ firstName, lastName, phone, email, password }) {
        const { User } = MODELS;
        const hashedPassword = await hashPassword(password);
        return await User.create({
            firstName,
            lastName,
            phone,
            email,
            password: hashedPassword,
            status: 'ACTIVE'
        });
    }

    static async checkJwt(token, custId) {
        const { Jwt } = MODELS;

        const jwtRecord = await Jwt.findOne({
            where: {
                token,
            },
        });

        if (jwtRecord) {
            return true;
        }
        return false;
    }

    static async profile(querier) {
        const userId = querier?.claims?.id;
        const { User } = MODELS;
        const user = await User.findByPk(userId);
        return user ? user.get({ plain: true }) : null;
    }
}
