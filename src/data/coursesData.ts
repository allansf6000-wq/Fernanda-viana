import { Course } from '../types/game';

export const JAPANESE_COURSES: Course[] = [
  {
    id: 'course_hiragana',
    title: 'Hiragana Completo do Zero',
    japaneseTitle: 'ひらがなマスターコース',
    description: 'Aprenda os 46 caracteres fundamentais da língua japonesa, regras de pronúncia pura e primeiras palavras.',
    levelBadge: 'Iniciante N5',
    icon: '🌸',
    tagColor: 'amber',
    totalXp: 300,
    certificateName: 'Certificado de Maestria em Hiragana',
    lessons: [
      {
        id: 'h_lesson_1',
        courseId: 'course_hiragana',
        title: 'As 5 Vogais Mestras: A, I, U, E, O',
        durationMinutes: 5,
        overview: 'As vogais japonesas são a alma de todo o sistema fonético. Dominá-las garante uma pronúncia limpa e natural.',
        fernandaTeaching:
          'Olá! Eu sou a Fernanda e serei sua professora nesta jornada. No japonês, as vogais nunca mudam de som! "A" soa sempre aberto como em "asa", "I" como em "ilha", "U" com os lábios relaxados (sem bico exagerado), "E" sempre fechado como em "estrela" e "O" como em "olho". Vamos ouvir e memorizar juntos!',
        examples: [
          { jp: 'あさ', reading: 'asa', meaningPt: 'Manhã' },
          { jp: 'いぬ', reading: 'inu', meaningPt: 'Cachorro' },
          { jp: 'うみ', reading: 'umi', meaningPt: 'Mar' },
          { jp: 'えき', reading: 'eki', meaningPt: 'Estação de trem' },
          { jp: 'おちゃ', reading: 'ocha', meaningPt: 'Chá verde' },
        ],
        quiz: {
          question: 'Qual é a pronúncia correta da vogal "E" (え) no japonês?',
          options: [
            'Sempre fechada como em "estrela" ou "café"',
            'Aberta como em "festa"',
            'Varia de acordo com a consoante seguinte',
            'É muda no fim das frases',
          ],
          correctIndex: 0,
          explanation: 'No japonês as vogais são puras e estáveis. O "E" soa sempre fechado!',
        },
        xpReward: 50,
      },
      {
        id: 'h_lesson_2',
        courseId: 'course_hiragana',
        title: 'As Linhas KA (か) e SA (さ)',
        durationMinutes: 6,
        overview: 'Combinando as vogais com as consoantes K e S para formar sons dinâmicos.',
        fernandaTeaching:
          'Muito bem! Agora juntamos a consoante K às vogais: Ka (か), Ki (き), Ku (く), Ke (け), Ko (こ). Na linha S, atenção especial ao som do "Shi" (し), que soa como "xí" e não "si"!',
        examples: [
          { jp: 'さくら', reading: 'sakura', meaningPt: 'Flor de cerejeira' },
          { jp: 'くるま', reading: 'kuruma', meaningPt: 'Carro' },
          { jp: 'しろ', reading: 'shiro', meaningPt: 'Castelo / Branco' },
          { jp: 'すし', reading: 'sushi', meaningPt: 'Sushi tradicional' },
        ],
        quiz: {
          question: 'Como se pronuncia o caractere "し" da linha do S?',
          options: [
            'Como "Shi" (som de "xí" em xícara)',
            'Como "Si" comum',
            'Como "Se" mudo',
            'Como "Chi"',
          ],
          correctIndex: 0,
          explanation: 'No japonês clássico e moderno, o par S + I pronuncia-se "Shi" (como xícara)!',
        },
        xpReward: 50,
      },
      {
        id: 'h_lesson_3',
        courseId: 'course_hiragana',
        title: 'As Linhas TA (た) e NA (な)',
        durationMinutes: 6,
        overview: 'Conheça os sons especiais Chi (ち) e Tsu (つ) e a suave linha do N.',
        fernandaTeaching:
          'A linha do T tem duas surpresas: em vez de "Ti", temos "Chi" (ち, como tchê ou tchau), e em vez de "Tu", temos "Tsu" (つ, como o início de tsunami com sopro na ponta da língua). A linha N é suave: Na, Ni, Nu, Ne, No.',
        examples: [
          { jp: 'ともだち', reading: 'tomodachi', meaningPt: 'Amigo(a)' },
          { jp: 'つき', reading: 'tsuki', meaningPt: 'Lua' },
          { jp: 'ねこ', reading: 'neko', meaningPt: 'Gato' },
          { jp: 'にほん', reading: 'nihon', meaningPt: 'Japão' },
        ],
        quiz: {
          question: 'Qual palavra significa "amigo(a)" e termina com "chi"?',
          options: ['ともだち (tomodachi)', 'せんせい (sensei)', 'がっこう (gakkou)', 'ねこ (neko)'],
          correctIndex: 0,
          explanation: 'ともだち (tomodachi) é a palavra japonesa para amigo ou amiga!',
        },
        xpReward: 50,
      },
      {
        id: 'h_lesson_4',
        courseId: 'course_hiragana',
        title: 'Sons Modificados: Dakuten (゛) e Handakuten (゜)',
        durationMinutes: 7,
        overview: 'Transforme Ka em Ga, Sa em Za, Ta em Da, e Ha em Ba ou Pa com dois pontinhos mágicos!',
        fernandaTeaching:
          'Adicionar dois tracinhos (dakuten / ten-ten) transforma sons surdos em sonoros: K vira G (か -> が Ga), S vira Z (さ -> ざ Za), T vira D (た -> だ Da) e H vira B (は -> ば Ba). Já o pequeno círculo (handakuten / maru) transforma H em P (は -> ぱ Pa)!',
        examples: [
          { jp: 'がくせい', reading: 'gakusei', meaningPt: 'Estudante' },
          { jp: 'みず', reading: 'mizu', meaningPt: 'Água' },
          { jp: 'ありがとう', reading: 'arigatou', meaningPt: 'Obrigado' },
          { jp: 'きんぱつ', reading: 'kinpatsu', meaningPt: 'Cabelo loiro' },
        ],
        quiz: {
          question: 'O que acontece ao adicionar o círculo handakuten (゜) ao caractere は (Ha)?',
          options: [
            'Ele se torna ぱ (Pa)',
            'Ele se torna ば (Ba)',
            'Ele vira Ma',
            'Ele fica mudo',
          ],
          correctIndex: 0,
          explanation: 'O círculo handakuten transforma os sons da linha H em sons com P: Pa, Pi, Pu, Pe, Po!',
        },
        xpReward: 60,
      },
    ],
  },

  {
    id: 'course_katakana',
    title: 'Katakana & Palavras Estrangeiras (Gairaigo)',
    japaneseTitle: 'カタカナ・外来語マスター',
    description: 'Domine a escrita angulosa usada para tecnologia, culinária internacional e nomes ocidentais.',
    levelBadge: 'Intermediário Inicial',
    icon: '✈️',
    tagColor: 'sky',
    totalXp: 280,
    certificateName: 'Certificado de Fluência em Katakana',
    lessons: [
      {
        id: 'k_lesson_1',
        courseId: 'course_katakana',
        title: 'Por que o Katakana Existe?',
        durationMinutes: 5,
        overview: 'Entenda o papel histórico e prático do alfabeto de cantos retos no Japão moderno.',
        fernandaTeaching:
          'O Katakana possui os mesmos 46 sons do Hiragana, mas com traços retos e geométricos. Ele é usado para: 1) Palavras importadas de outras línguas (Gairaigo); 2) Nomes e países estrangeiros; 3) Onomatopeias em mangás; 4) Nomes científicos de animais e plantas.',
        examples: [
          { jp: 'ブラジル', reading: 'Burajiru', meaningPt: 'Brasil' },
          { jp: 'ポルトガル', reading: 'Porutogaru', meaningPt: 'Portugal' },
          { jp: 'フェルナンダ', reading: 'Ferunanda', meaningPt: 'Fernanda (meu nome!)' },
        ],
        quiz: {
          question: 'Como se escreve o nome do Brasil em Katakana?',
          options: ['ブラジル (Burajiru)', 'ポルトガル (Porutogaru)', 'アメリカ (Amerika)', 'にほん (Nihon)'],
          correctIndex: 0,
          explanation: 'ブラジル (Burajiru) é a adaptação fonética de "Brasil" ao sistema silábico japonês!',
        },
        xpReward: 50,
      },
      {
        id: 'k_lesson_2',
        courseId: 'course_katakana',
        title: 'Palavras de Origem Portuguesa no Japão',
        durationMinutes: 6,
        overview: 'Descubra como os portugueses influenciaram o vocabulário japonês no século XVI.',
        fernandaTeaching:
          'Sabia que muitos termos comuns no dia a dia japonês vieram diretamente de Portugal? No século XVI, navegadores portugueses levaram produtos como o pão (パン - pan), o copo (コップ - koppu), o botão de camisa (ボタン - botan) e o doce Castella (カステラ - kasutera)!',
        examples: [
          { jp: 'パン', reading: 'pan', meaningPt: 'Pão (do português "pão")' },
          { jp: 'コップ', reading: 'koppu', meaningPt: 'Copo / Taça (do português "copo")' },
          { jp: 'ボタン', reading: 'botan', meaningPt: 'Botão de roupa (do português "botão")' },
          { jp: 'カステラ', reading: 'kasutera', meaningPt: 'Bolo de Castela' },
        ],
        quiz: {
          question: 'De qual idioma a palavra japonesa パン (pan, pão) foi importada?',
          options: ['Do Português', 'Do Inglês', 'Do Francês', 'Do Espanhol'],
          correctIndex: 0,
          explanation: 'パン (pan) foi introduzida pelos comerciantes e padres portugueses em 1543!',
        },
        xpReward: 60,
      },
      {
        id: 'k_lesson_3',
        courseId: 'course_katakana',
        title: 'No Restaurante e Café: O Menu em Katakana',
        durationMinutes: 6,
        overview: 'Aprenda a ler o cardápio e pedir suas comidas e bebidas favoritas no Japão.',
        fernandaTeaching:
          'Ao entrar em um café ou restaurante no Japão, a maior parte do menu ocidental estará em Katakana. Note o traço longo "ー" (chōonpu), que estica o som da vogal!',
        examples: [
          { jp: 'コーヒー', reading: 'kōhī', meaningPt: 'Café (note o som esticado do o e do i)' },
          { jp: 'ケーキ', reading: 'kēki', meaningPt: 'Bolo (cake)' },
          { jp: 'ハンバーガー', reading: 'hanbāgā', meaningPt: 'Hambúrguer' },
          { jp: 'ピザ', reading: 'piza', meaningPt: 'Pizza' },
        ],
        quiz: {
          question: 'O que indica o traço reto horizontal "ー" nas palavras em Katakana?',
          options: [
            'Que a vogal anterior deve ter seu som prolongado',
            'Que a palavra terminou',
            'Que a sílaba é muda',
            'Uma pontuação de exclamação',
          ],
          correctIndex: 0,
          explanation: 'O chōonpu "ー" dobra a duração do som da vogal (ex: コーヒー kō-hī)!',
        },
        xpReward: 60,
      },
    ],
  },

  {
    id: 'course_caligrafia',
    title: 'A Arte dos Traços (書き順 - Kakijun)',
    japaneseTitle: '美しい筆順・書道入門',
    description: 'Aprenda os segredos da caligrafia japonesa, equilíbrio visual e a ordem universal dos traços.',
    levelBadge: 'Prática & Caligrafia',
    icon: '🖌️',
    tagColor: 'rose',
    totalXp: 260,
    certificateName: 'Diploma de Caligrafia e Pincel',
    lessons: [
      {
        id: 'c_lesson_1',
        courseId: 'course_caligrafia',
        title: 'As 3 Regras de Ouro da Caligrafia',
        durationMinutes: 5,
        overview: 'De cima para baixo, da esquerda para a direita, e centro antes dos lados.',
        fernandaTeaching:
          'A ordem dos traços (Kakijun) não é capricho: ela foi aperfeiçoada ao longo de mais de mil anos para que o pincel flua com graça e o caractere fique sempre perfeitamente equilibrado no quadrante!',
        examples: [
          { jp: '上から下へ', reading: 'ue kara shita e', meaningPt: 'De cima para baixo' },
          { jp: '左から右へ', reading: 'hidari kara migi e', meaningPt: 'Da esquerda para a direita' },
          { jp: '真ん中から', reading: 'mannaka kara', meaningPt: 'Centro antes das laterais' },
        ],
        quiz: {
          question: 'Qual é o sentido padrão dos traços horizontais em japonês?',
          options: [
            'Da esquerda para a direita',
            'Da direita para a esquerda',
            'De baixo para cima',
            'Não importa a direção',
          ],
          correctIndex: 0,
          explanation: 'Traços horizontais são sempre desenhados da esquerda para a direita!',
        },
        xpReward: 50,
      },
      {
        id: 'c_lesson_2',
        courseId: 'course_caligrafia',
        title: 'As Três Finalizações: Tome, Hane e Harai',
        durationMinutes: 6,
        overview: 'Como parar o traço, fazer o gancho suave e deslizar a ponta para soltar a tinta.',
        fernandaTeaching:
          'Ao escrever, observe o final do traço: 1) Tome (止): parar firme o traço; 2) Hane (跳): levantar fazendo um pequeno gancho como em い ou し; 3) Harai (払): deslizar o pincel até a ponta afinar suavemente, como em 人 ou 大.',
        examples: [
          { jp: '止め', reading: 'tome', meaningPt: 'Parada firme' },
          { jp: '跳ね', reading: 'hane', meaningPt: 'Salto com gancho' },
          { jp: '払い', reading: 'harai', meaningPt: 'Deslize suave que afina' },
        ],
        quiz: {
          question: 'Como se chama o efeito onde o traço é desacelerado e solto gradualmente?',
          options: ['Harai (払い)', 'Tome (止め)', 'Hane (跳ね)', 'Katan'],
          correctIndex: 0,
          explanation: 'Harai é o elegante movimento de varredura que deixa a ponta afunilada!',
        },
        xpReward: 60,
      },
    ],
  },

  {
    id: 'course_conversacao',
    title: 'Conversação Prática com a Fernanda',
    japaneseTitle: 'フェルナンダ先生の実践会話',
    description: 'Diálogos da vida real: apresente-se, faça perguntas na sala de aula e converse com naturalidade.',
    levelBadge: 'Conversação Ativa',
    icon: '🗣️',
    tagColor: 'emerald',
    totalXp: 320,
    certificateName: 'Certificado de Comunicação e Diálogo',
    lessons: [
      {
        id: 'cv_lesson_1',
        courseId: 'course_conversacao',
        title: 'Autoapresentação Perfeita (自己紹介 - Jikoshoukai)',
        durationMinutes: 6,
        overview: 'Como se apresentar em japonês com simpatia, respeito e pronúncia autêntica.',
        fernandaTeaching:
          'Quando nos apresentamos, seguimos esta estrutura de ouro: 1) "Hajimemashite!" (Prazer em conhecê-lo); 2) "[Seu nome] desu" (Sou o ...); 3) "Burajiru kara kimashita" (Vim do Brasil); 4) "Douzo yoroshiku onegaishimasu!" (Conto com a sua colaboração!).',
        examples: [
          { jp: 'はじめまして！', reading: 'Hajimemashite!', meaningPt: 'Prazer em conhecê-lo(a)!' },
          { jp: 'わたしは生徒です。', reading: 'Watashi wa seito desu.', meaningPt: 'Eu sou estudante.' },
          { jp: 'どうぞよろしくお願いします！', reading: 'Douzo yoroshiku onegaishimasu!', meaningPt: 'Muito prazer e conto com seu apoio!' },
        ],
        quiz: {
          question: 'Qual expressão clássica fecha com respeito a apresentação pessoal no Japão?',
          options: [
            'どうぞよろしくお願いします (Douzo yoroshiku onegaishimasu)',
            'さようなら (Sayounara)',
            'おやすみなさい (Oyasuminasai)',
            'いただきます (Itadakimasu)',
          ],
          correctIndex: 0,
          explanation: 'Douzo yoroshiku onegaishimasu é a fórmula essencial de polidez e apreço mútuo.',
        },
        xpReward: 60,
      },
      {
        id: 'cv_lesson_2',
        courseId: 'course_conversacao',
        title: 'Tirando Dúvidas na Aula (質問があります)',
        durationMinutes: 6,
        overview: 'Frases práticas para pedir para repetir, tirar dúvidas e agradecer na escola.',
        fernandaTeaching:
          'Se você não entender algo durante uma aula de japonês, não se preocupe! Use frases como: "Mō ichido onegaishimasu" (Mais uma vez, por favor!) e "Wakarimashita" (Entendi!).',
        examples: [
          { jp: '先生、質問があります。', reading: 'Sensei, shitsumon ga arimasu.', meaningPt: 'Professora, tenho uma pergunta.' },
          { jp: 'もう一度お願いします。', reading: 'Mō ichido onegaishimasu.', meaningPt: 'Mais uma vez, por favor.' },
          { jp: 'わかりました！', reading: 'Wakarimashita!', meaningPt: 'Entendi / Compreendi!' },
        ],
        quiz: {
          question: 'Como pedir educadamente à professora para repetir uma frase?',
          options: [
            'もう一度お願いします (Mō ichido onegaishimasu)',
            'ごめんなさい (Gomennasai)',
            'じゃあね (Jaa ne)',
            'おいしいです (Oishii desu)',
          ],
          correctIndex: 0,
          explanation: '"Mō ichido onegaishimasu" significa literalmente "mais uma vez, por gentileza"!',
        },
        xpReward: 60,
      },
    ],
  },
];
