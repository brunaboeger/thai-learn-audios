import googleTTS from 'google-tts-api';
import fs from 'fs/promises';
import path from 'path';

const OUTPUT_DIR = './audios';

// Lista de palavras/frases a gerar.
// audioFile = nome do arquivo esperado pelo hook usePronunciation (sem extensão)
// text = texto em tailandês a ser sintetizado
const WORDS = [
  { audioFile: 'pronuncia', text: 'thai' },
];

async function generateAudio({ audioFile, text }) {
  // getAllAudioUrls quebra textos longos em pedaços automaticamente,
  // mas pra palavras/frases curtas normalmente retorna 1 único pedaço.
  const results = googleTTS.getAllAudioUrls(text, {
    lang: 'th',
    slow: false,
    host: 'https://translate.google.com',
  });

  // Baixa cada pedaço e concatena (na prática, quase sempre é só 1)
  const buffers = [];
  for (const { url } of results) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    buffers.push(Buffer.from(arrayBuffer));
  }

  const filePath = path.join(OUTPUT_DIR, `${audioFile}.mp3`);
  await fs.writeFile(filePath, Buffer.concat(buffers));
  console.log(`Gerado: ${filePath}`);
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  for (const word of WORDS) {
    try {
      await generateAudio(word);
      // Pequena pausa entre requisições para não tomar rate limit
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (err) {
      console.error(`Falha ao gerar "${word.audioFile}":`, err.message);
    }
  }
}

main();
