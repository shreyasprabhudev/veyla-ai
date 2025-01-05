import { Card, Title, BarChart, Subtitle } from '@tremor/react';

const data = [
  {
    name: 'ChatGPT',
    'Protected Messages': 89,
  },
  {
    name: 'Claude',
    'Protected Messages': 52,
  },
  {
    name: 'Gemini',
    'Protected Messages': 43,
  },
];

export default function Home() {
  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>OpaqueAI Dashboard</Title>
      <Subtitle>Monitor your privacy protection across AI platforms</Subtitle>
      
      <Card className="mt-6">
        <Title>Protected Messages by Platform</Title>
        <BarChart
          className="mt-6"
          data={data}
          index="name"
          categories={['Protected Messages']}
          colors={['blue']}
          yAxisWidth={48}
        />
      </Card>
    </main>
  );
}
