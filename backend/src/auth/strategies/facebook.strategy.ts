import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super({
      clientID: process.env.FACEBOOK_APP_ID || 'dummy-id',
      clientSecret: process.env.FACEBOOK_APP_SECRET || 'dummy-secret',
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:3002'}/auth/facebook/callback`,
      scope: 'email',
      profileFields: ['emails', 'name'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    const { name, emails } = profile;
    
    // Kiểm tra an toàn cho TypeScript
    const email = emails && emails.length > 0 ? emails[0].value : null;
    const firstName = name ? name.givenName : '';
    const lastName = name ? name.familyName : '';

    if (!email) {
      return done(new Error('Facebook account does not have an email associated'), null);
    }

    const user = {
      email,
      firstName,
      lastName,
    };
    done(null, user);
  }
}
