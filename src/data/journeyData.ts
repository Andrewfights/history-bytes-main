import { Arc, JourneyChapter, JourneyNode, TwoTruthsContent, FoundTapeContent, HeadlinesContent, QuizMixContent, DecisionContent, BossContent, TwoTruthsQuestion, VideoLessonContent, ImageExploreContent, ChronoOrderContent } from '@/types';

// ============================================================
// FRENCH REVOLUTION ARC
// ============================================================

const frenchRevolutionChapter1Nodes: JourneyNode[] = [
  {
    id: 'fr-c1-n1',
    chapterId: 'fr-c1',
    type: 'two-truths',
    title: 'Royal Myths',
    order: 1,
    xpReward: 60,
    content: {
      type: 'two-truths',
      statements: [
        'Marie Antoinette said "Let them eat cake" when told peasants had no bread.',
        'King Louis XVI was an amateur locksmith who made locks as a hobby.',
        'The Palace of Versailles had over 700 rooms and 1,200 fireplaces.',
      ],
      lieIndex: 0,
      explanation: 'Marie Antoinette never said "Let them eat cake." This quote was attributed to her by political enemies. The phrase actually appeared in Rousseau\'s writings when Marie was only 9 years old!',
      hostReaction: 'Ah, the cake myth! One of history\'s most persistent lies.',
      context: 'Before the Revolution, France was ruled by King Louis XVI and Queen Marie Antoinette from the magnificent Palace of Versailles. Many myths have grown around this royal couple over the centuries. Let\'s separate fact from fiction!',
      learningPoints: [
        'The Palace of Versailles was the center of French royal power',
        'King Louis XVI had unusual hobbies for a monarch',
        'Many famous quotes are misattributed to historical figures',
      ],
    } as TwoTruthsContent,
  },
  {
    id: 'fr-c1-n2',
    chapterId: 'fr-c1',
    type: 'found-tape',
    title: 'Voices from Versailles',
    order: 2,
    xpReward: 40,
    content: {
      type: 'found-tape',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Placeholder
      title: 'A Servant\'s Account',
      context: 'Discovered memoir fragment, Palace of Versailles, 1788',
      transcript: [
        { id: 't1', text: 'The halls of Versailles gleamed with gold, but outside the gates, Paris starved.', startTime: 0, endTime: 5 },
        { id: 't2', text: 'I served the Queen her breakfast each morning—fresh pastries, exotic fruits, chocolate from the Americas.', startTime: 5, endTime: 11 },
        { id: 't3', text: 'She was not cruel, merely... ignorant. She had never seen a peasant\'s home.', startTime: 11, endTime: 17 },
        { id: 't4', text: 'When the bread prices rose, we servants whispered among ourselves. Something had to change.', startTime: 17, endTime: 24 },
        { id: 't5', text: 'The King spent his days in his workshop, making locks, while his kingdom fell apart.', startTime: 24, endTime: 30 },
      ],
      questions: [
        {
          id: 'fr-c1-n2-q1',
          sessionId: 'fr-c1-n2',
          type: 'multiple-choice',
          prompt: 'According to the servant, what was the Queen\'s attitude toward the peasants?',
          choices: ['Actively cruel', 'Deliberately neglectful', 'Simply unaware', 'Deeply concerned'],
          answer: 2,
          explanation: 'The servant describes the Queen as "not cruel, merely ignorant" - she had never seen how common people lived.',
        },
      ],
    } as FoundTapeContent,
  },
  {
    id: 'fr-c1-n3',
    chapterId: 'fr-c1',
    type: 'headlines',
    title: 'Paris Gazette',
    order: 3,
    xpReward: 60,
    content: {
      type: 'headlines',
      publication: 'PARIS GAZETTE',
      date: 'June 1789',
      headlines: [
        {
          id: 'h1',
          title: 'BREAD PRICES REACH RECORD HIGH',
          body: 'A single loaf now costs a worker\'s entire daily wage. Bakeries report empty shelves as grain shipments fail to arrive.',
          imageUrl: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&w=400',
        },
        {
          id: 'h2',
          title: 'ESTATES-GENERAL CONVENED FOR FIRST TIME IN 175 YEARS',
          body: 'King Louis XVI summons representatives of clergy, nobility, and commoners to address the financial crisis gripping the nation.',
          imageUrl: 'https://images.pexels.com/photos/5765/castle-tower-architecture-building.jpg?auto=compress&w=400',
        },
        {
          id: 'h3',
          title: 'THIRD ESTATE DEMANDS EQUAL REPRESENTATION',
          body: 'Commoners, representing 97% of the population, refuse to be outvoted by clergy and nobles combined.',
          imageUrl: 'https://images.pexels.com/photos/2833037/pexels-photo-2833037.jpeg?auto=compress&w=400',
        },
      ],
      questions: [
        {
          id: 'fr-c1-n3-q1',
          sessionId: 'fr-c1-n3',
          type: 'multiple-choice',
          prompt: 'What percentage of the French population did the Third Estate represent?',
          choices: ['50%', '75%', '97%', '33%'],
          answer: 2,
          explanation: 'The Third Estate (commoners) represented about 97% of France\'s population, yet had equal voting power to the clergy and nobility combined.',
        },
      ],
    } as HeadlinesContent,
  },
  {
    id: 'fr-c1-n4',
    chapterId: 'fr-c1',
    type: 'quiz-mix',
    title: 'Test Your Knowledge',
    order: 4,
    xpReward: 100,
    content: {
      type: 'quiz-mix',
      questions: [
        {
          id: 'fr-c1-n4-q1',
          sessionId: 'fr-c1-n4',
          type: 'multiple-choice',
          prompt: 'What was the main cause of France\'s financial crisis in 1789?',
          choices: ['Plague epidemic', 'War debts and royal spending', 'Foreign invasion', 'Natural disaster'],
          answer: 1,
          explanation: 'France was nearly bankrupt from supporting the American Revolution and the lavish spending of the royal court.',
        },
        {
          id: 'fr-c1-n4-q2',
          sessionId: 'fr-c1-n4',
          type: 'true-false',
          prompt: 'The French Revolution began in 1789.',
          choices: ['True', 'False'],
          answer: 0,
          explanation: 'The French Revolution is traditionally dated from the storming of the Bastille on July 14, 1789.',
        },
        {
          id: 'fr-c1-n4-q3',
          sessionId: 'fr-c1-n4',
          type: 'multiple-choice',
          prompt: 'What were the three "Estates" in pre-revolutionary France?',
          choices: [
            'King, Queen, and Prince',
            'Clergy, Nobility, and Commoners',
            'Army, Navy, and Merchants',
            'Paris, Lyon, and Marseille',
          ],
          answer: 1,
          explanation: 'French society was divided into three estates: the First Estate (clergy), Second Estate (nobility), and Third Estate (everyone else).',
        },
      ],
    } as QuizMixContent,
  },
  {
    id: 'fr-c1-n5',
    chapterId: 'fr-c1',
    type: 'decision',
    title: 'The Tennis Court Oath',
    order: 5,
    xpReward: 80,
    content: {
      type: 'decision',
      scenario: 'June 20, 1789: The Third Estate finds themselves locked out of their meeting hall by the King\'s orders. You are a delegate representing the commoners of Paris.',
      context: 'Rain pours outside. Your fellow delegates are furious. Someone suggests gathering at a nearby indoor tennis court to continue the meeting.',
      optionA: {
        label: 'Disperse and wait for the King\'s permission',
        outcome: 'The movement loses momentum. The King continues to ignore the demands of the people.',
        isHistorical: false,
      },
      optionB: {
        label: 'Take the oath: never disperse until a constitution is written',
        outcome: 'The delegates unite in defiance. The National Assembly is born, and the revolution has truly begun.',
        isHistorical: true,
      },
      historicalOutcome: 'The delegates chose to take the Tennis Court Oath, vowing never to separate until they had given France a constitution. This act of defiance marked the birth of the National Assembly.',
      hostReaction: 'The Tennis Court Oath was the moment the revolution became unstoppable!',
    } as DecisionContent,
  },
  {
    id: 'fr-c1-n6',
    chapterId: 'fr-c1',
    type: 'boss',
    title: 'Chapter Boss: Before the Storm',
    order: 6,
    xpReward: 150,
    content: {
      type: 'boss',
      timeLimit: 60,
      xpMultiplier: 2,
      hostIntro: 'You\'ve learned about the powder keg that was France in 1789. Now prove your mastery!',
      hostVictory: 'Magnifique! You truly understand the forces that shaped the revolution!',
      hostDefeat: 'The revolution is complex. Return when you\'ve studied more of its origins.',
      questions: [
        {
          id: 'fr-c1-n6-q1',
          sessionId: 'fr-c1-n6',
          type: 'multiple-choice',
          prompt: 'Quick! Who was the King of France at the start of the Revolution?',
          choices: ['Louis XIV', 'Louis XV', 'Louis XVI', 'Napoleon'],
          answer: 2,
          explanation: 'Louis XVI was King when the Revolution began in 1789.',
        },
        {
          id: 'fr-c1-n6-q2',
          sessionId: 'fr-c1-n6',
          type: 'multiple-choice',
          prompt: 'What did the Third Estate declare themselves on June 17, 1789?',
          choices: ['The Royal Court', 'The National Assembly', 'The Revolutionary Guard', 'The People\'s Republic'],
          answer: 1,
          explanation: 'The Third Estate declared themselves the National Assembly, claiming to represent the French nation.',
        },
        {
          id: 'fr-c1-n6-q3',
          sessionId: 'fr-c1-n6',
          type: 'true-false',
          prompt: 'The Palace of Versailles was located in central Paris.',
          choices: ['True', 'False'],
          answer: 1,
          explanation: 'Versailles was located about 12 miles southwest of Paris, deliberately built away from the city.',
        },
        {
          id: 'fr-c1-n6-q4',
          sessionId: 'fr-c1-n6',
          type: 'multiple-choice',
          prompt: 'What sport was being played in the hall where the famous Oath was taken?',
          choices: ['Fencing', 'Tennis', 'Cricket', 'Polo'],
          answer: 1,
          explanation: 'The Tennis Court Oath was named for the indoor tennis court (jeu de paume) where it took place.',
        },
      ],
    } as BossContent,
  },
];

const frenchRevolutionChapter1: JourneyChapter = {
  id: 'fr-c1',
  arcId: 'french-revolution',
  title: 'Before the Storm',
  description: 'Discover the powder keg that was France in 1789',
  order: 1,
  nodes: frenchRevolutionChapter1Nodes,
  isLocked: false,
};

// French Revolution Chapter 2: The Bastille Falls
const frenchRevolutionChapter2Nodes: JourneyNode[] = [
  {
    id: 'fr-c2-n1',
    chapterId: 'fr-c2',
    type: 'two-truths',
    title: 'Storming Myths',
    order: 1,
    xpReward: 60,
    content: {
      type: 'two-truths',
      statements: [
        'The Bastille was holding hundreds of political prisoners when it was stormed.',
        'The storming of the Bastille began because revolutionaries needed gunpowder.',
        'The fortress was defended by fewer than 100 soldiers.',
      ],
      lieIndex: 0,
      explanation: 'The Bastille actually held only 7 prisoners when it was stormed! It was more symbolic of royal tyranny than an actual prison. The revolutionaries wanted the gunpowder stored there.',
      hostReaction: 'The Bastille was nearly empty! Its symbolic power far exceeded its actual importance.',
    } as TwoTruthsContent,
  },
  {
    id: 'fr-c2-n2',
    chapterId: 'fr-c2',
    type: 'found-tape',
    title: 'Eyewitness to Revolution',
    order: 2,
    xpReward: 40,
    content: {
      type: 'found-tape',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      title: 'A Soldier\'s Account',
      context: 'Testimony from a garrison soldier, July 14, 1789',
      transcript: [
        { id: 't1', text: 'They came at dawn, thousands of them, armed with pikes and muskets.', startTime: 0, endTime: 5 },
        { id: 't2', text: 'Our commander, de Launay, tried to negotiate. They would not listen.', startTime: 5, endTime: 10 },
        { id: 't3', text: 'When the drawbridge fell, they poured in like a flood.', startTime: 10, endTime: 15 },
        { id: 't4', text: 'They freed the prisoners—all seven of them. Just seven.', startTime: 15, endTime: 20 },
        { id: 't5', text: 'The commander\'s head was on a pike before sunset.', startTime: 20, endTime: 25 },
      ],
      questions: [
        {
          id: 'fr-c2-n2-q1',
          sessionId: 'fr-c2-n2',
          type: 'multiple-choice',
          prompt: 'How many prisoners were freed from the Bastille?',
          choices: ['Hundreds', 'Dozens', 'Seven', 'None'],
          answer: 2,
          explanation: 'Only 7 prisoners were held in the Bastille when it was stormed.',
        },
        {
          id: 'fr-c2-n2-q2',
          sessionId: 'fr-c2-n2',
          type: 'multiple-choice',
          prompt: 'What happened to the Bastille\'s commander?',
          choices: ['He escaped', 'He was killed', 'He joined the revolution', 'He was imprisoned'],
          answer: 1,
          explanation: 'Governor de Launay was killed by the mob, and his head was paraded on a pike.',
        },
        {
          id: 'fr-c2-n2-q3',
          sessionId: 'fr-c2-n2',
          type: 'multiple-choice',
          prompt: 'What time of day did the crowd arrive?',
          choices: ['Midnight', 'Dawn', 'Noon', 'Sunset'],
          answer: 1,
          explanation: 'The crowd arrived at dawn on July 14, 1789.',
        },
      ],
    } as FoundTapeContent,
  },
  {
    id: 'fr-c2-n3',
    chapterId: 'fr-c2',
    type: 'headlines',
    title: 'Revolution in Print',
    order: 3,
    xpReward: 60,
    content: {
      type: 'headlines',
      publication: 'LE MONITEUR',
      date: 'July 15, 1789',
      headlines: [
        {
          id: 'h1',
          title: 'BASTILLE FALLS TO THE PEOPLE',
          body: 'In a stunning display of popular fury, thousands of Parisians stormed the fortress of the Bastille yesterday, liberating prisoners and seizing arms.',
        },
        {
          id: 'h2',
          title: 'KING LEARNS OF UPRISING',
          body: 'When informed of the Bastille\'s fall, King Louis XVI reportedly asked "Is it a revolt?" His advisor replied: "No, Sire, it is a revolution."',
        },
        {
          id: 'h3',
          title: 'NATIONAL GUARD FORMED',
          body: 'The Marquis de Lafayette has been named commander of the newly formed National Guard. The tricolor cockade—blue, white, and red—is now worn throughout Paris.',
        },
      ],
      questions: [
        {
          id: 'fr-c2-n3-q1',
          sessionId: 'fr-c2-n3',
          type: 'multiple-choice',
          prompt: 'What was the King\'s first reaction to the fall of the Bastille?',
          choices: ['Anger', 'He asked if it was a revolt', 'He fled Paris', 'He celebrated'],
          answer: 1,
          explanation: 'Louis XVI famously asked "Is it a revolt?" to which his advisor responded "No, Sire, it is a revolution."',
        },
        {
          id: 'fr-c2-n3-q2',
          sessionId: 'fr-c2-n3',
          type: 'multiple-choice',
          prompt: 'Who became commander of the National Guard?',
          choices: ['Napoleon', 'Robespierre', 'Lafayette', 'Marat'],
          answer: 2,
          explanation: 'The Marquis de Lafayette, hero of the American Revolution, was named commander.',
        },
        {
          id: 'fr-c2-n3-q3',
          sessionId: 'fr-c2-n3',
          type: 'multiple-choice',
          prompt: 'What colors make up the revolutionary tricolor?',
          choices: ['Red, gold, black', 'Blue, white, red', 'Green, white, red', 'Blue, yellow, red'],
          answer: 1,
          explanation: 'The French tricolor combines blue and red (colors of Paris) with white (the monarchy).',
        },
        {
          id: 'fr-c2-n3-q4',
          sessionId: 'fr-c2-n3',
          type: 'true-false',
          prompt: 'The Bastille was stormed to rescue political prisoners.',
          choices: ['True', 'False'],
          answer: 1,
          explanation: 'The Bastille was stormed mainly for its gunpowder supply, not to free prisoners.',
        },
      ],
    } as HeadlinesContent,
  },
  {
    id: 'fr-c2-n4',
    chapterId: 'fr-c2',
    type: 'quiz-mix',
    title: 'July 14th Challenge',
    order: 4,
    xpReward: 100,
    content: {
      type: 'quiz-mix',
      questions: [
        {
          id: 'fr-c2-n4-q1',
          sessionId: 'fr-c2-n4',
          type: 'multiple-choice',
          prompt: 'What year did the Bastille fall?',
          choices: ['1776', '1789', '1799', '1804'],
          answer: 1,
          explanation: 'The Bastille fell on July 14, 1789.',
        },
        {
          id: 'fr-c2-n4-q2',
          sessionId: 'fr-c2-n4',
          type: 'multiple-choice',
          prompt: 'What is July 14th called in France today?',
          choices: ['Revolution Day', 'Bastille Day', 'Freedom Day', 'Republic Day'],
          answer: 1,
          explanation: 'July 14th is celebrated as Bastille Day, France\'s national holiday.',
        },
        {
          id: 'fr-c2-n4-q3',
          sessionId: 'fr-c2-n4',
          type: 'true-false',
          prompt: 'The Bastille still stands in Paris today.',
          choices: ['True', 'False'],
          answer: 1,
          explanation: 'The Bastille was demolished shortly after its capture. Only its outline remains marked on the ground.',
        },
        {
          id: 'fr-c2-n4-q4',
          sessionId: 'fr-c2-n4',
          type: 'multiple-choice',
          prompt: 'What were the revolutionaries primarily seeking at the Bastille?',
          choices: ['Political prisoners', 'The King', 'Gunpowder and weapons', 'Gold'],
          answer: 2,
          explanation: 'The crowd wanted the gunpowder stored in the Bastille to arm themselves.',
        },
        {
          id: 'fr-c2-n4-q5',
          sessionId: 'fr-c2-n4',
          type: 'multiple-choice',
          prompt: 'How did the fall of the Bastille affect King Louis XVI\'s power?',
          choices: ['It increased his authority', 'It showed his power was crumbling', 'It had no effect', 'He immediately abdicated'],
          answer: 1,
          explanation: 'The fall demonstrated that the King could no longer control Paris or the people.',
        },
        {
          id: 'fr-c2-n4-q6',
          sessionId: 'fr-c2-n4',
          type: 'true-false',
          prompt: 'The American Revolution influenced the French Revolution.',
          choices: ['True', 'False'],
          answer: 0,
          explanation: 'Yes! French soldiers like Lafayette who fought in America brought revolutionary ideas home.',
        },
        {
          id: 'fr-c2-n4-q7',
          sessionId: 'fr-c2-n4',
          type: 'multiple-choice',
          prompt: 'What document was influenced by the American Declaration of Independence?',
          choices: ['The Tennis Court Oath', 'Declaration of the Rights of Man', 'The Constitution of 1791', 'The Social Contract'],
          answer: 1,
          explanation: 'The Declaration of the Rights of Man (August 1789) was directly inspired by the American Declaration.',
        },
        {
          id: 'fr-c2-n4-q8',
          sessionId: 'fr-c2-n4',
          type: 'multiple-choice',
          prompt: 'What building now stands where the Bastille once was?',
          choices: ['The Eiffel Tower', 'Nothing - it\'s a plaza', 'The Louvre', 'Notre Dame'],
          answer: 1,
          explanation: 'The Place de la Bastille is now an open plaza with the July Column monument.',
        },
      ],
    } as QuizMixContent,
  },
  {
    id: 'fr-c2-n5',
    chapterId: 'fr-c2',
    type: 'decision',
    title: 'The Mob Approaches',
    order: 5,
    xpReward: 80,
    content: {
      type: 'decision',
      scenario: 'July 14, 1789: You are standing in the courtyard of the Bastille. The mob has breached the outer walls. Governor de Launay has asked for a truce.',
      context: 'The crowd is armed and angry. Some want to negotiate, others want blood. What do you advise?',
      optionA: {
        label: 'Accept the truce and negotiate surrender',
        outcome: 'The garrison surrenders peacefully. De Launay is taken prisoner but the crowd\'s anger remains.',
        isHistorical: false,
      },
      optionB: {
        label: 'Storm the inner fortress immediately',
        outcome: 'The crowd rushes in. De Launay is killed, and his head is paraded through Paris on a pike.',
        isHistorical: true,
      },
      historicalOutcome: 'Despite attempts at negotiation, the mob stormed the inner fortress. Governor de Launay was killed, and his head was displayed on a pike—a gruesome symbol of revolutionary justice.',
      hostReaction: 'The revolution showed its violent side that day. De Launay\'s fate became a warning to all who opposed the people.',
    } as DecisionContent,
  },
  {
    id: 'fr-c2-n6',
    chapterId: 'fr-c2',
    type: 'boss',
    title: 'Boss: July 14th Mastery',
    order: 6,
    xpReward: 150,
    content: {
      type: 'boss',
      timeLimit: 180,
      xpMultiplier: 2,
      hostIntro: 'The Bastille has fallen! Now prove you understand this pivotal day in history.',
      hostVictory: 'Magnifique! You have mastered the fall of the Bastille!',
      hostDefeat: 'The revolution demands more study. Return when you are ready.',
      questions: [
        // Round 1 (Easy-Medium)
        { id: 'fr-c2-boss-q1', sessionId: 'fr-c2-boss', type: 'multiple-choice', prompt: 'What date did the Bastille fall?', choices: ['July 4, 1789', 'July 14, 1789', 'July 24, 1789', 'June 14, 1789'], answer: 1, explanation: 'July 14, 1789' },
        { id: 'fr-c2-boss-q2', sessionId: 'fr-c2-boss', type: 'multiple-choice', prompt: 'How many prisoners were in the Bastille?', choices: ['7', '70', '700', '0'], answer: 0, explanation: 'Only 7 prisoners were held there.' },
        { id: 'fr-c2-boss-q3', sessionId: 'fr-c2-boss', type: 'true-false', prompt: 'The Bastille was a symbol of royal tyranny.', choices: ['True', 'False'], answer: 0, explanation: 'True - it symbolized absolute monarchy.' },
        { id: 'fr-c2-boss-q4', sessionId: 'fr-c2-boss', type: 'multiple-choice', prompt: 'What did the crowd want from the Bastille?', choices: ['Gold', 'The King', 'Gunpowder', 'Food'], answer: 2, explanation: 'They needed gunpowder to arm themselves.' },
        { id: 'fr-c2-boss-q5', sessionId: 'fr-c2-boss', type: 'multiple-choice', prompt: 'Who commanded the National Guard?', choices: ['Napoleon', 'Lafayette', 'Robespierre', 'Marat'], answer: 1, explanation: 'The Marquis de Lafayette.' },
        // Round 2 (Medium-Hard)
        { id: 'fr-c2-boss-q6', sessionId: 'fr-c2-boss', type: 'multiple-choice', prompt: 'What happened to Governor de Launay?', choices: ['Escaped', 'Killed', 'Promoted', 'Exiled'], answer: 1, explanation: 'He was killed by the mob.' },
        { id: 'fr-c2-boss-q7', sessionId: 'fr-c2-boss', type: 'true-false', prompt: 'The Bastille was completely destroyed after its capture.', choices: ['True', 'False'], answer: 0, explanation: 'True - it was demolished within months.' },
        { id: 'fr-c2-boss-q8', sessionId: 'fr-c2-boss', type: 'multiple-choice', prompt: 'What colors form the French tricolor?', choices: ['Red, white, blue', 'Blue, white, red', 'Green, white, red', 'Blue, yellow, red'], answer: 1, explanation: 'Blue, white, and red.' },
        { id: 'fr-c2-boss-q9', sessionId: 'fr-c2-boss', type: 'multiple-choice', prompt: 'What did Louis XVI say when told of the Bastille?', choices: ['"Is it a revolt?"', '"Send the army"', '"God save France"', '"Long live the people"'], answer: 0, explanation: '"Is it a revolt?" "No, Sire, it is a revolution."' },
        { id: 'fr-c2-boss-q10', sessionId: 'fr-c2-boss', type: 'true-false', prompt: 'July 14th is a national holiday in France.', choices: ['True', 'False'], answer: 0, explanation: 'Yes, it\'s called Bastille Day.' },
        // Round 3 (Hard + Twist)
        { id: 'fr-c2-boss-q11', sessionId: 'fr-c2-boss', type: 'multiple-choice', prompt: 'What American document influenced the Declaration of the Rights of Man?', choices: ['Constitution', 'Declaration of Independence', 'Bill of Rights', 'Federalist Papers'], answer: 1, explanation: 'The Declaration of Independence.' },
        { id: 'fr-c2-boss-q12', sessionId: 'fr-c2-boss', type: 'multiple-choice', prompt: 'What stands at the site of the Bastille today?', choices: ['A museum', 'Place de la Bastille', 'A castle', 'A church'], answer: 1, explanation: 'Place de la Bastille, an open plaza.' },
        { id: 'fr-c2-boss-q13', sessionId: 'fr-c2-boss', type: 'true-false', prompt: 'The Bastille held dangerous political prisoners in 1789.', choices: ['True', 'False'], answer: 1, explanation: 'False - it held mostly minor offenders.' },
        { id: 'fr-c2-boss-q14', sessionId: 'fr-c2-boss', type: 'multiple-choice', prompt: 'How many soldiers defended the Bastille?', choices: ['Over 1000', 'About 500', 'Fewer than 100', 'None'], answer: 2, explanation: 'Fewer than 100 soldiers defended it.' },
        { id: 'fr-c2-boss-q15', sessionId: 'fr-c2-boss', type: 'multiple-choice', prompt: 'What was displayed on pikes after the storming?', choices: ['The French flag', 'Heads of defenders', 'Royal crowns', 'Bread loaves'], answer: 1, explanation: 'Heads of de Launay and others were paraded.' },
      ],
    } as BossContent,
  },
];

