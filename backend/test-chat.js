const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { v2 } = require('@google-cloud/translate');

async function main() {
  const senderId = 'cmp254o7j0000ik24dnkj9vq3'; // en
  const conversationId = 'cmp25e7490004ik24xa4373hh';
  
  const conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
  const participants = conv.participants;
  console.log('Participants:', participants);
  console.log('is array?', Array.isArray(participants));
  
  const sender = await prisma.user.findUnique({ where: { id: senderId }, select: { preferredLanguage: true } });
  const senderLang = sender?.preferredLanguage || 'en';
  console.log('Sender lang:', senderLang);
  
  const otherIds = participants.filter((id) => id !== senderId);
  console.log('Other IDs:', otherIds);
  
  const otherUsers = await prisma.user.findMany({
    where: { id: { in: otherIds } },
    select: { preferredLanguage: true },
  });
  console.log('Other users:', otherUsers);
  
  const targetLangs = [...new Set(otherUsers.map((u) => u.preferredLanguage || 'en'))].filter((lang) => lang !== senderLang);
  console.log('Target langs:', targetLangs);
  
  if (targetLangs.length > 0) {
    const translate = new v2.Translate({ key: process.env.GOOGLE_TRANSLATE_API_KEY });
    const [translations, metadata] = await translate.translate('Can you help me?', targetLangs[0]);
    console.log('Translation:', translations);
    console.log('Metadata:', JSON.stringify(metadata, null, 2));
  }
}

main().finally(() => prisma.$disconnect());
