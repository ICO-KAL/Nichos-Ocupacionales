export type TeamMember = {
  name: string;
  studentId: string;
  description?: string;
  phone?: string;
  telegramUsername?: string;
  photo?: string | number;
};

export const teamMembers: TeamMember[] = [
  {
    name: 'Isaac Concepcion Peralta',
    studentId: '2023-1932',
    description: 'Desarrollador de software. Manejo de Node.js, JavaScript, Expo, MongoDB, React Native y React.',
    photo: require('../../assets/images/team/isaac-concepcion-peralta.jpg'),
  },
  {
    name: 'Carlos Gabriel Thomas Calcano',
    studentId: '2023-1296',
    description: 'Desarrollador de software con experiencia en C#/.NET, base de datos SQL, QA, JMeter, Selenium, pruebas manuales y automatización, Git y Java.',
    photo: require('../../assets/images/team/carlos-gabriel-thomas-calcano.jpg'),
  },
  {
    name: 'Ernesto Antonio Castillo Herrera',
    studentId: '2022-1053',
    description: 'Desarrollador de software enfocado en UI/UX, diseño en Figma, desarrollo en HTML, CSS, TypeScript/JavaScript, Node.',
    photo: require('../../assets/images/team/ernesto-antonio-castillo-herrera.jpg'),
  },
  {
    name: 'Jesus Correa Alonzoc',
    studentId: '2023-0258',
    description: 'Desarrollador de software con experiencia en Python, C#/.NET, bases de datos SQL, arquitectura de software, testing, Git y herramientas de desarrollo.',
    photo: require('../../assets/images/team/jesus-correa-alonzoc.jpg'),
  },
];