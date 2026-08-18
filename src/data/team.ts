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
  },
  {
    name: 'Ernesto Antonio Castillo Herrera',
    studentId: '2022-1053',
  },
];