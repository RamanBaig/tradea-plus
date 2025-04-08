import { useUser } from '@clerk/nextjs';

export const Greeting = () => {
  const { user } = useUser();
  const firstName = user?.firstName || user?.username || 'there';

  // Array of greeting variations
  const greetings = [
    `Hey ${firstName}!`,
    `Welcome back, ${firstName}!`,
    `Hey ${firstName}, ready to trade?`,
    `Great to see you, ${firstName}!`
  ];

  // Randomly select a greeting
  const greeting = greetings[Math.floor(Math.random() * greetings.length)];

  return (
    <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 
      bg-clip-text text-transparent mb-6 animate-fadeIn">
      {greeting}
    </h1>
  );
};