const frenchRevolutionChapter2: JourneyChapter = {
  id: 'fr-c2',
  arcId: 'french-revolution',
  title: 'The Bastille Falls',
  description: 'July 14, 1789: The day that changed everything',
  order: 2,
  nodes: frenchRevolutionChapter2Nodes,
  isLocked: false,
};

// French Revolution Chapter 3: Reign of Terror
const frenchRevolutionChapter3Nodes: JourneyNode[] = [
  {
    id: 'fr-c3-n1',
    chapterId: 'fr-c3',
    type: 'two-truths',
    title: 'Guillotine Myths',
    order: 1,
    xpReward: 60,
    content: {
      type: 'two-truths',
      statements: [
        'The guillotine was invented during the French Revolution.',
        'Dr. Guillotin proposed the device as a more humane form of execution.',
        'Marie Antoinette was executed by guillotine in October 1793.',
      ],
      lieIndex: 0,
      explanation: 'Similar devices existed for centuries before the Revolution! Dr. Guillotin advocated for it as a humane, quick death available to all—not just nobles who could afford a clean sword stroke.',
      hostReaction: 'The "humane" guillotine became the symbol of the Terror\'s bloody efficiency.',
    } as TwoTruthsContent,
  },
  {
    id: 'fr-c3-n2',
    chapterId: 'fr-c3',
    type: 'found-tape',
    title: 'Tribunal Testimony',
    order: 2,
    xpReward: 40,
    content: {
      type: 'found-tape',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      title: 'Before the Revolutionary Tribunal',
      context: 'Court records, Paris, 1793',
      transcript: [
        { id: 't1', text: 'The accused stands before the Committee of Public Safety.', startTime: 0, endTime: 4 },
        { id: 't2', text: 'The charges: conspiracy against the Republic, harboring enemies of the state.', startTime: 4, endTime: 9 },
        { id: 't3', text: 'Robespierre himself presides. His cold eyes miss nothing.', startTime: 9, endTime: 14 },
        { id: 't4', text: 'There is no defense counsel. The trial lasts seventeen minutes.', startTime: 14, endTime: 19 },
        { id: 't5', text: 'The verdict is always the same. The tumbrels wait outside.', startTime: 19, endTime: 24 },
      ],
      questions: [
        { id: 'fr-c3-n2-q1', sessionId: 'fr-c3-n2', type: 'multiple-choice', prompt: 'Who led the Committee of Public Safety?', choices: ['Napoleon', 'Lafayette', 'Robespierre', 'Marat'], answer: 2, explanation: 'Robespierre dominated the Committee during the Terror.' },
        { id: 'fr-c3-n2-q2', sessionId: 'fr-c3-n2', type: 'multiple-choice', prompt: 'How long did the trial described last?', choices: ['3 hours', '17 minutes', '2 days', '1 hour'], answer: 1, explanation: 'Trials during the Terror were often just minutes long.' },
        { id: 'fr-c3-n2-q3', sessionId: 'fr-c3-n2', type: 'true-false', prompt: 'The accused had defense counsel.', choices: ['True', 'False'], answer: 1, explanation: 'Most accused during the Terror had no legal defense.' },
      ],
    } as FoundTapeContent,
  },
  {
    id: 'fr-c3-n3',
    chapterId: 'fr-c3',
    type: 'headlines',
    title: 'Terror Chronicles',
    order: 3,
    xpReward: 60,
    content: {
      type: 'headlines',
      publication: 'L\'AMI DU PEUPLE',
      date: 'September 1793',
      headlines: [
        { id: 'h1', title: 'TERROR IS THE ORDER OF THE DAY', body: 'The Convention decrees that terror shall be the instrument of virtue. Enemies of the Republic shall find no mercy.' },
        { id: 'h2', title: 'QUEEN ANTOINETTE FACES TRIBUNAL', body: 'The Austrian woman, as she is called by the people, will answer for her crimes against France.' },
        { id: 'h3', title: 'CALENDAR REFORMED: YEAR ONE BEGINS', body: 'The revolutionary calendar replaces the Christian calendar. We now live in the Age of Reason.' },
      ],
      questions: [
        { id: 'fr-c3-n3-q1', sessionId: 'fr-c3-n3', type: 'multiple-choice', prompt: 'What was Marie Antoinette called by revolutionaries?', choices: ['The Queen', 'The Austrian Woman', 'Madame Deficit', 'Both B and C'], answer: 3, explanation: 'She was called both "the Austrian woman" and "Madame Deficit."' },
        { id: 'fr-c3-n3-q2', sessionId: 'fr-c3-n3', type: 'true-false', prompt: 'The revolutionaries created a new calendar.', choices: ['True', 'False'], answer: 0, explanation: 'Yes, the Revolutionary Calendar renamed months and started from Year One.' },
        { id: 'fr-c3-n3-q3', sessionId: 'fr-c3-n3', type: 'multiple-choice', prompt: 'What was declared "the order of the day"?', choices: ['Liberty', 'Terror', 'Peace', 'Justice'], answer: 1, explanation: 'The Convention declared that "terror is the order of the day."' },
        { id: 'fr-c3-n3-q4', sessionId: 'fr-c3-n3', type: 'multiple-choice', prompt: 'What did the new calendar represent?', choices: ['Christian tradition', 'The Age of Reason', 'Royal authority', 'Military power'], answer: 1, explanation: 'It represented the revolutionary embrace of reason over religion.' },
      ],
    } as HeadlinesContent,
  },
  {
    id: 'fr-c3-n4',
    chapterId: 'fr-c3',
    type: 'quiz-mix',
    title: 'The Committee',
    order: 4,
    xpReward: 100,
    content: {
      type: 'quiz-mix',
      questions: [
        { id: 'fr-c3-n4-q1', sessionId: 'fr-c3-n4', type: 'multiple-choice', prompt: 'How many people were executed during the Terror?', choices: ['About 1,000', 'About 17,000', 'About 50,000', 'About 100,000'], answer: 1, explanation: 'About 17,000 were officially executed; many more died in prison.' },
        { id: 'fr-c3-n4-q2', sessionId: 'fr-c3-n4', type: 'multiple-choice', prompt: 'What was the main governing body during the Terror?', choices: ['The King\'s Council', 'The Committee of Public Safety', 'The National Assembly', 'The Directory'], answer: 1, explanation: 'The Committee of Public Safety held near-dictatorial power.' },
        { id: 'fr-c3-n4-q3', sessionId: 'fr-c3-n4', type: 'true-false', prompt: 'Robespierre was eventually executed by guillotine.', choices: ['True', 'False'], answer: 0, explanation: 'Yes, Robespierre was executed on July 28, 1794, ending the Terror.' },
        { id: 'fr-c3-n4-q4', sessionId: 'fr-c3-n4', type: 'multiple-choice', prompt: 'Who was known as "The Incorruptible"?', choices: ['Marat', 'Danton', 'Robespierre', 'Napoleon'], answer: 2, explanation: 'Robespierre was called "The Incorruptible" for his rigid principles.' },
        { id: 'fr-c3-n4-q5', sessionId: 'fr-c3-n4', type: 'multiple-choice', prompt: 'What ended the Reign of Terror?', choices: ['Napoleon\'s coup', 'Robespierre\'s fall', 'Foreign invasion', 'Royal restoration'], answer: 1, explanation: 'The Terror ended when Robespierre was arrested and executed.' },
        { id: 'fr-c3-n4-q6', sessionId: 'fr-c3-n4', type: 'true-false', prompt: 'The Terror lasted for about 10 years.', choices: ['True', 'False'], answer: 1, explanation: 'The Terror lasted about one year (1793-1794).' },
        { id: 'fr-c3-n4-q7', sessionId: 'fr-c3-n4', type: 'multiple-choice', prompt: 'What phrase summarized revolutionary justice?', choices: ['"Liberty for all"', '"The ends justify the means"', '"Terror is the order of the day"', '"Death to tyrants"'], answer: 2, explanation: 'The Convention declared terror as official policy.' },
        { id: 'fr-c3-n4-q8', sessionId: 'fr-c3-n4', type: 'multiple-choice', prompt: 'When was Marie Antoinette executed?', choices: ['July 1789', 'January 1793', 'October 1793', 'July 1794'], answer: 2, explanation: 'Marie Antoinette was executed on October 16, 1793.' },
      ],
    } as QuizMixContent,
  },
  {
    id: 'fr-c3-n5',
    chapterId: 'fr-c3',
    type: 'decision',
    title: 'Accuse or Defend?',
    order: 5,
    xpReward: 80,
    content: {
      type: 'decision',
      scenario: 'You are a member of the Convention. Your neighbor, once a friend, has been accused of hoarding grain. You know she was saving it for her children.',
      context: 'If you defend her, you may be accused as well. If you stay silent or accuse her, she will likely die.',
      optionA: {
        label: 'Speak in her defense, risking yourself',
        outcome: 'Your words save her this time, but you are now watched closely. Your name appears on lists.',
        isHistorical: false,
      },
      optionB: {
        label: 'Stay silent and let the tribunal decide',
        outcome: 'She is condemned. You survive. But at night, you hear the tumbrels rolling past your window.',
        isHistorical: true,
      },
      historicalOutcome: 'Most people during the Terror stayed silent out of fear. Neighbor denounced neighbor, and even family members turned on each other to survive.',
      hostReaction: 'The Terror fed on fear. Speaking up could mean death. Most chose silence.',
    } as DecisionContent,
  },
  {
    id: 'fr-c3-n6',
    chapterId: 'fr-c3',
    type: 'boss',
    title: 'Arc Finale: Revolution Mastery',
    order: 6,
    xpReward: 150,
    content: {
      type: 'boss',
      timeLimit: 180,
      xpMultiplier: 2,
      hostIntro: 'You have journeyed from the gilded halls of Versailles to the blood-soaked streets of Paris. Now prove your mastery of the French Revolution!',
      hostVictory: 'Extraordinaire! You are a true scholar of the Revolution!',
      hostDefeat: 'The Revolution is complex. Return and study its twists and turns.',
      questions: [
        { id: 'fr-c3-boss-q1', sessionId: 'fr-c3-boss', type: 'multiple-choice', prompt: 'What years span the French Revolution?', choices: ['1776-1783', '1789-1799', '1799-1815', '1848-1852'], answer: 1, explanation: '1789-1799, ending with Napoleon\'s coup.' },
        { id: 'fr-c3-boss-q2', sessionId: 'fr-c3-boss', type: 'multiple-choice', prompt: 'Who said "Let them eat cake"?', choices: ['Marie Antoinette', 'No one - it\'s a myth', 'Louis XVI', 'Robespierre'], answer: 1, explanation: 'It\'s a myth attributed to Marie Antoinette.' },
        { id: 'fr-c3-boss-q3', sessionId: 'fr-c3-boss', type: 'true-false', prompt: 'The guillotine was invented during the Revolution.', choices: ['True', 'False'], answer: 1, explanation: 'Similar devices existed earlier; it was just adopted then.' },
        { id: 'fr-c3-boss-q4', sessionId: 'fr-c3-boss', type: 'multiple-choice', prompt: 'How many prisoners were in the Bastille when it fell?', choices: ['0', '7', '70', '700'], answer: 1, explanation: 'Just 7 prisoners.' },
        { id: 'fr-c3-boss-q5', sessionId: 'fr-c3-boss', type: 'multiple-choice', prompt: 'What was the Third Estate?', choices: ['Clergy', 'Nobility', 'Commoners', 'Royalty'], answer: 2, explanation: 'Commoners - about 97% of France\'s population.' },
        { id: 'fr-c3-boss-q6', sessionId: 'fr-c3-boss', type: 'true-false', prompt: 'Louis XVI was a skilled locksmith.', choices: ['True', 'False'], answer: 0, explanation: 'True - he loved making locks as a hobby.' },
        { id: 'fr-c3-boss-q7', sessionId: 'fr-c3-boss', type: 'multiple-choice', prompt: 'What document declared all men free and equal?', choices: ['Constitution of 1791', 'Declaration of Rights of Man', 'Tennis Court Oath', 'Social Contract'], answer: 1, explanation: 'Declaration of the Rights of Man and of the Citizen.' },
        { id: 'fr-c3-boss-q8', sessionId: 'fr-c3-boss', type: 'multiple-choice', prompt: 'Who led the Committee of Public Safety?', choices: ['Napoleon', 'Robespierre', 'Lafayette', 'Marat'], answer: 1, explanation: 'Maximilien Robespierre.' },
        { id: 'fr-c3-boss-q9', sessionId: 'fr-c3-boss', type: 'true-false', prompt: 'The Reign of Terror lasted about 10 years.', choices: ['True', 'False'], answer: 1, explanation: 'It lasted about one year (1793-1794).' },
        { id: 'fr-c3-boss-q10', sessionId: 'fr-c3-boss', type: 'multiple-choice', prompt: 'How did Robespierre die?', choices: ['Old age', 'Battle', 'Guillotine', 'Poison'], answer: 2, explanation: 'He was guillotined on July 28, 1794.' },
        { id: 'fr-c3-boss-q11', sessionId: 'fr-c3-boss', type: 'multiple-choice', prompt: 'What ended the Revolution?', choices: ['Return of the King', 'Napoleon\'s coup', 'Foreign invasion', 'Popular vote'], answer: 1, explanation: 'Napoleon\'s coup d\'état in November 1799.' },
        { id: 'fr-c3-boss-q12', sessionId: 'fr-c3-boss', type: 'true-false', prompt: 'The revolutionary calendar had 10-day weeks.', choices: ['True', 'False'], answer: 0, explanation: 'True - to remove Christian influence.' },
        { id: 'fr-c3-boss-q13', sessionId: 'fr-c3-boss', type: 'multiple-choice', prompt: 'What was Marie Antoinette\'s nationality?', choices: ['French', 'Austrian', 'Spanish', 'English'], answer: 1, explanation: 'She was Austrian, which made her unpopular.' },
        { id: 'fr-c3-boss-q14', sessionId: 'fr-c3-boss', type: 'multiple-choice', prompt: 'About how many people died during the Terror?', choices: ['1,000', '17,000', '100,000', '1 million'], answer: 1, explanation: 'About 17,000 were officially executed.' },
        { id: 'fr-c3-boss-q15', sessionId: 'fr-c3-boss', type: 'multiple-choice', prompt: 'What national holiday celebrates the Revolution?', choices: ['July 4th', 'July 14th', 'November 11th', 'May 1st'], answer: 1, explanation: 'Bastille Day on July 14th.' },
      ],
    } as BossContent,
  },
];

const frenchRevolutionChapter3: JourneyChapter = {
  id: 'fr-c3',
  arcId: 'french-revolution',
  title: 'Reign of Terror',
  description: 'When the Revolution devoured its own',
  order: 3,
  nodes: frenchRevolutionChapter3Nodes,
  isLocked: false,
};

export const frenchRevolutionArc: Arc = {
  id: 'french-revolution',
  title: 'The French Revolution',
  description: 'Liberty, Equality, Fraternity — and the fall of a king',
  icon: '🇫🇷',
  hostId: 'marie',
  chapters: [frenchRevolutionChapter1, frenchRevolutionChapter2, frenchRevolutionChapter3],
  badge: '⚜️',
  totalXP: 1470,
};

// ============================================================
// WORLD WAR II ARC - DEMO FLOW
// ============================================================

