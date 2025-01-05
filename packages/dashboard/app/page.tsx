import { Card, Title, AreaChart, DonutChart, BarList, Metric, Flex, Text } from '@tremor/react';

export default function Dashboard() {
  // Sample data - in production, this would come from your Supabase database
  const chartdata = [
    { date: '2024-12-01', 'Sensitive Data Detected': 12, 'Safe Messages': 89 },
    { date: '2024-12-02', 'Sensitive Data Detected': 15, 'Safe Messages': 92 },
    { date: '2024-12-03', 'Sensitive Data Detected': 8, 'Safe Messages': 95 },
  ];

  const sensitiveTypes = [
    { name: 'SSN Numbers', value: 23 },
    { name: 'Credit Cards', value: 18 },
    { name: 'Medical Records', value: 15 },
    { name: 'Addresses', value: 12 },
    { name: 'Phone Numbers', value: 10 },
  ];

  const platforms = [
    { name: 'ChatGPT', value: 45 },
    { name: 'Claude', value: 35 },
    { name: 'Gemini', value: 20 },
  ];

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>OpaqueAI Admin Dashboard</Title>
      <Text>Monitor privacy protection across all users</Text>

      <div className="mt-6">
        <Card>
          <Title>Key Metrics</Title>
          <Flex className="mt-4">
            <div>
              <Text>Total Users</Text>
              <Metric>1,234</Metric>
            </div>
            <div>
              <Text>Protected Messages</Text>
              <Metric>45,678</Metric>
            </div>
            <div>
              <Text>Privacy Score</Text>
              <Metric>98.2%</Metric>
            </div>
          </Flex>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <Title>Message Protection Trends</Title>
          <AreaChart
            className="mt-4 h-72"
            data={chartdata}
            index="date"
            categories={['Sensitive Data Detected', 'Safe Messages']}
            colors={['red', 'green']}
          />
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <Title>Sensitive Data Types</Title>
          <BarList data={sensitiveTypes} className="mt-4" />
        </Card>

        <Card>
          <Title>Platform Distribution</Title>
          <DonutChart
            className="mt-4 h-48"
            data={platforms}
            category="value"
            index="name"
            colors={['blue', 'cyan', 'indigo']}
          />
        </Card>
      </div>
    </main>
  );
}
