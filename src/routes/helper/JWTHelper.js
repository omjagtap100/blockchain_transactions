import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret'; // Using secret from env for simplicity as per plan
const EXPIRES_IN = process.env.JWT_EXPIRES_IN ? `${process.env.JWT_EXPIRES_IN}d` : '150d';

export const JWT_signProfile = (profile, profileType) => {
    let newProfile = { ...profile };
    newProfile.profileType = profileType;
    const token = jwt.sign(newProfile, JWT_SECRET, { expiresIn: EXPIRES_IN });
    return { token, expiresIn: EXPIRES_IN };
};

export const JWT_verifyProfile = (token) => {
    try {
        const claim = jwt.verify(token, JWT_SECRET);
        return claim;
    } catch (err) {
        console.log(`JWT_verifyProfile ERROR`, err.name);
        return;
    }
};

export function generate_JWT(user) {
    const payload = {
        id: user.id,
        name: user.firstName ? `${user.firstName} ${user.lastName}` : user.phone || user.email,
        membershipId: user.id.toString(), // Simplify for now
    };
    let newProfile = { ...payload };
    newProfile.profileType = 'customer'; // Matching reference
    const token = jwt.sign(newProfile, JWT_SECRET, { expiresIn: EXPIRES_IN });
    return { accessToken: token, expiresIn: EXPIRES_IN };
}
