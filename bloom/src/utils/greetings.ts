export interface Greeting {
  message: string;
  subtitle: string;
}

const greetings: Record<string, Greeting[]> = {
  morning: [
    { message: "Good morning!", subtitle: "Ready to plan your day on the farm?" },
    { message: "Rise and shine!", subtitle: "Let's check on your crops" },
    { message: "Morning!", subtitle: "What's on the agenda today?" },
  ],
  afternoon: [
    { message: "Good afternoon!", subtitle: "How are things looking today?" },
    { message: "Hey there!", subtitle: "Need help with anything?" },
    { message: "Afternoon!", subtitle: "Let's see what we can do" },
  ],
  evening: [
    { message: "Good evening!", subtitle: "How did the day go?" },
    { message: "Evening!", subtitle: "Time to review today's progress" },
    { message: "Hey!", subtitle: "Let's wrap up the day" },
  ],
  night: [
    { message: "Hola!", subtitle: "Planning for tomorrow?" },
    { message: "Hello!", subtitle: "Still working late?" },
    { message: "Hey there!", subtitle: "What can I help you with?" },
  ],
};

export const getGreeting = (): Greeting => {
  const hour = new Date().getHours();
  
  let timeOfDay: keyof typeof greetings;
  if (hour >= 5 && hour < 12) {
    timeOfDay = 'morning';
  } else if (hour >= 12 && hour < 17) {
    timeOfDay = 'afternoon';
  } else if (hour >= 17 && hour < 21) {
    timeOfDay = 'evening';
  } else {
    timeOfDay = 'night';
  }
  
  const greetingList = greetings[timeOfDay];
  const randomIndex = Math.floor(Math.random() * greetingList.length);
  
  return greetingList[randomIndex];
};
