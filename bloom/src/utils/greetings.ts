const greetings: Record<string, string[]> = {
  morning: [
    "Good morning!",
    "Rise and shine!",
    "Morning!",
    "Top of the morning!",
    "Bonjour!",
    "Buenos días!",
    "Guten Morgen!",
    "Ohayō!",
  ],
  afternoon: [
    "Good afternoon!",
    "Hey there!",
    "Afternoon!",
    "Howdy!",
    "Buenas tardes!",
    "Bon après-midi!",
    "Konnichiwa!",
    "Salaam!",
  ],
  evening: [
    "Good evening!",
    "Evening!",
    "Hey!",
    "Buenas noches!",
    "Bonsoir!",
    "Guten Abend!",
    "Konbanwa!",
    "Shalom!",
  ],
  night: [
    "Hello!",
    "Hey there!",
    "Hola!",
    "Namaste!",
    "Ciao!",
    "Salut!",
    "Aloha!",
    "Jambo!",
  ],
};

export const getGreeting = (): string => {
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