const ww2Chapter1Nodes: JourneyNode[] = [
  // Node 1: Video Lesson - Storm Clouds Over Europe
  {
    id: 'ww2-c1-n1',
    chapterId: 'ww2-c1',
    type: 'video-lesson',
    title: 'Storm Clouds Over Europe',
    order: 1,
    xpReward: 50,
    content: {
      type: 'video-lesson',
      videoUrl: 'https://www.youtube.com/embed/WOVEy1tC7nk?autoplay=0&controls=1&modestbranding=1&rel=0',
      title: 'Storm Clouds Over Europe',
      context: 'August 1939. The world holds its breath as Nazi Germany prepares to unleash war upon Europe.',
      thumbnailUrl: 'https://images.pexels.com/photos/4439444/pexels-photo-4439444.jpeg?auto=compress&w=800',
      questions: [
        { id: 'ww2-c1-n1-q1', sessionId: 'ww2-c1-n1', type: 'multiple-choice', prompt: 'What surprise agreement shocked the world in August 1939?', choices: ['Anglo-German Naval Treaty', 'Nazi-Soviet Non-Aggression Pact', 'Munich Agreement', 'Treaty of Versailles'], answer: 1, explanation: 'The Nazi-Soviet Pact stunned the world - sworn enemies had agreed not to attack each other.' },
      ],
      hostReaction: 'The pact meant Hitler could attack Poland without fear of a two-front war.',
    } as VideoLessonContent,
  },
  // Node 2: Image Explore - Map of the Invasion
  {
    id: 'ww2-c1-n2',
    chapterId: 'ww2-c1',
    type: 'image-explore',
    title: 'Map of the Invasion',
    order: 2,
    xpReward: 60,
    content: {
      type: 'image-explore',
      imageUrl: 'https://images.pexels.com/photos/4439444/pexels-photo-4439444.jpeg?auto=compress&w=1200',
      imageType: 'map',
      title: 'The Invasion of Poland',
      context: 'September 1, 1939 - The Wehrmacht strikes from three directions.',
      hotspots: [
        { id: 'h1', x: 25, y: 30, label: 'German Army Group North', description: 'Attacked from East Prussia, driving south toward Warsaw.', revealFact: '630,000 troops in this group alone' },
        { id: 'h2', x: 15, y: 60, label: 'German Army Group South', description: 'Struck from Silesia and Slovakia, encircling Polish forces.', revealFact: 'Included 6 Panzer divisions' },
        { id: 'h3', x: 85, y: 50, label: 'Soviet Invasion', description: 'On September 17, the USSR invaded from the east.', revealFact: 'Poland was divided per the secret protocol of the Nazi-Soviet Pact' },
        { id: 'h4', x: 50, y: 45, label: 'Warsaw', description: 'The capital held out until September 27 despite heavy bombing.', revealFact: 'Over 25,000 civilians died in the siege' },
      ],
      questions: [
        { id: 'ww2-c1-n2-q1', sessionId: 'ww2-c1-n2', type: 'multiple-choice', prompt: 'How long did Poland resist the German invasion?', choices: ['3 days', '2 weeks', 'About 5 weeks', '3 months'], answer: 2, explanation: 'Poland resisted for about 5 weeks until October 6, 1939.' },
      ],
      hostReaction: 'The speed of the German victory shocked military experts worldwide.',
    } as ImageExploreContent,
  },
  // Node 3: Two Truths - War Myths
  {
    id: 'ww2-c1-n3',
    chapterId: 'ww2-c1',
    type: 'two-truths',
    title: 'War Myths',
    order: 3,
    xpReward: 60,
    content: {
      type: 'two-truths',
      statements: [
        'Polish cavalry charged German tanks in 1939.',
        'Hitler was a decorated veteran of World War I, receiving the Iron Cross.',
        'Germany invaded Poland on September 1, 1939, starting the war.',
      ],
      lieIndex: 0,
      explanation: 'The cavalry charge myth is propaganda! Polish cavalry did engage German infantry, but the "charging tanks" story was invented by Nazi and Soviet propagandists.',
      hostReaction: 'Even today, this myth persists. Polish cavalry were actually quite effective against infantry!',
      context: 'Many myths surround the start of World War II. Let\'s separate fact from fiction.',
      learningPoints: [
        'Propaganda shaped perceptions of the war from day one',
        'Hitler served in WWI and was wounded twice',
        'The invasion of Poland triggered British and French declarations of war',
      ],
    } as TwoTruthsContent,
  },
  // Node 4: Found Tape - Chamberlain's Declaration
  {
    id: 'ww2-c1-n4',
    chapterId: 'ww2-c1',
    type: 'found-tape',
    title: 'Britain Declares War',
    order: 4,
    xpReward: 50,
    content: {
      type: 'found-tape',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      title: 'Britain Declares War',
      context: 'BBC Radio broadcast, September 3, 1939, 11:15 AM',
      transcript: [
        { id: 't1', text: 'This morning the British Ambassador in Berlin handed the German Government a final note...', startTime: 0, endTime: 6 },
        { id: 't2', text: '...stating that unless we heard from them by 11 o\'clock that they were prepared at once to withdraw their troops from Poland...', startTime: 6, endTime: 14 },
        { id: 't3', text: '...a state of war would exist between us. I have to tell you now that no such undertaking has been received...', startTime: 14, endTime: 22 },
        { id: 't4', text: '...and that consequently this country is at war with Germany.', startTime: 22, endTime: 28 },
      ],
      questions: [
        { id: 'ww2-c1-n4-q1', sessionId: 'ww2-c1-n4', type: 'multiple-choice', prompt: 'What ultimatum did Britain give Germany?', choices: ['Surrender immediately', 'Withdraw from Poland', 'Release prisoners', 'Pay reparations'], answer: 1, explanation: 'Britain demanded Germany withdraw from Poland by 11 AM on September 3rd.' },
        { id: 'ww2-c1-n4-q2', sessionId: 'ww2-c1-n4', type: 'multiple-choice', prompt: 'How many days after the invasion did Britain declare war?', choices: ['Same day', 'Two days', 'One week', 'Two weeks'], answer: 1, explanation: 'Britain declared war on September 3rd, two days after the September 1st invasion.' },
      ],
    } as FoundTapeContent,
  },
  // Node 5: Headlines - The London Times
  {
    id: 'ww2-c1-n5',
    chapterId: 'ww2-c1',
    type: 'headlines',
    title: 'The London Times',
    order: 5,
    xpReward: 60,
    content: {
      type: 'headlines',
      publication: 'THE LONDON TIMES',
      date: 'September 4, 1939',
      headlines: [
        { id: 'h1', title: 'BRITAIN AND FRANCE DECLARE WAR ON GERMANY', body: 'Following Germany\'s refusal to withdraw from Poland, His Majesty\'s Government has declared a state of war exists. France followed six hours later.', imageUrl: 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&w=400' },
        { id: 'h2', title: 'KING ADDRESSES THE EMPIRE', body: 'In a solemn broadcast, King George VI called upon the people of Britain and the Commonwealth to stand firm in this dark hour.', imageUrl: 'https://images.pexels.com/photos/5765/castle-tower-architecture-building.jpg?auto=compress&w=400' },
        { id: 'h3', title: 'EVACUATION OF CHILDREN BEGINS', body: 'Operation Pied Piper sees thousands of children boarding trains for the countryside. Parents bid tearful farewells at London stations.', imageUrl: 'https://images.pexels.com/photos/775567/pexels-photo-775567.jpeg?auto=compress&w=400' },
      ],
      questions: [
        { id: 'ww2-c1-n5-q1', sessionId: 'ww2-c1-n5', type: 'multiple-choice', prompt: 'Which country declared war first - Britain or France?', choices: ['France', 'Britain', 'They declared simultaneously', 'Neither declared war'], answer: 1, explanation: 'Britain declared war at 11 AM; France followed six hours later at 5 PM.' },
        { id: 'ww2-c1-n5-q2', sessionId: 'ww2-c1-n5', type: 'true-false', prompt: 'Operation Pied Piper evacuated children from London.', choices: ['True', 'False'], answer: 0, explanation: 'Over 1.5 million children were evacuated from cities to the countryside.' },
      ],
    } as HeadlinesContent,
  },
  // Node 6: Chrono Order - Timeline of Invasion
  {
    id: 'ww2-c1-n6',
    chapterId: 'ww2-c1',
    type: 'chrono-order',
    title: 'Timeline of the Fall',
    order: 6,
    xpReward: 70,
    content: {
      type: 'chrono-order',
      title: 'The Fall of Poland',
      context: 'Put these events in chronological order.',
      events: [
        { id: 'e1', text: 'Germany invades Poland', date: 'September 1, 1939', year: 1939.67, imageUrl: 'https://images.pexels.com/photos/4439444/pexels-photo-4439444.jpeg?auto=compress&w=200' },
        { id: 'e2', text: 'Britain and France declare war', date: 'September 3, 1939', year: 1939.68, imageUrl: 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&w=200' },
        { id: 'e3', text: 'Soviet Union invades Poland from the east', date: 'September 17, 1939', year: 1939.71, imageUrl: 'https://images.pexels.com/photos/4439444/pexels-photo-4439444.jpeg?auto=compress&w=200' },
        { id: 'e4', text: 'Warsaw surrenders', date: 'September 27, 1939', year: 1939.74, imageUrl: 'https://images.pexels.com/photos/4439444/pexels-photo-4439444.jpeg?auto=compress&w=200' },
      ],
      explanation: 'Poland was crushed in just five weeks by attacks from both Germany and the Soviet Union.',
      hostReaction: 'The speed of Poland\'s defeat introduced the world to "Blitzkrieg" - lightning war.',
    } as ChronoOrderContent,
  },
  // Node 7: Video Lesson - The Miracle at Dunkirk
  {
    id: 'ww2-c1-n7',
    chapterId: 'ww2-c1',
    type: 'video-lesson',
    title: 'The Miracle at Dunkirk',
    order: 7,
    xpReward: 60,
    content: {
      type: 'video-lesson',
      videoUrl: 'https://www.youtube.com/embed/WOVEy1tC7nk?autoplay=0&controls=1&modestbranding=1&rel=0',
      title: 'The Miracle at Dunkirk',
      context: 'May 1940. The British army is trapped on the beaches of France. What happens next will define the war.',
      thumbnailUrl: 'https://images.pexels.com/photos/4439444/pexels-photo-4439444.jpeg?auto=compress&w=800',
      questions: [
        { id: 'ww2-c1-n7-q1', sessionId: 'ww2-c1-n7', type: 'multiple-choice', prompt: 'What were the "Little Ships" of Dunkirk?', choices: ['Navy destroyers', 'French submarines', 'Civilian boats', 'German patrol boats'], answer: 2, explanation: 'Hundreds of civilian boats - fishing vessels, yachts, ferries - crossed the Channel to help.' },
      ],
      hostReaction: 'Dunkirk was a military disaster turned into a moral victory. The army lived to fight another day.',
    } as VideoLessonContent,
  },
  // Node 8: Decision - Operation Dynamo
  {
    id: 'ww2-c1-n8',
    chapterId: 'ww2-c1',
    type: 'decision',
    title: 'Operation Dynamo',
    order: 8,
    xpReward: 80,
    content: {
      type: 'decision',
      scenario: 'May 26, 1940: You are Admiral Ramsay. The army is trapped at Dunkirk. The Navy can only evacuate a fraction of the men. Churchill asks for your recommendation.',
      context: 'German Panzers are 10 miles away. The Luftwaffe controls the skies. 400,000 Allied soldiers await their fate on the beaches.',
      optionA: {
        label: 'Prioritize trained soldiers - leave the wounded and equipment',
        outcome: 'You save the fighting core of the army but abandon thousands. Morale suffers.',
        isHistorical: false,
      },
      optionB: {
        label: 'Call for civilian volunteers - attempt to rescue everyone possible',
        outcome: 'The "Little Ships" answer the call. Against all odds, 338,000 men are rescued in 9 days.',
        isHistorical: true,
      },
      historicalOutcome: 'Operation Dynamo exceeded all expectations. 861 vessels, including hundreds of civilian boats, rescued 338,226 soldiers. Churchill called it "a miracle of deliverance."',
      hostReaction: 'The spirit of Dunkirk - ordinary people doing extraordinary things - became a symbol of British resolve.',
    } as DecisionContent,
  },
  // Node 9: Quiz Mix - Test Your Knowledge
  {
    id: 'ww2-c1-n9',
    chapterId: 'ww2-c1',
    type: 'quiz-mix',
    title: 'Test Your Knowledge',
    order: 9,
    xpReward: 100,
    content: {
      type: 'quiz-mix',
      questions: [
        { id: 'ww2-c1-n9-q1', sessionId: 'ww2-c1-n9', type: 'multiple-choice', prompt: 'What date is considered the start of World War II?', choices: ['August 23, 1939', 'September 1, 1939', 'September 3, 1939', 'May 10, 1940'], answer: 1, explanation: 'September 1, 1939 - when Germany invaded Poland.' },
        { id: 'ww2-c1-n9-q2', sessionId: 'ww2-c1-n9', type: 'true-false', prompt: 'The Soviet Union and Nazi Germany were allies at the start of the war.', choices: ['True', 'False'], answer: 0, explanation: 'The Nazi-Soviet Pact meant they were non-belligerents, dividing Poland between them.' },
        { id: 'ww2-c1-n9-q3', sessionId: 'ww2-c1-n9', type: 'multiple-choice', prompt: 'What was "Blitzkrieg"?', choices: ['A German battleship', 'Lightning warfare tactics', 'The bombing of London', 'A code name for D-Day'], answer: 1, explanation: 'Blitzkrieg combined tanks, planes, and infantry for rapid, overwhelming attacks.' },
        { id: 'ww2-c1-n9-q4', sessionId: 'ww2-c1-n9', type: 'multiple-choice', prompt: 'Who was the British Prime Minister when the war started?', choices: ['Winston Churchill', 'Neville Chamberlain', 'Clement Attlee', 'Anthony Eden'], answer: 1, explanation: 'Neville Chamberlain declared war; Churchill became PM in May 1940.' },
      ],
    } as QuizMixContent,
  },
  // Node 10: Boss - Chapter Finale
  {
    id: 'ww2-c1-n10',
    chapterId: 'ww2-c1',
    type: 'boss',
    title: 'Chapter Boss: The War Begins',
    order: 10,
    xpReward: 150,
    content: {
      type: 'boss',
      timeLimit: 90,
      xpMultiplier: 2,
      hostIntro: 'The world has changed forever. Prove you understand how it all began!',
      hostVictory: 'Outstanding! You truly grasp the opening chapter of history\'s greatest conflict!',
      hostDefeat: 'The war\'s beginning was complex. Return when you\'ve studied more.',
      questions: [
        { id: 'ww2-c1-b-q1', sessionId: 'ww2-c1-b', type: 'multiple-choice', prompt: 'QUICK! What year did WWII begin?', choices: ['1937', '1938', '1939', '1941'], answer: 2, explanation: '1939 - with the invasion of Poland.' },
        { id: 'ww2-c1-b-q2', sessionId: 'ww2-c1-b', type: 'multiple-choice', prompt: 'Which country did Germany invade first?', choices: ['France', 'Belgium', 'Poland', 'Czechoslovakia'], answer: 2, explanation: 'Poland was invaded September 1, 1939.' },
        { id: 'ww2-c1-b-q3', sessionId: 'ww2-c1-b', type: 'multiple-choice', prompt: 'How many soldiers were rescued at Dunkirk?', choices: ['50,000', '150,000', '338,000', '500,000'], answer: 2, explanation: '338,226 Allied soldiers were evacuated.' },
        { id: 'ww2-c1-b-q4', sessionId: 'ww2-c1-b', type: 'true-false', prompt: 'Churchill was Prime Minister when Britain declared war.', choices: ['True', 'False'], answer: 1, explanation: 'Chamberlain declared war; Churchill took over in May 1940.' },
        { id: 'ww2-c1-b-q5', sessionId: 'ww2-c1-b', type: 'multiple-choice', prompt: 'What did the Nazi-Soviet Pact secretly include?', choices: ['Military alliance', 'Division of Poland', 'Trade agreement', 'Scientific cooperation'], answer: 1, explanation: 'A secret protocol divided Poland between Germany and the USSR.' },
      ],
    } as BossContent,
  },
];

const ww2Chapter1: JourneyChapter = {
  id: 'ww2-c1',
  arcId: 'world-war-2',
  title: 'The War Begins',
  description: 'From invasion to the Battle of Britain',
  order: 1,
  nodes: ww2Chapter1Nodes,
  isLocked: false,
  aiVideoUrl: 'https://www.youtube.com/embed/WOVEy1tC7nk?autoplay=0&controls=1&modestbranding=1&rel=0',
};

// WWII Chapter 2: The Global Conflict (1940-1943)
const ww2Chapter2Nodes: JourneyNode[] = [
  {
    id: 'ww2-c2-n1',
    chapterId: 'ww2-c2',
    type: 'two-truths',
    title: 'Battle Myths',
    order: 1,
    xpReward: 60,
    content: {
      type: 'two-truths',
      statements: [
        'The German Wehrmacht was considered invincible until Stalingrad.',
        'Japan attacked Pearl Harbor without any warning or declaration of war.',
        'The Soviet Union lost more soldiers at Stalingrad than the US lost in the entire war.',
      ],
      lieIndex: 0,
      explanation: 'The Wehrmacht suffered defeats before Stalingrad, including the Battle of Britain and the failed siege of Moscow in 1941. Stalingrad was the turning point, but not the first defeat.',
      hostReaction: 'Military myths often oversimplify complex histories!',
    } as TwoTruthsContent,
  },
  {
    id: 'ww2-c2-n2',
    chapterId: 'ww2-c2',
    type: 'found-tape',
    title: 'Letters from Stalingrad',
    order: 2,
    xpReward: 40,
    content: {
      type: 'found-tape',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
      title: 'A German Soldier\'s Account',
      context: 'Letter home, Stalingrad, December 1942',
      transcript: [
        { id: 't1', text: 'Dearest Mother, the cold here is beyond imagination. Men freeze where they stand.', startTime: 0, endTime: 5 },
        { id: 't2', text: 'We are surrounded. The Russians have cut off all escape. No supplies can reach us.', startTime: 5, endTime: 11 },
        { id: 't3', text: 'They promised us reinforcements. They promised us Göring\'s Luftwaffe would save us.', startTime: 11, endTime: 17 },
        { id: 't4', text: 'Those promises were lies. We are dying here, one by one, in this frozen hell.', startTime: 17, endTime: 23 },
        { id: 't5', text: 'If this letter reaches you, know that I thought of home until the very end.', startTime: 23, endTime: 28 },
      ],
      questions: [
        { id: 'ww2-c2-n2-q1', sessionId: 'ww2-c2-n2', type: 'multiple-choice', prompt: 'What was the fate of the German 6th Army at Stalingrad?', choices: ['Victorious retreat', 'Complete surrender', 'Successful breakout', 'Negotiated peace'], answer: 1, explanation: 'The entire 6th Army surrendered in February 1943 - about 91,000 survivors.' },
        { id: 'ww2-c2-n2-q2', sessionId: 'ww2-c2-n2', type: 'multiple-choice', prompt: 'How many German soldiers were encircled at Stalingrad?', choices: ['50,000', '150,000', '300,000', '500,000'], answer: 2, explanation: 'About 300,000 German and Axis soldiers were encircled.' },
      ],
    } as FoundTapeContent,
  },
  {
    id: 'ww2-c2-n3',
    chapterId: 'ww2-c2',
    type: 'headlines',
    title: 'Pacific Headlines',
    order: 3,
    xpReward: 60,
    content: {
      type: 'headlines',
      publication: 'THE NEW YORK TIMES',
      date: 'December 1941 - June 1942',
      headlines: [
        { id: 'h1', title: 'JAPAN ATTACKS PEARL HARBOR', body: 'Japanese aircraft devastated the US Pacific Fleet in a surprise attack. President Roosevelt calls December 7th "a date which will live in infamy."' },
        { id: 'h2', title: 'US DECLARES WAR ON JAPAN', body: 'Congress votes for war with only one dissenting vote. Germany and Italy declare war on the United States days later.' },
        { id: 'h3', title: 'AMERICAN VICTORY AT MIDWAY', body: 'US Navy sinks four Japanese aircraft carriers in decisive Pacific battle. The tide of war in the Pacific has turned.' },
      ],
      questions: [
        { id: 'ww2-c2-n3-q1', sessionId: 'ww2-c2-n3', type: 'multiple-choice', prompt: 'When did Japan attack Pearl Harbor?', choices: ['December 7, 1940', 'December 7, 1941', 'June 6, 1942', 'August 6, 1945'], answer: 1, explanation: 'December 7, 1941 - "a date which will live in infamy."' },
        { id: 'ww2-c2-n3-q2', sessionId: 'ww2-c2-n3', type: 'multiple-choice', prompt: 'What was significant about the Battle of Midway?', choices: ['First US defeat', 'Turning point in Pacific', 'End of the war', 'Japanese invasion of US'], answer: 1, explanation: 'Midway was the turning point - Japan lost 4 carriers and went on the defensive.' },
      ],
    } as HeadlinesContent,
  },
  {
    id: 'ww2-c2-n4',
    chapterId: 'ww2-c2',
    type: 'quiz-mix',
    title: 'Turning Points',
    order: 4,
    xpReward: 100,
    content: {
      type: 'quiz-mix',
      questions: [
        { id: 'ww2-c2-n4-q1', sessionId: 'ww2-c2-n4', type: 'multiple-choice', prompt: 'Which battle is considered the turning point on the Eastern Front?', choices: ['Moscow', 'Stalingrad', 'Kursk', 'Berlin'], answer: 1, explanation: 'Stalingrad (1942-43) was the decisive turning point against Germany.' },
        { id: 'ww2-c2-n4-q2', sessionId: 'ww2-c2-n4', type: 'multiple-choice', prompt: 'Who commanded the British forces in North Africa?', choices: ['Patton', 'Montgomery', 'Eisenhower', 'Churchill'], answer: 1, explanation: 'Field Marshal Bernard Montgomery led the British to victory at El Alamein.' },
        { id: 'ww2-c2-n4-q3', sessionId: 'ww2-c2-n4', type: 'true-false', prompt: 'Germany invaded the Soviet Union in 1941.', choices: ['True', 'False'], answer: 0, explanation: 'Operation Barbarossa began June 22, 1941.' },
        { id: 'ww2-c2-n4-q4', sessionId: 'ww2-c2-n4', type: 'multiple-choice', prompt: 'What was Operation Barbarossa?', choices: ['Invasion of Britain', 'Invasion of Soviet Union', 'D-Day invasion', 'Battle of the Atlantic'], answer: 1, explanation: 'Germany\'s massive invasion of the Soviet Union in 1941.' },
      ],
    } as QuizMixContent,
  },
  {
    id: 'ww2-c2-n5',
    chapterId: 'ww2-c2',
    type: 'decision',
    title: 'Operation Barbarossa',
    order: 5,
    xpReward: 80,
    content: {
      type: 'decision',
      scenario: 'December 1941: You are a German general outside Moscow. The temperature is -40°C. Your troops are exhausted and lacking winter equipment.',
      context: 'Hitler insists on taking Moscow before winter. Your soldiers are freezing and supplies are running low.',
      optionA: {
        label: 'Order a strategic withdrawal to defensible positions',
        outcome: 'Your troops survive the winter but Hitler relieves you of command for "cowardice."',
        isHistorical: false,
      },
      optionB: {
        label: 'Continue the assault on Moscow as ordered',
        outcome: 'The offensive fails. Soviet counterattacks push you back. Tens of thousands freeze to death.',
        isHistorical: true,
      },
      historicalOutcome: 'The German assault on Moscow failed in December 1941. Soviet counteroffensives pushed the Germans back 100-250km. Over 100,000 Germans died from cold and combat.',
      hostReaction: 'Hitler\'s refusal to retreat cost Germany dearly on the Eastern Front!',
    } as DecisionContent,
  },
  {
    id: 'ww2-c2-n6',
    chapterId: 'ww2-c2',
    type: 'boss',
    title: 'Chapter Boss: Global Conflict',
    order: 6,
    xpReward: 150,
    content: {
      type: 'boss',
      timeLimit: 90,
      xpMultiplier: 2,
      hostIntro: 'The war spread across the globe. From Stalingrad to Midway - show me your knowledge!',
      hostVictory: 'Excellent! You understand the global scope of this terrible conflict!',
      hostDefeat: 'The global war was complex. Study the major battles and turning points.',
      questions: [
        { id: 'ww2-c2-b-q1', sessionId: 'ww2-c2-b', type: 'multiple-choice', prompt: 'When did the Battle of Stalingrad end?', choices: ['December 1942', 'February 1943', 'May 1943', 'January 1944'], answer: 1, explanation: 'German surrender on February 2, 1943.' },
        { id: 'ww2-c2-b-q2', sessionId: 'ww2-c2-b', type: 'multiple-choice', prompt: 'How many Japanese carriers were sunk at Midway?', choices: ['1', '2', '4', '6'], answer: 2, explanation: 'Japan lost 4 fleet carriers at Midway.' },
        { id: 'ww2-c2-b-q3', sessionId: 'ww2-c2-b', type: 'true-false', prompt: 'The US entered the war before Pearl Harbor.', choices: ['True', 'False'], answer: 1, explanation: 'The US officially entered after Pearl Harbor, December 8, 1941.' },
        { id: 'ww2-c2-b-q4', sessionId: 'ww2-c2-b', type: 'multiple-choice', prompt: 'What was the "Afrika Korps"?', choices: ['British desert force', 'German tank army in Africa', 'Italian navy', 'American paratroopers'], answer: 1, explanation: 'Germany\'s tank force in North Africa, led by Rommel.' },
        { id: 'ww2-c2-b-q5', sessionId: 'ww2-c2-b', type: 'multiple-choice', prompt: 'Which alliance fought against the Axis?', choices: ['Triple Entente', 'Allied Powers', 'Central Powers', 'Comintern'], answer: 1, explanation: 'The Allied Powers: US, UK, USSR, China, and others.' },
      ],
    } as BossContent,
  },
];

const ww2Chapter2: JourneyChapter = {
  id: 'ww2-c2',
  arcId: 'world-war-2',
  title: 'The Global Conflict',
  description: 'From Pearl Harbor to Stalingrad - the war engulfs the world',
  order: 2,
  nodes: ww2Chapter2Nodes,
  isLocked: false,
  aiVideoUrl: 'https://www.youtube.com/embed/3G1G8Az43Cw?autoplay=0&controls=1&modestbranding=1&rel=0',
};

// WWII Chapter 3: Victory and Aftermath (1944-1945)
const ww2Chapter3Nodes: JourneyNode[] = [
  {
    id: 'ww2-c3-n1',
    chapterId: 'ww2-c3',
    type: 'two-truths',
    title: 'D-Day Myths',
    order: 1,
    xpReward: 60,
    content: {
      type: 'two-truths',
      statements: [
        'D-Day was the largest amphibious invasion in history.',
        'The German defenders knew exactly when and where the Allies would land.',
        'Over 150,000 Allied troops landed on D-Day.',
      ],
      lieIndex: 1,
      explanation: 'The Allies used elaborate deception (Operation Fortitude) to convince Germany the invasion would be at Calais. Even after D-Day, Hitler held back reinforcements expecting the "real" invasion.',
      hostReaction: 'Allied deception operations were crucial to D-Day\'s success!',
    } as TwoTruthsContent,
  },
  {
    id: 'ww2-c3-n2',
    chapterId: 'ww2-c3',
    type: 'found-tape',
    title: 'Eisenhower\'s Orders',
    order: 2,
    xpReward: 40,
    content: {
      type: 'found-tape',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
      title: 'Order of the Day, June 6, 1944',
      context: 'Supreme Commander\'s message to Allied forces',
      transcript: [
        { id: 't1', text: 'Soldiers, Sailors and Airmen of the Allied Expeditionary Force!', startTime: 0, endTime: 4 },
        { id: 't2', text: 'You are about to embark upon the Great Crusade, toward which we have striven these many months.', startTime: 4, endTime: 10 },
        { id: 't3', text: 'The eyes of the world are upon you. The hopes and prayers of liberty-loving people march with you.', startTime: 10, endTime: 17 },
        { id: 't4', text: 'Your task will not be an easy one. Your enemy is well trained, well equipped and battle-hardened.', startTime: 17, endTime: 24 },
        { id: 't5', text: 'But this is the year 1944! We will accept nothing less than full Victory!', startTime: 24, endTime: 30 },
      ],
      questions: [
        { id: 'ww2-c3-n2-q1', sessionId: 'ww2-c3-n2', type: 'multiple-choice', prompt: 'Who was the Supreme Commander of Allied forces on D-Day?', choices: ['Patton', 'Montgomery', 'Eisenhower', 'MacArthur'], answer: 2, explanation: 'General Dwight D. Eisenhower commanded Operation Overlord.' },
        { id: 'ww2-c3-n2-q2', sessionId: 'ww2-c3-n2', type: 'multiple-choice', prompt: 'Where did the D-Day landings take place?', choices: ['Calais', 'Normandy', 'Dunkirk', 'Brittany'], answer: 1, explanation: 'Five beaches in Normandy, France: Utah, Omaha, Gold, Juno, Sword.' },
      ],
    } as FoundTapeContent,
  },
  {
    id: 'ww2-c3-n3',
    chapterId: 'ww2-c3',
    type: 'headlines',
    title: 'Liberation News',
    order: 3,
    xpReward: 60,
    content: {
      type: 'headlines',
      publication: 'STARS AND STRIPES',
      date: 'August 1944 - May 1945',
      headlines: [
        { id: 'h1', title: 'PARIS LIBERATED!', body: 'After four years of Nazi occupation, the French capital is free. General de Gaulle leads a victory parade down the Champs-Élysées.' },
        { id: 'h2', title: 'HITLER DEAD, NAZIS SURRENDER', body: 'Adolf Hitler has died in his Berlin bunker. Germany has surrendered unconditionally. The war in Europe is over.' },
        { id: 'h3', title: 'V-E DAY: VICTORY IN EUROPE', body: 'May 8, 1945 marks the official end of the war in Europe. Celebrations erupt across the Allied nations.' },
      ],
      questions: [
        { id: 'ww2-c3-n3-q1', sessionId: 'ww2-c3-n3', type: 'multiple-choice', prompt: 'When was Paris liberated?', choices: ['June 1944', 'August 1944', 'December 1944', 'May 1945'], answer: 1, explanation: 'Paris was liberated on August 25, 1944.' },
        { id: 'ww2-c3-n3-q2', sessionId: 'ww2-c3-n3', type: 'multiple-choice', prompt: 'What does V-E Day commemorate?', choices: ['Victory over Japan', 'Victory in Europe', 'D-Day', 'End of WWI'], answer: 1, explanation: 'Victory in Europe Day - May 8, 1945.' },
      ],
    } as HeadlinesContent,
  },
  {
    id: 'ww2-c3-n4',
    chapterId: 'ww2-c3',
    type: 'quiz-mix',
    title: 'The Final Days',
    order: 4,
    xpReward: 100,
    content: {
      type: 'quiz-mix',
      questions: [
        { id: 'ww2-c3-n4-q1', sessionId: 'ww2-c3-n4', type: 'multiple-choice', prompt: 'What was the date of D-Day?', choices: ['June 6, 1943', 'June 6, 1944', 'August 15, 1944', 'May 8, 1945'], answer: 1, explanation: 'June 6, 1944 - Operation Overlord.' },
        { id: 'ww2-c3-n4-q2', sessionId: 'ww2-c3-n4', type: 'multiple-choice', prompt: 'Which city was the first to be hit by an atomic bomb?', choices: ['Tokyo', 'Nagasaki', 'Hiroshima', 'Osaka'], answer: 2, explanation: 'Hiroshima was bombed on August 6, 1945.' },
        { id: 'ww2-c3-n4-q3', sessionId: 'ww2-c3-n4', type: 'true-false', prompt: 'Japan surrendered before V-E Day.', choices: ['True', 'False'], answer: 1, explanation: 'Japan surrendered on August 15, 1945 - after V-E Day (May 8).' },
        { id: 'ww2-c3-n4-q4', sessionId: 'ww2-c3-n4', type: 'multiple-choice', prompt: 'Who became US President after FDR died in April 1945?', choices: ['Eisenhower', 'Truman', 'MacArthur', 'Marshall'], answer: 1, explanation: 'Harry S. Truman became president and made the decision to use atomic bombs.' },
      ],
    } as QuizMixContent,
  },
  {
    id: 'ww2-c3-n5',
    chapterId: 'ww2-c3',
    type: 'decision',
    title: 'The Atomic Decision',
    order: 5,
    xpReward: 80,
    content: {
      type: 'decision',
      scenario: 'August 1945: You are President Truman. Japan refuses to surrender. An invasion of Japan could cost 500,000 American lives. You have a new weapon.',
      context: 'The atomic bomb has been successfully tested. Military advisors say it could end the war immediately - but at a terrible human cost.',
      optionA: {
        label: 'Invade Japan with conventional forces',
        outcome: 'Operation Downfall begins. The invasion lasts months and costs hundreds of thousands of lives on both sides.',
        isHistorical: false,
      },
      optionB: {
        label: 'Use the atomic bomb on Japanese cities',
        outcome: 'Hiroshima and Nagasaki are destroyed. Japan surrenders within days. The nuclear age begins.',
        isHistorical: true,
      },
      historicalOutcome: 'Truman ordered atomic bombs dropped on Hiroshima (Aug 6) and Nagasaki (Aug 9). Japan surrendered on August 15, 1945. The decision remains one of history\'s most debated.',
      hostReaction: 'The atomic bomb ended WWII but opened a new era of fear and uncertainty.',
    } as DecisionContent,
  },
  {
    id: 'ww2-c3-n6',
    chapterId: 'ww2-c3',
    type: 'boss',
    title: 'Arc Finale: World War II Mastery',
    order: 6,
    xpReward: 200,
    content: {
      type: 'boss',
      timeLimit: 120,
      xpMultiplier: 2,
      hostIntro: 'You\'ve journeyed from 1939 to 1945. Now prove you understand the war that shaped our world!',
      hostVictory: 'Magnificent! You have mastered the history of World War II!',
      hostDefeat: 'The greatest conflict in human history deserves more study. Return when you\'re ready.',
      questions: [
        { id: 'ww2-c3-b-q1', sessionId: 'ww2-c3-b', type: 'multiple-choice', prompt: 'How many people died in WWII?', choices: ['20 million', '40 million', '70-85 million', '100 million'], answer: 2, explanation: 'Between 70-85 million people died, making it the deadliest conflict in history.' },
        { id: 'ww2-c3-b-q2', sessionId: 'ww2-c3-b', type: 'multiple-choice', prompt: 'What organization was created after WWII?', choices: ['League of Nations', 'United Nations', 'NATO', 'European Union'], answer: 1, explanation: 'The United Nations was founded in 1945 to prevent future world wars.' },
        { id: 'ww2-c3-b-q3', sessionId: 'ww2-c3-b', type: 'true-false', prompt: 'The Holocaust killed approximately 6 million Jews.', choices: ['True', 'False'], answer: 0, explanation: 'The Nazi genocide killed 6 million Jews and millions of others.' },
        { id: 'ww2-c3-b-q4', sessionId: 'ww2-c3-b', type: 'multiple-choice', prompt: 'What divided Europe after WWII?', choices: ['Berlin Wall', 'Iron Curtain', 'Maginot Line', 'Atlantic Charter'], answer: 1, explanation: 'The Iron Curtain divided communist Eastern Europe from the democratic West.' },
        { id: 'ww2-c3-b-q5', sessionId: 'ww2-c3-b', type: 'multiple-choice', prompt: 'When did Japan officially surrender?', choices: ['May 8, 1945', 'August 6, 1945', 'August 15, 1945', 'September 2, 1945'], answer: 3, explanation: 'Japan signed the formal surrender on September 2, 1945 aboard USS Missouri.' },
        { id: 'ww2-c3-b-q6', sessionId: 'ww2-c3-b', type: 'multiple-choice', prompt: 'What was the code name for the D-Day invasion?', choices: ['Operation Torch', 'Operation Overlord', 'Operation Market Garden', 'Operation Barbarossa'], answer: 1, explanation: 'Operation Overlord was the code name for the Normandy invasion.' },
        { id: 'ww2-c3-b-q7', sessionId: 'ww2-c3-b', type: 'multiple-choice', prompt: 'Which country suffered the most casualties in WWII?', choices: ['Germany', 'Japan', 'United States', 'Soviet Union'], answer: 3, explanation: 'The Soviet Union lost 27 million people - the most of any nation.' },
      ],
    } as BossContent,
  },
];

const ww2Chapter3: JourneyChapter = {
  id: 'ww2-c3',
  arcId: 'world-war-2',
  title: 'Victory and Aftermath',
  description: 'From D-Day to V-J Day - the end of history\'s deadliest war',
  order: 3,
  nodes: ww2Chapter3Nodes,
  isLocked: false,
  aiVideoUrl: 'https://www.youtube.com/embed/dUvsWDNw9hE?autoplay=0&controls=1&modestbranding=1&rel=0',
};

// ============================================================
// ANCIENT ROME ARC
// ============================================================

const romeChapter1Nodes: JourneyNode[] = [
  {
    id: 'rome-c1-n1',
    chapterId: 'rome-c1',
    type: 'two-truths',
    title: 'Roman Myths',
    order: 1,
    xpReward: 60,
    content: {
      type: 'two-truths',
      statements: [
        'Gladiators always fought to the death in the Colosseum.',
        'Roman concrete is stronger than modern concrete and still stands today.',
        'Emperors used the thumbs down gesture to condemn gladiators.',
      ],
      lieIndex: 0,
      explanation: 'Most gladiator fights did NOT end in death! Gladiators were expensive to train, so fights usually ended when one yielded. Death matches were rare.',
      hostReaction: 'Hollywood has deceived you! Gladiators were valuable athletes.',
    } as TwoTruthsContent,
  },
  {
    id: 'rome-c1-n2',
    chapterId: 'rome-c1',
    type: 'found-tape',
    title: 'Senate Records',
    order: 2,
    xpReward: 40,
    content: {
      type: 'found-tape',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
      title: 'The Ides of March',
      context: 'Senate testimony, March 44 BCE',
      transcript: [
        { id: 't1', text: 'Caesar entered the Theatre of Pompey that morning, unaware of what awaited.', startTime: 0, endTime: 5 },
        { id: 't2', text: 'The senators surrounded him, daggers hidden beneath their togas.', startTime: 5, endTime: 10 },
        { id: 't3', text: 'Casca struck first. Then Brutus. Then the others. Twenty-three wounds in all.', startTime: 10, endTime: 16 },
        { id: 't4', text: 'He fell at the base of Pompey\'s statue, his blood staining the marble.', startTime: 16, endTime: 21 },
        { id: 't5', text: 'The Republic they sought to save would die with him.', startTime: 21, endTime: 25 },
      ],
      questions: [
        { id: 'rome-c1-n2-q1', sessionId: 'rome-c1-n2', type: 'multiple-choice', prompt: 'How many wounds did Caesar receive?', choices: ['5', '12', '23', '50'], answer: 2, explanation: 'Caesar was stabbed 23 times by the conspirators.' },
        { id: 'rome-c1-n2-q2', sessionId: 'rome-c1-n2', type: 'multiple-choice', prompt: 'Who was among the assassins?', choices: ['Augustus', 'Brutus', 'Nero', 'Caligula'], answer: 1, explanation: 'Marcus Brutus was one of the lead conspirators.' },
      ],
    } as FoundTapeContent,
  },
  {
    id: 'rome-c1-n3',
    chapterId: 'rome-c1',
    type: 'headlines',
    title: 'Roman Gazette',
    order: 3,
    xpReward: 60,
    content: {
      type: 'headlines',
      publication: 'ACTA DIURNA',
      date: '44 BCE',
      headlines: [
        { id: 'h1', title: 'CAESAR FALLS TO SENATE CONSPIRACY', body: 'Dictator Julius Caesar was assassinated in the Senate today. Conspirators claim they acted to preserve the Republic.' },
        { id: 'h2', title: 'MARK ANTONY RALLIES CAESAR\'S SUPPORTERS', body: 'At Caesar\'s funeral, Antony\'s speech inflamed the crowd against the assassins. Riots have broken out across Rome.' },
        { id: 'h3', title: 'OCTAVIAN NAMED CAESAR\'S HEIR', body: 'Caesar\'s will reveals his grand-nephew Octavian as his adopted son and primary heir.' },
      ],
      questions: [
        { id: 'rome-c1-n3-q1', sessionId: 'rome-c1-n3', type: 'multiple-choice', prompt: 'Who gave the famous funeral speech?', choices: ['Brutus', 'Octavian', 'Mark Antony', 'Cicero'], answer: 2, explanation: 'Mark Antony\'s speech turned public opinion against the assassins.' },
        { id: 'rome-c1-n3-q2', sessionId: 'rome-c1-n3', type: 'multiple-choice', prompt: 'Who was named Caesar\'s heir?', choices: ['Brutus', 'Antony', 'Octavian', 'Pompey'], answer: 2, explanation: 'Octavian (later Augustus) was Caesar\'s adopted heir.' },
      ],
    } as HeadlinesContent,
  },
  {
    id: 'rome-c1-n4',
    chapterId: 'rome-c1',
    type: 'quiz-mix',
    title: 'Roman Empire Quiz',
    order: 4,
    xpReward: 100,
    content: {
      type: 'quiz-mix',
      questions: [
        { id: 'rome-c1-n4-q1', sessionId: 'rome-c1-n4', type: 'multiple-choice', prompt: 'What were Roman soldiers called?', choices: ['Gladiators', 'Centurions', 'Legionaries', 'Spartans'], answer: 2, explanation: 'Roman soldiers were legionaries; centurions were officers.' },
        { id: 'rome-c1-n4-q2', sessionId: 'rome-c1-n4', type: 'multiple-choice', prompt: 'What was the Colosseum used for?', choices: ['Senate meetings', 'Public entertainment', 'Religious ceremonies', 'Military training'], answer: 1, explanation: 'The Colosseum hosted gladiatorial games and public spectacles.' },
        { id: 'rome-c1-n4-q3', sessionId: 'rome-c1-n4', type: 'true-false', prompt: 'Rome was founded by Romulus and Remus according to legend.', choices: ['True', 'False'], answer: 0, explanation: 'Legend says twin brothers Romulus and Remus founded Rome in 753 BCE.' },
        { id: 'rome-c1-n4-q4', sessionId: 'rome-c1-n4', type: 'multiple-choice', prompt: 'Who was Rome\'s first emperor?', choices: ['Julius Caesar', 'Augustus', 'Nero', 'Tiberius'], answer: 1, explanation: 'Augustus (Octavian) became the first Roman Emperor in 27 BCE.' },
      ],
    } as QuizMixContent,
  },
  {
    id: 'rome-c1-n5',
    chapterId: 'rome-c1',
    type: 'decision',
    title: 'Cross the Rubicon',
    order: 5,
    xpReward: 80,
    content: {
      type: 'decision',
      scenario: '49 BCE: You are Julius Caesar, standing at the Rubicon River. Roman law forbids generals from bringing armies into Italy.',
      context: 'The Senate has ordered you to disband your army. If you cross the river with your legions, it means civil war.',
      optionA: {
        label: 'Obey the Senate and disband your army',
        outcome: 'You return to Rome as a private citizen. Your enemies in the Senate prosecute you, ending your career.',
        isHistorical: false,
      },
      optionB: {
        label: 'Cross the Rubicon with your legions',
        outcome: 'You declare "The die is cast" and march on Rome. Civil war begins, but you will emerge as dictator.',
        isHistorical: true,
      },
      historicalOutcome: 'Caesar crossed the Rubicon on January 10, 49 BCE, starting a civil war. He defeated his enemies and became dictator of Rome.',
      hostReaction: '"Alea iacta est" - The die is cast! Caesar\'s gamble changed history forever.',
    } as DecisionContent,
  },
  {
    id: 'rome-c1-n6',
    chapterId: 'rome-c1',
    type: 'boss',
    title: 'Chapter Boss: Roman Power',
    order: 6,
    xpReward: 150,
    content: {
      type: 'boss',
      timeLimit: 90,
      xpMultiplier: 2,
      hostIntro: 'From Republic to Empire! Show me your knowledge of Rome!',
      hostVictory: 'Ave! You have proven yourself worthy of Rome!',
      hostDefeat: 'Return when you have studied more of Roman history.',
      questions: [
        { id: 'rome-c1-b-q1', sessionId: 'rome-c1-b', type: 'multiple-choice', prompt: 'When was Caesar assassinated?', choices: ['March 15, 44 BCE', 'July 4, 44 BCE', 'January 1, 45 BCE', 'December 25, 44 BCE'], answer: 0, explanation: 'The Ides of March - March 15, 44 BCE' },
        { id: 'rome-c1-b-q2', sessionId: 'rome-c1-b', type: 'multiple-choice', prompt: 'What river did Caesar cross?', choices: ['Tiber', 'Nile', 'Rubicon', 'Rhine'], answer: 2, explanation: 'The Rubicon River' },
        { id: 'rome-c1-b-q3', sessionId: 'rome-c1-b', type: 'true-false', prompt: 'Caesar was the first Roman Emperor.', choices: ['True', 'False'], answer: 1, explanation: 'Augustus was the first emperor; Caesar was dictator.' },
        { id: 'rome-c1-b-q4', sessionId: 'rome-c1-b', type: 'multiple-choice', prompt: 'Who said "Et tu, Brute?"', choices: ['Historical Caesar', 'Shakespeare\'s Caesar', 'Augustus', 'Mark Antony'], answer: 1, explanation: 'This line is from Shakespeare, not history.' },
        { id: 'rome-c1-b-q5', sessionId: 'rome-c1-b', type: 'multiple-choice', prompt: 'How many hills was Rome built on?', choices: ['3', '5', '7', '12'], answer: 2, explanation: 'Rome was built on seven hills.' },
      ],
    } as BossContent,
  },
];

const romeChapter1: JourneyChapter = {
  id: 'rome-c1',
  arcId: 'ancient-rome',
  title: 'Rise of the Empire',
  description: 'From Republic to Empire under Caesar and Augustus',
  order: 1,
  nodes: romeChapter1Nodes,
  isLocked: false,
};

// ============================================================
// AMERICAN CIVIL WAR ARC
// ============================================================

const civilWarChapter1Nodes: JourneyNode[] = [
  {
    id: 'cw-c1-n1',
    chapterId: 'cw-c1',
    type: 'two-truths',
    title: 'Civil War Myths',
    order: 1,
    xpReward: 60,
    content: {
      type: 'two-truths',
      statements: [
        'The Civil War was fought primarily over the issue of slavery.',
        'Abraham Lincoln was a trained military general before the war.',
        'More Americans died in the Civil War than in all other U.S. wars combined until Vietnam.',
      ],
      lieIndex: 1,
      explanation: 'Lincoln had almost no military experience. He served briefly as a militia captain in the Black Hawk War but never saw combat.',
      hostReaction: 'Lincoln led a nation at war despite having no military background!',
    } as TwoTruthsContent,
  },
  {
    id: 'cw-c1-n2',
    chapterId: 'cw-c1',
    type: 'found-tape',
    title: 'Soldier\'s Letter',
    order: 2,
    xpReward: 40,
    content: {
      type: 'found-tape',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
      title: 'Letter from Gettysburg',
      context: 'Union soldier\'s letter, July 1863',
      transcript: [
        { id: 't1', text: 'Dearest Sarah, the battle here was the worst I have witnessed.', startTime: 0, endTime: 5 },
        { id: 't2', text: 'For three days the cannons never stopped. The ground shook like thunder.', startTime: 5, endTime: 10 },
        { id: 't3', text: 'Pickett\'s charge came on the third day. Thousands of Rebels marched across the open field.', startTime: 10, endTime: 16 },
        { id: 't4', text: 'We held the line. The Union held. But the cost... the cost was terrible.', startTime: 16, endTime: 22 },
        { id: 't5', text: 'Pray that this war may end soon. I long to see you again.', startTime: 22, endTime: 27 },
      ],
      questions: [
        { id: 'cw-c1-n2-q1', sessionId: 'cw-c1-n2', type: 'multiple-choice', prompt: 'How long did the Battle of Gettysburg last?', choices: ['1 day', '3 days', '1 week', '2 weeks'], answer: 1, explanation: 'The battle lasted from July 1-3, 1863.' },
        { id: 'cw-c1-n2-q2', sessionId: 'cw-c1-n2', type: 'multiple-choice', prompt: 'What was Pickett\'s Charge?', choices: ['Union cavalry attack', 'Confederate infantry assault', 'Naval battle', 'Siege tactic'], answer: 1, explanation: 'Pickett\'s Charge was a failed Confederate assault on Union lines.' },
      ],
    } as FoundTapeContent,
  },
  {
    id: 'cw-c1-n3',
    chapterId: 'cw-c1',
    type: 'headlines',
    title: 'War News',
    order: 3,
    xpReward: 60,
    content: {
      type: 'headlines',
      publication: 'NEW YORK TRIBUNE',
      date: 'January 1863',
      headlines: [
        { id: 'h1', title: 'EMANCIPATION PROCLAMATION TAKES EFFECT', body: 'President Lincoln\'s executive order declares all slaves in Confederate states "forever free." The war is now a fight for human freedom.' },
        { id: 'h2', title: 'COLORED TROOPS TO JOIN UNION ARMY', body: 'African Americans may now enlist in the United States Army. The 54th Massachusetts is among the first regiments.' },
        { id: 'h3', title: 'CONFEDERACY VOWS TO FIGHT ON', body: 'Jefferson Davis declares the South will never surrender. The war enters its third year with no end in sight.' },
      ],
      questions: [
        { id: 'cw-c1-n3-q1', sessionId: 'cw-c1-n3', type: 'multiple-choice', prompt: 'What did the Emancipation Proclamation do?', choices: ['Ended the war', 'Freed slaves in Confederate states', 'Freed all slaves everywhere', 'Gave women the right to vote'], answer: 1, explanation: 'It freed slaves only in Confederate states, not border states.' },
        { id: 'cw-c1-n3-q2', sessionId: 'cw-c1-n3', type: 'multiple-choice', prompt: 'Who led the Confederacy?', choices: ['Robert E. Lee', 'Jefferson Davis', 'Ulysses S. Grant', 'Abraham Lincoln'], answer: 1, explanation: 'Jefferson Davis was President of the Confederate States.' },
      ],
    } as HeadlinesContent,
  },
  {
    id: 'cw-c1-n4',
    chapterId: 'cw-c1',
    type: 'quiz-mix',
    title: 'Civil War Knowledge',
    order: 4,
    xpReward: 100,
    content: {
      type: 'quiz-mix',
      questions: [
        { id: 'cw-c1-n4-q1', sessionId: 'cw-c1-n4', type: 'multiple-choice', prompt: 'When did the Civil War begin?', choices: ['1859', '1861', '1863', '1865'], answer: 1, explanation: 'The war began April 12, 1861 with the attack on Fort Sumter.' },
        { id: 'cw-c1-n4-q2', sessionId: 'cw-c1-n4', type: 'multiple-choice', prompt: 'Who was the top Union general at war\'s end?', choices: ['Sherman', 'McClellan', 'Grant', 'Lee'], answer: 2, explanation: 'Ulysses S. Grant led the Union to victory.' },
        { id: 'cw-c1-n4-q3', sessionId: 'cw-c1-n4', type: 'true-false', prompt: 'The Confederacy won the Battle of Gettysburg.', choices: ['True', 'False'], answer: 1, explanation: 'The Union won Gettysburg, a major turning point.' },
        { id: 'cw-c1-n4-q4', sessionId: 'cw-c1-n4', type: 'multiple-choice', prompt: 'Where did the war effectively end?', choices: ['Gettysburg', 'Antietam', 'Appomattox', 'Washington'], answer: 2, explanation: 'Lee surrendered to Grant at Appomattox Court House, April 9, 1865.' },
      ],
    } as QuizMixContent,
  },
  {
    id: 'cw-c1-n5',
    chapterId: 'cw-c1',
    type: 'decision',
    title: 'Fort Sumter',
    order: 5,
    xpReward: 80,
    content: {
      type: 'decision',
      scenario: 'April 1861: You are President Lincoln. Confederate forces surround Fort Sumter in Charleston Harbor. The garrison is running out of supplies.',
      context: 'Sending supplies might provoke war. Abandoning the fort might legitimize secession.',
      optionA: {
        label: 'Abandon Fort Sumter to avoid war',
        outcome: 'The Confederacy claims victory. More states consider secession. The Union appears weak.',
        isHistorical: false,
      },
      optionB: {
        label: 'Send supply ships, forcing the Confederacy to act',
        outcome: 'Confederate batteries open fire. The war begins, but the South fired first, rallying the North.',
        isHistorical: true,
      },
      historicalOutcome: 'Lincoln sent supplies, and the Confederates fired on Fort Sumter on April 12, 1861. By firing first, the South lost the moral high ground.',
      hostReaction: 'Lincoln\'s clever strategy made the Confederacy appear as the aggressor!',
    } as DecisionContent,
  },
  {
    id: 'cw-c1-n6',
    chapterId: 'cw-c1',
    type: 'boss',
    title: 'Chapter Boss: A Nation Divided',
    order: 6,
    xpReward: 150,
    content: {
      type: 'boss',
      timeLimit: 90,
      xpMultiplier: 2,
      hostIntro: 'Brother against brother, state against state. Show your knowledge of America\'s bloodiest war!',
      hostVictory: 'Excellent! You understand the tragedy and triumph of the Civil War!',
      hostDefeat: 'The war\'s complexity demands more study. Return when ready.',
      questions: [
        { id: 'cw-c1-b-q1', sessionId: 'cw-c1-b', type: 'multiple-choice', prompt: 'How many states seceded?', choices: ['7', '11', '13', '15'], answer: 1, explanation: '11 states formed the Confederacy.' },
        { id: 'cw-c1-b-q2', sessionId: 'cw-c1-b', type: 'multiple-choice', prompt: 'What was the bloodiest single day?', choices: ['Gettysburg', 'Antietam', 'Bull Run', 'Shiloh'], answer: 1, explanation: 'Antietam: ~23,000 casualties in one day.' },
        { id: 'cw-c1-b-q3', sessionId: 'cw-c1-b', type: 'true-false', prompt: 'Lincoln was assassinated before the war ended.', choices: ['True', 'False'], answer: 1, explanation: 'He was killed April 14, 1865, after Lee\'s surrender.' },
        { id: 'cw-c1-b-q4', sessionId: 'cw-c1-b', type: 'multiple-choice', prompt: 'Who assassinated Lincoln?', choices: ['Lee Harvey Oswald', 'John Wilkes Booth', 'James Earl Ray', 'Charles Guiteau'], answer: 1, explanation: 'John Wilkes Booth shot Lincoln at Ford\'s Theatre.' },
        { id: 'cw-c1-b-q5', sessionId: 'cw-c1-b', type: 'multiple-choice', prompt: 'About how many Americans died?', choices: ['50,000', '150,000', '620,000', '1,000,000'], answer: 2, explanation: 'About 620,000 soldiers died in the Civil War.' },
      ],
    } as BossContent,
  },
];

const civilWarChapter1: JourneyChapter = {
  id: 'cw-c1',
  arcId: 'american-civil-war',
  title: 'A Nation Divided',
  description: 'The causes and key battles of America\'s bloodiest conflict',
  order: 1,
  nodes: civilWarChapter1Nodes,
  isLocked: false,
};

// ============================================================
// ANCIENT MESOPOTAMIA ARC
// ============================================================

const mesopotamiaChapter1Nodes: JourneyNode[] = [
  {
    id: 'meso-c1-n1',
    chapterId: 'meso-c1',
    type: 'two-truths',
    title: 'Cradle of Civilization',
    order: 1,
    xpReward: 60,
    content: {
      type: 'two-truths',
      statements: [
        'Mesopotamia invented the wheel around 3500 BCE.',
        'The Code of Hammurabi was the world\'s first written laws.',
        'Mesopotamia was located between the Tigris and Euphrates rivers.',
      ],
      lieIndex: 1,
      explanation: 'While Hammurabi\'s Code is famous, earlier law codes existed, such as the Code of Ur-Nammu, written about 300 years before Hammurabi.',
      hostReaction: 'Hammurabi\'s Code was influential, but not the first written laws!',
    } as TwoTruthsContent,
  },
  {
    id: 'meso-c1-n2',
    chapterId: 'meso-c1',
    type: 'found-tape',
    title: 'Clay Tablets',
    order: 2,
    xpReward: 40,
    content: {
      type: 'found-tape',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
      title: 'Epic of Gilgamesh',
      context: 'Ancient Sumerian tablet, circa 2100 BCE',
      transcript: [
        { id: 't1', text: 'Gilgamesh, king of Uruk, two-thirds god and one-third man.', startTime: 0, endTime: 5 },
        { id: 't2', text: 'He built the great walls of Uruk, the city of a thousand temples.', startTime: 5, endTime: 10 },
        { id: 't3', text: 'With his friend Enkidu, he slew the monster Humbaba in the Cedar Forest.', startTime: 10, endTime: 16 },
        { id: 't4', text: 'When Enkidu died, Gilgamesh sought the secret of eternal life.', startTime: 16, endTime: 21 },
        { id: 't5', text: 'He learned that immortality is found not in endless life, but in the deeds we leave behind.', startTime: 21, endTime: 27 },
      ],
      questions: [
        { id: 'meso-c1-n2-q1', sessionId: 'meso-c1-n2', type: 'multiple-choice', prompt: 'What city did Gilgamesh rule?', choices: ['Babylon', 'Uruk', 'Nineveh', 'Ur'], answer: 1, explanation: 'Gilgamesh was the legendary king of Uruk.' },
        { id: 'meso-c1-n2-q2', sessionId: 'meso-c1-n2', type: 'multiple-choice', prompt: 'What did Gilgamesh seek?', choices: ['Treasure', 'Eternal life', 'Revenge', 'A kingdom'], answer: 1, explanation: 'After Enkidu\'s death, Gilgamesh sought immortality.' },
      ],
    } as FoundTapeContent,
  },
  {
    id: 'meso-c1-n3',
    chapterId: 'meso-c1',
    type: 'headlines',
    title: 'Babylon Rising',
    order: 3,
    xpReward: 60,
    content: {
      type: 'headlines',
      publication: 'TABLETS OF BABYLON',
      date: '1754 BCE',
      headlines: [
        { id: 'h1', title: 'HAMMURABI UNITES MESOPOTAMIA', body: 'King Hammurabi has conquered the last rival city-states. All of Mesopotamia now answers to Babylon.' },
        { id: 'h2', title: 'NEW LAW CODE CARVED IN STONE', body: 'The king\'s 282 laws are displayed for all to see. "An eye for an eye" ensures justice for all citizens.' },
        { id: 'h3', title: 'HANGING GARDENS PLANNED', body: 'The king announces plans for magnificent gardens to rival the pyramids of Egypt.' },
      ],
      questions: [
        { id: 'meso-c1-n3-q1', sessionId: 'meso-c1-n3', type: 'multiple-choice', prompt: 'How many laws were in Hammurabi\'s Code?', choices: ['100', '282', '500', '1000'], answer: 1, explanation: 'Hammurabi\'s Code contained 282 laws.' },
        { id: 'meso-c1-n3-q2', sessionId: 'meso-c1-n3', type: 'multiple-choice', prompt: 'What principle is the Code famous for?', choices: ['Innocent until proven guilty', 'An eye for an eye', 'All are equal', 'Mercy before justice'], answer: 1, explanation: 'The Code established proportional punishment.' },
      ],
    } as HeadlinesContent,
  },
  {
    id: 'meso-c1-n4',
    chapterId: 'meso-c1',
    type: 'quiz-mix',
    title: 'Mesopotamian Innovations',
    order: 4,
    xpReward: 100,
    content: {
      type: 'quiz-mix',
      questions: [
        { id: 'meso-c1-n4-q1', sessionId: 'meso-c1-n4', type: 'multiple-choice', prompt: 'What writing system did Mesopotamia use?', choices: ['Hieroglyphics', 'Cuneiform', 'Alphabet', 'Pictographs'], answer: 1, explanation: 'Cuneiform used wedge-shaped marks pressed into clay.' },
        { id: 'meso-c1-n4-q2', sessionId: 'meso-c1-n4', type: 'multiple-choice', prompt: 'Where is ancient Mesopotamia today?', choices: ['Egypt', 'Iran', 'Iraq', 'Turkey'], answer: 2, explanation: 'Mesopotamia is in modern-day Iraq.' },
        { id: 'meso-c1-n4-q3', sessionId: 'meso-c1-n4', type: 'true-false', prompt: 'Mesopotamians invented the 60-minute hour.', choices: ['True', 'False'], answer: 0, explanation: 'Their base-60 number system gave us 60 seconds/minutes.' },
        { id: 'meso-c1-n4-q4', sessionId: 'meso-c1-n4', type: 'multiple-choice', prompt: 'What does "Mesopotamia" mean?', choices: ['Land of Kings', 'Between Rivers', 'Fertile Crescent', 'Ancient Land'], answer: 1, explanation: 'It means "land between rivers" (Tigris and Euphrates).' },
      ],
    } as QuizMixContent,
  },
  {
    id: 'meso-c1-n5',
    chapterId: 'meso-c1',
    type: 'decision',
    title: 'The Great Flood',
    order: 5,
    xpReward: 80,
    content: {
      type: 'decision',
      scenario: 'The gods have warned you of a coming flood that will destroy all life. You are Utnapishtim, a wise man of Shuruppak.',
      context: 'The god Ea has told you to build a boat and save your family and "the seed of all living things."',
      optionA: {
        label: 'Ignore the warning and continue your daily life',
        outcome: 'The flood comes. You and all you know are swept away. The story of the flood is never told.',
        isHistorical: false,
      },
      optionB: {
        label: 'Build a great boat and gather animals aboard',
        outcome: 'You survive the flood that destroys the world. The gods grant you immortality for your wisdom.',
        isHistorical: true,
      },
      historicalOutcome: 'The flood story in the Epic of Gilgamesh predates the biblical Noah story by over 1,000 years. Utnapishtim built a boat and survived.',
      hostReaction: 'This ancient flood story influenced many later traditions, including Noah\'s Ark!',
    } as DecisionContent,
  },
  {
    id: 'meso-c1-n6',
    chapterId: 'meso-c1',
    type: 'boss',
    title: 'Chapter Boss: Cradle of Civilization',
    order: 6,
    xpReward: 150,
    content: {
      type: 'boss',
      timeLimit: 90,
      xpMultiplier: 2,
      hostIntro: 'Where civilization began! Prove your knowledge of ancient Mesopotamia!',
      hostVictory: 'Excellent! You have mastered the cradle of civilization!',
      hostDefeat: 'The ancient world holds many secrets. Study and return.',
      questions: [
        { id: 'meso-c1-b-q1', sessionId: 'meso-c1-b', type: 'multiple-choice', prompt: 'What rivers bordered Mesopotamia?', choices: ['Nile and Amazon', 'Tigris and Euphrates', 'Ganges and Indus', 'Yellow and Yangtze'], answer: 1, explanation: 'Tigris and Euphrates' },
        { id: 'meso-c1-b-q2', sessionId: 'meso-c1-b', type: 'multiple-choice', prompt: 'What was the first great empire?', choices: ['Babylonian', 'Akkadian', 'Assyrian', 'Persian'], answer: 1, explanation: 'The Akkadian Empire under Sargon the Great' },
        { id: 'meso-c1-b-q3', sessionId: 'meso-c1-b', type: 'true-false', prompt: 'The ziggurat was a stepped pyramid temple.', choices: ['True', 'False'], answer: 0, explanation: 'Ziggurats were massive temple structures.' },
        { id: 'meso-c1-b-q4', sessionId: 'meso-c1-b', type: 'multiple-choice', prompt: 'What was cuneiform written on?', choices: ['Paper', 'Stone', 'Clay tablets', 'Papyrus'], answer: 2, explanation: 'Cuneiform was pressed into wet clay tablets.' },
        { id: 'meso-c1-b-q5', sessionId: 'meso-c1-b', type: 'multiple-choice', prompt: 'What\'s the oldest known story?', choices: ['The Odyssey', 'Epic of Gilgamesh', 'The Bible', 'Beowulf'], answer: 1, explanation: 'The Epic of Gilgamesh, circa 2100 BCE.' },
      ],
    } as BossContent,
  },
];

const mesopotamiaChapter1: JourneyChapter = {
  id: 'meso-c1',
  arcId: 'mesopotamia',
  title: 'Cradle of Civilization',
  description: 'Where writing, cities, and empires began',
  order: 1,
  nodes: mesopotamiaChapter1Nodes,
  isLocked: false,
};

// ============================================================
// ANCIENT EGYPT ARC
// ============================================================

const egyptChapter1Nodes: JourneyNode[] = [
  {
    id: 'egypt-c1-n1',
    chapterId: 'egypt-c1',
    type: 'two-truths',
    title: 'Pyramid Mysteries',
    order: 1,
    xpReward: 60,
    content: {
      type: 'two-truths',
      statements: [
        'The pyramids were built by slaves.',
        'Cleopatra lived closer in time to the Moon landing than to the building of the pyramids.',
        'The Great Pyramid was the tallest structure in the world for over 3,800 years.',
      ],
      lieIndex: 0,
      explanation: 'The pyramids were NOT built by slaves! Archaeological evidence shows they were built by paid workers who were well-fed and received medical care.',
      hostReaction: 'The slave myth comes from ancient Greek historians, not Egyptian records!',
    } as TwoTruthsContent,
  },
  {
    id: 'egypt-c1-n2',
    chapterId: 'egypt-c1',
    type: 'found-tape',
    title: 'Tomb Inscription',
    order: 2,
    xpReward: 40,
    content: {
      type: 'found-tape',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
      title: 'The Boy King\'s Curse',
      context: 'Inscription from the tomb of Tutankhamun, 1323 BCE',
      transcript: [
        { id: 't1', text: 'Death shall come on swift wings to him who disturbs the peace of the King.', startTime: 0, endTime: 5 },
        { id: 't2', text: 'I am Tutankhamun, who became Pharaoh at the age of nine.', startTime: 5, endTime: 10 },
        { id: 't3', text: 'My reign was short, but my tomb was filled with treasures for the afterlife.', startTime: 10, endTime: 16 },
        { id: 't4', text: 'For three thousand years I slept undisturbed, until the foreigners came.', startTime: 16, endTime: 22 },
        { id: 't5', text: 'Now my golden mask is known throughout the world.', startTime: 22, endTime: 27 },
      ],
      questions: [
        { id: 'egypt-c1-n2-q1', sessionId: 'egypt-c1-n2', type: 'multiple-choice', prompt: 'How old was Tutankhamun when he became Pharaoh?', choices: ['5', '9', '15', '21'], answer: 1, explanation: 'Tutankhamun became pharaoh at about age 9.' },
        { id: 'egypt-c1-n2-q2', sessionId: 'egypt-c1-n2', type: 'multiple-choice', prompt: 'What is Tutankhamun\'s tomb famous for?', choices: ['Its size', 'Its intact treasures', 'Its location', 'Its age'], answer: 1, explanation: 'It was discovered nearly intact with thousands of artifacts.' },
      ],
    } as FoundTapeContent,
  },
  {
    id: 'egypt-c1-n3',
    chapterId: 'egypt-c1',
    type: 'headlines',
    title: 'Nile Chronicles',
    order: 3,
    xpReward: 60,
    content: {
      type: 'headlines',
      publication: 'PAPYRUS TIMES',
      date: '1922 CE',
      headlines: [
        { id: 'h1', title: 'KING TUT\'S TOMB DISCOVERED', body: 'Howard Carter has found an intact pharaoh\'s tomb in the Valley of the Kings. "I see wonderful things," he declared upon opening.' },
        { id: 'h2', title: 'GOLDEN TREASURES ASTOUND THE WORLD', body: 'Over 5,000 artifacts recovered including a solid gold death mask weighing 24 pounds.' },
        { id: 'h3', title: 'CURSE OF THE PHARAOH?', body: 'Lord Carnarvon, who funded the expedition, has died. Some whisper of an ancient curse.' },
      ],
      questions: [
        { id: 'egypt-c1-n3-q1', sessionId: 'egypt-c1-n3', type: 'multiple-choice', prompt: 'Who discovered Tutankhamun\'s tomb?', choices: ['Lord Carnarvon', 'Howard Carter', 'Indiana Jones', 'Jean-François Champollion'], answer: 1, explanation: 'Howard Carter discovered the tomb in 1922.' },
        { id: 'egypt-c1-n3-q2', sessionId: 'egypt-c1-n3', type: 'true-false', prompt: 'The mummy\'s curse killed several expedition members.', choices: ['True', 'False'], answer: 1, explanation: 'The "curse" is a myth; most expedition members lived long lives.' },
      ],
    } as HeadlinesContent,
  },
  {
    id: 'egypt-c1-n4',
    chapterId: 'egypt-c1',
    type: 'quiz-mix',
    title: 'Egyptian Knowledge',
    order: 4,
    xpReward: 100,
    content: {
      type: 'quiz-mix',
      questions: [
        { id: 'egypt-c1-n4-q1', sessionId: 'egypt-c1-n4', type: 'multiple-choice', prompt: 'What river was essential to Egyptian civilization?', choices: ['Tigris', 'Euphrates', 'Nile', 'Amazon'], answer: 2, explanation: 'The Nile provided water, fertile soil, and transportation.' },
        { id: 'egypt-c1-n4-q2', sessionId: 'egypt-c1-n4', type: 'multiple-choice', prompt: 'What was the purpose of mummification?', choices: ['Preserve the body for the afterlife', 'Medical research', 'Display wealth', 'Punishment'], answer: 0, explanation: 'Egyptians believed the body was needed in the afterlife.' },
        { id: 'egypt-c1-n4-q3', sessionId: 'egypt-c1-n4', type: 'true-false', prompt: 'Hieroglyphics were deciphered using the Rosetta Stone.', choices: ['True', 'False'], answer: 0, explanation: 'The Rosetta Stone had the same text in three scripts.' },
        { id: 'egypt-c1-n4-q4', sessionId: 'egypt-c1-n4', type: 'multiple-choice', prompt: 'Who was the last pharaoh of Egypt?', choices: ['Nefertiti', 'Cleopatra', 'Hatshepsut', 'Ramesses II'], answer: 1, explanation: 'Cleopatra VII was the last active pharaoh before Roman conquest.' },
      ],
    } as QuizMixContent,
  },
  {
    id: 'egypt-c1-n5',
    chapterId: 'egypt-c1',
    type: 'decision',
    title: 'Building the Great Pyramid',
    order: 5,
    xpReward: 80,
    content: {
      type: 'decision',
      scenario: 'You are Pharaoh Khufu. You wish to build a tomb that will last for eternity and secure your place in the afterlife.',
      context: 'Your architects have proposed two options for your eternal resting place.',
      optionA: {
        label: 'Build a traditional mastaba tomb like your ancestors',
        outcome: 'Your tomb is completed quickly but is eventually robbed and forgotten.',
        isHistorical: false,
      },
      optionB: {
        label: 'Build the largest pyramid ever attempted',
        outcome: 'It takes 20 years and thousands of workers, but your pyramid becomes one of the Seven Wonders.',
        isHistorical: true,
      },
      historicalOutcome: 'The Great Pyramid of Giza took about 20 years to build and remained the tallest man-made structure for over 3,800 years.',
      hostReaction: 'Khufu\'s ambition created a wonder that still stands 4,500 years later!',
    } as DecisionContent,
  },
  {
    id: 'egypt-c1-n6',
    chapterId: 'egypt-c1',
    type: 'boss',
    title: 'Chapter Boss: Land of the Pharaohs',
    order: 6,
    xpReward: 150,
    content: {
      type: 'boss',
      timeLimit: 90,
      xpMultiplier: 2,
      hostIntro: 'Walk like an Egyptian! Show me your knowledge of ancient Egypt!',
      hostVictory: 'Magnificent! You are worthy of the pharaohs!',
      hostDefeat: 'The sands of time hold more secrets. Study and return.',
      questions: [
        { id: 'egypt-c1-b-q1', sessionId: 'egypt-c1-b', type: 'multiple-choice', prompt: 'What did Egyptians call their land?', choices: ['Egypt', 'Kemet', 'Nubia', 'Libya'], answer: 1, explanation: 'Kemet means "black land" for the fertile Nile soil.' },
        { id: 'egypt-c1-b-q2', sessionId: 'egypt-c1-b', type: 'multiple-choice', prompt: 'What god ruled the underworld?', choices: ['Ra', 'Horus', 'Osiris', 'Anubis'], answer: 2, explanation: 'Osiris was king of the underworld.' },
        { id: 'egypt-c1-b-q3', sessionId: 'egypt-c1-b', type: 'true-false', prompt: 'The Sphinx has the body of a lion.', choices: ['True', 'False'], answer: 0, explanation: 'The Sphinx has a lion\'s body and human head.' },
        { id: 'egypt-c1-b-q4', sessionId: 'egypt-c1-b', type: 'multiple-choice', prompt: 'How old are the pyramids of Giza?', choices: ['2,000 years', '3,000 years', '4,500 years', '6,000 years'], answer: 2, explanation: 'Built around 2560 BCE, about 4,500 years ago.' },
        { id: 'egypt-c1-b-q5', sessionId: 'egypt-c1-b', type: 'multiple-choice', prompt: 'What was placed in tombs with mummies?', choices: ['Nothing', 'Gold and goods', 'Living servants', 'Water only'], answer: 1, explanation: 'Treasures and goods for the afterlife.' },
      ],
    } as BossContent,
  },
];

const egyptChapter1: JourneyChapter = {
  id: 'egypt-c1',
  arcId: 'ancient-egypt',
  title: 'Land of the Pharaohs',
  description: 'Pyramids, mummies, and the mysteries of the Nile',
  order: 1,
  nodes: egyptChapter1Nodes,
  isLocked: false,
};

// ============================================================
// MEDIEVAL EUROPE ARC
// ============================================================

const medievalChapter1Nodes: JourneyNode[] = [
  {
    id: 'med-c1-n1',
    chapterId: 'med-c1',
    type: 'two-truths',
    title: 'Medieval Myths',
    order: 1,
    xpReward: 60,
    content: {
      type: 'two-truths',
      statements: [
        'Medieval people believed the Earth was flat.',
        'The Black Death killed about one-third of Europe\'s population.',
        'Knights wore armor so heavy they couldn\'t move if knocked down.',
      ],
      lieIndex: 0,
      explanation: 'Most educated medieval people knew the Earth was round! This is a modern myth. Greek knowledge of the spherical Earth was preserved throughout the Middle Ages.',
      hostReaction: 'The flat Earth myth is itself a myth! Medieval scholars knew better.',
    } as TwoTruthsContent,
  },
  {
    id: 'med-c1-n2',
    chapterId: 'med-c1',
    type: 'found-tape',
    title: 'Plague Chronicle',
    order: 2,
    xpReward: 40,
    content: {
      type: 'found-tape',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
      title: 'The Black Death',
      context: 'Monastery records, Florence, 1348',
      transcript: [
        { id: 't1', text: 'The pestilence arrived on ships from the East, carried by rats and fleas.', startTime: 0, endTime: 5 },
        { id: 't2', text: 'Black swellings appeared in the armpits and groin. Death came within days.', startTime: 5, endTime: 11 },
        { id: 't3', text: 'So many died that the living could not bury them. Bodies filled the streets.', startTime: 11, endTime: 17 },
        { id: 't4', text: 'Some said it was God\'s punishment. Others blamed the Jews or the stars.', startTime: 17, endTime: 23 },
        { id: 't5', text: 'By the time it passed, one in three had perished.', startTime: 23, endTime: 28 },
      ],
      questions: [
        { id: 'med-c1-n2-q1', sessionId: 'med-c1-n2', type: 'multiple-choice', prompt: 'What carried the Black Death?', choices: ['Bad air', 'Fleas on rats', 'Contaminated water', 'Witchcraft'], answer: 1, explanation: 'Fleas on rats carried the Yersinia pestis bacteria.' },
        { id: 'med-c1-n2-q2', sessionId: 'med-c1-n2', type: 'multiple-choice', prompt: 'What fraction of Europe died?', choices: ['One-tenth', 'One-quarter', 'One-third', 'One-half'], answer: 2, explanation: 'About 30-50% of Europe\'s population died.' },
      ],
    } as FoundTapeContent,
  },
  {
    id: 'med-c1-n3',
    chapterId: 'med-c1',
    type: 'headlines',
    title: 'Medieval News',
    order: 3,
    xpReward: 60,
    content: {
      type: 'headlines',
      publication: 'THE HERALD',
      date: '1066 CE',
      headlines: [
        { id: 'h1', title: 'NORMAN CONQUEST COMPLETE', body: 'William of Normandy has defeated King Harold at Hastings. England has a new king.' },
        { id: 'h2', title: 'HAROLD FALLS TO ARROW', body: 'King Harold was struck in the eye by an arrow, leading to Saxon defeat.' },
        { id: 'h3', title: 'NEW CASTLES TO BE BUILT', body: 'William orders stone castles constructed throughout England to secure Norman rule.' },
      ],
      questions: [
        { id: 'med-c1-n3-q1', sessionId: 'med-c1-n3', type: 'multiple-choice', prompt: 'Who conquered England in 1066?', choices: ['Vikings', 'Romans', 'Normans', 'Saxons'], answer: 2, explanation: 'William the Conqueror led the Norman invasion.' },
        { id: 'med-c1-n3-q2', sessionId: 'med-c1-n3', type: 'multiple-choice', prompt: 'What battle decided England\'s fate?', choices: ['Hastings', 'Waterloo', 'Agincourt', 'Crécy'], answer: 0, explanation: 'The Battle of Hastings in 1066.' },
      ],
    } as HeadlinesContent,
  },
  {
    id: 'med-c1-n4',
    chapterId: 'med-c1',
    type: 'quiz-mix',
    title: 'Medieval Life',
    order: 4,
    xpReward: 100,
    content: {
      type: 'quiz-mix',
      questions: [
        { id: 'med-c1-n4-q1', sessionId: 'med-c1-n4', type: 'multiple-choice', prompt: 'What was the feudal system?', choices: ['Banking system', 'Land-for-service hierarchy', 'Religious order', 'Trade network'], answer: 1, explanation: 'Lords granted land to vassals in exchange for military service.' },
        { id: 'med-c1-n4-q2', sessionId: 'med-c1-n4', type: 'multiple-choice', prompt: 'What were the Crusades?', choices: ['Trade expeditions', 'Religious wars', 'Viking raids', 'Plague outbreaks'], answer: 1, explanation: 'Wars to capture the Holy Land from Muslims.' },
        { id: 'med-c1-n4-q3', sessionId: 'med-c1-n4', type: 'true-false', prompt: 'Serfs were essentially slaves tied to the land.', choices: ['True', 'False'], answer: 0, explanation: 'Serfs couldn\'t leave their lord\'s land but had some rights.' },
        { id: 'med-c1-n4-q4', sessionId: 'med-c1-n4', type: 'multiple-choice', prompt: 'What was a keep?', choices: ['Prison', 'Central castle tower', 'Church', 'Market'], answer: 1, explanation: 'The keep was the fortified tower at a castle\'s center.' },
      ],
    } as QuizMixContent,
  },
  {
    id: 'med-c1-n5',
    chapterId: 'med-c1',
    type: 'decision',
    title: 'The First Crusade',
    order: 5,
    xpReward: 80,
    content: {
      type: 'decision',
      scenario: '1095: Pope Urban II calls for a holy war to reclaim Jerusalem from Muslim control. You are a European knight.',
      context: 'The journey is dangerous, but the Pope promises forgiveness of all sins to those who take up the cross.',
      optionA: {
        label: 'Stay home and tend to your lands',
        outcome: 'You live a comfortable life, but miss the chance for glory and salvation.',
        isHistorical: false,
      },
      optionB: {
        label: 'Take the cross and march to Jerusalem',
        outcome: 'After years of hardship, the Crusaders capture Jerusalem in 1099. You are forever changed.',
        isHistorical: true,
      },
      historicalOutcome: 'The First Crusade captured Jerusalem in 1099. Thousands of knights and commoners made the journey, driven by faith and the promise of salvation.',
      hostReaction: 'The Crusades shaped relations between East and West for centuries!',
    } as DecisionContent,
  },
  {
    id: 'med-c1-n6',
    chapterId: 'med-c1',
    type: 'boss',
    title: 'Chapter Boss: Age of Knights',
    order: 6,
    xpReward: 150,
    content: {
      type: 'boss',
      timeLimit: 90,
      xpMultiplier: 2,
      hostIntro: 'Knights, castles, and crusades! Prove your medieval knowledge!',
      hostVictory: 'Well fought! You are a true scholar of the Middle Ages!',
      hostDefeat: 'The Dark Ages hold more secrets. Return when ready.',
      questions: [
        { id: 'med-c1-b-q1', sessionId: 'med-c1-b', type: 'multiple-choice', prompt: 'When was the Black Death?', choices: ['1066', '1215', '1347-1351', '1492'], answer: 2, explanation: '1347-1351 was the main outbreak.' },
        { id: 'med-c1-b-q2', sessionId: 'med-c1-b', type: 'multiple-choice', prompt: 'What was the Magna Carta?', choices: ['A castle', 'A charter limiting king\'s power', 'A church decree', 'A battle'], answer: 1, explanation: 'The Magna Carta (1215) limited royal authority.' },
        { id: 'med-c1-b-q3', sessionId: 'med-c1-b', type: 'true-false', prompt: 'The Middle Ages lasted about 1,000 years.', choices: ['True', 'False'], answer: 0, explanation: 'From roughly 500-1500 CE.' },
        { id: 'med-c1-b-q4', sessionId: 'med-c1-b', type: 'multiple-choice', prompt: 'Who led the Norman Conquest?', choices: ['Charlemagne', 'William', 'Richard', 'Harold'], answer: 1, explanation: 'William the Conqueror in 1066.' },
        { id: 'med-c1-b-q5', sessionId: 'med-c1-b', type: 'multiple-choice', prompt: 'What ended the Middle Ages?', choices: ['Black Death', 'Renaissance', 'Crusades', 'Roman fall'], answer: 1, explanation: 'The Renaissance marked the transition to early modern era.' },
      ],
    } as BossContent,
  },
];

const medievalChapter1: JourneyChapter = {
  id: 'med-c1',
  arcId: 'medieval-europe',
  title: 'Age of Knights',
  description: 'Castles, crusades, and the feudal world',
  order: 1,
  nodes: medievalChapter1Nodes,
  isLocked: false,
};

// ============================================================
// ANCIENT GREECE ARC
// ============================================================

const greeceChapter1Nodes: JourneyNode[] = [
  {
    id: 'greece-c1-n1',
    chapterId: 'greece-c1',
    type: 'two-truths',
    title: 'Greek Myths',
    order: 1,
    xpReward: 60,
    content: {
      type: 'two-truths',
      statements: [
        'Ancient Greek statues were originally painted in bright colors.',
        'The Olympics allowed women to compete alongside men.',
        'Democracy was invented in Athens around 508 BCE.',
      ],
      lieIndex: 1,
      explanation: 'Women were NOT allowed to compete in the ancient Olympics! In fact, married women couldn\'t even watch. There were separate games for women called the Heraean Games.',
      hostReaction: 'The ancient Olympics were men-only. Women had their own separate games!',
    } as TwoTruthsContent,
  },
  {
    id: 'greece-c1-n2',
    chapterId: 'greece-c1',
    type: 'found-tape',
    title: 'Socrates\' Trial',
    order: 2,
    xpReward: 40,
    content: {
      type: 'found-tape',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
      title: 'The Death of Socrates',
      context: 'Athenian court records, 399 BCE',
      transcript: [
        { id: 't1', text: 'Socrates stands accused of corrupting the youth of Athens.', startTime: 0, endTime: 5 },
        { id: 't2', text: 'He is also charged with not believing in the gods of the city.', startTime: 5, endTime: 10 },
        { id: 't3', text: 'The philosopher defends himself but refuses to beg for mercy.', startTime: 10, endTime: 15 },
        { id: 't4', text: 'The jury votes: 280 for death, 221 for acquittal.', startTime: 15, endTime: 20 },
        { id: 't5', text: 'He drinks the hemlock calmly, discussing philosophy until the end.', startTime: 20, endTime: 25 },
      ],
      questions: [
        { id: 'greece-c1-n2-q1', sessionId: 'greece-c1-n2', type: 'multiple-choice', prompt: 'What was Socrates accused of?', choices: ['Murder', 'Theft', 'Corrupting youth', 'Treason'], answer: 2, explanation: 'He was accused of corrupting young minds with his questioning.' },
        { id: 'greece-c1-n2-q2', sessionId: 'greece-c1-n2', type: 'multiple-choice', prompt: 'How did Socrates die?', choices: ['Execution by sword', 'Drinking hemlock', 'Old age', 'In battle'], answer: 1, explanation: 'He was sentenced to drink poison hemlock.' },
      ],
    } as FoundTapeContent,
  },
  {
    id: 'greece-c1-n3',
    chapterId: 'greece-c1',
    type: 'headlines',
    title: 'Athenian News',
    order: 3,
    xpReward: 60,
    content: {
      type: 'headlines',
      publication: 'ATHENIAN HERALD',
      date: '490 BCE',
      headlines: [
        { id: 'h1', title: 'VICTORY AT MARATHON!', body: 'Athenian forces have defeated the Persian army despite being outnumbered. A runner brings news to Athens.' },
        { id: 'h2', title: 'PHEIDIPPIDES RUNS 26 MILES', body: 'The messenger ran from Marathon to Athens to announce victory, then collapsed and died.' },
        { id: 'h3', title: 'PERSIAN INVASION REPELLED', body: 'King Darius\'s forces retreat to their ships. Athens stands free!' },
      ],
      questions: [
        { id: 'greece-c1-n3-q1', sessionId: 'greece-c1-n3', type: 'multiple-choice', prompt: 'How far did the messenger run?', choices: ['10 miles', '26 miles', '50 miles', '100 miles'], answer: 1, explanation: 'About 26 miles, inspiring the modern marathon.' },
        { id: 'greece-c1-n3-q2', sessionId: 'greece-c1-n3', type: 'multiple-choice', prompt: 'Who invaded Greece?', choices: ['Romans', 'Egyptians', 'Persians', 'Macedonians'], answer: 2, explanation: 'The Persian Empire under King Darius.' },
      ],
    } as HeadlinesContent,
  },
  {
    id: 'greece-c1-n4',
    chapterId: 'greece-c1',
    type: 'quiz-mix',
    title: 'Greek Knowledge',
    order: 4,
    xpReward: 100,
    content: {
      type: 'quiz-mix',
      questions: [
        { id: 'greece-c1-n4-q1', sessionId: 'greece-c1-n4', type: 'multiple-choice', prompt: 'Who was the student of Socrates?', choices: ['Aristotle', 'Plato', 'Alexander', 'Homer'], answer: 1, explanation: 'Plato was Socrates\' most famous student.' },
        { id: 'greece-c1-n4-q2', sessionId: 'greece-c1-n4', type: 'multiple-choice', prompt: 'What was the Parthenon?', choices: ['A palace', 'A temple to Athena', 'A stadium', 'A market'], answer: 1, explanation: 'The Parthenon was a temple dedicated to the goddess Athena.' },
        { id: 'greece-c1-n4-q3', sessionId: 'greece-c1-n4', type: 'true-false', prompt: 'Sparta and Athens were allies.', choices: ['True', 'False'], answer: 1, explanation: 'They were rivals who fought the Peloponnesian War.' },
        { id: 'greece-c1-n4-q4', sessionId: 'greece-c1-n4', type: 'multiple-choice', prompt: 'Who conquered the Greek world?', choices: ['Rome', 'Persia', 'Alexander the Great', 'Egypt'], answer: 2, explanation: 'Alexander of Macedon united Greece and conquered Persia.' },
      ],
    } as QuizMixContent,
  },
  {
    id: 'greece-c1-n5',
    chapterId: 'greece-c1',
    type: 'decision',
    title: 'Thermopylae',
    order: 5,
    xpReward: 80,
    content: {
      type: 'decision',
      scenario: '480 BCE: You are King Leonidas of Sparta. The massive Persian army approaches the narrow pass at Thermopylae.',
      context: 'You have 300 Spartans and a few thousand Greek allies. The Persians number in the hundreds of thousands.',
      optionA: {
        label: 'Retreat and defend the Peloponnese',
        outcome: 'You save your men, but the Persians sweep through Greece unchallenged.',
        isHistorical: false,
      },
      optionB: {
        label: 'Hold the pass to buy time for Greece',
        outcome: 'You fight to the last man. Your sacrifice gives Greece time to prepare, leading to eventual victory.',
        isHistorical: true,
      },
      historicalOutcome: 'Leonidas and his 300 Spartans held the pass for three days before being surrounded. Their sacrifice became legendary and helped unite Greece.',
      hostReaction: '"Come and take them!" The Spartans died, but Greece survived!',
    } as DecisionContent,
  },
  {
    id: 'greece-c1-n6',
    chapterId: 'greece-c1',
    type: 'boss',
    title: 'Chapter Boss: Glory of Greece',
    order: 6,
    xpReward: 150,
    content: {
      type: 'boss',
      timeLimit: 90,
      xpMultiplier: 2,
      hostIntro: 'Philosophy, democracy, and heroes! Show your Greek wisdom!',
      hostVictory: 'Magnificent! The gods smile upon your knowledge!',
      hostDefeat: 'Return to the academy and study more.',
      questions: [
        { id: 'greece-c1-b-q1', sessionId: 'greece-c1-b', type: 'multiple-choice', prompt: 'What is Athens famous for inventing?', choices: ['The wheel', 'Democracy', 'Writing', 'The calendar'], answer: 1, explanation: 'Athens created the first democracy.' },
        { id: 'greece-c1-b-q2', sessionId: 'greece-c1-b', type: 'multiple-choice', prompt: 'Who wrote the Iliad and Odyssey?', choices: ['Socrates', 'Plato', 'Homer', 'Aristotle'], answer: 2, explanation: 'Homer, the legendary poet.' },
        { id: 'greece-c1-b-q3', sessionId: 'greece-c1-b', type: 'true-false', prompt: 'Greek statues were always white marble.', choices: ['True', 'False'], answer: 1, explanation: 'They were painted in bright colors.' },
        { id: 'greece-c1-b-q4', sessionId: 'greece-c1-b', type: 'multiple-choice', prompt: 'Who tutored Alexander the Great?', choices: ['Socrates', 'Plato', 'Aristotle', 'Homer'], answer: 2, explanation: 'Aristotle was Alexander\'s teacher.' },
        { id: 'greece-c1-b-q5', sessionId: 'greece-c1-b', type: 'multiple-choice', prompt: 'What city-state was known for warriors?', choices: ['Athens', 'Sparta', 'Corinth', 'Thebes'], answer: 1, explanation: 'Sparta was famous for its military culture.' },
      ],
    } as BossContent,
  },
];

const greeceChapter1: JourneyChapter = {
  id: 'greece-c1',
  arcId: 'ancient-greece',
  title: 'Glory of Greece',
  description: 'Democracy, philosophy, and the Persian Wars',
  order: 1,
  nodes: greeceChapter1Nodes,
  isLocked: false,
};

// ============================================================
// RENAISSANCE ARC
// ============================================================

const renaissanceChapter1Nodes: JourneyNode[] = [
  {
    id: 'ren-c1-n1',
    chapterId: 'ren-c1',
    type: 'two-truths',
    title: 'Renaissance Myths',
    order: 1,
    xpReward: 60,
    content: {
      type: 'two-truths',
      statements: [
        'Michelangelo painted the Sistine Chapel ceiling lying on his back.',
        'Leonardo da Vinci wrote his notes backwards (mirror writing).',
        'The Mona Lisa was stolen from the Louvre in 1911.',
      ],
      lieIndex: 0,
      explanation: 'Michelangelo did NOT lie on his back! He painted standing up on scaffolding, bending backwards. He even wrote a poem complaining about the neck pain.',
      hostReaction: 'Imagine standing and bending backwards for four years! No wonder he complained.',
    } as TwoTruthsContent,
  },
  {
    id: 'ren-c1-n2',
    chapterId: 'ren-c1',
    type: 'found-tape',
    title: 'Da Vinci\'s Notebook',
    order: 2,
    xpReward: 40,
    content: {
      type: 'found-tape',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
      title: 'Thoughts of a Genius',
      context: 'From Leonardo\'s private notebooks, circa 1500',
      transcript: [
        { id: 't1', text: 'I have designed a flying machine with wings like a bird.', startTime: 0, endTime: 5 },
        { id: 't2', text: 'Men will walk on the moon, though not in my lifetime.', startTime: 5, endTime: 10 },
        { id: 't3', text: 'I dissect corpses at night to understand the human body.', startTime: 10, endTime: 15 },
        { id: 't4', text: 'The Church forbids such study, so I work in secret.', startTime: 15, endTime: 20 },
        { id: 't5', text: 'Art and science are not separate. They are one pursuit of truth.', startTime: 20, endTime: 25 },
      ],
      questions: [
        { id: 'ren-c1-n2-q1', sessionId: 'ren-c1-n2', type: 'multiple-choice', prompt: 'What did Leonardo design?', choices: ['A submarine', 'A flying machine', 'A telephone', 'A car'], answer: 1, explanation: 'Leonardo sketched designs for flying machines centuries ahead of his time.' },
        { id: 'ren-c1-n2-q2', sessionId: 'ren-c1-n2', type: 'multiple-choice', prompt: 'Why did he dissect bodies in secret?', choices: ['It was illegal', 'Church forbade it', 'He was shy', 'For fun'], answer: 1, explanation: 'The Church restricted anatomical study.' },
      ],
    } as FoundTapeContent,
  },
  {
    id: 'ren-c1-n3',
    chapterId: 'ren-c1',
    type: 'headlines',
    title: 'Florence Times',
    order: 3,
    xpReward: 60,
    content: {
      type: 'headlines',
      publication: 'FLORENTINE CHRONICLE',
      date: '1504',
      headlines: [
        { id: 'h1', title: 'DAVID UNVEILED IN PIAZZA', body: 'Michelangelo\'s marble masterpiece now stands in the Piazza della Signoria. The 17-foot statue took three years to complete.' },
        { id: 'h2', title: 'MEDICI BANK FUNDS NEW ARTWORKS', body: 'The wealthy Medici family continues to commission paintings, sculptures, and buildings throughout Florence.' },
        { id: 'h3', title: 'PRINTING PRESS SPREADS KNOWLEDGE', body: 'Books once copied by hand are now printed by machine. Ideas spread faster than ever before.' },
      ],
      questions: [
        { id: 'ren-c1-n3-q1', sessionId: 'ren-c1-n3', type: 'multiple-choice', prompt: 'Who sculpted David?', choices: ['Leonardo', 'Raphael', 'Michelangelo', 'Donatello'], answer: 2, explanation: 'Michelangelo carved David from 1501-1504.' },
        { id: 'ren-c1-n3-q2', sessionId: 'ren-c1-n3', type: 'multiple-choice', prompt: 'What family funded Renaissance art?', choices: ['Borgia', 'Medici', 'Sforza', 'Habsburg'], answer: 1, explanation: 'The Medici were the greatest patrons of Renaissance art.' },
      ],
    } as HeadlinesContent,
  },
  {
    id: 'ren-c1-n4',
    chapterId: 'ren-c1',
    type: 'quiz-mix',
    title: 'Renaissance Masters',
    order: 4,
    xpReward: 100,
    content: {
      type: 'quiz-mix',
      questions: [
        { id: 'ren-c1-n4-q1', sessionId: 'ren-c1-n4', type: 'multiple-choice', prompt: 'What does "Renaissance" mean?', choices: ['Revolution', 'Rebirth', 'Religion', 'Royalty'], answer: 1, explanation: 'Renaissance means "rebirth" in French.' },
        { id: 'ren-c1-n4-q2', sessionId: 'ren-c1-n4', type: 'multiple-choice', prompt: 'Who painted the Mona Lisa?', choices: ['Michelangelo', 'Raphael', 'Leonardo', 'Botticelli'], answer: 2, explanation: 'Leonardo da Vinci painted it around 1503-1519.' },
        { id: 'ren-c1-n4-q3', sessionId: 'ren-c1-n4', type: 'true-false', prompt: 'The printing press was invented during the Renaissance.', choices: ['True', 'False'], answer: 0, explanation: 'Gutenberg invented the printing press around 1440.' },
        { id: 'ren-c1-n4-q4', sessionId: 'ren-c1-n4', type: 'multiple-choice', prompt: 'Where did the Renaissance begin?', choices: ['France', 'England', 'Italy', 'Spain'], answer: 2, explanation: 'The Renaissance started in Italian city-states like Florence.' },
      ],
    } as QuizMixContent,
  },
  {
    id: 'ren-c1-n5',
    chapterId: 'ren-c1',
    type: 'decision',
    title: 'Galileo\'s Choice',
    order: 5,
    xpReward: 80,
    content: {
      type: 'decision',
      scenario: '1633: You are Galileo Galilei. The Church has ordered you to renounce your claim that the Earth revolves around the Sun.',
      context: 'Your telescopic observations prove you\'re right, but the Inquisition threatens imprisonment or death.',
      optionA: {
        label: 'Refuse to recant and accept martyrdom',
        outcome: 'You die for truth, but your work is destroyed and your discoveries delayed for decades.',
        isHistorical: false,
      },
      optionB: {
        label: 'Publicly recant but continue research in secret',
        outcome: 'You save your life and continue working under house arrest. Your ideas eventually triumph.',
        isHistorical: true,
      },
      historicalOutcome: 'Galileo publicly recanted but reportedly whispered "And yet it moves." He spent his final years under house arrest but continued scientific work.',
      hostReaction: 'Galileo chose survival, and science eventually won!',
    } as DecisionContent,
  },
  {
    id: 'ren-c1-n6',
    chapterId: 'ren-c1',
    type: 'boss',
    title: 'Chapter Boss: Age of Genius',
    order: 6,
    xpReward: 150,
    content: {
      type: 'boss',
      timeLimit: 90,
      xpMultiplier: 2,
      hostIntro: 'Art, science, and the rebirth of learning! Show your Renaissance knowledge!',
      hostVictory: 'Bravo! You are a true Renaissance scholar!',
      hostDefeat: 'Return to the studio and study the masters.',
      questions: [
        { id: 'ren-c1-b-q1', sessionId: 'ren-c1-b', type: 'multiple-choice', prompt: 'What ceiling did Michelangelo paint?', choices: ['St. Peter\'s', 'Sistine Chapel', 'Notre Dame', 'Westminster'], answer: 1, explanation: 'The Sistine Chapel in the Vatican.' },
        { id: 'ren-c1-b-q2', sessionId: 'ren-c1-b', type: 'multiple-choice', prompt: 'Who invented the printing press?', choices: ['Da Vinci', 'Gutenberg', 'Copernicus', 'Galileo'], answer: 1, explanation: 'Johannes Gutenberg around 1440.' },
        { id: 'ren-c1-b-q3', sessionId: 'ren-c1-b', type: 'true-false', prompt: 'Leonardo was left-handed.', choices: ['True', 'False'], answer: 0, explanation: 'Yes, which may explain his mirror writing.' },
        { id: 'ren-c1-b-q4', sessionId: 'ren-c1-b', type: 'multiple-choice', prompt: 'What did Copernicus propose?', choices: ['Flat Earth', 'Sun-centered system', 'Evolution', 'Gravity'], answer: 1, explanation: 'That the Earth orbits the Sun (heliocentrism).' },
        { id: 'ren-c1-b-q5', sessionId: 'ren-c1-b', type: 'multiple-choice', prompt: 'When was the Renaissance?', choices: ['500-1000', '1000-1300', '1400-1600', '1700-1800'], answer: 2, explanation: 'Roughly the 14th to 17th centuries.' },
      ],
    } as BossContent,
  },
];

const renaissanceChapter1: JourneyChapter = {
  id: 'ren-c1',
  arcId: 'renaissance',
  title: 'Age of Genius',
  description: 'Art, science, and the rebirth of Europe',
  order: 1,
  nodes: renaissanceChapter1Nodes,
  isLocked: false,
};

// ============================================================
// INDUSTRIAL REVOLUTION ARC
// ============================================================

const industrialChapter1Nodes: JourneyNode[] = [
  {
    id: 'ind-c1-n1',
    chapterId: 'ind-c1',
    type: 'two-truths',
    title: 'Factory Myths',
    order: 1,
    xpReward: 60,
    content: {
      type: 'two-truths',
      statements: [
        'Children as young as 5 worked in factories during the Industrial Revolution.',
        'The steam engine was invented by James Watt.',
        'The Industrial Revolution began in Great Britain.',
      ],
      lieIndex: 1,
      explanation: 'James Watt did NOT invent the steam engine! Thomas Newcomen invented it in 1712. Watt significantly improved it in 1769, making it more efficient.',
      hostReaction: 'Watt improved the steam engine, but Newcomen came first!',
    } as TwoTruthsContent,
  },
  {
    id: 'ind-c1-n2',
    chapterId: 'ind-c1',
    type: 'found-tape',
    title: 'Factory Report',
    order: 2,
    xpReward: 40,
    content: {
      type: 'found-tape',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
      title: 'Child Worker Testimony',
      context: 'Parliamentary investigation, 1833',
      transcript: [
        { id: 't1', text: 'I started work at the cotton mill when I was seven years old.', startTime: 0, endTime: 5 },
        { id: 't2', text: 'We worked from six in the morning until eight at night.', startTime: 5, endTime: 10 },
        { id: 't3', text: 'If we fell asleep, the overseer would hit us with a strap.', startTime: 10, endTime: 15 },
        { id: 't4', text: 'My sister lost her fingers in the machinery. She was nine.', startTime: 15, endTime: 20 },
        { id: 't5', text: 'We earned three shillings a week. Barely enough for bread.', startTime: 20, endTime: 25 },
      ],
      questions: [
        { id: 'ind-c1-n2-q1', sessionId: 'ind-c1-n2', type: 'multiple-choice', prompt: 'How many hours did children work?', choices: ['6 hours', '8 hours', '14 hours', '20 hours'], answer: 2, explanation: 'Children often worked 14-hour days, six days a week.' },
        { id: 'ind-c1-n2-q2', sessionId: 'ind-c1-n2', type: 'multiple-choice', prompt: 'What danger is mentioned?', choices: ['Fire', 'Machinery accidents', 'Disease', 'Starvation'], answer: 1, explanation: 'Machinery often injured or killed child workers.' },
      ],
    } as FoundTapeContent,
  },
  {
    id: 'ind-c1-n3',
    chapterId: 'ind-c1',
    type: 'headlines',
    title: 'Industrial Times',
    order: 3,
    xpReward: 60,
    content: {
      type: 'headlines',
      publication: 'MANCHESTER GUARDIAN',
      date: '1830',
      headlines: [
        { id: 'h1', title: 'RAILWAY OPENS: LIVERPOOL TO MANCHESTER', body: 'The world\'s first inter-city passenger railway begins service. Trains reach the incredible speed of 30 miles per hour!' },
        { id: 'h2', title: 'FACTORIES TRANSFORM CITIES', body: 'Manchester\'s population has doubled in twenty years as workers flock to the mills seeking employment.' },
        { id: 'h3', title: 'LUDDITES SMASH MACHINES', body: 'Workers calling themselves Luddites have destroyed factory equipment, fearing machines will take their jobs.' },
      ],
      questions: [
        { id: 'ind-c1-n3-q1', sessionId: 'ind-c1-n3', type: 'multiple-choice', prompt: 'What did Luddites destroy?', choices: ['Factories', 'Machines', 'Trains', 'Farms'], answer: 1, explanation: 'Luddites smashed machinery they feared would replace workers.' },
        { id: 'ind-c1-n3-q2', sessionId: 'ind-c1-n3', type: 'multiple-choice', prompt: 'How fast did early trains go?', choices: ['5 mph', '15 mph', '30 mph', '60 mph'], answer: 2, explanation: 'About 30 mph, considered incredibly fast at the time.' },
      ],
    } as HeadlinesContent,
  },
  {
    id: 'ind-c1-n4',
    chapterId: 'ind-c1',
    type: 'quiz-mix',
    title: 'Industrial Knowledge',
    order: 4,
    xpReward: 100,
    content: {
      type: 'quiz-mix',
      questions: [
        { id: 'ind-c1-n4-q1', sessionId: 'ind-c1-n4', type: 'multiple-choice', prompt: 'Where did the Industrial Revolution begin?', choices: ['USA', 'France', 'Britain', 'Germany'], answer: 2, explanation: 'Britain had coal, iron, and capital to industrialize first.' },
        { id: 'ind-c1-n4-q2', sessionId: 'ind-c1-n4', type: 'multiple-choice', prompt: 'What powered early factories?', choices: ['Electricity', 'Steam', 'Oil', 'Nuclear'], answer: 1, explanation: 'Steam engines powered the first factories.' },
        { id: 'ind-c1-n4-q3', sessionId: 'ind-c1-n4', type: 'true-false', prompt: 'The telephone was invented during the Industrial Revolution.', choices: ['True', 'False'], answer: 0, explanation: 'Alexander Graham Bell invented it in 1876.' },
        { id: 'ind-c1-n4-q4', sessionId: 'ind-c1-n4', type: 'multiple-choice', prompt: 'What industry started the revolution?', choices: ['Steel', 'Textile/Cotton', 'Automobile', 'Electrical'], answer: 1, explanation: 'The textile industry, especially cotton, led the way.' },
      ],
    } as QuizMixContent,
  },
  {
    id: 'ind-c1-n5',
    chapterId: 'ind-c1',
    type: 'decision',
    title: 'The Factory Owner',
    order: 5,
    xpReward: 80,
    content: {
      type: 'decision',
      scenario: 'You own a textile mill in 1820. Parliament is considering laws to limit child labor.',
      context: 'Child workers are cheap and can fit into small spaces. But reformers say it\'s morally wrong.',
      optionA: {
        label: 'Oppose the reforms to maximize profits',
        outcome: 'Your profits remain high, but public opinion turns against factory owners. Eventually laws pass anyway.',
        isHistorical: true,
      },
      optionB: {
        label: 'Support reforms and improve conditions',
        outcome: 'You lose some profit but gain public respect. Other owners follow your example.',
        isHistorical: false,
      },
      historicalOutcome: 'Most factory owners opposed child labor laws. The Factory Acts were passed anyway starting in 1833, gradually improving conditions.',
      hostReaction: 'Profit often won over humanity. Change came slowly through legislation.',
    } as DecisionContent,
  },
  {
    id: 'ind-c1-n6',
    chapterId: 'ind-c1',
    type: 'boss',
    title: 'Chapter Boss: Age of Steam',
    order: 6,
    xpReward: 150,
    content: {
      type: 'boss',
      timeLimit: 90,
      xpMultiplier: 2,
      hostIntro: 'Factories, railways, and revolution! Show your industrial knowledge!',
      hostVictory: 'Excellent! You\'ve mastered the age of machines!',
      hostDefeat: 'Return to the factory and learn more.',
      questions: [
        { id: 'ind-c1-b-q1', sessionId: 'ind-c1-b', type: 'multiple-choice', prompt: 'When was the Industrial Revolution?', choices: ['1600s', '1700s-1800s', '1900s', '2000s'], answer: 1, explanation: 'Roughly 1760-1840 for the first phase.' },
        { id: 'ind-c1-b-q2', sessionId: 'ind-c1-b', type: 'multiple-choice', prompt: 'Who improved the steam engine?', choices: ['Edison', 'Watt', 'Ford', 'Bell'], answer: 1, explanation: 'James Watt made it efficient for factories.' },
        { id: 'ind-c1-b-q3', sessionId: 'ind-c1-b', type: 'true-false', prompt: 'Cities grew rapidly during industrialization.', choices: ['True', 'False'], answer: 0, explanation: 'People flocked to cities for factory jobs.' },
        { id: 'ind-c1-b-q4', sessionId: 'ind-c1-b', type: 'multiple-choice', prompt: 'What movement opposed machines?', choices: ['Chartism', 'Luddism', 'Socialism', 'Liberalism'], answer: 1, explanation: 'Luddites destroyed machines they feared.' },
        { id: 'ind-c1-b-q5', sessionId: 'ind-c1-b', type: 'multiple-choice', prompt: 'What did the Factory Acts regulate?', choices: ['Taxes', 'Child labor', 'Exports', 'Wages'], answer: 1, explanation: 'They limited child labor and improved conditions.' },
      ],
    } as BossContent,
  },
];

const industrialChapter1: JourneyChapter = {
  id: 'ind-c1',
  arcId: 'industrial-revolution',
  title: 'Age of Steam',
  description: 'Factories, railways, and the birth of the modern world',
  order: 1,
  nodes: industrialChapter1Nodes,
  isLocked: false,
};

// ============================================================
// AGE OF EXPLORATION ARC
// ============================================================

const explorationChapter1Nodes: JourneyNode[] = [
  {
    id: 'exp-c1-n1',
    chapterId: 'exp-c1',
    type: 'two-truths',
    title: 'Explorer Myths',
    order: 1,
    xpReward: 60,
    content: {
      type: 'two-truths',
      statements: [
        'Christopher Columbus proved the Earth was round.',
        'Columbus never actually set foot on mainland North America.',
        'The first voyage around the world was completed by Magellan\'s crew.',
      ],
      lieIndex: 0,
      explanation: 'Columbus did NOT prove the Earth was round! Educated people already knew this. Columbus was trying to find a shorter route to Asia, not prove Earth\'s shape.',
      hostReaction: 'The flat Earth myth is itself a myth! Columbus knew the world was round.',
    } as TwoTruthsContent,
  },
  {
    id: 'exp-c1-n2',
    chapterId: 'exp-c1',
    type: 'found-tape',
    title: 'Ship\'s Log',
    order: 2,
    xpReward: 40,
    content: {
      type: 'found-tape',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
      title: 'Columbus\'s Journal',
      context: 'Log of the Santa María, October 1492',
      transcript: [
        { id: 't1', text: 'The crew grows restless. We have been at sea for weeks with no sight of land.', startTime: 0, endTime: 6 },
        { id: 't2', text: 'Some whisper of mutiny. They fear we will sail off the edge of the world.', startTime: 6, endTime: 12 },
        { id: 't3', text: 'I have told them we are closer than we think. I pray I am right.', startTime: 12, endTime: 18 },
        { id: 't4', text: 'October 12: Land! A lookout has spotted birds and floating branches.', startTime: 18, endTime: 24 },
        { id: 't5', text: 'We have reached the Indies. Or so I believe. Glory to God and Spain!', startTime: 24, endTime: 30 },
      ],
      questions: [
        { id: 'exp-c1-n2-q1', sessionId: 'exp-c1-n2', type: 'multiple-choice', prompt: 'What did Columbus think he found?', choices: ['America', 'Africa', 'The Indies (Asia)', 'Australia'], answer: 2, explanation: 'Columbus believed he had reached Asia until his death.' },
        { id: 'exp-c1-n2-q2', sessionId: 'exp-c1-n2', type: 'multiple-choice', prompt: 'When did Columbus land?', choices: ['1492', '1500', '1520', '1620'], answer: 0, explanation: 'October 12, 1492.' },
      ],
    } as FoundTapeContent,
  },
  {
    id: 'exp-c1-n3',
    chapterId: 'exp-c1',
    type: 'headlines',
    title: 'Age of Discovery',
    order: 3,
    xpReward: 60,
    content: {
      type: 'headlines',
      publication: 'IBERIAN CHRONICLE',
      date: '1522',
      headlines: [
        { id: 'h1', title: 'MAGELLAN\'S CREW RETURNS FROM WORLD VOYAGE', body: 'Only 18 of 270 men survived the three-year journey. Magellan himself was killed in the Philippines.' },
        { id: 'h2', title: 'SPICES WORTH A FORTUNE', body: 'Despite the losses, the spices brought back paid for the entire expedition and more.' },
        { id: 'h3', title: 'EARTH PROVEN ROUND', body: 'The successful circumnavigation proves beyond doubt that the world is a sphere.' },
      ],
      questions: [
        { id: 'exp-c1-n3-q1', sessionId: 'exp-c1-n3', type: 'multiple-choice', prompt: 'How many of Magellan\'s crew survived?', choices: ['18', '100', '200', '270'], answer: 0, explanation: 'Only 18 of 270 men completed the voyage.' },
        { id: 'exp-c1-n3-q2', sessionId: 'exp-c1-n3', type: 'true-false', prompt: 'Magellan completed the circumnavigation.', choices: ['True', 'False'], answer: 1, explanation: 'He was killed in the Philippines; his crew finished.' },
      ],
    } as HeadlinesContent,
  },
  {
    id: 'exp-c1-n4',
    chapterId: 'exp-c1',
    type: 'quiz-mix',
    title: 'Explorer Knowledge',
    order: 4,
    xpReward: 100,
    content: {
      type: 'quiz-mix',
      questions: [
        { id: 'exp-c1-n4-q1', sessionId: 'exp-c1-n4', type: 'multiple-choice', prompt: 'Who sponsored Columbus?', choices: ['Portugal', 'England', 'Spain', 'France'], answer: 2, explanation: 'Queen Isabella and King Ferdinand of Spain.' },
        { id: 'exp-c1-n4-q2', sessionId: 'exp-c1-n4', type: 'multiple-choice', prompt: 'Why did Europeans want to reach Asia?', choices: ['To spread religion', 'To trade for spices', 'To find gold', 'All of the above'], answer: 3, explanation: 'Spices, gold, and religious conversion all motivated exploration.' },
        { id: 'exp-c1-n4-q3', sessionId: 'exp-c1-n4', type: 'true-false', prompt: 'Vikings reached America before Columbus.', choices: ['True', 'False'], answer: 0, explanation: 'Leif Erikson reached Newfoundland around 1000 CE.' },
        { id: 'exp-c1-n4-q4', sessionId: 'exp-c1-n4', type: 'multiple-choice', prompt: 'What was the "Columbian Exchange"?', choices: ['Currency trading', 'Transfer of plants, animals, diseases', 'Slave trade', 'Spice trade'], answer: 1, explanation: 'The exchange of species between Old and New Worlds.' },
      ],
    } as QuizMixContent,
  },
  {
    id: 'exp-c1-n5',
    chapterId: 'exp-c1',
    type: 'decision',
    title: 'The New World',
    order: 5,
    xpReward: 80,
    content: {
      type: 'decision',
      scenario: '1492: You are Columbus. You\'ve landed on an island and met the native Taíno people. They bring gifts of gold.',
      context: 'You could establish peaceful trade, or you could claim everything for Spain and search for more gold.',
      optionA: {
        label: 'Establish respectful trade and learn their language',
        outcome: 'A slower path to wealth, but one that preserves indigenous cultures.',
        isHistorical: false,
      },
      optionB: {
        label: 'Claim the land for Spain and demand tribute',
        outcome: 'Spain grows rich, but the native population is devastated by conquest and disease.',
        isHistorical: true,
      },
      historicalOutcome: 'Columbus enslaved natives and demanded gold tribute. Within 50 years, the Taíno population was nearly extinct from disease and exploitation.',
      hostReaction: 'The Age of Exploration brought wealth to Europe but devastation to indigenous peoples.',
    } as DecisionContent,
  },
  {
    id: 'exp-c1-n6',
    chapterId: 'exp-c1',
    type: 'boss',
    title: 'Chapter Boss: New Horizons',
    order: 6,
    xpReward: 150,
    content: {
      type: 'boss',
      timeLimit: 90,
      xpMultiplier: 2,
      hostIntro: 'Ships, spices, and new worlds! Show your exploration knowledge!',
      hostVictory: 'Excellent! You\'ve charted these waters well!',
      hostDefeat: 'Return to port and study the maps.',
      questions: [
        { id: 'exp-c1-b-q1', sessionId: 'exp-c1-b', type: 'multiple-choice', prompt: 'What year did Columbus sail?', choices: ['1442', '1492', '1522', '1620'], answer: 1, explanation: '1492' },
        { id: 'exp-c1-b-q2', sessionId: 'exp-c1-b', type: 'multiple-choice', prompt: 'Who sailed around Africa to India?', choices: ['Columbus', 'Magellan', 'Vasco da Gama', 'Drake'], answer: 2, explanation: 'Vasco da Gama in 1498.' },
        { id: 'exp-c1-b-q3', sessionId: 'exp-c1-b', type: 'true-false', prompt: 'Columbus knew he found a new continent.', choices: ['True', 'False'], answer: 1, explanation: 'He believed he reached Asia.' },
        { id: 'exp-c1-b-q4', sessionId: 'exp-c1-b', type: 'multiple-choice', prompt: 'What disease devastated Native Americans?', choices: ['Plague', 'Smallpox', 'Cholera', 'Malaria'], answer: 1, explanation: 'Smallpox killed millions with no immunity.' },
        { id: 'exp-c1-b-q5', sessionId: 'exp-c1-b', type: 'multiple-choice', prompt: 'What strait did Magellan discover?', choices: ['Gibraltar', 'Magellan', 'Drake', 'Bering'], answer: 1, explanation: 'The Strait of Magellan at South America\'s tip.' },
      ],
    } as BossContent,
  },
];

const explorationChapter1: JourneyChapter = {
  id: 'exp-c1',
  arcId: 'age-of-exploration',
  title: 'New Horizons',
  description: 'Voyages of discovery that connected the world',
  order: 1,
  nodes: explorationChapter1Nodes,
  isLocked: false,
};

// ============================================================
// ANCIENT CHINA ARC
// ============================================================

const chinaChapter1Nodes: JourneyNode[] = [
  {
    id: 'china-c1-n1',
    chapterId: 'china-c1',
    type: 'two-truths',
    title: 'Chinese Myths',
    order: 1,
    xpReward: 60,
    content: {
      type: 'two-truths',
      statements: [
        'The Great Wall of China is visible from space.',
        'The Terracotta Army was buried to protect Emperor Qin Shi Huang in the afterlife.',
        'China invented paper, gunpowder, the compass, and printing.',
      ],
      lieIndex: 0,
      explanation: 'The Great Wall is NOT visible from space with the naked eye! Astronauts have confirmed this myth is false. The wall is wide but not wide enough to see from orbit.',
      hostReaction: 'Even astronauts cannot see the Great Wall without special equipment!',
    } as TwoTruthsContent,
  },
  {
    id: 'china-c1-n2',
    chapterId: 'china-c1',
    type: 'found-tape',
    title: 'Emperor\'s Decree',
    order: 2,
    xpReward: 40,
    content: {
      type: 'found-tape',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
      title: 'Qin Shi Huang\'s Command',
      context: 'Imperial decree, 221 BCE',
      transcript: [
        { id: 't1', text: 'I am the First Emperor. I have unified the warring states under one rule.', startTime: 0, endTime: 6 },
        { id: 't2', text: 'All weights and measures shall be standardized throughout the realm.', startTime: 6, endTime: 12 },
        { id: 't3', text: 'A great wall shall protect our northern borders from barbarian invasion.', startTime: 12, endTime: 18 },
        { id: 't4', text: 'Books that speak of the old kingdoms shall be burned. Only one history matters now.', startTime: 18, endTime: 24 },
        { id: 't5', text: 'Build my tomb with an army of clay soldiers to guard me for eternity.', startTime: 24, endTime: 30 },
      ],
      questions: [
        { id: 'china-c1-n2-q1', sessionId: 'china-c1-n2', type: 'multiple-choice', prompt: 'What did Qin Shi Huang standardize?', choices: ['Religion', 'Weights and measures', 'Clothing', 'Food'], answer: 1, explanation: 'He standardized weights, measures, currency, and writing.' },
        { id: 'china-c1-n2-q2', sessionId: 'china-c1-n2', type: 'multiple-choice', prompt: 'What did he order burned?', choices: ['Villages', 'Books', 'Temples', 'Farms'], answer: 1, explanation: 'He ordered books burned to erase competing histories.' },
      ],
    } as FoundTapeContent,
  },
  {
    id: 'china-c1-n3',
    chapterId: 'china-c1',
    type: 'headlines',
    title: 'Imperial Gazette',
    order: 3,
    xpReward: 60,
    content: {
      type: 'headlines',
      publication: 'IMPERIAL GAZETTE',
      date: '1974 CE',
      headlines: [
        { id: 'h1', title: 'FARMERS DISCOVER CLAY ARMY', body: 'While digging a well, local farmers have uncovered an incredible sight: thousands of life-size clay soldiers buried for over 2,000 years.' },
        { id: 'h2', title: 'TERRACOTTA WARRIORS GUARD FIRST EMPEROR', body: 'Archaeologists believe this is the army of Qin Shi Huang, each soldier with a unique face.' },
        { id: 'h3', title: 'EIGHTH WONDER OF THE WORLD', body: 'Experts call this discovery one of the greatest archaeological finds in history.' },
      ],
      questions: [
        { id: 'china-c1-n3-q1', sessionId: 'china-c1-n3', type: 'multiple-choice', prompt: 'When was the Terracotta Army discovered?', choices: ['1874', '1924', '1974', '2004'], answer: 2, explanation: 'Farmers discovered it in 1974 near Xi\'an.' },
        { id: 'china-c1-n3-q2', sessionId: 'china-c1-n3', type: 'true-false', prompt: 'Each terracotta soldier has a unique face.', choices: ['True', 'False'], answer: 0, explanation: 'Each of the ~8,000 soldiers has distinct features.' },
      ],
    } as HeadlinesContent,
  },
  {
    id: 'china-c1-n4',
    chapterId: 'china-c1',
    type: 'quiz-mix',
    title: 'Chinese Civilization',
    order: 4,
    xpReward: 100,
    content: {
      type: 'quiz-mix',
      questions: [
        { id: 'china-c1-n4-q1', sessionId: 'china-c1-n4', type: 'multiple-choice', prompt: 'What Chinese invention changed warfare?', choices: ['Paper', 'Silk', 'Gunpowder', 'Compass'], answer: 2, explanation: 'Gunpowder, invented for fireworks, revolutionized warfare.' },
        { id: 'china-c1-n4-q2', sessionId: 'china-c1-n4', type: 'multiple-choice', prompt: 'What was the Silk Road?', choices: ['A road made of silk', 'Trade routes to the West', 'A royal highway', 'A river'], answer: 1, explanation: 'Trade routes connecting China to Rome and beyond.' },
        { id: 'china-c1-n4-q3', sessionId: 'china-c1-n4', type: 'true-false', prompt: 'The Great Wall was built all at once.', choices: ['True', 'False'], answer: 1, explanation: 'It was built over centuries by different dynasties.' },
        { id: 'china-c1-n4-q4', sessionId: 'china-c1-n4', type: 'multiple-choice', prompt: 'What philosophy influenced Chinese government?', choices: ['Buddhism', 'Confucianism', 'Taoism', 'Shinto'], answer: 1, explanation: 'Confucianism shaped government and society for millennia.' },
      ],
    } as QuizMixContent,
  },
  {
    id: 'china-c1-n5',
    chapterId: 'china-c1',
    type: 'decision',
    title: 'The Burning of Books',
    order: 5,
    xpReward: 80,
    content: {
      type: 'decision',
      scenario: '213 BCE: You are an advisor to Emperor Qin Shi Huang. He wants to burn all books that don\'t support his rule.',
      context: 'Scholars and philosophers protest, but the Emperor demands unity of thought.',
      optionA: {
        label: 'Argue against the book burning',
        outcome: 'You are buried alive with 460 other scholars who opposed the Emperor.',
        isHistorical: false,
      },
      optionB: {
        label: 'Support the Emperor\'s decree',
        outcome: 'Books are burned, knowledge is lost, but you survive. Some scholars hide copies.',
        isHistorical: true,
      },
      historicalOutcome: 'The First Emperor burned books and buried scholars alive. However, some knowledge survived through hidden copies and oral tradition.',
      hostReaction: 'The Emperor\'s tyranny destroyed much knowledge, but human memory preserved what it could.',
    } as DecisionContent,
  },
  {
    id: 'china-c1-n6',
    chapterId: 'china-c1',
    type: 'boss',
    title: 'Chapter Boss: Middle Kingdom',
    order: 6,
    xpReward: 150,
    content: {
      type: 'boss',
      timeLimit: 90,
      xpMultiplier: 2,
      hostIntro: 'Dynasties, inventions, and the Great Wall! Prove your knowledge of China!',
      hostVictory: 'Excellent! You honor the wisdom of the ancients!',
      hostDefeat: 'Return and study the ways of the Middle Kingdom.',
      questions: [
        { id: 'china-c1-b-q1', sessionId: 'china-c1-b', type: 'multiple-choice', prompt: 'Who was the First Emperor?', choices: ['Confucius', 'Sun Tzu', 'Qin Shi Huang', 'Kublai Khan'], answer: 2, explanation: 'Qin Shi Huang unified China in 221 BCE.' },
        { id: 'china-c1-b-q2', sessionId: 'china-c1-b', type: 'multiple-choice', prompt: 'What are China\'s Four Great Inventions?', choices: ['Paper, printing, gunpowder, compass', 'Silk, tea, porcelain, bronze', 'Rice, noodles, fortune cookies, fireworks', 'Iron, steel, jade, gold'], answer: 0, explanation: 'Paper, printing, gunpowder, and the compass.' },
        { id: 'china-c1-b-q3', sessionId: 'china-c1-b', type: 'true-false', prompt: 'The Ming Dynasty built most of the Great Wall.', choices: ['True', 'False'], answer: 0, explanation: 'Most of what we see today was built by the Ming.' },
        { id: 'china-c1-b-q4', sessionId: 'china-c1-b', type: 'multiple-choice', prompt: 'How many Terracotta Warriors are there?', choices: ['1,000', '8,000', '50,000', '1 million'], answer: 1, explanation: 'About 8,000 clay soldiers, plus horses and chariots.' },
        { id: 'china-c1-b-q5', sessionId: 'china-c1-b', type: 'multiple-choice', prompt: 'What was China called?', choices: ['The Far East', 'The Middle Kingdom', 'The Celestial Empire', 'Both B and C'], answer: 3, explanation: 'Both Middle Kingdom and Celestial Empire.' },
      ],
    } as BossContent,
  },
];

const chinaChapter1: JourneyChapter = {
  id: 'china-c1',
  arcId: 'ancient-china',
  title: 'Middle Kingdom',
  description: 'Dynasties, emperors, and the world\'s oldest civilization',
  order: 1,
  nodes: chinaChapter1Nodes,
  isLocked: false,
};

// ============================================================
// WORLD WAR I ARC
// ============================================================

const ww1Chapter1Nodes: JourneyNode[] = [
  {
    id: 'ww1-c1-n1',
    chapterId: 'ww1-c1',
    type: 'two-truths',
    title: 'Great War Myths',
    order: 1,
    xpReward: 60,
    content: {
      type: 'two-truths',
      statements: [
        'World War I was started by the assassination of Archduke Franz Ferdinand.',
        'Christmas Truce soccer games happened along the entire Western Front.',
        'More soldiers died from disease than combat in WWI.',
      ],
      lieIndex: 1,
      explanation: 'The Christmas Truce soccer games did happen, but only in scattered locations, not along the entire front. Many sectors saw no truce at all.',
      hostReaction: 'The Christmas Truce is often romanticized. Reality was more complicated.',
    } as TwoTruthsContent,
  },
  {
    id: 'ww1-c1-n2',
    chapterId: 'ww1-c1',
    type: 'found-tape',
    title: 'Trench Letter',
    order: 2,
    xpReward: 40,
    content: {
      type: 'found-tape',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
      title: 'Letter from the Somme',
      context: 'British soldier\'s letter, July 1916',
      transcript: [
        { id: 't1', text: 'Dear Mother, I write from a hole in the mud called a trench.', startTime: 0, endTime: 5 },
        { id: 't2', text: 'The whistles blew at 7:30 this morning. We went over the top.', startTime: 5, endTime: 10 },
        { id: 't3', text: 'The machine guns cut down our boys like wheat before a scythe.', startTime: 10, endTime: 15 },
        { id: 't4', text: 'Of the 800 men in my battalion, fewer than 200 remain.', startTime: 15, endTime: 20 },
        { id: 't5', text: 'They told us it would be over by Christmas. That was two years ago.', startTime: 20, endTime: 25 },
      ],
      questions: [
        { id: 'ww1-c1-n2-q1', sessionId: 'ww1-c1-n2', type: 'multiple-choice', prompt: 'What weapon caused massive casualties?', choices: ['Cavalry', 'Machine guns', 'Swords', 'Arrows'], answer: 1, explanation: 'Machine guns made frontal assaults deadly.' },
        { id: 'ww1-c1-n2-q2', sessionId: 'ww1-c1-n2', type: 'multiple-choice', prompt: 'What was expected about the war\'s length?', choices: ['Years', 'Decades', 'Over by Christmas', 'A month'], answer: 2, explanation: 'Most thought it would end quickly. It lasted four years.' },
      ],
    } as FoundTapeContent,
  },
  {
    id: 'ww1-c1-n3',
    chapterId: 'ww1-c1',
    type: 'headlines',
    title: 'War Headlines',
    order: 3,
    xpReward: 60,
    content: {
      type: 'headlines',
      publication: 'THE DAILY TELEGRAPH',
      date: 'June 1914',
      headlines: [
        { id: 'h1', title: 'ARCHDUKE ASSASSINATED IN SARAJEVO', body: 'Heir to the Austro-Hungarian throne shot by Serbian nationalist Gavrilo Princip. Europe holds its breath.' },
        { id: 'h2', title: 'AUSTRIA-HUNGARY ISSUES ULTIMATUM', body: 'Demands on Serbia so harsh that rejection seems certain. War clouds gather over Europe.' },
        { id: 'h3', title: 'ALLIANCE SYSTEM THREATENS WORLD WAR', body: 'If Austria attacks Serbia, Russia may mobilize. Germany would then face France. Britain watches anxiously.' },
      ],
      questions: [
        { id: 'ww1-c1-n3-q1', sessionId: 'ww1-c1-n3', type: 'multiple-choice', prompt: 'Who assassinated the Archduke?', choices: ['A German spy', 'A Russian agent', 'Gavrilo Princip', 'A French soldier'], answer: 2, explanation: 'Gavrilo Princip, a Bosnian Serb nationalist.' },
        { id: 'ww1-c1-n3-q2', sessionId: 'ww1-c1-n3', type: 'multiple-choice', prompt: 'What system made the war spread?', choices: ['Colonial system', 'Alliance system', 'Feudal system', 'Banking system'], answer: 1, explanation: 'Alliances pulled nations into the conflict.' },
      ],
    } as HeadlinesContent,
  },
  {
    id: 'ww1-c1-n4',
    chapterId: 'ww1-c1',
    type: 'quiz-mix',
    title: 'Great War Knowledge',
    order: 4,
    xpReward: 100,
    content: {
      type: 'quiz-mix',
      questions: [
        { id: 'ww1-c1-n4-q1', sessionId: 'ww1-c1-n4', type: 'multiple-choice', prompt: 'When did WWI begin?', choices: ['1912', '1914', '1916', '1918'], answer: 1, explanation: 'July 1914, after the assassination.' },
        { id: 'ww1-c1-n4-q2', sessionId: 'ww1-c1-n4', type: 'multiple-choice', prompt: 'What new weapon caused "shell shock"?', choices: ['Tanks', 'Planes', 'Artillery', 'Submarines'], answer: 2, explanation: 'Constant artillery bombardment traumatized soldiers.' },
        { id: 'ww1-c1-n4-q3', sessionId: 'ww1-c1-n4', type: 'true-false', prompt: 'The USA fought from the war\'s beginning.', choices: ['True', 'False'], answer: 1, explanation: 'The US entered in 1917, three years after it started.' },
        { id: 'ww1-c1-n4-q4', sessionId: 'ww1-c1-n4', type: 'multiple-choice', prompt: 'What ended the war?', choices: ['Treaty of Paris', 'Treaty of Versailles', 'Treaty of Vienna', 'Treaty of London'], answer: 1, explanation: 'The Treaty of Versailles in 1919.' },
      ],
    } as QuizMixContent,
  },
  {
    id: 'ww1-c1-n5',
    chapterId: 'ww1-c1',
    type: 'decision',
    title: 'The Schlieffen Plan',
    order: 5,
    xpReward: 80,
    content: {
      type: 'decision',
      scenario: 'August 1914: You are a German general. France and Russia have mobilized. Your plan requires attacking France through neutral Belgium.',
      context: 'Attacking Belgium will bring Britain into the war. But your plan depends on speed.',
      optionA: {
        label: 'Attack through Belgium as planned',
        outcome: 'Germany nearly reaches Paris but is stopped at the Marne. Britain joins the war. Stalemate follows.',
        isHistorical: true,
      },
      optionB: {
        label: 'Attack France directly without violating Belgian neutrality',
        outcome: 'The attack is slower and less effective. France holds the line more easily.',
        isHistorical: false,
      },
      historicalOutcome: 'Germany invaded Belgium, bringing Britain into the war. The Schlieffen Plan nearly worked but failed at the Battle of the Marne, leading to trench warfare.',
      hostReaction: 'The invasion of Belgium was called a "scrap of paper" by Germany. It cost them the war.',
    } as DecisionContent,
  },
  {
    id: 'ww1-c1-n6',
    chapterId: 'ww1-c1',
    type: 'boss',
    title: 'Chapter Boss: The Great War',
    order: 6,
    xpReward: 150,
    content: {
      type: 'boss',
      timeLimit: 90,
      xpMultiplier: 2,
      hostIntro: 'Trenches, tanks, and tragedy! Show your knowledge of the Great War!',
      hostVictory: 'Excellent! You understand the war that shaped the 20th century!',
      hostDefeat: 'Return to the trenches and study more.',
      questions: [
        { id: 'ww1-c1-b-q1', sessionId: 'ww1-c1-b', type: 'multiple-choice', prompt: 'How long did WWI last?', choices: ['2 years', '4 years', '6 years', '10 years'], answer: 1, explanation: '1914-1918, four years.' },
        { id: 'ww1-c1-b-q2', sessionId: 'ww1-c1-b', type: 'multiple-choice', prompt: 'About how many died in WWI?', choices: ['1 million', '10 million', '20 million', '50 million'], answer: 2, explanation: 'About 20 million military and civilian deaths.' },
        { id: 'ww1-c1-b-q3', sessionId: 'ww1-c1-b', type: 'true-false', prompt: 'Tanks were first used in WWI.', choices: ['True', 'False'], answer: 0, explanation: 'Tanks were introduced by Britain in 1916.' },
        { id: 'ww1-c1-b-q4', sessionId: 'ww1-c1-b', type: 'multiple-choice', prompt: 'What was "No Man\'s Land"?', choices: ['A neutral country', 'Land between trenches', 'Germany', 'A ship'], answer: 1, explanation: 'The deadly ground between opposing trenches.' },
        { id: 'ww1-c1-b-q5', sessionId: 'ww1-c1-b', type: 'multiple-choice', prompt: 'When did the war end?', choices: ['Nov 11, 1917', 'Nov 11, 1918', 'June 28, 1919', 'Dec 25, 1918'], answer: 1, explanation: 'November 11, 1918 at 11 AM - Armistice Day.' },
      ],
    } as BossContent,
  },
];

const ww1Chapter1: JourneyChapter = {
  id: 'ww1-c1',
  arcId: 'world-war-1',
  title: 'The Great War',
  description: 'Trenches, tragedy, and the war to end all wars',
  order: 1,
  nodes: ww1Chapter1Nodes,
  isLocked: false,
};

// ============================================================
// COLD WAR ARC
// ============================================================

const coldWarChapter1Nodes: JourneyNode[] = [
  {
    id: 'cold-c1-n1',
    chapterId: 'cold-c1',
    type: 'two-truths',
    title: 'Cold War Myths',
    order: 1,
    xpReward: 60,
    content: {
      type: 'two-truths',
      statements: [
        'The USA and USSR never directly fought each other during the Cold War.',
        'The Berlin Wall fell because of a press conference mistake.',
        'Nuclear war was narrowly avoided only once during the Cold War.',
      ],
      lieIndex: 2,
      explanation: 'Nuclear war was narrowly avoided MANY times during the Cold War! The Cuban Missile Crisis is famous, but there were numerous close calls due to technical errors and miscommunication.',
      hostReaction: 'We came closer to nuclear war more often than most people realize.',
    } as TwoTruthsContent,
  },
  {
    id: 'cold-c1-n2',
    chapterId: 'cold-c1',
    type: 'found-tape',
    title: 'Soviet Broadcast',
    order: 2,
    xpReward: 40,
    content: {
      type: 'found-tape',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      title: 'Voice from the Kremlin',
      context: 'Soviet radio broadcast, 1962',
      transcript: [
        { id: 't1', text: 'The American imperialists have discovered our missiles in Cuba.', startTime: 0, endTime: 5 },
        { id: 't2', text: 'Their navy has blockaded the island. They call it a "quarantine."', startTime: 5, endTime: 10 },
        { id: 't3', text: 'Chairman Khrushchev and President Kennedy exchange messages.', startTime: 10, endTime: 15 },
        { id: 't4', text: 'The world holds its breath. Nuclear war seems hours away.', startTime: 15, endTime: 20 },
        { id: 't5', text: 'At the last moment, the Soviets agree to remove the missiles.', startTime: 20, endTime: 25 },
      ],
      questions: [
        { id: 'cold-c1-n2-q1', sessionId: 'cold-c1-n2', type: 'multiple-choice', prompt: 'Where did the USSR place missiles?', choices: ['Mexico', 'Cuba', 'Canada', 'Alaska'], answer: 1, explanation: 'Soviet nuclear missiles were placed in Cuba.' },
        { id: 'cold-c1-n2-q2', sessionId: 'cold-c1-n2', type: 'multiple-choice', prompt: 'Who was the Soviet leader?', choices: ['Stalin', 'Lenin', 'Khrushchev', 'Gorbachev'], answer: 2, explanation: 'Nikita Khrushchev led the USSR during the crisis.' },
      ],
    } as FoundTapeContent,
  },
  {
    id: 'cold-c1-n3',
    chapterId: 'cold-c1',
    type: 'headlines',
    title: 'Cold War Headlines',
    order: 3,
    xpReward: 60,
    content: {
      type: 'headlines',
      publication: 'WASHINGTON POST',
      date: 'November 1989',
      headlines: [
        { id: 'h1', title: 'BERLIN WALL FALLS', body: 'After 28 years, the Berlin Wall has been opened. East and West Germans celebrate together in the streets.' },
        { id: 'h2', title: 'PRESS CONFERENCE ERROR SPARKS CHAOS', body: 'An East German official mistakenly announced borders were open "immediately." Thousands rushed to crossing points.' },
        { id: 'h3', title: 'END OF THE COLD WAR IN SIGHT', body: 'With the Wall\'s fall, the Iron Curtain across Europe begins to crumble.' },
      ],
      questions: [
        { id: 'cold-c1-n3-q1', sessionId: 'cold-c1-n3', type: 'multiple-choice', prompt: 'When did the Berlin Wall fall?', choices: ['1979', '1989', '1991', '2001'], answer: 1, explanation: 'November 9, 1989.' },
        { id: 'cold-c1-n3-q2', sessionId: 'cold-c1-n3', type: 'multiple-choice', prompt: 'What caused the Wall to open?', choices: ['War', 'Treaty', 'Press conference mistake', 'Election'], answer: 2, explanation: 'A confused announcement led to immediate openings.' },
      ],
    } as HeadlinesContent,
  },
  {
    id: 'cold-c1-n4',
    chapterId: 'cold-c1',
    type: 'quiz-mix',
    title: 'Cold War Knowledge',
    order: 4,
    xpReward: 100,
    content: {
      type: 'quiz-mix',
      questions: [
        { id: 'cold-c1-n4-q1', sessionId: 'cold-c1-n4', type: 'multiple-choice', prompt: 'What was the "Iron Curtain"?', choices: ['A real curtain', 'Division between East and West Europe', 'A weapon', 'A spy network'], answer: 1, explanation: 'The ideological boundary dividing Europe.' },
        { id: 'cold-c1-n4-q2', sessionId: 'cold-c1-n4', type: 'multiple-choice', prompt: 'What was the Space Race?', choices: ['A movie', 'Competition to explore space', 'A nuclear test', 'A sports event'], answer: 1, explanation: 'USA and USSR competed to achieve space milestones.' },
        { id: 'cold-c1-n4-q3', sessionId: 'cold-c1-n4', type: 'true-false', prompt: 'The USSR launched the first satellite.', choices: ['True', 'False'], answer: 0, explanation: 'Sputnik launched in 1957, beating the USA.' },
        { id: 'cold-c1-n4-q4', sessionId: 'cold-c1-n4', type: 'multiple-choice', prompt: 'When did the Cold War end?', choices: ['1975', '1989', '1991', '2001'], answer: 2, explanation: 'With the dissolution of the USSR in 1991.' },
      ],
    } as QuizMixContent,
  },
  {
    id: 'cold-c1-n5',
    chapterId: 'cold-c1',
    type: 'decision',
    title: 'Cuban Missile Crisis',
    order: 5,
    xpReward: 80,
    content: {
      type: 'decision',
      scenario: 'October 1962: You are President Kennedy. Soviet ships carrying missiles approach the US naval blockade around Cuba.',
      context: 'If the ships don\'t stop, you must decide whether to let them through or fire on them—possibly starting nuclear war.',
      optionA: {
        label: 'Order the Navy to fire if ships don\'t stop',
        outcome: 'The Soviets respond with force. Escalation leads to nuclear war.',
        isHistorical: false,
      },
      optionB: {
        label: 'Give diplomacy more time while maintaining the blockade',
        outcome: 'Khrushchev agrees to remove missiles in exchange for US concessions. War is avoided.',
        isHistorical: true,
      },
      historicalOutcome: 'Kennedy chose restraint. The USSR removed missiles from Cuba, and the US secretly agreed to remove missiles from Turkey. Nuclear war was avoided.',
      hostReaction: 'The world came within hours of nuclear annihilation. Diplomacy saved us.',
    } as DecisionContent,
  },
  {
    id: 'cold-c1-n6',
    chapterId: 'cold-c1',
    type: 'boss',
    title: 'Chapter Boss: Superpower Standoff',
    order: 6,
    xpReward: 150,
    content: {
      type: 'boss',
      timeLimit: 90,
      xpMultiplier: 2,
      hostIntro: 'Spies, nukes, and superpowers! Show your Cold War knowledge!',
      hostVictory: 'Excellent! You survived the Cold War!',
      hostDefeat: 'Return to the bunker and study more.',
      questions: [
        { id: 'cold-c1-b-q1', sessionId: 'cold-c1-b', type: 'multiple-choice', prompt: 'Who was the first in space?', choices: ['John Glenn', 'Neil Armstrong', 'Yuri Gagarin', 'Alan Shepard'], answer: 2, explanation: 'Soviet cosmonaut Yuri Gagarin in 1961.' },
        { id: 'cold-c1-b-q2', sessionId: 'cold-c1-b', type: 'multiple-choice', prompt: 'What was NATO\'s rival alliance?', choices: ['Axis', 'Warsaw Pact', 'SEATO', 'League of Nations'], answer: 1, explanation: 'The Warsaw Pact united communist Eastern Europe.' },
        { id: 'cold-c1-b-q3', sessionId: 'cold-c1-b', type: 'true-false', prompt: 'The USA won the Space Race by landing on the Moon.', choices: ['True', 'False'], answer: 0, explanation: 'Apollo 11 landed humans on the Moon in 1969.' },
        { id: 'cold-c1-b-q4', sessionId: 'cold-c1-b', type: 'multiple-choice', prompt: 'What war was fought during the Cold War?', choices: ['WWI', 'Vietnam', 'Gulf War', 'Afghan War'], answer: 1, explanation: 'Vietnam was a major Cold War proxy conflict.' },
        { id: 'cold-c1-b-q5', sessionId: 'cold-c1-b', type: 'multiple-choice', prompt: 'Who said "Mr. Gorbachev, tear down this wall"?', choices: ['Kennedy', 'Nixon', 'Reagan', 'Bush'], answer: 2, explanation: 'President Reagan in 1987.' },
      ],
    } as BossContent,
  },
];

const coldWarChapter1: JourneyChapter = {
  id: 'cold-c1',
  arcId: 'cold-war',
  title: 'Superpower Standoff',
  description: 'Nuclear tensions, spies, and the battle for world supremacy',
  order: 1,
  nodes: coldWarChapter1Nodes,
  isLocked: false,
};

// ============================================================
// AMERICAN REVOLUTION ARC
// ============================================================

const americanRevChapter1Nodes: JourneyNode[] = [
  {
    id: 'amrev-c1-n1',
    chapterId: 'amrev-c1',
    type: 'two-truths',
    title: 'Revolution Myths',
    order: 1,
    xpReward: 60,
    content: {
      type: 'two-truths',
      statements: [
        'Paul Revere shouted "The British are coming!" during his midnight ride.',
        'The Declaration of Independence was signed on July 4, 1776.',
        'George Washington had wooden teeth.',
      ],
      lieIndex: 0,
      explanation: 'Paul Revere never shouted "The British are coming!" The mission was secret, and colonists still considered themselves British! He likely said "The Regulars are coming."',
      hostReaction: 'Revere\'s ride was real, but the famous phrase is fiction!',
    } as TwoTruthsContent,
  },
  {
    id: 'amrev-c1-n2',
    chapterId: 'amrev-c1',
    type: 'found-tape',
    title: 'Declaration Draft',
    order: 2,
    xpReward: 40,
    content: {
      type: 'found-tape',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      title: 'Jefferson\'s Words',
      context: 'Continental Congress, July 1776',
      transcript: [
        { id: 't1', text: 'We hold these truths to be self-evident, that all men are created equal.', startTime: 0, endTime: 6 },
        { id: 't2', text: 'They are endowed by their Creator with certain unalienable Rights.', startTime: 6, endTime: 11 },
        { id: 't3', text: 'Among these are Life, Liberty, and the pursuit of Happiness.', startTime: 11, endTime: 16 },
        { id: 't4', text: 'Whenever any government becomes destructive of these ends...', startTime: 16, endTime: 21 },
        { id: 't5', text: 'It is the right of the people to alter or abolish it.', startTime: 21, endTime: 26 },
      ],
      questions: [
        { id: 'amrev-c1-n2-q1', sessionId: 'amrev-c1-n2', type: 'multiple-choice', prompt: 'Who wrote the Declaration?', choices: ['Washington', 'Franklin', 'Jefferson', 'Adams'], answer: 2, explanation: 'Thomas Jefferson was the primary author.' },
        { id: 'amrev-c1-n2-q2', sessionId: 'amrev-c1-n2', type: 'multiple-choice', prompt: 'What three rights are mentioned?', choices: ['Life, Liberty, Property', 'Life, Liberty, Happiness', 'Freedom, Justice, Equality', 'Peace, Love, Hope'], answer: 1, explanation: 'Life, Liberty, and the pursuit of Happiness.' },
      ],
    } as FoundTapeContent,
  },
  {
    id: 'amrev-c1-n3',
    chapterId: 'amrev-c1',
    type: 'headlines',
    title: 'Colonial News',
    order: 3,
    xpReward: 60,
    content: {
      type: 'headlines',
      publication: 'BOSTON GAZETTE',
      date: 'December 1773',
      headlines: [
        { id: 'h1', title: 'TEA DUMPED IN BOSTON HARBOR', body: 'Sons of Liberty, disguised as Mohawk Indians, have thrown 342 chests of British tea into the harbor!' },
        { id: 'h2', title: 'NO TAXATION WITHOUT REPRESENTATION', body: 'Patriots protest Parliament\'s Tea Act. If we cannot vote, why should we pay British taxes?' },
        { id: 'h3', title: 'KING GEORGE FURIOUS', body: 'London reports the King is outraged. Harsh punishment for Massachusetts is expected.' },
      ],
      questions: [
        { id: 'amrev-c1-n3-q1', sessionId: 'amrev-c1-n3', type: 'multiple-choice', prompt: 'What was thrown in the harbor?', choices: ['Coffee', 'Sugar', 'Tea', 'Stamps'], answer: 2, explanation: '342 chests of British tea.' },
        { id: 'amrev-c1-n3-q2', sessionId: 'amrev-c1-n3', type: 'multiple-choice', prompt: 'What slogan did patriots use?', choices: ['Give me liberty or death', 'No taxation without representation', 'United we stand', 'Remember the Alamo'], answer: 1, explanation: 'No taxation without representation.' },
      ],
    } as HeadlinesContent,
  },
  {
    id: 'amrev-c1-n4',
    chapterId: 'amrev-c1',
    type: 'quiz-mix',
    title: 'Revolution Knowledge',
    order: 4,
    xpReward: 100,
    content: {
      type: 'quiz-mix',
      questions: [
        { id: 'amrev-c1-n4-q1', sessionId: 'amrev-c1-n4', type: 'multiple-choice', prompt: 'When did the Revolution begin?', choices: ['1765', '1773', '1775', '1776'], answer: 2, explanation: 'Fighting began at Lexington and Concord in April 1775.' },
        { id: 'amrev-c1-n4-q2', sessionId: 'amrev-c1-n4', type: 'multiple-choice', prompt: 'What country helped America win?', choices: ['Spain', 'France', 'Netherlands', 'All of the above'], answer: 3, explanation: 'France was the main ally, but Spain and Netherlands helped.' },
        { id: 'amrev-c1-n4-q3', sessionId: 'amrev-c1-n4', type: 'true-false', prompt: 'Washington never lost a battle.', choices: ['True', 'False'], answer: 1, explanation: 'He lost many battles but won the war.' },
        { id: 'amrev-c1-n4-q4', sessionId: 'amrev-c1-n4', type: 'multiple-choice', prompt: 'Where did the British surrender?', choices: ['Boston', 'Philadelphia', 'Yorktown', 'New York'], answer: 2, explanation: 'Cornwallis surrendered at Yorktown in 1781.' },
      ],
    } as QuizMixContent,
  },
  {
    id: 'amrev-c1-n5',
    chapterId: 'amrev-c1',
    type: 'decision',
    title: 'Valley Forge',
    order: 5,
    xpReward: 80,
    content: {
      type: 'decision',
      scenario: 'Winter 1777: You are General Washington at Valley Forge. Your army is starving, freezing, and deserting.',
      context: 'Congress sends no supplies. Your officers advise surrender or retreat.',
      optionA: {
        label: 'Negotiate peace with the British',
        outcome: 'The Revolution ends. America remains a British colony.',
        isHistorical: false,
      },
      optionB: {
        label: 'Endure the winter and train the army',
        outcome: 'Baron von Steuben trains your troops. By spring, you have a professional army.',
        isHistorical: true,
      },
      historicalOutcome: 'Washington\'s army survived Valley Forge. Von Steuben transformed them into a disciplined force that would eventually win the war.',
      hostReaction: 'Valley Forge was the Revolution\'s darkest hour—and its turning point.',
    } as DecisionContent,
  },
  {
    id: 'amrev-c1-n6',
    chapterId: 'amrev-c1',
    type: 'boss',
    title: 'Chapter Boss: Birth of a Nation',
    order: 6,
    xpReward: 150,
    content: {
      type: 'boss',
      timeLimit: 90,
      xpMultiplier: 2,
      hostIntro: 'Liberty, revolution, and the birth of America! Prove your knowledge!',
      hostVictory: 'Excellent! You honor the Founding Fathers!',
      hostDefeat: 'Return and study the price of freedom.',
      questions: [
        { id: 'amrev-c1-b-q1', sessionId: 'amrev-c1-b', type: 'multiple-choice', prompt: 'Who was the first president?', choices: ['Jefferson', 'Adams', 'Washington', 'Franklin'], answer: 2, explanation: 'George Washington.' },
        { id: 'amrev-c1-b-q2', sessionId: 'amrev-c1-b', type: 'multiple-choice', prompt: 'What started the fighting?', choices: ['Boston Tea Party', 'Declaration signing', 'Lexington and Concord', 'Yorktown'], answer: 2, explanation: '"The shot heard round the world" at Lexington.' },
        { id: 'amrev-c1-b-q3', sessionId: 'amrev-c1-b', type: 'true-false', prompt: 'Ben Franklin was a Founding Father.', choices: ['True', 'False'], answer: 0, explanation: 'Yes, he signed the Declaration and Constitution.' },
        { id: 'amrev-c1-b-q4', sessionId: 'amrev-c1-b', type: 'multiple-choice', prompt: 'What year did the war end?', choices: ['1776', '1781', '1783', '1789'], answer: 2, explanation: 'The Treaty of Paris was signed in 1783.' },
        { id: 'amrev-c1-b-q5', sessionId: 'amrev-c1-b', type: 'multiple-choice', prompt: 'Who said "Give me liberty or give me death"?', choices: ['Washington', 'Jefferson', 'Patrick Henry', 'Franklin'], answer: 2, explanation: 'Patrick Henry in 1775.' },
      ],
    } as BossContent,
  },
];

const americanRevChapter1: JourneyChapter = {
  id: 'amrev-c1',
  arcId: 'american-revolution',
  title: 'Birth of a Nation',
  description: 'The fight for independence and the founding of America',
  order: 1,
  nodes: americanRevChapter1Nodes,
  isLocked: false,
};

// ============================================================
// ALL ARCS (15 Historical Eras)
// ============================================================

export const arcs: Arc[] = [
  // WW2 FIRST - Primary focus for users
  {
    id: 'world-war-2',
    title: 'World War II',
    description: 'The war that changed the world forever',
    icon: '🪖',
    hostId: 'correspondent',
    chapters: [ww2Chapter1, ww2Chapter2, ww2Chapter3],
    badge: '🎖️',
    totalXP: 1530,
  },
  // Other Arcs
  frenchRevolutionArc,
  {
    id: 'ancient-rome',
    title: 'Ancient Rome',
    description: 'From Republic to Empire: The rise and fall of Rome',
    icon: '🏛️',
    hostId: 'caesar',
    chapters: [romeChapter1],
    badge: '🦅',
    totalXP: 490,
  },
  {
    id: 'american-civil-war',
    title: 'American Civil War',
    description: 'A nation divided against itself',
    icon: '🇺🇸',
    hostId: 'lincoln',
    chapters: [civilWarChapter1],
    badge: '🗽',
    totalXP: 490,
  },
  {
    id: 'mesopotamia',
    title: 'Ancient Mesopotamia',
    description: 'The cradle of civilization',
    icon: '📜',
    hostId: 'hammurabi',
    chapters: [mesopotamiaChapter1],
    badge: '🏺',
    totalXP: 490,
  },
  {
    id: 'ancient-egypt',
    title: 'Ancient Egypt',
    description: 'Pharaohs, pyramids, and the mysteries of the Nile',
    icon: '🔺',
    hostId: 'cleopatra',
    chapters: [egyptChapter1],
    badge: '👁️',
    totalXP: 490,
  },
  {
    id: 'medieval-europe',
    title: 'Medieval Europe',
    description: 'Knights, castles, and the age of chivalry',
    icon: '⚔️',
    hostId: 'knight',
    chapters: [medievalChapter1],
    badge: '🛡️',
    totalXP: 490,
  },
  {
    id: 'ancient-greece',
    title: 'Ancient Greece',
    description: 'Democracy, philosophy, and the birth of Western thought',
    icon: '🏺',
    hostId: 'socrates',
    chapters: [greeceChapter1],
    badge: '🦉',
    totalXP: 490,
  },
  {
    id: 'renaissance',
    title: 'The Renaissance',
    description: 'Art, science, and the rebirth of Europe',
    icon: '🎨',
    hostId: 'davinci',
    chapters: [renaissanceChapter1],
    badge: '🖼️',
    totalXP: 490,
  },
  {
    id: 'industrial-revolution',
    title: 'Industrial Revolution',
    description: 'Machines, factories, and the birth of the modern world',
    icon: '🏭',
    hostId: 'inventor',
    chapters: [industrialChapter1],
    badge: '⚙️',
    totalXP: 490,
  },
  {
    id: 'age-of-exploration',
    title: 'Age of Exploration',
    description: 'Voyages of discovery that connected the world',
    icon: '🧭',
    hostId: 'explorer',
    chapters: [explorationChapter1],
    badge: '⛵',
    totalXP: 490,
  },
  {
    id: 'ancient-china',
    title: 'Ancient China',
    description: 'Dynasties, emperors, and the Middle Kingdom',
    icon: '🐉',
    hostId: 'emperor',
    chapters: [chinaChapter1],
    badge: '🏯',
    totalXP: 490,
  },
  {
    id: 'world-war-1',
    title: 'World War I',
    description: 'The Great War that shook the foundations of empires',
    icon: '🎖️',
    hostId: 'soldier',
    chapters: [ww1Chapter1],
    badge: '🕊️',
    totalXP: 490,
  },
  {
    id: 'cold-war',
    title: 'The Cold War',
    description: 'Superpowers, spies, and the shadow of nuclear war',
    icon: '🕵️',
    hostId: 'spy',
    chapters: [coldWarChapter1],
    badge: '☢️',
    totalXP: 490,
  },
  {
    id: 'american-revolution',
    title: 'American Revolution',
    description: 'The birth of a nation and the fight for independence',
    icon: '🗽',
    hostId: 'founder',
    chapters: [americanRevChapter1],
    badge: '🦅',
    totalXP: 490,
  },
];

// ============================================================
// TWO TRUTHS ARCADE DATA (Random from all eras)
// ============================================================

export const twoTruthsQuestions: TwoTruthsQuestion[] = [
  {
    id: 'tt-1',
    category: 'French Revolution',
    statements: [
      'Marie Antoinette said "Let them eat cake" when told peasants had no bread.',
      'The guillotine was named after Dr. Joseph-Ignace Guillotin.',
      'The French Revolution lasted about 10 years (1789-1799).',
    ],
    lieIndex: 0,
    explanation: 'Marie Antoinette never said this. The quote predates her and was used as propaganda against her.',
  },
  {
    id: 'tt-2',
    category: 'World War II',
    statements: [
      'D-Day was the largest amphibious invasion in history.',
      'Japan surrendered immediately after the first atomic bomb was dropped.',
      'The war in Europe ended on May 8, 1945 (V-E Day).',
    ],
    lieIndex: 1,
    explanation: 'Japan did not surrender after Hiroshima. It took a second bomb on Nagasaki and Soviet declaration of war before Japan surrendered.',
  },
  {
    id: 'tt-3',
    category: 'Ancient Rome',
    statements: [
      'Julius Caesar was assassinated on the Ides of March (March 15).',
      'The Colosseum could hold about 50,000 spectators.',
      'Caesar\'s last words were "Et tu, Brute?" in Latin.',
    ],
    lieIndex: 2,
    explanation: 'Caesar\'s actual last words are unknown. "Et tu, Brute?" comes from Shakespeare\'s play, not historical record.',
  },
  {
    id: 'tt-4',
    category: 'American Civil War',
    statements: [
      'The Civil War was fought primarily over states\' rights to maintain slavery.',
      'Abraham Lincoln was a trained military general before becoming president.',
      'The war lasted from 1861 to 1865.',
    ],
    lieIndex: 1,
    explanation: 'Lincoln had almost no military experience. He served briefly as a captain in the Black Hawk War but saw no combat.',
  },
  {
    id: 'tt-5',
    category: 'Mesopotamia',
    statements: [
      'Hammurabi\'s Code included the principle "an eye for an eye."',
      'The wheel was invented in Mesopotamia around 3500 BCE.',
      'Mesopotamia was located in modern-day Egypt.',
    ],
    lieIndex: 2,
    explanation: 'Mesopotamia was located in modern-day Iraq, between the Tigris and Euphrates rivers, not Egypt.',
  },
  {
    id: 'tt-6',
    category: 'Ancient Egypt',
    statements: [
      'The Great Pyramid was the tallest man-made structure for over 3,800 years.',
      'Cleopatra lived closer in time to the Moon landing than to the building of the pyramids.',
      'Ancient Egyptians invented paper as we know it today.',
    ],
    lieIndex: 2,
    explanation: 'Egyptians invented papyrus, not paper. Paper was invented in China around 100 BCE.',
  },
  {
    id: 'tt-7',
    category: 'Medieval Europe',
    statements: [
      'Medieval people believed the Earth was flat.',
      'The Black Death killed about one-third of Europe\'s population.',
      'Knights in armor could not mount horses without help from cranes.',
    ],
    lieIndex: 0,
    explanation: 'Most educated medieval people knew the Earth was round. This is a modern myth about the Middle Ages.',
  },
  {
    id: 'tt-8',
    category: 'Renaissance',
    statements: [
      'Leonardo da Vinci wrote his notes backwards (mirror writing).',
      'The Mona Lisa was stolen from the Louvre in 1911.',
      'Michelangelo painted the Sistine Chapel ceiling lying on his back.',
    ],
    lieIndex: 2,
    explanation: 'Michelangelo painted standing up on scaffolding, bending backwards. He did not lie on his back.',
  },
];

// Helper functions
export function getArcById(id: string): Arc | undefined {
  return arcs.find(arc => arc.id === id);
}

export function getChapterById(arcId: string, chapterId: string): JourneyChapter | undefined {
  const arc = getArcById(arcId);
  return arc?.chapters.find(ch => ch.id === chapterId);
}

export function getNodeById(arcId: string, chapterId: string, nodeId: string): JourneyNode | undefined {
  const chapter = getChapterById(arcId, chapterId);
  return chapter?.nodes.find(n => n.id === nodeId);
}

export function getRandomTwoTruthsQuestion(): TwoTruthsQuestion {
  return twoTruthsQuestions[Math.floor(Math.random() * twoTruthsQuestions.length)];
}
