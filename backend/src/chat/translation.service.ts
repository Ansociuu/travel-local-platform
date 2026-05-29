import { Injectable, Logger } from '@nestjs/common';
import { v2 } from '@google-cloud/translate';

@Injectable()
export class TranslationService {
  private translate: v2.Translate | null = null;
  private readonly logger = new Logger(TranslationService.name);

  constructor() {
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (apiKey) {
      this.translate = new v2.Translate({ key: apiKey });
      this.logger.log('Google Translate API initialized');
    } else {
      this.logger.warn('GOOGLE_TRANSLATE_API_KEY is not defined. Translation will be bypassed.');
    }
  }

  async translateText(
    text: string,
    targetLanguage: string,
  ): Promise<{ translatedText: string; detectedSourceLanguage: string }> {
    if (!this.translate) {
      return { translatedText: text, detectedSourceLanguage: 'unknown' };
    }
    
    try {
      const [translations, metadata] = await this.translate.translate(text, targetLanguage);
      const translatedText = Array.isArray(translations) ? translations[0] : translations;
      
      const responseData: any = metadata?.data;
      const detectedSourceLanguage = responseData?.translations?.[0]?.detectedSourceLanguage || 'unknown';

      return {
        translatedText,
        detectedSourceLanguage,
      };
    } catch (error) {
      this.logger.error('Error translating text:', error.message);
      return { translatedText: text, detectedSourceLanguage: 'unknown' };
    }
  }
}
