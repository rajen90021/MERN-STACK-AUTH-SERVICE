import { expressjwt } from 'express-jwt';
import { Config } from '../config';
import { Request } from 'express';
import { AuthCookie, IRefreshTokenPayload, TokenPayload } from '../types';
import { AppDataSource } from '../config/data-source';
import { RefreshToken } from '../entity/RefreshToken';

import logger from '../config/logger';



export default expressjwt({
    secret: Config.REFRESH_TOKEN_SECRET!,
    algorithms: ['HS256'],
    getToken(req: Request) {
        

        const {refreshToken}= req.cookies as AuthCookie;
        return refreshToken;
    },

    isRevoked: async (req: Request, token) => {
        console.log("token from miidleware",token)
         try{
          const  refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
          const refreshTokenEntity = await refreshTokenRepo.findOne({
            where: {
              id: Number((token?.payload as IRefreshTokenPayload).id),
              user :{id:Number(token?.payload?.sub)}
            },
          })
          return refreshTokenEntity === null;

         }catch(e){
                logger.error(e)
                
         }
         return true;
    },
})